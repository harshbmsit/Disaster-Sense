from pydantic import BaseModel

class Shelter(BaseModel):
    id: int
    name: str
    lat: float
    lng: float
    capacity: int
    current_occupancy: int
    status: str
    contact: str
