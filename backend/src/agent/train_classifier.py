import json
import os
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

def train_and_save():
    print("Loading TRAIN dataset...")
    train_texts = []
    train_labels = []
    
    with open("artifacts/splits/train_labeled.jsonl", "r") as f:
        for line in f:
            c = json.loads(line)
            first_msg = next((m['text'] for m in c['messages'] if m['role'] == 'customer'), "")
            train_texts.append(first_msg)
            train_labels.append(c['intent'])
            
    print(f"Training TF-IDF + Logistic Regression on {len(train_texts)} examples...")
    
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(stop_words='english', max_features=5000)),
        ('clf', LogisticRegression(C=10.0, max_iter=1000, class_weight='balanced'))
    ])
    
    pipeline.fit(train_texts, train_labels)
    
    os.makedirs("models", exist_ok=True)
    with open("models/intent_pipeline.pkl", "wb") as f:
        pickle.dump(pipeline, f)
        
    print("Saved model pipeline to models/intent_pipeline.pkl")

if __name__ == "__main__":
    train_and_save()
