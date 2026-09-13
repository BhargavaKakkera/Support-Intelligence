import os
import json
from google import genai

class LLMVerifier:
    def __init__(self, use_llm=True):
        self.use_llm = use_llm
        self.api_key = os.environ.get("GEMINI_API_KEY")
        if self.use_llm and self.api_key:
            self.client = genai.Client(api_key=self.api_key)
        else:
            self.client = None
            
    def verify(self, customer_message, draft_response, resolution_pattern):
        if not self.client:
            return {"is_safe": True, "reason": "Fallback: No API key.", "api_status": "OK"}
            
        prompt = f"""
You are a strict QA bot for AmazonHelp. Review the drafted response.

Customer Message: {customer_message}
Expected Policy: {resolution_pattern}
Draft Response: {draft_response}

Check for:
1. HALLUCINATIONS: Did the agent invent a specific delivery date, tracking number, or refund amount?
2. POLICY VIOLATION: Does the draft contradict the expected policy?

Output strictly in JSON:
{{"is_safe": true/false, "reason": "short explanation"}}
"""
        try:
            res = self.client.models.generate_content(
                model='gemini-3.6-flash',
                contents=prompt
            )
            out = res.text.strip().strip('```json').strip('```')
            data = json.loads(out)
            # Default to False if missing for safety
            return {
                "is_safe": bool(data.get("is_safe", False)),
                "reason": str(data.get("reason", "Verified via LLM")),
                "api_status": "OK"
            }
        except Exception as e:
            error_str = str(e)
            is_rate_limit = "429" in error_str or "RESOURCE_EXHAUSTED" in error_str
            # Zero-Hallucination Policy: Fail closed
            return {
                "is_safe": False, 
                "reason": f"Verifier crash: {error_str}",
                "api_status": "RATE_LIMITED" if is_rate_limit else "ERROR"
            }
