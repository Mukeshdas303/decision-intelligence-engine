# backend/main.py

import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.models import AnalyzeRequest, AnalyzeResponse
from backend.pipeline import run_pipeline

# ── Logging setup ─────────────────────────────────────────────────────────────
# basicConfig sets up a simple console logger for the whole app
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s"
)
logger = logging.getLogger(__name__)

# ── FastAPI app ────────────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_TITLE,
    version=settings.APP_VERSION,
    description="Converts meeting transcripts into structured decision intelligence."
)

# ── CORS middleware ────────────────────────────────────────────────────────────
# This allows the React frontend (running on localhost:3000) to call this API.
# In production, replace "*" with your actual frontend domain.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health check route ─────────────────────────────────────────────────────────
@app.get("/health")
def health_check():
    """Quick endpoint to verify the server is running."""
    return {"status": "ok", "version": settings.APP_VERSION}


# ── Main analysis route ────────────────────────────────────────────────────────
@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_transcript(request: AnalyzeRequest):
    """
    Main endpoint. Accepts a transcript and returns full decision intelligence.

    FastAPI automatically:
    - Validates the request against AnalyzeRequest (returns 422 if invalid)
    - Serializes the response against AnalyzeResponse
    - Generates OpenAPI docs at /docs
    """
    logger.info(f"Received /analyze request. Transcript length: {len(request.transcript)}")

    try:
        # Run the full 7-step pipeline
        result = run_pipeline(request.transcript)

        # Build and return the response
        return AnalyzeResponse(
            success=True,
            meeting_title=request.meeting_title,
            meeting_date=request.meeting_date,
            **result   # unpacks all pipeline keys directly into the model
        )

    except Exception as e:
        logger.error(f"Pipeline crashed unexpectedly: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )