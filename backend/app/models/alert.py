from pydantic import BaseModel
from datetime import datetime
from app.models.sensor_data import db

alerts_collection = db["alerts"]

class AlertCreate(BaseModel):
    type: str
    level: str
    area: str
    message: str
