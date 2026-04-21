from fastapi import FastAPI
from dotenv import load_dotenv

load_dotenv()

from api.endpoints import router as matching_router

app = FastAPI(title="AcuityTalent AI API")


app.include_router(matching_router, prefix="/api", tags=["Matching"])
