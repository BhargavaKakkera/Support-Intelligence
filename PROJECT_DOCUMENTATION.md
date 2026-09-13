# Hiver AI Support Agent - Project Documentation

## 1. Project Overview
The **Hiver AI Support Agent** is a production-ready customer support intelligence pipeline designed for the **AmazonHelp** brand. It acts as the first line of defense for customer queries, automatically resolving common issues while strictly escalating sensitive or high-risk cases to human agents.

The core philosophy of this project is the **Zero-Hallucination Policy**: the AI must never invent order numbers, tracking links, policies, or facts. Large Language Models (LLMs) are notorious for hallucinating details when asked to act as customer support agents. To prevent this, the Hiver agent does not rely on a single raw LLM call. Instead, it uses a multi-stage, mathematically verified pipeline that tightly controls what the LLM is allowed to say.

---

## 2. Architecture & Data Flow (The 7-Stage Pipeline)

When a customer sends a message (e.g., *"My order is late, where is it?"*), the pipeline executes the following 7-stage sequence in real-time:

### Step 1: Intent Classification (DistilBERT)
**How it works:** We use a fine-tuned **DistilBERT** transformer model to classify the customer's intent into 9 rigid categories (e.g., `Delivery Delay`, `Product Damage/Defect`, `Account/Billing`). During training, we apply **Weighted Cross-Entropy (Class Weights)** to heavily penalize the model for missing rare classes. Furthermore, we rigorously cleaned the training data heuristics to ensure high-quality ground truth labels, proving that algorithmic architecture must be paired with pristine data.
**Why not an LLM?** A specialized smaller transformer runs in ~6 milliseconds locally. It guarantees deterministic, structured outputs, meaning it never accidentally replies with conversational text when we just need a classification tag. Furthermore, it costs $0 in API fees, which is critical for the high-volume frontline of customer support.

### Step 2: Dense Retrieval (all-MiniLM-L6-v2)
**How it works:** The agent searches an offline database of 81,000 historical *AmazonHelp* conversations to find similar past issues. It uses a **Sentence-Transformer** (`all-MiniLM-L6-v2`) to generate dense vector embeddings locally. This allows the system to understand the *semantic meaning* of the customer's issue rather than just blindly matching keywords, ensuring it finds historically accurate solutions.

### Step 3: Cross-Encoder Reranking (ms-marco-MiniLM-L-6-v2)
**How it works:** Dense retrieval is fast but can sometimes return matches that are topically similar but contextually irrelevant (e.g., confusing "Where is my refund?" with "How do I return this?"). The pipeline uses a robust **Cross-Encoder** to deeply compare the customer's query against the top retrieved historical cases side-by-side. It produces a highly calibrated relevance score from 0.0 to 1.0, ensuring we only use perfectly matched historical precedent.

### Step 4: Resolution-Aware Abstraction (Safety Layer)
**How it works:** If we pass raw historical chat transcripts directly to the generative LLM, we risk massive data leakage. The LLM might accidentally copy another customer's name, email, or order number into the new response. To prevent this, our `ResolutionExtractor` algorithm strips away all PII and specific details, abstracting the historical solution into a clean, safe policy pattern. 
*Example:* Instead of seeing *"Hi John, your order #123 is delayed"*, the agent receives the abstract pattern: `"ISSUE_APOLOGY, PROVIDE_HELP_LINK"`.

### Step 5: Grounded Response Generation (LLM)
**How it works:** Finally, the system prompts the **Gemini 3.6-Flash LLM** to draft a polite response to the customer. Crucially, the prompt strictly forces the LLM to ground its response *only* in the abstracted policy pattern generated in Step 4. It is strictly forbidden from inventing details or making unauthorized promises.

### Step 6: Post-Generation Verification (LLM-as-Judge)
**How it works:** Before the draft is ever sent to the customer, a second, independent LLM (the `LLMVerifier`) audits the drafted response. It mathematically checks if the generator invented any facts (hallucinations) or contradicted the established policy pattern. It acts as an automated QA agent, returning a strict `True/False` safety boolean.

### Step 7: Multi-Signal Escalation Engine
**How it works:** The final component acts as the ultimate safety net. It decides whether to send the draft to the customer (`AUTO_HANDLE`) or route the ticket to a human (`ESCALATE`). It fails closed (escalates) if:
- The intent is flagged as highly sensitive (e.g., Billing, Payment, Account Login).
- The intent classification confidence is < 70%.
- The retrieval similarity is too low (< 30%), meaning there is no clear historical precedent.
- The reranker relevance score is too low (< 50%).
- The `LLMVerifier` flagged a potential hallucination or risk.

---

## 3. Gemini API Usage and Rate Limits

**Is an API key required?**
Yes. You must provide a `GEMINI_API_KEY` in your `.env` file. While the heavy lifting (Classification, Retrieval, Reranking, and Abstraction) is done locally for free by HuggingFace Transformers, the Gemini API is used for the two final downstream tasks that require generative language:
1. Drafting the final grounded response (`gemini-3.6-flash`).
2. Running the strict post-generation QA verification (`gemini-3.6-flash`).

*(Note: If no API key is provided, the system gracefully falls back to deterministic heuristics or triggers a safe escalation to a human).*

**Context Window & Cost Efficiency:**
The project uses the `gemini-3.6-flash` model, which boasts an enormous 2,000,000 token context window. However, because we execute abstraction locally and only send strict policy patterns to the API, our prompts are incredibly small (typically under 500 tokens). This results in lightning-fast API inference times, zero context bloat, and minimal API costs.

**Handling Rate Limits:**
The free tier of the Gemini API typically limits Requests Per Minute (RPM). To prevent breaking the application, if the API throws a `429 RESOURCE_EXHAUSTED` error, the UI elegantly catches it. It falls back to a pre-defined generic policy pattern message and displays a clear warning in the dashboard, ensuring the app remains usable.

---

## 4. Evaluation Methodology

How do we prove this works? The project includes a robust, automated evaluation harness (`src/agent/eval_ablations.py`):
1. **Golden Test Set:** A holdout set of 200 labeled examples that the models have *never* seen during training. This mathematically proves the system generalizes to new customer queries without just memorizing the database.
2. **LLM-as-a-Judge:** We use a strict 5-point rubric to evaluate the final answers, heavily penalizing any hallucinations or bad tone.
3. **Ablation Testing:** The framework allows developers to toggle off specific pipeline stages (e.g., turning off the Reranker or the Verifier) to mathematically prove the performance delta and justify the necessity of the complex architecture.

---

## 5. How to Run Locally

1. Make sure you have Node.js and Python 3.10+ installed.
2. Add your `GEMINI_API_KEY` to a `.env` file in the `backend/` directory.
3. Install the Python requirements: `cd backend && pip install -r requirements.txt`.
4. Start the Python FastAPI backend: `cd backend && PYTHONPATH=. ./venv/bin/python src/api/server.py`
5. Start the Next.js frontend (in a new terminal): `cd frontend && npm install && npm run dev`
6. Navigate to `http://localhost:3000/console` to see the beautiful, real-time interactive UI in action!
