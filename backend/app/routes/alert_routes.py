from fastapi import APIRouter
from datetime import datetime
from app.models.alert import alerts_collection, AlertCreate

router = APIRouter(prefix="/api/v1/alerts", tags=["Alerts"])

@router.get("")
def get_alerts():
    alerts = list(alerts_collection.find())
    
    if not alerts:
        # Seed mock alerts
        mock_alerts = [
            {
                "type": "flood",
                "level": "warning",
                "area": "Koramangala",
                "message": "Heavy rainfall detected. Flood risk score 72/100.",
                "created_at": datetime.utcnow()
            },
            {
                "type": "earthquake",
                "level": "advisory",
                "area": "Whitefield",
                "message": "Minor seismic activity detected. Stay alert.",
                "created_at": datetime.utcnow()
            },
            {
                "type": "cyclone",
                "level": "critical",
                "area": "Bellandur",
                "message": "Critical risk detected. Evacuate low-lying areas.",
                "created_at": datetime.utcnow()
            }
        ]
        alerts_collection.insert_many(mock_alerts)
        alerts = list(alerts_collection.find())

    # Format for response
    formatted_alerts = []
    for alert in alerts:
        formatted_alerts.append({
            "id": str(alert["_id"]),
            "type": alert["type"],
            "level": alert["level"],
            "area": alert["area"],
            "message": alert["message"],
            "created_at": alert["created_at"].isoformat() if isinstance(alert["created_at"], datetime) else alert["created_at"]
        })

    return {
        "alerts": formatted_alerts,
        "total": len(formatted_alerts)
    }

@router.post("")
def create_alert(alert: AlertCreate):
    new_alert = alert.dict()
    new_alert["created_at"] = datetime.utcnow()
    result = alerts_collection.insert_one(new_alert)
    
    # Convert ObjectId and datetime for response
    new_alert["_id"] = str(result.inserted_id)
    new_alert["created_at"] = new_alert["created_at"].isoformat()
    
    return new_alert

@router.delete("")
async def delete_all_alerts():
    alerts_collection.delete_many({})
    return {"message": "All alerts cleared", "status": "ok"}
