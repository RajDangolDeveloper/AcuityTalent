from dotenv import load_dotenv
load_dotenv()

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity


class RecommendationService:

    @staticmethod
    def calculate_match_score(candidate, job, weights=None):
        """
        Calculate a weighted match score between a candidate and a job.
        
        Args:
            candidate: CandidateProfile object with embedding
            job: Job object with embedding
            weights: Dict of weights for different scoring components
            
        Returns:
            float: Score between 0 and 1
        """
        if weights is None:
            weights = {
                'semantic': 0.6,      # Embedding similarity
                'skills': 0.2,         # Direct skill overlap
                'experience': 0.1,      # Years match
                'location': 0.1         # Location preference
            }
        
        try:
            # 1. Semantic similarity (60% weight) - using embeddings from database
            candidate_emb = np.array(candidate.embedding) if hasattr(candidate, 'embedding') and candidate.embedding else np.zeros(768)
            job_emb = np.array(job.embedding) if hasattr(job, 'embedding') and job.embedding else np.zeros(768)
            
            if candidate_emb.sum() > 0 and job_emb.sum() > 0:
                semantic_score = float(cosine_similarity(
                    candidate_emb.reshape(1, -1),
                    job_emb.reshape(1, -1)
                )[0][0])
            else:
                semantic_score = 0.5
            
            # 2. Skill overlap (20% weight)
            candidate_skills = set(candidate.skills) if hasattr(candidate, 'skills') and candidate.skills else set()
            job_skills = set()
            
            # Parse job requirements for skills if available
            if hasattr(job, 'requirements') and job.requirements:
                # Simple parsing - could be improved
                job_skills = set(word.lower() for word in job.requirements.split() if len(word) > 3)
            
            skill_overlap = len(candidate_skills & job_skills) / max(len(job_skills), 1) if job_skills else 0.5
            
            # 3. Experience fit (10% weight)
            candidate_exp = getattr(candidate, 'experienceYears', 0) or 0
            # Estimate required experience from job level
            job_exp_levels = {'ENTRY': 0, 'MID': 3, 'SENIOR': 7, 'EXECUTIVE': 10}
            required_exp = job_exp_levels.get(getattr(job, 'experienceLevel', 'MID'), 3)
            
            exp_score = min(candidate_exp / max(required_exp, 1), 1.0) if required_exp > 0 else 0.5
            
            # 4. Location match (10% weight)
            candidate_loc = (getattr(candidate, 'preferredLocation', '') or '').lower()
            job_loc = (getattr(job, 'location', '') or '').lower()
            loc_score = 1.0 if candidate_loc == job_loc or job_loc == 'remote' else 0.3
            
            # Weighted combination
            total_score = (
                weights['semantic'] * semantic_score +
                weights['skills'] * skill_overlap +
                weights['experience'] * exp_score +
                weights['location'] * loc_score
            )
            
            return max(0.0, min(1.0, total_score))  # Clamp between 0 and 1
            
        except Exception as e:
            print(f"Error calculating match score: {e}")
            return 0.5  # Default score on error