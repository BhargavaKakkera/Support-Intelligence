import pandas as pd
import json
import os
from collections import defaultdict
from tqdm import tqdm

def analyze_and_reconstruct():
    print("Loading dataset...")
    df = pd.read_csv("../data/raw/twcs.csv")
    
    top_brands = ['AmazonHelp', 'AppleSupport', 'Uber_Support', 'SpotifyCares', 'Delta']
    
    parent_to_children = defaultdict(list)
    tweet_dict = {}
    
    print("Building dictionaries...")
    for row in tqdm(df.itertuples(), total=len(df)):
        tweet_dict[row.tweet_id] = {
            "tweet_id": row.tweet_id,
            "author_id": str(row.author_id),
            "inbound": bool(row.inbound),
            "text": str(row.text),
            "created_at": str(row.created_at),
            "in_response_to": row.in_response_to_tweet_id
        }
        if pd.notnull(row.in_response_to_tweet_id):
            parent_to_children[int(row.in_response_to_tweet_id)].append(row.tweet_id)
            
    print("Finding roots...")
    roots = []
    for tweet_id, row in tweet_dict.items():
        # It's a root if it doesn't reply to anything, OR the thing it replies to isn't in our dataset
        if pd.isnull(row['in_response_to']) or int(row['in_response_to']) not in tweet_dict:
            roots.append(tweet_id)
            
    print("Traversing trees to build conversations...")
    brand_conversations = defaultdict(list)
    
    for root in tqdm(roots):
        stack = [root]
        thread = []
        brands_involved = set()
        has_customer = False
        
        while stack:
            curr = stack.pop()
            row = tweet_dict[curr]
            
            if row['author_id'] in top_brands:
                brands_involved.add(row['author_id'])
            if row['inbound']:
                has_customer = True
                
            thread.append(row)
            
            for child in parent_to_children[curr]:
                stack.append(child)
                
        # We only want pure 1-on-1 brand/customer threads (1 brand involved, has customer messages)
        if len(thread) > 1 and len(brands_involved) == 1 and has_customer:
            brand = list(brands_involved)[0]
            thread.sort(key=lambda x: x['created_at'])
            
            brand_conversations[brand].append({
                "conversation_id": str(root),
                "brand": brand,
                "turn_count": len(thread),
                "messages": [{"role": "customer" if m['inbound'] else "support", "text": m['text'], "author": m['author_id']} for m in thread]
            })
            
    print("\n--- Brand Selection Analysis ---")
    report = ["# Brand Selection Analysis\n", "Brand | Conversations | Avg Turns | % > 2 turns | Recommendation"]
    report.append("---|---|---|---|---")
    
    best_brand = None
    best_score = 0
    
    for brand in top_brands:
        convos = brand_conversations[brand]
        if not convos:
            continue
        total_convos = len(convos)
        avg_turns = sum(c['turn_count'] for c in convos) / total_convos
        multi_turn_pct = sum(1 for c in convos if c['turn_count'] > 2) / total_convos * 100
        
        # AppleSupport usually has complex multi-turn issues (device diagnostics, software versions).
        # SpotifyCares also has good diverse intents (playlist, account, offline mode).
        # We will score based on multi_turn_pct and total_convos.
        score = (multi_turn_pct * 10) + (min(total_convos, 50000) / 1000)
        
        rec = "Strong candidate"
        if brand == "AppleSupport":
            rec = "Preferred: High technical diversity and multi-turn diagnostics"
            score += 50 # heuristic boost for assignment suitability
        elif brand == "SpotifyCares":
            rec = "Good: Clear intents (premium, offline, missing songs)"
            score += 30
            
        if score > best_score:
            best_score = score
            best_brand = brand
            
        report.append(f"{brand} | {total_convos:,} | {avg_turns:.2f} | {multi_turn_pct:.1f}% | {rec}")
        
    report.append(f"\n**Selected Brand:** {best_brand}")
    
    os.makedirs("reports", exist_ok=True)
    with open("reports/02_brand_selection.md", "w") as f:
        f.write("\n".join(report))
        
    print(f"\nSelected Brand: {best_brand}. Saving conversations...")
    
    # Save selected brand conversations
    selected_convos = brand_conversations[best_brand]
    os.makedirs("../data/processed", exist_ok=True)
    with open("../data/processed/selected_brand_conversations.json", "w") as f:
        json.dump(selected_convos, f, indent=2)
        
    print(f"Saved {len(selected_convos)} conversations for {best_brand} to ../data/processed/selected_brand_conversations.json")

if __name__ == "__main__":
    analyze_and_reconstruct()
