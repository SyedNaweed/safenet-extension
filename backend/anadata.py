from qdrant_client import QdrantClient
from dotenv import load_dotenv
import os

# === Load credentials ===
load_dotenv()
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)

# === List current collections ===
print("📋 Existing collections:")
for c in client.get_collections().collections:
    print(" -", c.name)

# === Delete old collection ===
COLLECTION_NAME = "phish_urls"  # change if yours differs

confirm = input(f"\n⚠️  Are you sure you want to delete '{COLLECTION_NAME}'? (yes/no): ").strip().lower()
if confirm == "yes":
    client.delete_collection(COLLECTION_NAME)
    print(f"✅ Deleted collection: {COLLECTION_NAME}")
else:
    print("❌ Cancelled — no deletion.")
