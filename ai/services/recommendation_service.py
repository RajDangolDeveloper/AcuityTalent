from dotenv import load_dotenv
load_dotenv()

from torch import cosine_similarity


class RecommendationService:

    def calculate_match_score(candidate, job, weights=None):
        if weights is None:
            weights = {
                'semantic': 0.6,      # Embedding similarity
                'skills': 0.2,         # Direct skill overlap
                'experience': 0.1,      # Years match
                'location': 0.1         # Location preference
            }
        
        # 1. Semantic similarity (60% weight)
        semantic_score = cosine_similarity(
            candidate.embedding.reshape(1, -1),
            job.embedding.reshape(1, -1)
        )[0][0]
        
        # 2. Skill overlap (20% weight)
        candidate_skills = set(candidate.skills)
        job_skills = set(job.required_skills)
        skill_overlap = len(candidate_skills & job_skills) / max(len(job_skills), 1)
        
        # 3. Experience fit (10% weight)
        exp_score = min(candidate.experienceYears / job.min_experience, 1.0) if job.min_experience else 0.5
        
        # 4. Location match (10% weight)
        loc_score = 1.0 if candidate.preferredLocation == job.location else 0.3
        
        # Weighted combination
        total_score = (
            weights['semantic'] * semantic_score +
            weights['skills'] * skill_overlap +
            weights['experience'] * exp_score +
            weights['location'] * loc_score
        )
        
        return total_score