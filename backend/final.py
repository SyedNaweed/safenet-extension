# #!/usr/bin/env python3
# """
# safenet_backend.py
# Phishing detection using:
#  - Heuristics (brand typo, suspicious patterns)
#  - Qdrant (nearest neighbor similarity search)

# Behavior:
#  - Loads QDRANT_URL, QDRANT_API_KEY, QDRANT_COLLECTION from .env
#  - URL marked Legit only if at least one neighbor is legit with similarity >= LEGIT_THRESHOLD
#  - Otherwise Phishing if any neighbor is phishing with similarity >= PHISH_THRESHOLD
#  - Otherwise fallback to heuristic decision
# """

# import os
# import re
# import time
# from urllib.parse import urlparse
# from difflib import SequenceMatcher
# from dotenv import load_dotenv
# from qdrant_client import QdrantClient

# # ----------------- Config -----------------
# load_dotenv()

# QDRANT_URL = os.getenv("QDRANT_URL")
# QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
# COLLECTION_NAME = os.getenv("QDRANT_COLLECTION", "phish_urls")

# LEGIT_THRESHOLD = float(os.getenv("LEGIT_THRESHOLD", "0.90"))
# PHISH_THRESHOLD = float(os.getenv("PHISH_THRESHOLD", "0.75"))
# TOP_K = int(os.getenv("TOP_K", "5"))

# SUSPICIOUS_TLDS = [".xyz", ".top", ".club", ".info", ".buzz", ".tk", ".ml", ".ga"]

# BRAND_KEYWORDS = [
#     "hdfcbank", "hdfc", "icici", "sbi", "axisbank",
#     "paypal", "netflix", "flipkart", "amazon", "microsoft"
# ]

# # ----------------- Utilities -----------------
# def domain_from_url(url: str) -> str:
#     try:
#         parsed = urlparse(url if url.startswith("http") else "http://" + url)
#         return parsed.netloc.lower().replace("www.", "")
#     except Exception:
#         return url.lower()

# def fuzzy_similarity(a: str, b: str) -> float:
#     return SequenceMatcher(None, a, b).ratio()

# # ----------------- Heuristic detection -----------------
# def is_suspicious_heuristic(url: str):
#     u = url.lower()
#     domain = domain_from_url(u)
#     score = 0
#     reasons = []

#     if "@" in u:
#         score += 2
#         reasons.append("Contains '@' in URL")

#     if re.search(r"https?://\d+\.\d+\.\d+\.\d+", u):
#         score += 3
#         reasons.append("Uses raw IP address")

#     if any(u.endswith(tld) for tld in SUSPICIOUS_TLDS):
#         score += 2
#         reasons.append("Suspicious TLD")

#     if u.count("-") > 3:
#         score += 1
#         reasons.append("Too many hyphens")

#     for brand in BRAND_KEYWORDS:
#         if brand in domain:
#             continue
#         ratio = fuzzy_similarity(brand, domain)
#         if 0.6 < ratio < 0.95:
#             score += 3
#             reasons.append(f"Domain similar to brand '{brand}' ({ratio:.2f})")

#     if len(u) > 80:
#         score += 1
#         reasons.append("Unusually long URL")

#     verdict = "Phishing" if score >= 3 else "Likely Safe"
#     return verdict, reasons, score

# # ----------------- Qdrant helper -----------------
# def query_qdrant(client: QdrantClient, collection: str, vector: list, top_k: int = 5):
#     try:
#         resp = client.search(collection_name=collection, query_vector=vector, limit=top_k, with_payload=True)
#         return resp
#     except Exception as e:
#         print("Qdrant query failed:", e)
#         return []

# # ----------------- Detection Pipeline -----------------
# def analyze_url(url: str, client: QdrantClient):
#     print(f"\n🔍 Checking URL: {url}")

#     # Try fetching embedding vector (placeholder if not integrated yet)
#     # In the new setup, your scraper will generate this vector or basic metadata
#     vector = [0.1] * 384  # temporary dummy vector until embedding step is re-added

#     hits = query_qdrant(client, COLLECTION_NAME, vector, TOP_K)

#     found_legit = any(h.payload.get("status") == 1 and h.score >= LEGIT_THRESHOLD for h in hits)
#     found_phish = any(h.payload.get("status") == 0 and h.score >= PHISH_THRESHOLD for h in hits)

#     if found_legit:
#         return {"verdict": "Legit ✅", "reason": "Similar legit neighbor found"}
#     elif found_phish:
#         return {"verdict": "Phishing 🚨", "reason": "Similar phishing neighbor found"}
#     else:
#         heur_v, heur_reasons, _ = is_suspicious_heuristic(url)
#         if heur_v == "Phishing":
#             return {"verdict": "Phishing 🚨", "reason": "Heuristic patterns: " + "; ".join(heur_reasons)}
#         else:
#             return {"verdict": "UNKNOWN", "reason": "No strong match in Qdrant or heuristics"}

# # ----------------- Entry -----------------
# if __name__ == "__main__":
#     if not QDRANT_URL or not QDRANT_API_KEY:
#         raise SystemExit("❌ Missing QDRANT_URL or QDRANT_API_KEY in .env")

#     client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
#     print("✅ Connected to Qdrant — Ready to analyze.")

#     while True:
#         user_input = input("Enter URL (or 'exit'): ").strip()
#         if user_input.lower() == "exit":
#             break
#         result = analyze_url(user_input, client)
#         print(result)
#         print("-" * 50)
#         time.sleep(0.3)

#!/usr/bin/env python3
"""
SafeNet AI - Phishing Detection Backend API

Uses:
 - Heuristic checks (brand typos, suspicious URL patterns)
 - Qdrant semantic similarity search (legit / phishing neighbors)

Endpoint:
 - POST /analyze  → { "url": "..." }

Response:
{
  "label": "legit" | "phishing" | "unknown",
  "confidence": float,
  "reason": str
}
"""

import os
import re
from urllib.parse import urlparse
from difflib import SequenceMatcher
from dotenv import load_dotenv
import numpy as np
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# ---------------- Config ----------------
load_dotenv()

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
COLLECTION_NAME = os.getenv("QDRANT_COLLECTION", "phish_urls")

MODEL_NAME = os.getenv("EMBED_MODEL", "all-MiniLM-L6-v2")
TOP_K = int(os.getenv("TOP_K", "5"))

LEGIT_THRESHOLD = float(os.getenv("LEGIT_THRESHOLD", "0.90"))
PHISH_THRESHOLD = float(os.getenv("PHISH_THRESHOLD", "0.75"))

SUSPICIOUS_TLDS = [".xyz", ".top", ".club", ".info", ".buzz", ".tk", ".ml", ".ga"]
MODEL_DIR = os.getenv("MODEL_DIR", r"D:\dev\safenet-extension\backend\models")
DATA_BRAND_FILE = os.path.join(MODEL_DIR, "top_brands.txt")

# ---------------- Brand list ----------------
def load_brands():
    brands = []
    if os.path.exists(DATA_BRAND_FILE):
        with open(DATA_BRAND_FILE, "r", encoding="utf-8") as f:
            for line in f:
                b = line.strip()
                if b and not b.startswith(("Brand", "---")):
                    brands.append(b.split()[0])
    brands += ["hdfcbank", "hdfc", "icici", "sbi", "axisbank", "paypal", "netflix", "flipkart", "amazon", "microsoft"]
    return sorted(set(brands))

# ---------------- Utility functions ----------------
def domain_from_url(url: str) -> str:
    try:
        parsed = urlparse(url if url.startswith("http") else "http://" + url)
        return parsed.netloc.lower().replace("www.", "")
    except Exception:
        return url.lower()

def fuzzy_similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, a, b).ratio()

# ---------------- Heuristic detection ----------------
BRAND_KEYWORDS = load_brands()

def is_suspicious_heuristic(url: str):
    u = url.lower()
    domain = domain_from_url(u)
    score = 0
    reasons = []

    if "@" in u:
        score += 2
        reasons.append("Contains '@' in URL")

    if re.search(r"https?://\d+\.\d+\.\d+\.\d+", u):
        score += 3
        reasons.append("Uses raw IP address")

    if any(u.endswith(tld) for tld in SUSPICIOUS_TLDS):
        score += 2
        reasons.append("Suspicious TLD")

    if u.count("-") > 3:
        score += 1
        reasons.append("Too many hyphens")

    for brand in BRAND_KEYWORDS:
        if brand in domain:
            continue
        ratio = fuzzy_similarity(brand, domain)
        if 0.6 < ratio < 0.95:
            score += 3
            reasons.append(f"Domain similar to brand '{brand}' (ratio={ratio:.2f})")

    if len(u) > 80:
        score += 1
        reasons.append("Unusually long URL")

    verdict = "Phishing" if score >= 3 else "Likely Safe"
    return verdict, reasons, score

# ---------------- Qdrant query wrapper ----------------
# def query_qdrant(client: QdrantClient, collection: str, vector: list, top_k: int = 5):
#     try:
#         resp = client.query_points(collection_name=collection, query_vector=vector, limit=top_k, with_payload=True)
#         return resp.points if hasattr(resp, "points") else resp
#     except Exception:
#         resp = client.search(collection_name=collection, query_vector=vector, limit=top_k, with_payload=True)
#         return resp
def query_qdrant(client: QdrantClient, collection: str, vector: list, top_k: int = 5):
    resp = client.query_points(
        collection_name=collection,
        query=vector,
        limit=top_k,
        with_payload=True
    )
    return resp.points if hasattr(resp, "points") else resp


# ---------------- Detection logic ----------------
def analyze_url(url: str):
    """Main detection logic for a single URL."""
    if not QDRANT_URL or not QDRANT_API_KEY:
        return {"label": "unknown", "confidence": 0, "reason": "Missing Qdrant credentials"}

    embedder = SentenceTransformer(MODEL_NAME)
    client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)

    try:
        vec = embedder.encode([url], normalize_embeddings=False)[0]
        query_vector = list(map(float, vec))
    except Exception as e:
        return {"label": "unknown", "confidence": 0, "reason": f"Embedding failed: {e}"}

    try:
        hits = query_qdrant(client, COLLECTION_NAME, query_vector, TOP_K)
    except Exception as e:
        return {"label": "unknown", "confidence": 0, "reason": f"Qdrant query failed: {e}"}

    norm_hits = []
    for h in hits:
        payload = getattr(h, "payload", None) or (h.get("payload") if isinstance(h, dict) else {})
        score = getattr(h, "score", None) or (h.get("score") if isinstance(h, dict) else 0)
        norm_hits.append({"payload": payload, "score": float(score)})

    found_legit = any(
        str(h["payload"].get("status", h["payload"].get("label", ""))).lower() in ("1", "legit", "true")
        and h["score"] >= LEGIT_THRESHOLD
        for h in norm_hits
    )
    found_phish = any(
        str(h["payload"].get("status", h["payload"].get("label", ""))).lower() in ("0", "phishing", "false")
        and h["score"] >= PHISH_THRESHOLD
        for h in norm_hits
    )

    if found_legit:
        return {"label": "legit", "confidence": 95, "reason": "Found legit neighbor in Qdrant"}
    elif found_phish:
        return {"label": "phishing", "confidence": 92, "reason": "Found phishing neighbor in Qdrant"}

    heur_v, heur_reasons, _ = is_suspicious_heuristic(url)
    if heur_v == "Phishing":
        return {"label": "phishing", "confidence": 75, "reason": ", ".join(heur_reasons)}
    else:
        return {"label": "unknown", "confidence": 60, "reason": "No strong match or suspicious patterns"}

# ---------------- FastAPI App ----------------
app = FastAPI(title="SafeNet AI Backend")

# ✅ Enable CORS so the Chrome extension / frontend can access this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all during dev (later restrict to your extension ID or domain)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
async def analyze(request: Request):
    """POST endpoint that accepts { "url": "..." }"""
    data = await request.json()
    url = data.get("url", "").strip()
    print("🔹 Incoming request from frontend...")

    if not url:
        return {"error": "Missing URL"}
    result = analyze_url(url)
    return result

@app.get("/")
def root():
    return {"message": "✅ SafeNet AI backend is running", "endpoint": "/analyze"}

# ---------------- Entry Point ----------------
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
