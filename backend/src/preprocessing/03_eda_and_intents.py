import json
import pandas as pd
from collections import Counter
import re
import os

def clean_text(text):
    text = re.sub(r'http\S+', '', text)
    text = re.sub(r'@\w+', '', text)
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    return text.lower().strip()

def analyze_intents():
    print("Loading selected conversations...")
    with open("../data/processed/selected_brand_conversations.json", "r") as f:
        convos = json.load(f)
        
    first_messages = []
    for c in convos:
        # Find first customer message
        for m in c['messages']:
            if m['role'] == 'customer':
                first_messages.append(m['text'])
                break
                
    print(f"Analyzing {len(first_messages)} first messages...")
    
    words = []
    bigrams = []
    
    stop_words = {'the', 'to', 'my', 'and', 'a', 'is', 'i', 'it', 'for', 'on', 'of', 'in', 'have', 'that', 'with', 'this', 'you', 'not', 'but', 'can', 'it', 'was', 'so', 'me', 'at', 'be', 'just', 'from', 'an', 'are', 'your', 'has'}
    
    for text in first_messages:
        cleaned = clean_text(text).split()
        cleaned = [w for w in cleaned if len(w) > 2 and w not in stop_words]
        words.extend(cleaned)
        bigrams.extend([f"{cleaned[i]} {cleaned[i+1]}" for i in range(len(cleaned)-1)])
        
    word_counts = Counter(words)
    bigram_counts = Counter(bigrams)
    
    report = ["# Exploratory Data Analysis & Keyword Extraction"]
    report.append("\n## Top 50 words")
    for w, c in word_counts.most_common(50):
        report.append(f"- {w}: {c}")
        
    report.append("\n## Top 50 bigrams")
    for b, c in bigram_counts.most_common(50):
        report.append(f"- {b}: {c}")
        
    os.makedirs("reports", exist_ok=True)
    with open("reports/03_eda_keywords.md", "w") as f:
        f.write("\n".join(report))
        
    print("Keyword extraction complete. Saved to reports/03_eda_keywords.md")

if __name__ == "__main__":
    analyze_intents()
