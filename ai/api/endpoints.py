from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select
from services.embeddings_service import createTextEmbedding
from database.database import get_db
from models.models import Job, User, CandidateProfile, CandidateProfileEmbedding, JobEmbedding
from models.schemas import (
    EmbeddingRequest,
    EmbeddingResponse,
    JobRecommendationResponse,
    JobRecommendationsListResponse,
    MatchRequest,
    MatchResponse,
    ScoreRequest,
    ScoreResponse,
    ReviewRequest,
    ReviewResponse,
    CoverLetterRequest,
    CoverLetterResponse,
    RewriteRequest,
    RewriteResponse,
    RiskAssessmentRequest,
    RiskAssessmentResponse,
)
from services.nlp_service import nlp_handler
from services.scorer_service import ResumeScorer
from services.qwen_services import (
    CoverLetterService,
    LLMClientError,
    ProfessionalRewriteService,
    ResumeReviewService,
)
from services.recommendation_service import RecommendationService
import numpy as np
from datetime import datetime, timezone
import re
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

resume_scorer = ResumeScorer()
cover_letter_service = CoverLetterService()
rewrite_service = ProfessionalRewriteService()
resume_review_service = ResumeReviewService()


def _has_vector_data(vector) -> bool:
    if vector is None:
        return False

    # Handles numpy arrays from pgvector adapters and list-like vectors.
    if isinstance(vector, np.ndarray):
        return vector.size > 0

    try:
        return len(vector) > 0
    except TypeError:
        return False


def _to_vector_array(vector, fallback_size: int = 768) -> np.ndarray:
    if not _has_vector_data(vector):
        return np.zeros(fallback_size)
    return np.asarray(vector)


def _clamp_0_1(value: float) -> float:
    return max(0.0, min(1.0, value))


def _months_between(start_date: datetime, end_date: datetime) -> float:
    days = max((end_date - start_date).days, 0)
    return days / 30.44


def _parse_date(value: str | None) -> datetime | None:
    if not value:
        return None

    try:
        normalized = value.replace("Z", "+00:00")
        parsed = datetime.fromisoformat(normalized)
        if parsed.tzinfo is None:
            return parsed.replace(tzinfo=timezone.utc)
        return parsed
    except ValueError:
        return None


def _get_stability_risk(work_history) -> float:
    if not work_history:
        return 0.5

    now = datetime.now(timezone.utc)
    tenures = []

    for item in work_history:
        start = _parse_date(item.start_date)
        if not start:
            continue

        end = now if item.is_current else (_parse_date(item.end_date) or now)
        tenures.append(_months_between(start, end))

    if not tenures:
        return 0.5

    avg_tenure_months = float(np.mean(tenures))

    # 24+ months average tenure = low risk, < 6 months = high risk.
    if avg_tenure_months >= 24:
        return 0.1
    if avg_tenure_months <= 6:
        return 1.0

    normalized = (24 - avg_tenure_months) / 18
    return _clamp_0_1(0.1 + normalized * 0.9)


def _tokenize(text: str) -> set[str]:
    return set(re.findall(r"[a-zA-Z0-9+#.]{2,}", text.lower()))


def _get_skill_gap(candidate_skills, job_requirements: str) -> float:
    req_tokens = _tokenize(job_requirements or "")
    if not req_tokens:
        return 0.0

    skill_tokens = set()
    for skill in candidate_skills or []:
        skill_tokens.update(_tokenize(skill))

    overlap = len(req_tokens & skill_tokens)
    coverage = overlap / max(len(req_tokens), 1)
    return _clamp_0_1(1 - coverage)


def _get_salary_risk(expected_salary: float | None, offered_salary: float | None) -> float:
    if expected_salary is None or offered_salary is None or expected_salary <= 0:
        return 0.5

    diff_ratio = abs(expected_salary - offered_salary) / expected_salary
    return _clamp_0_1(diff_ratio)


def _get_reliability_risk(interviews) -> float:
    if not interviews:
        return 0.0

    return 1.0 if any(i.status == "NO_SHOW" for i in interviews) else 0.0


def _risk_label(score: float) -> str:
    if score >= 0.67:
        return "HIGH"
    if score >= 0.34:
        return "MEDIUM"
    return "LOW"


@router.post("/getscore", response_model=MatchResponse)
async def get_score(data: MatchRequest):
    logger.info("POST /getscore resume_chars=%d job_chars=%d", len(data.resume_text or ""), len(data.job_description or ""))
    score = nlp_handler.calculate_similarity(data.resume_text, data.job_description)
    logger.info("POST /getscore success similarity_score=%.4f", score)
    return {"similarity_score": score, "status": "success"}


@router.post("/matching-score", response_model=MatchResponse)
async def get_matching_score(data: MatchRequest):
    logger.info("POST /matching-score resume_chars=%d job_chars=%d", len(data.resume_text or ""), len(data.job_description or ""))
    score = nlp_handler.calculate_similarity(data.resume_text, data.job_description)
    logger.info("POST /matching-score success similarity_score=%.4f", score)
    return {"similarity_score": score, "status": "success"}


@router.post("/resume-score", response_model=ScoreResponse)
async def get_resume_score(data: ScoreRequest):
    logger.info("POST /resume-score resume_chars=%d job_chars=%d", len(data.resume_text or ""), len(data.job_description or ""))
    result = resume_scorer.score_resume(data.resume_text, data.job_description)
    logger.info("POST /resume-score success total_score=%.2f", result["total_score"])
    return {"resume_score": result["total_score"], "status": "success"}


@router.post("/generate-cover-letter", response_model=CoverLetterResponse)
async def generate_cover_letter(data: CoverLetterRequest):
    logger.info(
        "POST /generate-cover-letter resume_chars=%d job_chars=%d",
        len(data.resume_text or ""),
        len(data.job_description or ""),
    )
    try:
        cover_letter = cover_letter_service.generate_cover_letter(
            data.resume_text, data.job_description
        )
        logger.info("POST /generate-cover-letter success output_chars=%d", len(cover_letter or ""))
        return {"cover_letter": cover_letter, "status": "success"}
    except LLMClientError as exc:
        logger.error("POST /generate-cover-letter failed status_code=%d detail=%s", exc.status_code, exc.message)
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc


@router.post("/improve-text", response_model=RewriteResponse)
async def improve_text(data: RewriteRequest):
    logger.info("POST /improve-text text_chars=%d topic_present=%s", len(data.text or ""), bool(data.topic))
    try:
        improved = rewrite_service.improve_text(data.text, data.topic)
        logger.info("POST /improve-text success output_chars=%d", len(improved or ""))
        return {"improved_text": improved, "status": "success"}
    except LLMClientError as exc:
        logger.error("POST /improve-text failed status_code=%d detail=%s", exc.status_code, exc.message)
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc


@router.post("/review-resume", response_model=ReviewResponse)
async def review_resume(data: ReviewRequest):
    logger.info("POST /review-resume resume_chars=%d", len(data.resume_text or ""))
    try:
        parts = resume_review_service.review_resume(data.resume_text)
        logger.info(
            "POST /review-resume success summary_chars=%d strength_chars=%d changes_chars=%d tips_chars=%d",
            len(parts.get("summary", "")),
            len(parts.get("strength", "")),
            len(parts.get("changes", "")),
            len(parts.get("tips", "")),
        )
        return {
            "summary": parts.get("summary", ""),
            "strength": parts.get("strength", ""),
            "changes": parts.get("changes", ""),
            "tips": parts.get("tips", ""),
            "status": "success",
        }
    except LLMClientError as exc:
        logger.error("POST /review-resume failed status_code=%d detail=%s", exc.status_code, exc.message)
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc


@router.post("/risk-assessment", response_model=RiskAssessmentResponse)
async def calculate_risk_assessment(data: RiskAssessmentRequest):
    logger.info(
        "POST /risk-assessment skills_count=%d has_expected_salary=%s has_offered_salary=%s work_history_count=%d interviews_count=%d",
        len(data.candidate_skills or []),
        data.expected_salary is not None,
        data.offered_salary is not None,
        len(data.work_history or []),
        len(data.interviews or []),
    )
    weights = {
        "stability": 0.4,
        "skill_gap": 0.3,
        "salary_alignment": 0.2,
        "reliability": 0.1,
    }

    stability_score = _get_stability_risk(data.work_history)
    skill_gap_score = _get_skill_gap(data.candidate_skills, data.job_requirements)
    salary_alignment_score = _get_salary_risk(data.expected_salary, data.offered_salary)
    reliability_score = _get_reliability_risk(data.interviews)

    total_risk = (
        stability_score * weights["stability"]
        + skill_gap_score * weights["skill_gap"]
        + salary_alignment_score * weights["salary_alignment"]
        + reliability_score * weights["reliability"]
    )

    total_risk = _clamp_0_1(total_risk)
    logger.info("POST /risk-assessment success risk_score=%.4f risk_label=%s", total_risk, _risk_label(total_risk))

    return {
        "risk_score": round(total_risk, 4),
        "risk_label": _risk_label(total_risk),
        "stability_score": round(stability_score, 4),
        "skill_gap_score": round(skill_gap_score, 4),
        "salary_alignment_score": round(salary_alignment_score, 4),
        "reliability_score": round(reliability_score, 4),
        "status": "success",
    }

@router.get("/testdatabase")
def test(db: Session = Depends(get_db)):
    logger.info("GET /testdatabase")
    users = db.query(User).limit(5).all()
    logger.info("GET /testdatabase success users=%d", len(users))
    return {"users": len(users), "status": "success"}

@router.get("/candidates/{candidate_id}/recommendations", response_model=JobRecommendationsListResponse)
def recommend_jobs_for_candidate(
    candidate_id: int, 
    top_k: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    logger.info("GET /candidates/%s/recommendations top_k=%d", candidate_id, top_k)
    try:
        # 1. Fetch Candidate Profile and their Embedding
        candidate = db.query(CandidateProfile).filter(CandidateProfile.id == candidate_id).first()
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate profile not found")
        
        candidate_emb_record = db.query(CandidateProfileEmbedding).filter(
            CandidateProfileEmbedding.candidateProfileId == candidate_id
        ).first()

        if not candidate_emb_record or not _has_vector_data(candidate_emb_record.embedding):
            raise HTTPException(status_code=404, detail="Candidate embedding not found. Ensure embeddings are generated.")

        # 2. Database Pre-filter (Vector Search)
        # Fetch top 50 matches via SQL vector distance, then refine them in Python
        candidate_vector = candidate_emb_record.embedding
        candidate_vector_list = candidate_vector.tolist() if hasattr(candidate_vector, 'tolist') else list(candidate_vector)
        
        stmt = (
            select(Job, JobEmbedding.embedding)
            .join(JobEmbedding, Job.id == JobEmbedding.jobId)
            .where(JobEmbedding.embedding.isnot(None))
            .order_by(JobEmbedding.embedding.cosine_distance(candidate_vector_list))
            .limit(50)
        )
        
        results = db.execute(stmt).all()
        
        if not results:
            raise HTTPException(status_code=404, detail="No job embeddings found in database")
        
        # 3. Apply Weighted Scoring Logic
        scored_jobs = []
        candidate_vec_np = _to_vector_array(candidate_vector)
        candidate_vec_list = candidate_vec_np.tolist()

        for job_record, job_vector in results:
            job_vec_np = _to_vector_array(job_vector)

            # Attach vectors on dedicated attributes so ORM relationships stay intact.
            job_record.embedding_vector = job_vec_np
            candidate.embedding_vector = candidate_vec_list
            
            # Calculate weighted match score
            score = RecommendationService.calculate_match_score(candidate, job_record)
            
            scored_jobs.append({
                "job_id": job_record.id,
                "title": job_record.title,
                "location": job_record.location,
                "employment_type": job_record.employmentType,
                "match_score": round(score * 100, 2)  # Convert to percentage
            })

        # 4. Final Sort by Weighted Score
        scored_jobs.sort(key=lambda x: x['match_score'], reverse=True)

        logger.info(
            "GET /candidates/%s/recommendations success prefiltered=%d returned=%d",
            candidate_id,
            len(scored_jobs),
            len(scored_jobs[:top_k]),
        )

        return {"recommendations": scored_jobs[:top_k], "total_count": len(scored_jobs), "status": "success"}

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Recommendation endpoint failed candidate_id=%s", candidate_id)
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")

@router.post("/embeddings", response_model=EmbeddingResponse)
def create_embedding(request: EmbeddingRequest):
    logger.info("POST /embeddings text_chars=%d", len(request.text or ""))
    embedding = createTextEmbedding(request.text) 
    logger.info("POST /embeddings success vector_length=%d", len(embedding))
    return EmbeddingResponse(embedding=embedding)
