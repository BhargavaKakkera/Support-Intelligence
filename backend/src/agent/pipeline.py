from src.agent.transformer_classifier import TransformerClassifier
from src.agent.retriever import HistoricalRetriever
from src.agent.generator import GroundedGenerator
from src.agent.escalator import EscalationEngine
from src.agent.resolution_extractor import ResolutionExtractor
from src.agent.verifier import LLMVerifier
import json

class SupportAgent:
    def __init__(self):
        self.classifier = TransformerClassifier()
        self.retriever = HistoricalRetriever()
        self.extractor = ResolutionExtractor()
        self.generator = GroundedGenerator()
        self.verifier = LLMVerifier()
        self.escalator = EscalationEngine()
        
    def setup(self):
        pass
            
    def handle_message(self, message):
        # 1. Classify Intent
        classification = self.classifier.classify(message)
        intent = classification['intent']
        confidence = classification['confidence']
        
        # 2. Retrieve Evidence (Hybrid + Reranking)
        retrieved_examples_scored = self.retriever.retrieve(message)
        
        # Unpack for downstream
        retrieved_examples = [ex["conversation"] for ex in retrieved_examples_scored]
        
        retrieval_score = 0.0
        reranker_score = 0.0
        if retrieved_examples_scored:
            # The top example's scores
            top_ex = retrieved_examples_scored[0]
            retrieval_score = float(top_ex.get("semantic_score", 0))
            reranker_score = float(top_ex.get("score", 0))
        
        # 3. Extract Resolution Pattern
        resolution_pattern = self.extractor.extract(retrieved_examples)
        
        # 4. Generate Response
        gen_result = self.generator.generate(message, intent, resolution_pattern, retrieved_examples)
        draft = gen_result["response"]
        
        # 5. Verify Output
        verification = self.verifier.verify(message, draft, resolution_pattern)
        
        # 6. Escalate or Auto-Handle
        escalation = self.escalator.decide(
            intent=intent,
            confidence=confidence,
            retrieval_score=retrieval_score,
            reranker_score=reranker_score,
            risk_flags={
                "unsupported_claims": not verification["is_safe"],
                "verifier_reason": verification["reason"]
            }
        )
        
        # Determine overall API status
        api_status = "OK"
        if gen_result.get("api_status") == "RATE_LIMITED" or verification.get("api_status") == "RATE_LIMITED":
            api_status = "RATE_LIMITED"
        elif gen_result.get("api_status") == "ERROR" or verification.get("api_status") == "ERROR":
            api_status = "ERROR"

        return {
            "customer_message": message,
            "intent": intent,
            "intent_confidence": confidence,
            "retrieved_examples": len(retrieved_examples),
            "retrieval_score": retrieval_score,
            "reranker_score": reranker_score,
            "resolution_pattern": resolution_pattern,
            "draft_response": draft,
            "verifier_safe": verification["is_safe"],
            "decision": escalation["decision"],
            "decision_reason": escalation["reason"],
            "grounding": gen_result["grounding_references"],
            "api_status": api_status
        }

if __name__ == "__main__":
    agent = SupportAgent()
    agent.setup()
    res = agent.handle_message("My order is two weeks late. Where is it?")
    print(json.dumps(res, indent=2))
