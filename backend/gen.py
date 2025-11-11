#!/usr/bin/env python3
"""
Phishing Detection (Heuristic + FAISS)
Dynamic Brand Awareness: auto-learns brands from dataset + adds manual ones
"""

import os
import re
import time
import numpy as np
from urllib.parse import urlparse
from difflib import SequenceMatcher
from sentence_transformers import SentenceTransformer
import faiss

# === CONFIG ===
MODEL_DIR = r"C:\Users\S Duraimurugan\Pictures\newfish\models"
DATA_BRAND_FILE = os.path.join(MODEL_DIR, "top_brands.txt")

EMBEDDING_MODEL = "all-MiniLM-L6-v2"
FAISS_INDEX = os.path.join(MODEL_DIR, "faiss_index.bin")
URLS_FILE = os.path.join(MODEL_DIR, "urls.npy")
LABELS_FILE = os.path.join(MODEL_DIR, "labels.npy")

SUSPICIOUS_TLDS = [".xyz", ".top", ".club", ".info", ".buzz", ".tk", ".ml", ".ga"]

# === 1️⃣ LOAD BRANDS ===
def load_brands():
    auto_brands = []
    if os.path.exists(DATA_BRAND_FILE):
        with open(DATA_BRAND_FILE, "r", encoding="utf-8") as f:
            for line in f:
                b = line.strip()
                if b and not b.startswith("Brand") and not b.startswith("---"):
                    auto_brands.append(b.split()[0])
    extra_brands = ["hdfcbank", "hdfc", "icici", "sbi", "axisbank", "paypal", "netflix", "flipkart", "amazon", "microsoft"]
    return sorted(set(auto_brands + extra_brands))

BRAND_KEYWORDS = load_brands()
print(f"🧠 Loaded {len(BRAND_KEYWORDS)} brands for heuristic analysis")

# === 2️⃣ LOAD MODEL & INDEX ===
print("⚙️ Loading embedding model and FAISS index...")
model = SentenceTransformer(EMBEDDING_MODEL)

if not (os.path.exists(FAISS_INDEX) and os.path.exists(URLS_FILE) and os.path.exists(LABELS_FILE)):
    raise FileNotFoundError("❌ FAISS index or data files missing in models/ directory")

index = faiss.read_index(FAISS_INDEX)
urls = np.load(URLS_FILE, allow_pickle=True)
labels = np.load(LABELS_FILE, allow_pickle=True)

# === 3️⃣ HEURISTIC CHECK ===
def is_suspicious_heuristic(url: str):
    url_lower = url.lower()
    domain = urlparse(url_lower).netloc.replace("www.", "")
    score = 0
    reasons = []

    if "@" in url_lower:
        score += 2
        reasons.append("Contains '@' in URL")

    if re.search(r"https?://\d+\.\d+\.\d+\.\d+", url_lower):
        score += 3
        reasons.append("Uses raw IP address")

    if any(url_lower.endswith(tld) for tld in SUSPICIOUS_TLDS):
        score += 2
        reasons.append("Suspicious TLD")

    if url_lower.count('-') > 3:
        score += 1
        reasons.append("Too many hyphens")

    # Check similarity to known brands
    for brand in BRAND_KEYWORDS:
        if brand in domain:
            continue
        ratio = SequenceMatcher(None, brand, domain).ratio()
        if 0.6 < ratio < 0.95:
            score += 3
            reasons.append(f"Domain similar to brand '{brand}' (homoglyph)")

    if len(url_lower) > 80:
        score += 1
        reasons.append("Unusually long URL")

    return ("Phishing 🚨" if score >= 3 else "Legit ✅"), reasons, score


# === 4️⃣ FAISS SIMILARITY CHECK ===
def faiss_similarity_check(input_url: str, top_k: int = 5):
    emb = model.encode([input_url], normalize_embeddings=True)
    scores, idxs = index.search(emb.astype(np.float32), top_k)

    results = []
    for i, idx in enumerate(idxs[0]):
        results.append({
            "url": urls[idx],
            "status": int(labels[idx]),
            "similarity": float(scores[0][i])
        })
    return results


# === 5️⃣ COMBINED VERDICT ===
def combined_verdict(url: str):
    heur_verdict, heur_reasons, heur_score = is_suspicious_heuristic(url)
    faiss_results = faiss_similarity_check(url)

    phishing_ratio = sum(r["status"] == 0 for r in faiss_results) / len(faiss_results)
    avg_sim = np.mean([r["similarity"] for r in faiss_results])

    confidence = (heur_score * 0.25 + phishing_ratio * 0.75) * 100
    final = "Phishing 🚨" if confidence >= 50 else "Legit ✅"

    print(f"\n🔗 URL: {url}")
    print(f"\n⚙️ Heuristic verdict: {heur_verdict}")
    if heur_reasons:
        print("   Reasons:", "; ".join(heur_reasons))

    print("\n🔍 Top similar URLs in dataset:")
    for i, r in enumerate(faiss_results, 1):
        st = "Phishing 🚨" if r["status"] == 0 else "Legit ✅"
        print(f"{i}. {r['url']}\n   → status = {r['status']} ({st})\n   → similarity = {r['similarity']:.4f}")

    print("------------------------------------------------------------")
    print(f"🧠 Final Verdict: {final} | Confidence = {confidence:.1f}% | Avg sim = {avg_sim:.3f}")
    print("------------------------------------------------------------\n")


# === 6️⃣ MAIN LOOP ===
if __name__ == "__main__":
    while True:
        user_url = input("Enter a URL (or 'exit'): ").strip()
        if user_url.lower() in ["exit", "quit"]:
            break
        if not user_url.startswith("http"):
            user_url = "http://" + user_url
        combined_verdict(user_url)
