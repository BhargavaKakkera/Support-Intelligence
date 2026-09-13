import json
import pickle
import numpy as np
import os
import math
import torch
from sentence_transformers import SentenceTransformer
from sentence_transformers.cross_encoder import CrossEncoder

class HistoricalRetriever:
    def __init__(self):
        self.bm25 = None
        self.semantic_embeddings = None
        self.conversations = []
        
        self.device = "cpu"
        self.encoder = None
        self.reranker = None
        
        self.load_indices()
        
    def load_indices(self):
        try:
            with open("models/bm25_index.pkl", "rb") as f:
                self.bm25 = pickle.load(f)
                
            self.semantic_embeddings = np.load("models/semantic_index.npy")
            
            with open("models/retrieval_corpus.json", "r") as f:
                self.conversations = json.load(f)
                
            print(f"Loading SentenceTransformer and CrossEncoder on {self.device}...")
            self.encoder = SentenceTransformer('all-MiniLM-L6-v2', device=self.device)
            self.reranker = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2', device=self.device)
                
        except FileNotFoundError:
            print("Warning: Indices not found. Run build_index.py first.")
            
    def _get_embedding(self, text):
        if not self.encoder:
            return np.zeros(384) # all-MiniLM-L6-v2 dimension
        return self.encoder.encode([text], convert_to_numpy=True)[0]
            
    def retrieve(self, query, top_k=3, alpha=0.5):
        if not self.bm25 or not self.conversations:
            return []
            
        # 1. BM25 Scores
        tokenized_query = query.lower().split()
        bm25_scores = self.bm25.get_scores(tokenized_query)
        
        # Normalize BM25
        if np.max(bm25_scores) > 0:
            bm25_scores = bm25_scores / np.max(bm25_scores)
            
        # 2. Semantic Scores
        query_emb = self.get_embedding(query)
        
        semantic_scores = np.zeros(len(self.conversations))
        if np.any(query_emb):
            # cosine similarity
            norms = np.linalg.norm(self.semantic_embeddings, axis=1) * np.linalg.norm(query_emb)
            valid = norms > 0
            semantic_scores[valid] = np.dot(self.semantic_embeddings[valid], query_emb) / norms[valid]
            
        # Normalize Semantic
        if np.max(semantic_scores) > 0:
            semantic_scores = semantic_scores / np.max(semantic_scores)
            
        # 3. Get Top-K candidates from BM25 and Semantic
        top_k_fetch = max(20, top_k * 4) # Fetch 20 for reranking
        bm25_top_indices = np.argsort(bm25_scores)[::-1][:top_k_fetch]
        semantic_top_indices = np.argsort(semantic_scores)[::-1][:top_k_fetch]
        
        # Merge candidate indices
        candidate_indices = list(set(bm25_top_indices).union(set(semantic_top_indices)))
        
        if not candidate_indices or not self.reranker:
            return []
            
        # 4. Cross-Encoder Reranking
        cross_encoder_pairs = []
        for idx in candidate_indices:
            conv = self.conversations[idx]
            first_cust = next((m['text'] for m in conv['messages'] if m['role'] == 'customer'), "")
            cross_encoder_pairs.append([query, first_cust])
            
        # Score pairs
        rerank_scores = self.reranker.predict(cross_encoder_pairs)
        
        # Sigmoid to normalize scores roughly 0-1
        rerank_scores = 1 / (1 + np.exp(-rerank_scores))
        
        # Combine with index
        scored_candidates = []
        for i, idx in enumerate(candidate_indices):
            scored_candidates.append({
                "score": float(rerank_scores[i]),
                "bm25_score": float(bm25_scores[idx]),
                "semantic_score": float(semantic_scores[idx]),
                "conversation": self.conversations[idx]
            })
            
        # Sort by rerank score
        scored_candidates.sort(key=lambda x: x["score"], reverse=True)
        
        # Return top-k
        return scored_candidates[:top_k]

    def get_embedding(self, text):
        return self._get_embedding(text)
