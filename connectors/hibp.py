from .base import DataConnector
import httpx
import os

class HIBPConnector(DataConnector):
    async def check_email(self, email: str) -> str:
        api_key = os.getenv("HIBP_API_KEY")
        if not api_key or api_key == "your_hibp_api_key_here":
            return "Error: HIBP API Key not configured."

        url = f"https://haveibeenpwned.com/api/v3/breachedaccount/{email}?truncateResponse=false"
        headers = {
            "hibp-api-key": api_key,
            "user-agent": "Universal-AI-Security-Chatbot"
        }

        async with httpx.AsyncClient() as client:
            try:
                resp = await client.get(url, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    return ", ".join([b["Name"] for b in data])
                elif resp.status_code == 404:
                    return "None"
                elif resp.status_code == 401:
                    return "Error: Invalid HIBP API Key"
                elif resp.status_code == 429:
                    return "Error: HIBP Rate limit exceeded"
                return f"Error: Status {resp.status_code}"
            except Exception as e:
                return f"Error connecting to HIBP: {str(e)}"
