import math

from sentence_transformers import SentenceTransformer, util

class NLPService:
    def __init__(self, model_name: str):
        self.model = SentenceTransformer(model_name)

    def calculate_similarity(self, text1: str, text2: str) -> float:
        embeddings = self.model.encode([text1, text2], convert_to_tensor=True)
        score = util.cos_sim(embeddings[0], embeddings[1])
        percent = score.item() * 100

        return math.floor(percent)
    
    


nlp_handler = NLPService("sentence-transformers/all-mpnet-base-v2")