import os
import json
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer, TrainingArguments
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.utils.class_weight import compute_class_weight
from datasets import Dataset
import pickle
import numpy as np
from torch import nn

def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    return {"accuracy": (predictions == labels).mean()}

class CustomTrainer(Trainer):
    def __init__(self, class_weights, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.class_weights = class_weights

    def compute_loss(self, model, inputs, return_outputs=False, **kwargs):
        labels = inputs.get("labels")
        outputs = model(**inputs)
        logits = outputs.get("logits")
        loss_fct = nn.CrossEntropyLoss(weight=self.class_weights)
        loss = loss_fct(logits.view(-1, self.model.config.num_labels), labels.view(-1))
        return (loss, outputs) if return_outputs else loss

def train_transformer():
    print("Loading data from artifacts/splits/train_labeled.jsonl...")
    texts = []
    labels = []
    
    with open("artifacts/splits/train_labeled.jsonl", "r") as f:
        for line in f:
            data = json.loads(line)
            # Find customer message
            customer_msg = next((m["text"] for m in data["messages"] if m["role"] == "customer"), "")
            if customer_msg and "intent" in data:
                texts.append(customer_msg)
                labels.append(data["intent"])
                
    if not texts:
        print("Error: No training data found.")
        return

    # Encode labels
    print("Encoding labels...")
    le = LabelEncoder()
    y = le.fit_transform(labels)
    num_labels = len(le.classes_)
    
    print(f"Found {num_labels} classes: {le.classes_}")
    
    # Compute class weights
    print("Computing class weights to handle imbalance...")
    class_weights = compute_class_weight('balanced', classes=np.unique(y), y=y)
    
    # Subsample data for practical training time during demonstration
    print("Subsampling data (using 10% of training data for speed)...")
    texts, _, y, _ = train_test_split(texts, y, train_size=0.10, random_state=42, stratify=y)
    
    # Save label encoder
    os.makedirs("models/transformer_intent", exist_ok=True)
    with open("models/transformer_intent/label_encoder.pkl", "wb") as f:
        pickle.dump(le, f)

    # Tokenizer
    print("Loading tokenizer (distilbert-base-uncased)...")
    tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")
    
    # Stratified split for train/eval
    X_train, X_eval, y_train, y_eval = train_test_split(
        texts, y, test_size=0.1, random_state=42, stratify=y
    )
    
    # Create datasets
    print("Tokenizing datasets...")
    def tokenize_function(examples):
        return tokenizer(examples["text"], padding="max_length", truncation=True, max_length=128)
        
    train_ds = Dataset.from_dict({"text": X_train, "labels": y_train})
    eval_ds = Dataset.from_dict({"text": X_eval, "labels": y_eval})
    
    train_ds = train_ds.map(tokenize_function, batched=True)
    eval_ds = eval_ds.map(tokenize_function, batched=True)

    # Load Model
    print("Loading DistilBERT model...")
    model = AutoModelForSequenceClassification.from_pretrained("distilbert-base-uncased", num_labels=num_labels)
    
    # Device logic (MPS on Mac, CUDA on Linux)
    device = "cpu"
    if torch.backends.mps.is_available():
        device = "mps"
    elif torch.cuda.is_available():
        device = "cuda"
    print(f"Using device: {device}")
    
    class_weights_tensor = torch.tensor(class_weights, dtype=torch.float32).to(device)

    # Training arguments
    training_args = TrainingArguments(
        output_dir="./results",
        learning_rate=2e-5,
        per_device_train_batch_size=16,
        per_device_eval_batch_size=16,
        num_train_epochs=3,
        weight_decay=0.01,
        eval_strategy="epoch", # Fixed from evaluation_strategy for transformers > 5.x
        save_strategy="epoch",
        load_best_model_at_end=True,
        fp16=(device == "cuda"), # only fp16 on CUDA
        report_to="none"
    )

    trainer = CustomTrainer(
        class_weights=class_weights_tensor,
        model=model,
        args=training_args,
        train_dataset=train_ds,
        eval_dataset=eval_ds,
        compute_metrics=compute_metrics,
    )

    # Train
    print("Starting training...")
    trainer.train()

    # Save model
    print("Saving model to models/transformer_intent...")
    trainer.save_model("models/transformer_intent")
    tokenizer.save_pretrained("models/transformer_intent")
    print("Training complete!")

if __name__ == "__main__":
    train_transformer()
