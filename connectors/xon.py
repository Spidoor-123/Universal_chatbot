import httpx
from .base import DataConnector

class XONConnector(DataConnector):
    async def check_email(self, email: str) -> str:
        url = f"https://api.xposedornot.com/v1/check-email/{email}"
        
        # XposedOrNot Best Practices:
        # 1. Use a descriptive User-Agent
        # 2. Set Content-Length to 0 for GET requests
        headers = {
            "User-Agent": "Universal-AI-Security-Chatbot",
            "Content-Length": "0"
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                resp = await client.get(url, headers=headers)
                
                if resp.status_code == 200:
                    data = resp.json()
                    # XON returns breaches as a list of lists: [["BreachName1"], ["BreachName2"]]
                    breach_list = data.get("breaches", [])
                    if not breach_list:
                        return "None"
                    return ", ".join([b[0] for b in breach_list])
                
                elif resp.status_code == 404:
                    return "None"
                
                elif resp.status_code == 429:
                    return "Error: XposedOrNot rate limit exceeded. Please try again later."
                
                return f"Error: XposedOrNot API returned status {resp.status_code}"
            
            except httpx.TimeoutException:
                return "Error: Connection to XposedOrNot timed out."
            except Exception as e:
                return f"Error connecting to XposedOrNot: {str(e)}"
