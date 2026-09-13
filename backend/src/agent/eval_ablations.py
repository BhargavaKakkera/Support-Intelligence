import json
from sklearn.metrics import classification_report, accuracy_score, f1_score
from src.agent.classifier import IntentClassifier
from src.agent.transformer_classifier import TransformerClassifier
import time

def evaluate_models():
    print("Loading test dataset (golden_labeled.jsonl)...")
    texts = []
    labels = []
    
    with open("artifacts/splits/golden_labeled.jsonl", "r") as f:
        for line in f:
            data = json.loads(line)
            customer_msg = next((m["text"] for m in data["messages"] if m["role"] == "customer"), "")
            if customer_msg and "ground_truth_intent" in data:
                texts.append(customer_msg)
                labels.append(data["ground_truth_intent"])
                
    if not texts:
        print("Error: No test data found.")
        return
        
    print(f"Loaded {len(texts)} test examples.")
    
    print("\n--- Evaluating Baseline: TF-IDF + Logistic Regression ---")
    tfidf_classifier = IntentClassifier()
    
    tfidf_preds = []
    start_time = time.time()
    for text in texts:
        res = tfidf_classifier.classify(text)
        tfidf_preds.append(res["intent"])
    tfidf_time = time.time() - start_time
    
    tfidf_acc = accuracy_score(labels, tfidf_preds)
    tfidf_f1 = f1_score(labels, tfidf_preds, average="weighted")
    print(f"TF-IDF Accuracy: {tfidf_acc:.4f}")
    print(f"TF-IDF F1-Score: {tfidf_f1:.4f}")
    print(f"TF-IDF Inference Time: {tfidf_time:.2f}s ({(tfidf_time/len(texts))*1000:.2f}ms/query)")
    
    print("\n--- Evaluating New Architecture: Fine-tuned DistilBERT ---")
    transformer_classifier = TransformerClassifier()
    
    if not transformer_classifier.is_loaded:
        print("Transformer model not loaded. Skipping.")
        return
        
    trans_preds = []
    start_time = time.time()
    for text in texts:
        res = transformer_classifier.classify(text)
        trans_preds.append(res["intent"])
    trans_time = time.time() - start_time
    
    trans_acc = accuracy_score(labels, trans_preds)
    trans_f1 = f1_score(labels, trans_preds, average="weighted")
    print(f"Transformer Accuracy: {trans_acc:.4f}")
    print(f"Transformer F1-Score: {trans_f1:.4f}")
    print(f"Transformer Inference Time: {trans_time:.2f}s ({(trans_time/len(texts))*1000:.2f}ms/query)")
    
    print("\n--- Summary ---")
    print(f"F1 Improvement: {(trans_f1 - tfidf_f1):+0.4f}")
    print("Full Classification Report (Transformer):")
    print(classification_report(labels, trans_preds, zero_division=0))

if __name__ == "__main__":
    evaluate_models()
