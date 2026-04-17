from fastapi import FastAPI
from dotenv import load_dotenv

load_dotenv()

from api.endpoints import router as matching_router

app = FastAPI(title="AcuityTalent AI API")

# mount the matching router under /api
app.include_router(matching_router, prefix="/api", tags=["Matching"])
