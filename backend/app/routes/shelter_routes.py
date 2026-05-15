from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/shelters", tags=["Shelters"])

@router.get("")
def get_shelters():
    mock_shelters = [
        {
            "id": 1,
            "name": "Koramangala Community Hall",
            "lat": 12.9279,
            "lng": 77.6271,
            "capacity": 500,
            "current_occupancy": 120,
            "status": "open",
            "contact": "+91-80-12345678"
        },
        {
            "id": 2,
            "name": "Whitefield Relief Camp",
            "lat": 12.9698,
            "lng": 77.7480,
            "capacity": 300,
            "current_occupancy": 0,
            "status": "open",
            "contact": "+91-80-23456789"
        },
        {
            "id": 3,
            "name": "Electronic City School",
            "lat": 12.8450,
            "lng": 77.6730,
            "capacity": 800,
            "current_occupancy": 450,
            "status": "open",
            "contact": "+91-80-34567890"
        },
        {
            "id": 4,
            "name": "JP Nagar Sports Complex",
            "lat": 12.9100,
            "lng": 77.5900,
            "capacity": 1000,
            "current_occupancy": 980,
            "status": "full",
            "contact": "+91-80-45678901"
        },
        {
            "id": 5,
            "name": "Marathahalli Convention Center",
            "lat": 12.9560,
            "lng": 77.7010,
            "capacity": 600,
            "current_occupancy": 200,
            "status": "open",
            "contact": "+91-80-56789012"
        }
    ]
    return {
        "shelters": mock_shelters,
        "total": len(mock_shelters)
    }
