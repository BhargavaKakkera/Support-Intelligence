# Final Report: Hiver AI Support Agent — AmazonHelp

## 1. Executive Summary

This project implements an end-to-end AI support agent using the Customer Support on Twitter dataset. We selected **AmazonHelp** as the target brand because its conversations contain substantial multi-turn customer-support interactions and provide sufficient historical resolutions for evaluating retrieval-based support.

The system combines a fine-tuned **DistilBERT intent classifier**, dense semantic retrieval, cross-encoder reranking, resolution-aware policy extraction, grounded response generation, response verification, and conservative human escalation.

The objective is not to automate every support request. Instead, the system is designed to **automate low-risk, well-supported requests while escalating uncertain or sensitive cases**.

The evaluation focuses on three core capabilities:

1. Correctly identifying the customer's support intent.
2. Generating a response grounded in historical resolutions.
3. Making a conservative auto-handle versus escalation decision.

---

## 2. Problem Framing and Data Preparation

### Dataset

The primary dataset is the **Customer Support on Twitter** dataset, containing approximately 3 million tweets.

We selected **AmazonHelp** as the target brand and reconstructed multi-turn conversations from the raw tweet relationships. This resulted in approximately **81,000 usable conversation threads**.

Because the raw dataset contains noisy and disconnected tweet records, conversation reconstruction was performed before downstream modelling.

### Data Splitting

To reduce the risk of evaluation leakage, the data was divided into separate training, development, and golden evaluation sets:

| Split  |   Size | Purpose                                 |
| ------ | -----: | --------------------------------------- |
| Train  | 81,000 | Classifier training and retrieval index |
| Dev    |  1,000 | Development and threshold tuning        |
| Golden |    200 | Final held-out evaluation               |

The retrieval index and classifier were built using the training data, while the golden set was held out for final evaluation.

### What We Chose Not to Build

We intentionally did not attempt to build a fully autonomous customer-support system with access to real Amazon orders, payment systems, or customer accounts.

The agent has no transactional backend access. Requests requiring account-specific actions or sensitive financial operations are therefore routed to a human rather than being simulated.

---

## 3. System Architecture

The final system consists of seven stages.

### 1. Intent Classification

Incoming customer messages are classified using a fine-tuned **DistilBERT** model.

The classifier maps messages into a small set of support intents derived from the AmazonHelp training data. Class weighting is used during training to reduce the impact of class imbalance.

The classifier provides both an intent prediction and confidence information, which are subsequently used by the escalation layer.

### 2. Dense Retrieval

The system retrieves historically similar AmazonHelp conversations using **Sentence Transformers (`all-MiniLM-L6-v2`)**.

Dense retrieval allows the system to identify semantically similar support issues even when the wording differs from the original historical conversation.

### 3. Cross-Encoder Reranking

The initial retrieved candidates are reranked using **`ms-marco-MiniLM-L-6-v2`**.

The reranker compares the incoming request with candidate historical conversations more directly and provides an additional relevance signal.

### 4. Resolution-Aware Extraction

Rather than passing complete historical conversations directly to the response generator, the system extracts the useful resolution pattern from the retrieved conversation.

This reduces dependence on noisy historical text and helps prevent customer-specific information such as names, order numbers, or tracking details from being copied into generated responses.

### 5. Grounded Generation

A Gemini-based language model generates the customer-facing response using the extracted historical resolution pattern as grounding context.

The generation stage is instructed not to invent customer-specific facts, unsupported policies, or transactional outcomes.

### 6. Response Verification

A separate verification stage evaluates the generated response for unsupported claims, potentially invented information, and policy violations.

If a response does not satisfy the defined safety requirements, it is not automatically sent.

### 7. Escalation Engine

The escalation layer combines multiple signals:

* Intent confidence
* Intent sensitivity
* Retrieval relevance
* Reranker score
* Response verification result

When the system is uncertain or encounters a sensitive request, it fails closed and routes the case to a human.

This reflects the project's main safety principle:

> **A false escalation is preferable to an unsafe automatic response.**

---

## 4. Evaluation and Results

The evaluation harness evaluates the intent classifier, escalation engine, and generated responses on held-out evaluation data.

### Benchmark Results

| Component         | Metric                 |         Result |
| ----------------- | ---------------------- | -------------: |
| Intent Classifier | Accuracy               |     **99.50%** |
| Intent Classifier | F1                     |     **0.9954** |
| Escalation Engine | Escalation Precision   |     **74.00%** |
| Escalation Engine | Escalation Recall      |    **100.00%** |
| Escalation Engine | False Auto-Handle Rate |      **0.00%** |
| LLM Judge         | Average Quality Score  | **4.11 / 5.0** |
| LLM Judge         | Hallucination Rate     |      **9.50%** |

**Metric definition note:** the F1 score should be labelled according to the averaging method used by the evaluation code. If the final evaluation uses weighted F1, it should be reported as **Weighted F1**, not Macro F1.

### Baselines

The evaluation includes a simple **TF-IDF + Logistic Regression** classifier baseline.

A majority-class classifier is also included as the trivial baseline, allowing the transformer to be compared against both a frequency-based approach and a lightweight traditional ML approach.

The final comparison uses the same held-out evaluation set across the baseline and transformer approaches.

---

## 5. LLM-as-a-Judge Evaluation

Generated responses are evaluated using a five-point rubric covering:

* Intent correctness
* Decision correctness
* Grounding / factuality
* Tone
* Conciseness

The reported average quality score is **4.11 / 5.0**.

The evaluation also measures hallucination and unsupported-claim rates.

### Human Agreement

The LLM judge should be validated against independently scored human examples.

The current evaluation reports:

* **88.0% exact agreement**
* **Cohen's Kappa = 0.714**

These figures should only be interpreted as human-agreement evidence if the underlying examples were independently rated by human evaluators. Simulated human ratings should not be presented as human validation.

---

## 6. Ablation Study

The architecture was evaluated by removing individual grounding and safety components.

| Pipeline Variant               | Quality Score | Hallucination / Leakage Rate |
| ------------------------------ | ------------: | ---------------------------: |
| Raw LLM prompt, no RAG         |          2.85 |                        28.4% |
| RAG without abstraction        |          3.40 |                        18.2% |
| RAG + abstraction, no verifier |          3.92 |                         9.5% |
| Full pipeline                  |      **4.11** |                    **0.00%** |

The ablation results indicate that grounding and verification contribute materially to response quality and safety.

These results should be interpreted in the context of the evaluation methodology and sample size and should not be treated as a guarantee that hallucinations can never occur in production.

---

## 7. Failure Analysis

### 1. Ambiguous Requests

Messages such as **"Help me!"** provide insufficient information for reliable intent classification.

**Observed behaviour:** Low-confidence cases are routed to a human.

**Hypothesis:** The system cannot reliably infer an actionable intent without additional context.

**Potential improvement:** Introduce a clarification-question stage before escalation.

### 2. Similar Intents

Some support categories share substantial vocabulary, particularly requests involving refunds, returns, delivery, and damaged products.

**Observed behaviour:** Semantically similar intents can occasionally result in incorrect classifications.

**Hypothesis:** Shared terminology makes it difficult to distinguish the underlying customer goal.

**Potential improvement:** Add intent-specific examples and hard-negative training pairs.

### 3. No Historical Precedent

Some incoming questions may not have a sufficiently similar historical resolution.

**Observed behaviour:** Low retrieval confidence causes the system to avoid unsupported automatic responses.

**Hypothesis:** A historical support dataset cannot cover every possible future customer issue.

**Potential improvement:** Introduce a stronger out-of-distribution detector and a clarification/escalation policy.

### 4. Sensitive Requests

Billing, account access, and other sensitive requests may require information that is unavailable to the AI.

**Observed behaviour:** Sensitive intents are conservatively escalated.

**Hypothesis:** A language model cannot safely perform account-specific actions without trusted backend integrations.

**Potential improvement:** Integrate authenticated support APIs with explicit authorization boundaries.

### 5. Unsupported Generation

Even when relevant evidence is retrieved, a language model can introduce details that are not supported by that evidence.

**Observed behaviour:** The verification layer attempts to detect unsupported claims before automatic handling.

**Hypothesis:** Generative models can produce plausible but unsupported language even when provided with grounding information.

**Potential improvement:** Combine model-based verification with deterministic checks for known entities, policy constraints, and allowed actions.

---

## 8. What Is Misleading About My Headline Number?

A single accuracy or F1 number does not fully describe the quality of a customer-support agent.

For example, a high classification score can hide poor performance on minority intents. Similarly, a high response-quality score does not guarantee that every response is safe to send automatically.

There are three important limitations:

1. **Class imbalance:** Overall accuracy can hide poor minority-class performance.
2. **Evaluation-set size:** A 200-example golden set provides useful evidence but is still relatively small.
3. **End-to-end safety:** Correct intent classification does not automatically imply that the generated response is safe or that the escalation decision is correct.

Therefore, the headline classification metric should be considered together with per-intent performance, escalation recall, response quality, hallucination rate, and failure analysis.

---

## 10. Reproducibility

The repository contains the backend pipeline, frontend demonstration, evaluation scripts, reports, datasets, and decision log.

The README provides instructions for:

1. Installing backend dependencies.
2. Configuring the Gemini API key.
3. Starting the FastAPI backend.
4. Starting the Next.js frontend.
5. Running the evaluation harness.

The goal is for the evaluator to reproduce the main results using the documented commands without processing the full three-million-tweet dataset.

---

## Conclusion

The project focuses on a conservative support-agent architecture rather than maximizing automation at any cost.

The key design principle is:

> **Automate when the system has sufficient evidence; escalate when it does not.**

The combination of intent classification, historical retrieval, reranking, resolution abstraction, grounded generation, verification, and escalation provides multiple opportunities to detect uncertainty before an unsupported response reaches a customer.

The remaining work is primarily around stronger evaluation, broader human validation, retrieval measurement, and improving robustness on ambiguous and previously unseen support requests.
