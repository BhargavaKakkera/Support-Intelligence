import os
import torch
import pickle
import numpy as np
from transformers import AutoTokenizer, AutoModelForSequenceClassification

class TransformerClassifier:
    def __init__(self, model_dir="models/transformer_intent"):
        self.model_dir = model_dir
        self.device = "mps" if torch.backends.mps.is_available() else "cuda" if torch.cuda.is_available() else "cpu"
        self.tokenizer = None
        self.model = None
        self.label_encoder = None
        self.is_loaded = False
        
        # Load lazily or if directory exists
        if os.path.exists(model_dir):
            try:
                self.load_model()
            except Exception as e:
                print(f"Warning: Failed to load TransformerClassifier: {e}")
                
    def load_model(self):
        print(f"Loading Transformer Classifier from {self.model_dir} on {self.device}...")
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_dir)
        self.model = AutoModelForSequenceClassification.from_pretrained(self.model_dir).to(self.device)
        self.model.eval()
        
        with open(os.path.join(self.model_dir, "label_encoder.pkl"), "rb") as f:
            self.label_encoder = pickle.load(f)
            
        self.is_loaded = True
        
    def calibrate_confidence(self, logits, temperature=1.2):
        """
        Apply temperature scaling to raw logits to produce better calibrated probabilities.
        """
        scaled_logits = logits / temperature
        probs = torch.nn.functional.softmax(scaled_logits, dim=-1)
        return probs.cpu().numpy()[0]
        
    def classify(self, text):
        if not self.is_loaded:
            return {"intent": "UNKNOWN", "confidence": 0.0}
            
        inputs = self.tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=128).to(self.device)
        
        with torch.no_grad():
            outputs = self.model(**inputs)
            
        probs = self.calibrate_confidence(outputs.logits)
        predicted_class_idx = np.argmax(probs)
        confidence = probs[predicted_class_idx]
        
        intent_label = self.label_encoder.inverse_transform([predicted_class_idx])[0]
        
        return {
            "intent": intent_label,
            "confidence": float(confidence)
        }
