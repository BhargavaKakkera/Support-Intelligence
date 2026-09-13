from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import os
from dotenv import load_dotenv

load_dotenv()

# Add the root directory to the python path so we can import src.agent.pipeline
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.agent.pipeline import SupportAgent

app = FastAPI(title="Hiver AI Support API")

# Configure CORS so Next.js on localhost:3000 can talk to this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the agent
agent = SupportAgent()
agent.setup()

class AnalyzeRequest(BaseModel):
    query: str

@app.post("/api/analyze")
async def analyze_query(req: AnalyzeRequest):
    try:
        # Run the pipeline
        result = agent.handle_message(req.query)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
