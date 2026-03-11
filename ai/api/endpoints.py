from fastapi import APIRouter
from models.schemas import MatchRequest, MatchResponse
from services.nlp_service import nlp_handler

router = APIRouter()

@router.post("/getscore", response_model=MatchResponse)
async def get_score(data: MatchRequest):
    score = nlp_handler.calculate_similarity(data.resume_text, data.job_description)
    return {"similarity_score": score, "status": "success"}