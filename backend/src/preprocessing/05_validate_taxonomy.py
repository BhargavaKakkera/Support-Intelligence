import json
import collections

def validate_taxonomy():
    with open("artifacts/splits/train.jsonl", "r") as f:
        train_data = [json.loads(line) for line in f]
        
    print(f"Loaded {len(train_data)} train conversations.")
    
    # We will look at unigrams/bigrams in the first customer message to see if they align with the 8 intents
    from sklearn.feature_extraction.text import CountVectorizer
    
    texts = []
    for c in train_data:
        first_msg = next((m['text'] for m in c['messages'] if m['role'] == 'customer'), "")
        texts.append(first_msg)
        
    vectorizer = CountVectorizer(stop_words='english', ngram_range=(1, 2), max_features=100)
    X = vectorizer.fit_transform(texts)
    
    sums = X.sum(axis=0)
    words = [(word, sums[0, idx]) for word, idx in vectorizer.vocabulary_.items()]
    words = sorted(words, key=lambda x: x[1], reverse=True)
    
    print("Top 20 N-grams in TRAIN:")
    for w, count in words[:20]:
        print(f"{w}: {count}")
        
    # Define the updated taxonomy and store it
    taxonomy = {
        "Delivery Delay": {"keywords": ["late", "delay", "when", "still waiting", "arriving"]},
        "Missing/Lost Package": {"keywords": ["delivered", "didn't get", "haven't received", "lost"]},
        "Returns & Refunds": {"keywords": ["refund", "return", "cancel", "money back"]},
        "Prime Membership & Billing": {"keywords": ["prime", "charge", "membership", "charged"]},
        "Digital Services": {"keywords": ["prime video", "music", "app", "streaming"]},
        "Hardware & Devices": {"keywords": ["echo", "fire", "kindle", "alexa"]},
        "Payment & Gift Cards": {"keywords": ["gift card", "pay", "payment"]},
        "Account & Login": {"keywords": ["password", "login", "locked", "access", "account"]},
        "UNKNOWN": {"keywords": []}
    }
    
    with open("artifacts/audit/intent_taxonomy.json", "w") as f:
        json.dump(taxonomy, f, indent=2)
        
    print("Taxonomy validated and saved to artifacts/audit/intent_taxonomy.json")

if __name__ == "__main__":
    validate_taxonomy()
