import json
import os
from google import genai
from tqdm import tqdm
from dotenv import load_dotenv
import time

load_dotenv()

def label_golden():
    print("Labeling golden set with Ground Truth...")
    api_key = os.environ.get("GEMINI_API_KEY")
    client = genai.Client(api_key=api_key)
    
    labeled_data = []
    
    with open("artifacts/splits/golden.jsonl", "r") as f:
        lines = f.readlines()
        
    for idx, line in enumerate(tqdm(lines)):
        c = json.loads(line)
        first_cust = next((m['text'] for m in c['messages'] if m['role'] == 'customer'), "")
        
        prompt = f"""
You are a Senior Customer Support Manager at AmazonHelp.
Please analyze the following customer message and determine the Ground Truth values.

Customer Message: {first_cust}

1. intent: Must be one of ["Order Status & Tracking", "Delivery Delay", "Returns & Refunds", "Product Damage/Defect", "Account & Login", "Prime Membership & Billing", "Payment & Gift Cards", "UNKNOWN"]
2. decision: Should this be "AUTO_HANDLE" or "ESCALATE"? Escalate if sensitive (finance/auth/unknown) or very high risk. Auto-handle otherwise.

Output ONLY JSON:
{{"intent": "Category", "decision": "ESCALATE/AUTO_HANDLE"}}
"""
        try:
            res = client.models.generate_content(model='gemini-3.6-flash', contents=prompt)
            out = res.text.strip().strip('```json').strip('```')
            data = json.loads(out)
            
            c["ground_truth_intent"] = data.get("intent", "UNKNOWN")
            c["ground_truth_decision"] = data.get("decision", "ESCALATE")
        except Exception as e:
            c["ground_truth_intent"] = "UNKNOWN"
            c["ground_truth_decision"] = "ESCALATE"
            
        labeled_data.append(c)
        time.sleep(0.5) # Avoid rate limits
        
    with open("artifacts/splits/golden_labeled.jsonl", "w") as f:
        for c in labeled_data:
            f.write(json.dumps(c) + "\n")
            
    print(f"Labeled {len(labeled_data)} golden examples.")

if __name__ == "__main__":
    label_golden()
