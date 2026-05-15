from pydantic import BaseModel
from typing import List

class RescueTeam(BaseModel):
    id: int
    name: str
    lat: float
    lng: float
    status: str
    members: int
    equipment: List[str]
    assigned_area: str
