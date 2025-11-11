#!/usr/bin/env python3
"""
Fresh upload of FAISS vectors to Qdrant Cloud.
Deletes existing collection before upload.
"""

import os
import numpy as np
import faiss
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct
from dotenv import load_dotenv
from tqdm import tqdm

# === Load environment variables ===
load_dotenv()
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

if not QDRANT_URL or not QDRANT_API_KEY:
    raise ValueError("❌ Missing QDRANT_URL or QDRANT_API_KEY in .env file")

# === Local Paths ===
MODEL_DIR = r"C:\Users\S Duraimurugan\Pictures\newfish\models"
FAISS_INDEX = os.path.join(MODEL_DIR, "faiss_index.bin")
URLS_FILE = os.path.join(MODEL_DIR, "urls.npy")
LABELS_FILE = os.path.join(MODEL_DIR, "labels.npy")

COLLECTION_NAME = "phish_urls"

print("⚙️ Loading FAISS index and metadata...")
index = faiss.read_index(FAISS_INDEX)
urls = np.load(URLS_FILE, allow_pickle=True)
labels = np.load(LABELS_FILE, allow_pickle=True)

if len(urls) != len(labels):
    raise ValueError("❌ URLs and labels length mismatch!")

total = len(urls)
dim = index.d
print(f"✅ Loaded {total:,} vectors | dim={dim}")

# === Reconstruct vectors ===
print("📤 Extracting vectors from FAISS...")
vectors = np.zeros((total, dim), dtype=np.float32)
for i in range(total):
    vectors[i] = index.reconstruct(i)
print("✅ Extracted all vectors")

# === Connect to Qdrant ===
client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
print(f"🔗 Connected to Qdrant Cloud: {QDRANT_URL}")

# === Delete and recreate collection ===
if client.collection_exists(COLLECTION_NAME):
    print(f"🗑️ Deleting old collection '{COLLECTION_NAME}'...")
    client.delete_collection(COLLECTION_NAME)
    print("✅ Old collection deleted.")

print(f"🧠 Creating new collection '{COLLECTION_NAME}'...")
client.create_collection(
    collection_name=COLLECTION_NAME,
    vectors_config=VectorParams(size=dim, distance=Distance.COSINE),
)
print("✅ New collection created!")

# === Upload in batches ===
BATCH_SIZE = 2000
print(f"🚀 Uploading {total:,} vectors to '{COLLECTION_NAME}' ...")

for offset in tqdm(range(0, total, BATCH_SIZE)):
    end = min(offset + BATCH_SIZE, total)
    batch_vectors = vectors[offset:end]

    points = [
        PointStruct(
            id=offset + j,
            vector=batch_vectors[j].tolist(),
            payload={
                "url": str(urls[offset + j]),
                "status": int(labels[offset + j]),
            },
        )
        for j in range(len(batch_vectors))
    ]

    client.upsert(collection_name=COLLECTION_NAME, points=points)

print("✅ Fresh upload complete! 🎯")
