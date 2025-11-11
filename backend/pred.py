#!/usr/bin/env python3
"""
Phishing Detection (Heuristic + FAISS)
Enhanced version with color output and better homoglyph detection.
"""

import os
import re
import time
import numpy as np
import pandas as pd
from urllib.parse import urlparse
from difflib import SequenceMatcher
from sentence_transformers import SentenceTransformer
import faiss
from colorama import Fore, Style, init

# === Initialize colored output ===
init(autoreset=True)

# === CONFIG ===
MODEL_DIR = r"C:\Users\S Duraimurugan\Pictures\newfish\models"
DATA_PATH = r"C:\Users\S Duraimurugan\Pictures\newfish\data\new_data_urls.csv"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"

SUSPICIOUS_TLDS = [".xyz", ".top", ".club", ".info", ".buzz", ".tk", ".ml", ".ga"]
BRAND_KEYWORDS = [
    "google", "facebook", "paypal", "amazon", "flipkart",
    "netflix", "instagram", "microsoft", "hdfcbank", "sbi", "icici"
]

# === FILE PATHS ===
FAISS_INDEX = os.path.join(MODEL_DIR, "faiss_index.bin")
URLS_FILE = os.path.join(MODEL_DIR, "urls.npy")
LABELS_FILE = os.path.join(MODEL_DIR, "labels.npy")

# === 1️⃣ LOAD MODELS ===
print("⚙️ Loading embedding model...")
model = SentenceTransformer(EMBEDDING_MODEL)

if not (os.path.exists(FAISS_INDEX) and os.path.exists(URLS_FILE) and os.path.exists(LABELS_FILE)):
    raise FileNotFoundError("❌ Missing FAISS index or label/url files — run the embedding builder first.")

print("📦 Loading FAISS index and data...")
index = faiss.read_index(FAISS_INDEX)
urls = np.load(URLS_FILE, allow_pickle=True)
labels = np.load(LABELS_FILE, allow_pickle=True)

# === 2️⃣ HEURISTIC CHECK ===
def is_suspicious_heuristic(url: str):
    url_lower = url.lower()
    domain = urlparse(url_lower).netloc.replace("www.", "")
    score = 0
    reasons = []

    # Common phishing patterns
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

    # Detect brand lookalikes
    for brand in BRAND_KEYWORDS:
        ratio = SequenceMatcher(None, brand, domain).ratio()
        if 0.7 < ratio < 0.95:
            score += 3
            reasons.append(f"Domain similar to brand '{brand}' (homoglyph)")

    if len(url_lower) > 80:
        score += 1
        reasons.append("Unusually long URL")

    verdict = "Phishing 🚨" if score >= 3 else "Legit ✅"
    return verdict, reasons, score


# === 3️⃣ FAISS SIMILARITY CHECK ===
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


# === 4️⃣ COMBINED VERDICT ===
def combined_verdict(url: str):
    heur_verdict, heur_reasons, heur_score = is_suspicious_heuristic(url)
    faiss_results = faiss_similarity_check(url)

    phishing_ratio = sum(r["status"] == 0 for r in faiss_results) / len(faiss_results)
    avg_sim = np.mean([r["similarity"] for r in faiss_results])

    # Weighted confidence (75% FAISS + 25% heuristic)
    confidence = (heur_score * 0.25 + phishing_ratio * 0.75) * 100

    # Enhanced 3-class verdict
    if confidence >= 60:
        final = f"{Fore.RED}Phishing 🚨{Style.RESET_ALL}"
    elif confidence >= 40:
        final = f"{Fore.YELLOW}Suspicious ⚠️{Style.RESET_ALL}"
    else:
        final = f"{Fore.GREEN}Legit ✅{Style.RESET_ALL}"

    print(f"\n🔗 {Fore.CYAN}URL:{Style.RESET_ALL} {url}\n")
    print(f"⚙️ Heuristic verdict: {Fore.MAGENTA}{heur_verdict}{Style.RESET_ALL}")
    if heur_reasons:
        print("   Reasons:", "; ".join(heur_reasons))

    print(f"\n🔍 Top similar URLs in dataset:")
    for i, r in enumerate(faiss_results, 1):
        st = f"{Fore.RED}Phishing 🚨{Style.RESET_ALL}" if r["status"] == 0 else f"{Fore.GREEN}Legit ✅{Style.RESET_ALL}"
        print(f"{i}. {r['url']}\n   → status = {r['status']} ({st})\n   → similarity = {r['similarity']:.4f}")

    print("------------------------------------------------------------")
    print(f"🧠 Final Verdict: {final} | Confidence = {confidence:.1f}% | Avg sim = {avg_sim:.3f}")
    print("------------------------------------------------------------\n")


# === 5️⃣ MAIN LOOP ===
if __name__ == "__main__":
    while True:
        user_url = input("Enter a URL (or 'exit'): ").strip()
        if user_url.lower() in ["exit", "quit"]:
            break
        if not user_url.startswith("http"):
            user_url = "http://" + user_url
        combined_verdict(user_url)
