eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.LNvdSEP_YxH1FuHMpAZvVuRs7LNndCy5QOxzVdXHTtc 


from qdrant_client import QdrantClient

qdrant_client = QdrantClient(
    url="https://48c784ee-23e9-4320-9886-ae60841cd60f.europe-west3-0.gcp.cloud.qdrant.io:6333", 
    api_key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.LNvdSEP_YxH1FuHMpAZvVuRs7LNndCy5QOxzVdXHTtc",
)

print(qdrant_client.get_collections())