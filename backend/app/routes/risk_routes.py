from fastapi import APIRouter
from pydantic import BaseModel
from app.models.risk_score import save_risk_score, get_latest_risk_score

router = APIRouter(prefix="/api/v1/risk-scores", tags=["Risk Scores"])


class RiskScoreRequest(BaseModel):
    flood_risk: float
    earthquake_risk: float
    cyclone_risk: float


@router.post("")
def create_risk_score(body: RiskScoreRequest):
    """Receive risk values, compute fused score, save to MongoDB, and return."""
    doc = save_risk_score(body.flood_risk, body.earthquake_risk, body.cyclone_risk)
    # Convert ObjectId to string for JSON serialization
    doc["_id"] = str(doc["_id"])
    return doc


@router.get("/latest")
def latest_risk_score():
    """Return the most recent risk score from MongoDB."""
    doc = get_latest_risk_score()
    if not doc:
        return {
            "flood_risk": 0.0,
            "earthquake_risk": 0.0,
            "cyclone_risk": 0.0,
            "fused_score": 0.0,
            "alert_level": "Monitor",
            "alert_color": "gray",
            "created_at": None
        }
    doc["_id"] = str(doc["_id"])
    if doc.get("created_at"):
        doc["created_at"] = doc["created_at"].isoformat()
    return doc
