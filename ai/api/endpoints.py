from fastapi import APIRouter
from models.schemas import (
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
)
from services.nlp_service import nlp_handler
from services.scorer_service import ResumeScorer
from services.qwen_services import (
    CoverLetterService,
    ProfessionalRewriteService,
    ResumeReviewService,
)

router = APIRouter()

resume_scorer = ResumeScorer()
cover_letter_service = CoverLetterService()
rewrite_service = ProfessionalRewriteService()
resume_review_service = ResumeReviewService()


@router.post("/getscore", response_model=MatchResponse)
async def get_score(data: MatchRequest):
    score = nlp_handler.calculate_similarity(data.resume_text, data.job_description)
    return {"similarity_score": score, "status": "success"}


@router.post("/matching-score", response_model=MatchResponse)
async def get_matching_score(data: MatchRequest):
    score = nlp_handler.calculate_similarity(data.resume_text, data.job_description)
    return {"similarity_score": score, "status": "success"}


@router.post("/resume-score", response_model=ScoreResponse)
async def get_resume_score(data: ScoreRequest):
    result = resume_scorer.score_resume(data.resume_text, data.job_description)
    return {"resume_score": result["total_score"], "status": "success"}


@router.post("/generate-cover-letter", response_model=CoverLetterResponse)
async def generate_cover_letter(data: CoverLetterRequest):
    cover_letter = cover_letter_service.generate_cover_letter(
        data.resume_text, data.job_description
    )
    return {"cover_letter": cover_letter, "status": "success"}


@router.post("/improve-text", response_model=RewriteResponse)
async def improve_text(data: RewriteRequest):
    improved = rewrite_service.improve_text(data.text, data.topic)
    return {"improved_text": improved, "status": "success"}


@router.post("/review-resume", response_model=ReviewResponse)
async def review_resume(data: ReviewRequest):
    parts = resume_review_service.review_resume(data.resume_text)
    return {
        "summary": parts.get("summary", ""),
        "strength": parts.get("strength", ""),
        "changes": parts.get("changes", ""),
        "tips": parts.get("tips", ""),
        "status": "success",
    }