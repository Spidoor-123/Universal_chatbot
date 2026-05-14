import httpx
from .base import DataConnector

class XONConnector(DataConnector):
    async def check_email(self, email: str) -> str:
        url = f"https://api.xposedornot.com/v1/check-email/{email}"
        async with httpx.AsyncClient() as client:
            try:
                resp = await client.get(url)
                if resp.status_code == 200:
                    data = resp.json()
                    breaches = data.get("breaches", [])
                    return ", ".join([b[0] for b in breaches]) if breaches else "None"
                elif resp.status_code == 404:
                    return "None"
                return f"Error: Status {resp.status_code}"
            except Exception as e:
                return f"Error: {str(e)}"
