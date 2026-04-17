from sentence_transformers import SentenceTransformer

model = SentenceTransformer('sentence-transformers/all-mpnet-base-v2')

def createTextEmbedding(text: str):
    embedding = model.encode(text)
    return embedding.tolist()