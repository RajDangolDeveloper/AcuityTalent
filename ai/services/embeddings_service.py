import logging
from sentence_transformers import SentenceTransformer


logger = logging.getLogger(__name__)

model = SentenceTransformer('sentence-transformers/all-mpnet-base-v2')
logger.info("Loaded embedding model sentence-transformers/all-mpnet-base-v2")

def createTextEmbedding(text: str):
    logger.info("createTextEmbedding text_chars=%d", len(text or ""))
    embedding = model.encode(text)
    logger.info("createTextEmbedding success vector_length=%d", len(embedding))
    return embedding.tolist()