# 🚀 Hiver AI Support Intelligence (DistilBERT Edition)

![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)
![Python](https://img.shields.io/badge/Python-3.11%2B-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Transformers](https://img.shields.io/badge/HuggingFace-Transformers-yellow)

Welcome to the **Hiver AI Support Intelligence** platform! This repository contains a state-of-the-art, end-to-end Machine Learning pipeline designed to safely and autonomously resolve customer support queries for AmazonHelp.

By combining the natural language understanding of a **Fine-Tuned DistilBERT Transformer** with the reasoning power of a **Retrieval-Augmented Generation (RAG) Pipeline**, this agent achieves incredibly high accuracy while enforcing a strict **Zero-Hallucination Policy**.

---

## 🧠 Architectural Overview

Our system does not rely on a single, hallucination-prone LLM prompt. Instead, it utilizes a rigorous **6-Stage Pipeline**:

1. **Intent Classification**: A Fine-Tuned DistilBERT Transformer uses weighted cross-entropy to handle extreme class imbalance, routing queries into 9 distinct categories with high precision (e.g., *Product Damage/Defect*, *Delivery Delay*).
2. **Dense Retrieval**: SentenceTransformers semantically search a vector database of 81,000 verified historical AmazonHelp tickets.
3. **Policy Abstraction**: Extracts the raw historical resolution and strips all Personally Identifiable Information (PII) to form a safe, abstract policy pattern.
4. **Grounded Generation**: Gemini 1.5 Pro drafts a customer-facing response strictly grounded in the abstract policy pattern.
5. **Post-Gen Verification**: An adversarial LLM verifies that no tracking numbers, links, or unsupported claims were invented.
6. **Escalation Engine**: A multi-signal gatekeeper combining confidence scores from the Transformer and Retriever. If the AI is unsure, or if the intent is highly sensitive (e.g., Billing), it safely **Fails Closed** and escalates to a human agent.

---

## ⚡ Quickstart (Run it locally in < 5 minutes)

*(Note: Pre-trained transformer weights and semantic FAISS indices have already been generated for you!)*

### 1. Setup Backend Environment
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure API Keys
Create a `.env` file in the `backend/` directory:
```bash
GEMINI_API_KEY=your_gemini_key_here
```

### 3. Boot the Services
Start the Python backend and Next.js frontend in separate terminal windows:

**Terminal 1 (FastAPI Backend):**
```bash
cd backend
PYTHONPATH=. ./venv/bin/python src/api/server.py
```

**Terminal 2 (Next.js Frontend):**
```bash
cd frontend
npm install
npm run dev
```

### 4. Experience the Dashboard
Open your browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

Click on **Test Support Query** to paste examples from the `dev_evaluation_dataset.csv` directly into the AI console!

---

## 📊 Evaluation & Metrics

To mathematically verify the DistilBERT Transformer's performance on unseen Golden test data:
```bash
cd backend
PYTHONPATH=. ./venv/bin/python src/agent/eval_ablations.py
```

## 📁 Repository Structure
- `backend/`: Core AI architecture, FastAPI server, Preprocessing scripts, Models, and Vector Artifacts.
- `frontend/`: Stunning Next.js web application for visualizing the execution pipeline.
- `reports/`: Deep-dive Markdown reports detailing EDA, Data Forensics, and final architectural decisions.
- `dev_evaluation_dataset.csv`: 1,000 cleanly labeled examples to test in the UI.

---
*Built for the Hiver Customer Support AI Project.*
