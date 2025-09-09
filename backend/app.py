from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# Request body schema

class URLRequest(BaseModel):
    url: str

@app.post("/scan-url")
def scan_url(data: URLRequest):
    url = data.url

    # ⚠️ Temporary dummy prediction (replace later with model.predict)
    if "login" in url or "bank" in url:
        result = "phishing"
    else:
        result = "safe"

    return {"url": url, "prediction": result}
