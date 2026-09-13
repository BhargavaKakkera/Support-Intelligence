import pandas as pd
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
import numpy as np

class TrivialClassifier:
    def __init__(self):
        self.majority_class = None
        
    def fit(self, X, y):
        self.majority_class = pd.Series(y).mode()[0]
        
    def predict(self, X):
        return [self.majority_class] * len(X)
        
    def predict_proba(self, X):
        # Trivial 1.0 confidence for majority
        return np.ones((len(X), 1))

class SimpleMLClassifier:
    def __init__(self):
        self.pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(stop_words='english', max_features=5000)),
            ('clf', LogisticRegression(C=10.0, max_iter=1000, class_weight='balanced'))
        ])
        
    def fit(self, X, y):
        self.pipeline.fit(X, y)
        
    def predict(self, text_list):
        return self.pipeline.predict(text_list)
class IntentClassifier:
    def __init__(self):
        self.pipeline = None
        self.load()
        
    def load(self, model_path="models/intent_pipeline.pkl"):
        try:
            with open(model_path, "rb") as f:
                self.pipeline = pickle.load(f)
        except FileNotFoundError:
            print(f"Warning: Model not found at {model_path}. Run train_classifier.py first.")
            
    def predict(self, text):
        if not self.pipeline:
            return {"intent": "UNKNOWN", "confidence": 0.0, "reason": "Model not loaded"}
            
        if isinstance(text, str):
            text = [text]
            
        probs = self.pipeline.predict_proba(text)[0]
        classes = self.pipeline.classes_
        
        best_idx = probs.argmax()
        intent = classes[best_idx]
        confidence = float(probs[best_idx])
        
        return {
            "intent": intent,
            "confidence": confidence,
            "reason": "TF-IDF + LR prediction"
        }
        
    def classify(self, text):
        return self.predict(text)
