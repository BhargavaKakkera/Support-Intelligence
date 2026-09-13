import json
import os
import pickle
import numpy as np
from rank_bm25 import BM25Okapi
from google import genai
from tqdm import tqdm
from dotenv import load_dotenv

load_dotenv()

def build_indices():
    print("Loading TRAIN dataset for indexing...")
    conversations = []
    texts = []
    
    with open("artifacts/splits/train.jsonl", "r") as f:
        # Sample to 5000 for semantic indexing cost/speed since it's an assignment
        max_samples = 5000 
        for line in f:
            c = json.loads(line)
            # Only index conversations that have resolutions (turn_count > 1)
            if c['turn_count'] > 1:
                first_cust = next((m['text'] for m in c['messages'] if m['role'] == 'customer'), "")
                if first_cust:
                    texts.append(first_cust)
                    conversations.append(c)
            if len(texts) >= max_samples:
                break
                
    print(f"Building BM25 Index on {len(texts)} texts...")
    tokenized_corpus = [doc.lower().split() for doc in texts]
    bm25 = BM25Okapi(tokenized_corpus)
    
    os.makedirs("models", exist_ok=True)
    with open("models/bm25_index.pkl", "wb") as f:
        pickle.dump(bm25, f)
        
    print("Building Semantic Index using Sentence Transformers...")
    from sentence_transformers import SentenceTransformer
    import torch
    
    device = "cpu"
    print(f"Loading all-MiniLM-L6-v2 on {device}...")
    model = SentenceTransformer('all-MiniLM-L6-v2', device=device)
    
    # Batch embedding to save time
    batch_size = 64
    
    # We can just use the model's encode function directly which handles batching
    print("Encoding corpus...")
    embeddings = model.encode(texts, batch_size=batch_size, show_progress_bar=True, convert_to_numpy=True)
    
    with open("models/semantic_index.npy", "wb") as f:
        np.save(f, embeddings)
        
    with open("models/retrieval_corpus.json", "w") as f:
        json.dump(conversations, f)
        
    print("Hybrid retrieval index build complete.")

if __name__ == "__main__":
    build_indices()
