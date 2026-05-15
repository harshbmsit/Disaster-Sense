from fastapi import APIRouter
from datetime import datetime

router = APIRouter(prefix="/api/v1/risk-grid", tags=["Risk Grid"])

@router.get("")
def get_risk_grid():
    mock_grid = [
        {
            "id": 1,
            "name": "Koramangala",
            "lat": 12.9352,
            "lng": 77.6245,
            "flood_risk": 72,
            "earthquake_risk": 45,
            "cyclone_risk": 30,
            "fused_score": 52.5,
            "level": "warning"
        },
        {
            "id": 2,
            "name": "Whitefield",
            "lat": 12.9698,
            "lng": 77.7500,
            "flood_risk": 45,
            "earthquake_risk": 60,
            "cyclone_risk": 38,
            "fused_score": 47.4,
            "level": "advisory"
        },
        {
            "id": 3,
            "name": "Electronic City",
            "lat": 12.8399,
            "lng": 77.6770,
            "flood_risk": 18,
            "earthquake_risk": 25,
            "cyclone_risk": 15,
            "fused_score": 19.5,
            "level": "monitor"
        },
        {
            "id": 4,
            "name": "Bellandur",
            "lat": 12.9259,
            "lng": 77.6762,
            "flood_risk": 91,
            "earthquake_risk": 55,
            "cyclone_risk": 62,
            "fused_score": 72.8,
            "level": "critical"
        },
        {
            "id": 5,
            "name": "HSR Layout",
            "lat": 12.9116,
            "lng": 77.6370,
            "flood_risk": 38,
            "earthquake_risk": 30,
            "cyclone_risk": 25,
            "fused_score": 31.5,
            "level": "advisory"
        },
        {
            "id": 6,
            "name": "Indiranagar",
            "lat": 12.9784,
            "lng": 77.6408,
            "flood_risk": 25,
            "earthquake_risk": 20,
            "cyclone_risk": 18,
            "fused_score": 21.4,
            "level": "monitor"
        },
        {
            "id": 7,
            "name": "Marathahalli",
            "lat": 12.9591,
            "lng": 77.6972,
            "flood_risk": 65,
            "earthquake_risk": 48,
            "cyclone_risk": 55,
            "fused_score": 56.9,
            "level": "warning"
        },
        {
            "id": 8,
            "name": "JP Nagar",
            "lat": 12.9063,
            "lng": 77.5857,
            "flood_risk": 85,
            "earthquake_risk": 70,
            "cyclone_risk": 78,
            "fused_score": 78.4,
            "level": "critical"
        }
    ]
    return {
        "grid": mock_grid,
        "total": len(mock_grid),
        "updated_at": datetime.utcnow().isoformat()
    }
