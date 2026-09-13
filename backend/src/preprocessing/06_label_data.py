import json
import os

def heuristic_label(text):
    t = text.lower()
    
    if "kindle edition" in t or "kindle book" in t or "audiobook" in t or "audio book" in t:
        return "Digital Services"
    elif any(w in t for w in ["damaged", "broken", "ripped", "defect", "scratch", "torn"]):
        return "Product Damage/Defect"
    elif any(w in t for w in ["late", "delay", "when", "still waiting", "arriving"]):
        return "Delivery Delay"
    elif any(w in t for w in ["delivered", "didn't get", "haven't received", "lost"]):
        return "Missing/Lost Package"
    elif any(w in t for w in ["refund", "return", "cancel", "money back"]):
        return "Returns & Refunds"
    elif any(w in t for w in ["prime", "charge", "membership", "charged"]):
        return "Prime Membership & Billing"
    elif any(w in t for w in ["prime video", "music", "app", "streaming"]):
        return "Digital Services"
    elif any(w in t for w in ["echo", "fire", "kindle", "alexa"]):
        return "Hardware & Devices"
    elif any(w in t for w in ["gift card", "pay", "payment"]):
        return "Payment & Gift Cards"
    elif any(w in t for w in ["password", "login", "locked", "access", "account"]):
        return "Account & Login"
    else:
        return "UNKNOWN"

def label_file(input_path, output_path):
    labeled_data = []
    with open(input_path, "r") as f:
        for line in f:
            c = json.loads(line)
            first_msg = next((m['text'] for m in c['messages'] if m['role'] == 'customer'), "")
            c['intent'] = heuristic_label(first_msg)
            labeled_data.append(c)
            
    with open(output_path, "w") as f:
        for item in labeled_data:
            f.write(json.dumps(item) + "\n")
    print(f"Labeled {len(labeled_data)} records in {output_path}")

def label_datasets():
    print("Labeling TRAIN and DEV datasets via heuristics (simulating a labeled corpus)...")
    label_file("artifacts/splits/train.jsonl", "artifacts/splits/train_labeled.jsonl")
    label_file("artifacts/splits/dev.jsonl", "artifacts/splits/dev_labeled.jsonl")
    # We leave golden.jsonl unlabeled for Phase 12 (hand-labeling)
    
if __name__ == "__main__":
    label_datasets()
