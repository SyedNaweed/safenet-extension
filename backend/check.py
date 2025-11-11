import faiss

index = faiss.read_index("your_index.faiss")
print(index.ntotal)  # Number of vectors stored
