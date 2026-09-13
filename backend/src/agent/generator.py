import os
from google import genai

class GroundedGenerator:
    def __init__(self, use_llm=True):
        self.use_llm = use_llm
        self.api_key = os.environ.get("GEMINI_API_KEY")
        
        if self.use_llm and self.api_key:
            self.client = genai.Client(api_key=self.api_key)
        else:
            self.client = None
            
    def generate(self, customer_message, intent, resolution_pattern, retrieved_examples):
        if not retrieved_examples or resolution_pattern == "NO_PRECEDENT":
            return {
                "response": "I'm sorry, I couldn't find a historical precedent for this issue. Let me transfer you to a human agent.",
                "grounding_references": [],
                "unsupported_claims": False,
                "confidence": 0.0
            }
            
        best_example_id = retrieved_examples[0]['conversation_id']
                
        if self.client is None:
            # Fallback heuristic
            draft = f"Based on our policy ({resolution_pattern}), we can help with this."
            if intent == "Delivery Delay":
                draft = "Sorry your delivery is delayed! " + draft
            return {
                "response": draft,
                "grounding_references": [best_example_id],
                "unsupported_claims": False,
                "confidence": 0.85,
                "api_status": "OK"
            }
            
        # Use Gemini LLM
        prompt = f"""
You are a customer support agent for AmazonHelp.
Your task is to write a polite, concise reply to the customer's message.
You MUST heavily ground your response in the "Resolution Pattern" provided. This pattern describes exactly what action the brand should take (e.g., asking for a DM, offering a refund, etc).
Do not invent policies. Do not invent tracking links or order statuses.
If the pattern says to request a DM for details, you MUST ask the customer for a DM.

Customer Message:
{customer_message}

Detected Intent: {intent}

Resolution Pattern to follow:
{resolution_pattern}

Write the draft response now:
"""
        try:
            response = self.client.models.generate_content(
                model='gemini-3.6-flash',
                contents=prompt
            )
            return {
                "response": response.text.strip(),
                "grounding_references": [best_example_id],
                "unsupported_claims": False, # Will be checked by verifier later
                "confidence": 0.95,
                "api_status": "OK"
            }
        except Exception as e:
            error_str = str(e)
            print(f"Generator LLM Error: {error_str}")
            is_rate_limit = "429" in error_str or "RESOURCE_EXHAUSTED" in error_str
            return {
                "response": f"Based on our policy ({resolution_pattern}), we can help.",
                "grounding_references": [best_example_id],
                "unsupported_claims": False,
                "confidence": 0.5,
                "api_status": "RATE_LIMITED" if is_rate_limit else "ERROR"
            }
