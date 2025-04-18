import requests

BASE_URL = "http://127.0.0.1:8000"

def test_post_prompt():
    response = requests.post(
        f"{BASE_URL}/prompts",
        json={"prompt": "Test fra tests.py"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "total" in data
    print("✅ POST-test OK")

def test_get_prompts():
    response = requests.get(f"{BASE_URL}/prompts")
    assert response.status_code == 200
    data = response.json()
    assert "prompts" in data
    print("✅ GET-test OK")
