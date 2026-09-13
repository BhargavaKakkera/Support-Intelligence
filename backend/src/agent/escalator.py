class EscalationEngine:
    def __init__(self):
        # Intents that are inherently sensitive (Finance/Auth/Unknown)
        self.escalation_intents = [
            "Payment & Gift Cards",
            "Prime Membership & Billing",
            "Account & Login",
            "UNKNOWN"
        ]
        
    def decide(self, intent, confidence, risk_flags, retrieval_score, reranker_score):
        # 1. Hard fail on sensitive intents
        if intent in self.escalation_intents:
            return {
                "decision": "ESCALATE",
                "reason": f"Sensitive intent detected."
            }
            
        # 2. Verifier Check (Post-Generation Hallucination check)
        if risk_flags.get("unsupported_claims", False):
            return {
                "decision": "ESCALATE",
                "reason": f"Verifier rejected response."
            }
            
        # 3. Intent Confidence Check
        if confidence < 0.70:
            return {
                "decision": "ESCALATE",
                "reason": f"Intent confidence: {confidence*100:.1f}%. Below required threshold: 70%"
            }
            
        # 4. Retrieval Confidence Check
        if retrieval_score < 0.3 or reranker_score < 0.5:
            return {
                "decision": "ESCALATE",
                "reason": "Insufficient retrieval evidence"
            }
            
        return {
            "decision": "AUTO_HANDLE",
            "reason": f"Safe. High confidence ({confidence*100:.1f}%), common issue ({intent}), verified draft."
        }
