from fastapi import FastAPI, HTTPException
import asyncio
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os
from groq import Groq
from dotenv import load_dotenv
from connectors.xon import XONConnector
from connectors.hibp import HIBPConnector

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

# Partner Database
VALID_SITE_KEYS = {
    "partner-alpha": {"name": "Alpha Security", "connectors": ["xon"]},
    "partner-beta": {"name": "Beta Privacy", "connectors": ["hibp"]},
    "xon-internal": {"name": "XON Dashboard", "connectors": ["xon", "hibp"]}
}

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    site_key: str

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    # 1. Site Key Check
    partner = VALID_SITE_KEYS.get(request.site_key)
    if not partner:
        raise HTTPException(status_code=403, detail="Invalid Site Key")

    user_msg = request.messages[-1].content.strip()
    connector_types = partner["connectors"]

    # 2. Aggregated Connector Logic
    if "@" in user_msg:
        # Extract email
        email = next((w for w in user_msg.split() if "@" in w), user_msg)
        
        # Instantiate connectors
        instances = []
        for ctype in connector_types:
            if ctype == "hibp":
                instances.append(HIBPConnector())
            else:
                instances.append(XONConnector())

        # Fetch in parallel
        results = await asyncio.gather(*[inst.check_email(email) for inst in instances])
        
        # Format for AI
        aggregated_data = ""
        for i, res in enumerate(results):
            aggregated_data += f"- {connector_types[i].upper()} Results: {res}\n"

        system_prompt = f"""
        You are the XON AI Security Assistant.
        Partner: {partner['name']}
        Aggregated Context from {len(connector_types)} sources:
        {aggregated_data}
        
        Rules:
        - If ALL sources say 'None', congratulate and give a tip.
        - If breaches exist in ANY source, list them clearly and give 3 recovery steps.
        - Professional, concise, under 180 words.
        """
    else:
        system_prompt = f"You are the XON AI Security Assistant serving {partner['name']}. Answer security questions accurately."

    messages_to_send = [{"role": "system", "content": system_prompt}] + [{"role": m.role, "content": m.content} for m in request.messages]

    try:
        completion = groq_client.chat.completions.create(
            messages=messages_to_send,
            model="llama-3.1-8b-instant",
            temperature=0.5
        )
        return {"reply": completion.choices[0].message.content}
    except Exception as e:
        return {"reply": f"AI Error: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
