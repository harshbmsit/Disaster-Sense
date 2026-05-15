from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/rescue-teams", tags=["Rescue Teams"])

@router.get("")
def get_rescue_teams():
    mock_teams = [
        {
            "id": 1,
            "name": "Alpha Team",
            "lat": 12.9716,
            "lng": 77.5946,
            "status": "standby",
            "members": 8,
            "equipment": ["boat", "first_aid", "radio"],
            "assigned_area": "Central Bengaluru"
        },
        {
            "id": 2,
            "name": "Bravo Team",
            "lat": 12.9352,
            "lng": 77.6245,
            "status": "deployed",
            "members": 6,
            "equipment": ["rope", "first_aid", "stretcher"],
            "assigned_area": "Koramangala"
        },
        {
            "id": 3,
            "name": "Charlie Team",
            "lat": 12.9259,
            "lng": 77.6762,
            "status": "deployed",
            "members": 10,
            "equipment": ["boat", "rope", "first_aid", "radio"],
            "assigned_area": "Bellandur"
        },
        {
            "id": 4,
            "name": "Delta Team",
            "lat": 12.9063,
            "lng": 77.5857,
            "status": "standby",
            "members": 7,
            "equipment": ["first_aid", "radio", "stretcher"],
            "assigned_area": "JP Nagar"
        }
    ]
    return {
        "teams": mock_teams,
        "total": len(mock_teams)
    }
