from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.sensor_data import db

reports_collection = db["citizen_reports"]

class CitizenReportCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    area: str
    disaster_type: str
    description: str
    severity: str
