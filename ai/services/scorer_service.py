from dotenv import load_dotenv
load_dotenv()

import spacy
from spacy.matcher import PhraseMatcher
from sentence_transformers import SentenceTransformer, util
import logging


logger = logging.getLogger(__name__)

class ResumeScorer:
    def __init__(self):
        logger.info("Initializing ResumeScorer")
        self.nlp = spacy.load("en_core_web_md")
        self.similarity_model = SentenceTransformer('all-MiniLM-L6-v2')
        logger.info("ResumeScorer initialized with spaCy en_core_web_md and all-MiniLM-L6-v2")


        
    def score_resume(self, resume_text: str, jd_text: str):
        logger.info(
            "ResumeScorer.score_resume resume_chars=%d jd_chars=%d",
            len(resume_text or ""),
            len(jd_text or ""),
        )
    
        keyword_score = self._get_keyword_score(resume_text, jd_text) * 0.40
        
        title_score = self._get_title_score(resume_text, jd_text) * 0.30
        
        edu_score = self._get_edu_score(resume_text, jd_text) * 0.20
        
        parse_score = self._get_parse_score(resume_text) * 0.10
        
        total = keyword_score + title_score + edu_score + parse_score
        logger.info(
            "ResumeScorer.score_resume success total=%.2f keyword=%.2f title=%.2f edu=%.2f parse=%.2f",
            total,
            keyword_score,
            title_score,
            edu_score,
            parse_score,
        )
        return {
            "total_score": round(total, 2),
            "breakdown": {
                "keywords": keyword_score,
                "title": title_score,
                "education": edu_score,
                "formatting": parse_score
            }
        }

    def _get_keyword_score(self, resume_text, jd_text):
        embeddings = self.similarity_model.encode([resume_text, jd_text], convert_to_tensor=True)
        cosine_sim = util.cos_sim(embeddings[0], embeddings[1])
        return float(cosine_sim.item() * 100)

    def _get_title_score(self, resume_text, jd_text):
        header_context = " ".join(resume_text.split()[:100]).lower()
        
        target_title = jd_text.split('\n')[0].lower() 
        
        if target_title in header_context:
            return 100

        elif any(word in header_context for word in target_title.split()):
            return 70
        return 0

    def _get_edu_score(self, resume_text, jd_text):
        degrees = ["bachelor", "master", "phd", "b.s.", "m.s.", "degree"]
        if any(d in jd_text.lower() for d in degrees):
            if any(d in resume_text.lower() for d in degrees):
                return 100
            return 0 
        return 100 

    def _get_parse_score(self, text):
        if not text.strip(): return 0
        non_ascii = len([char for char in text if ord(char) > 127])
        ratio = non_ascii / len(text)
        return 100 if ratio < 0.05 else 50