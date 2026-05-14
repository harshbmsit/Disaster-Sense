from sqlalchemy import Column, Integer, String, Float, JSON, DateTime
from sqlalchemy.sql import func
from app.database import Base

class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source = Column(String)
    rainfall_mm = Column(Float, nullable=True)
    wind_speed_kmh = Column(Float, nullable=True)
    pressure_hpa = Column(Float, nullable=True)
    temperature_c = Column(Float, nullable=True)
    magnitude = Column(Float, nullable=True)
    depth_km = Column(Float, nullable=True)
    hotspot_count = Column(Integer, nullable=True)
    max_brightness = Column(Float, nullable=True)
    raw_data = Column(JSON)
    created_at = Column(DateTime, default=func.now())
