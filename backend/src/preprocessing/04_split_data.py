import json
import random
import os

def create_splits():
    random.seed(42)
    
    with open("../data/processed/selected_brand_conversations.json", "r") as f:
        convos = json.load(f)
        
    print(f"Total conversations loaded: {len(convos)}")
    
    # 1. Deduplicate by conversation ID
    unique_convos = {}
    for c in convos:
        unique_convos[c['conversation_id']] = c
        
    convos = list(unique_convos.values())
    print(f"Total after ID deduplication: {len(convos)}")
    
    # 2. Deduplicate by exact first customer message match
    text_dedup = {}
    for c in convos:
        first_msg = next((m['text'] for m in c['messages'] if m['role'] == 'customer'), "")
        text_dedup[first_msg] = c
        
    convos = list(text_dedup.values())
    print(f"Total after exact text deduplication: {len(convos)}")
    
    # 3. Stratified Golden Set Sampling (200)
    short_convos = [c for c in convos if c['turn_count'] <= 2]
    long_convos = [c for c in convos if c['turn_count'] > 2]
    
    # Take 100 short, 100 long for GOLDEN
    golden_short = random.sample(short_convos, 100)
    golden_long = random.sample(long_convos, 100)
    golden = golden_short + golden_long
    
    # 4. Remove Golden from pool
    golden_ids = set([c['conversation_id'] for c in golden])
    remaining = [c for c in convos if c['conversation_id'] not in golden_ids]
    
    # 5. Sample DEV (1000)
    random.shuffle(remaining)
    dev = remaining[:1000]
    
    # 6. Rest is TRAIN
    train = remaining[1000:]
    
    # Verification (Leakage check)
    train_ids = set([c['conversation_id'] for c in train])
    dev_ids = set([c['conversation_id'] for c in dev])
    
    leak_golden_train = golden_ids.intersection(train_ids)
    leak_golden_dev = golden_ids.intersection(dev_ids)
    leak_train_dev = train_ids.intersection(dev_ids)
    
    leakage_report = {
        "golden_in_train": len(leak_golden_train),
        "golden_in_dev": len(leak_golden_dev),
        "train_in_dev": len(leak_train_dev),
        "is_safe": len(leak_golden_train) == 0 and len(leak_golden_dev) == 0 and len(leak_train_dev) == 0
    }
    
    os.makedirs("artifacts/splits", exist_ok=True)
    os.makedirs("artifacts/audit", exist_ok=True)
    
    with open("artifacts/audit/leakage_report.json", "w") as f:
        json.dump(leakage_report, f, indent=2)
        
    print(f"Leakage check safe: {leakage_report['is_safe']}")
    
    # Save JSONL
    def save_jsonl(data, path):
        with open(path, "w") as f:
            for item in data:
                f.write(json.dumps(item) + "\n")
                
    save_jsonl(train, "artifacts/splits/train.jsonl")
    save_jsonl(dev, "artifacts/splits/dev.jsonl")
    save_jsonl(golden, "artifacts/splits/golden.jsonl")
    
    # Manifest
    manifest = {
        "train_count": len(train),
        "dev_count": len(dev),
        "golden_count": len(golden),
        "total": len(train) + len(dev) + len(golden)
    }
    
    with open("artifacts/splits/split_manifest.json", "w") as f:
        json.dump(manifest, f, indent=2)
        
    print(f"Saved splits: {manifest}")

if __name__ == "__main__":
    create_splits()
