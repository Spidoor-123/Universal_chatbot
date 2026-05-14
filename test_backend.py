import requests
import json

url = "http://localhost:8002/api/chat"

def test_partner(site_key, email="test@example.com"):
    print(f"Testing Site Key: {site_key}")
    payload = {
        "messages": [{"role": "user", "content": email}],
        "site_key": site_key
    }
    try:
        resp = requests.post(url, json=payload)
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.text}")
    except Exception as e:
        print(f"Error: {e}")
    print("-" * 20)

if __name__ == "__main__":
    # Test Alpha (XON)
    test_partner("partner-alpha")
    
    # Test Beta (HIBP)
    test_partner("partner-beta")
    
    # Test Invalid
    test_partner("invalid-key")
