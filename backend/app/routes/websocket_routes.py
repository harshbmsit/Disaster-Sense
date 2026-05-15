import asyncio
from datetime import datetime
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.models.risk_score import risk_scores

router = APIRouter(tags=["WebSockets"])

@router.websocket("/ws/live-updates")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Fetch latest risk score from MongoDB
            latest_score = risk_scores.find_one(sort=[("created_at", -1)])
            
            if latest_score:
                data = {
                    "flood_risk": latest_score.get("flood_risk", 0.0),
                    "earthquake_risk": latest_score.get("earthquake_risk", 0.0),
                    "cyclone_risk": latest_score.get("cyclone_risk", 0.0),
                    "fused_score": latest_score.get("fused_score", 0.0),
                    "level": latest_score.get("alert_level", "monitor").lower(),
                    "updated_at": latest_score.get("created_at").isoformat() if isinstance(latest_score.get("created_at"), datetime) else str(latest_score.get("created_at"))
                }
            else:
                # Push mock data if collection is empty
                data = {
                    "flood_risk": 23.4,
                    "earthquake_risk": 45.2,
                    "cyclone_risk": 31.8,
                    "fused_score": 33.1,
                    "level": "advisory",
                    "updated_at": datetime.utcnow().isoformat()
                }
            
            await websocket.send_json(data)
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        print("Client disconnected from WebSocket")
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        try:
            await websocket.close()
        except:
            pass
