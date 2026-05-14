import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.database import engine, Base, get_db
from app.models.sensor_data import SensorReading
from app.ingestion.weather_ingestion import fetch_weather_data
from app.ingestion.earthquake_ingestion import fetch_earthquake_data
from app.ingestion.nasa_ingestion import fetch_nasa_data

# Create all database tables
Base.metadata.create_all(bind=engine)

def run_ingestion_sync():
    """Runs synchronous fetching and DB insert logic."""
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        # Weather
        try:
            w_data = fetch_weather_data()
            w_reading = SensorReading(
                source="weather",
                rainfall_mm=w_data["rainfall_mm"],
                wind_speed_kmh=w_data["wind_speed_kmh"],
                pressure_hpa=w_data["pressure_hpa"],
                temperature_c=w_data["temperature_c"],
                raw_data=w_data
            )
            db.add(w_reading)
        except Exception as e:
            print(f"Failed to ingest weather: {e}")

        # Earthquake
        try:
            e_data = fetch_earthquake_data()
            e_reading = SensorReading(
                source="earthquake",
                magnitude=e_data["magnitude"],
                depth_km=e_data["depth_km"],
                raw_data=e_data
            )
            db.add(e_reading)
        except Exception as e:
            print(f"Failed to ingest earthquake: {e}")

        # NASA
        try:
            n_data = fetch_nasa_data()
            n_reading = SensorReading(
                source="nasa",
                hotspot_count=n_data["hotspot_count"],
                max_brightness=n_data["max_brightness"],
                raw_data=n_data
            )
            db.add(n_reading)
        except Exception as e:
            print(f"Failed to ingest nasa: {e}")

        db.commit()
    except Exception as e:
        print(f"Ingestion loop failed: {e}")
        db.rollback()
    finally:
        db.close()

async def run_ingestion():
    # Use to_thread to avoid blocking the event loop with synchronous requests
    await asyncio.to_thread(run_ingestion_sync)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    scheduler = AsyncIOScheduler()
    scheduler.add_job(run_ingestion, 'interval', seconds=30)
    scheduler.start()
    yield
    # Shutdown
    scheduler.shutdown()

app = FastAPI(title="DisasterSense Backend", lifespan=lifespan)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "DisasterSense Backend"}

@app.get("/api/v1/sensor-data")
def get_sensor_data(db: Session = Depends(get_db)):
    # Get latest weather
    weather = db.query(SensorReading).filter(SensorReading.source == "weather").order_by(SensorReading.created_at.desc()).first()
    # Get latest earthquake
    earthquake = db.query(SensorReading).filter(SensorReading.source == "earthquake").order_by(SensorReading.created_at.desc()).first()
    # Get latest nasa
    nasa = db.query(SensorReading).filter(SensorReading.source == "nasa").order_by(SensorReading.created_at.desc()).first()

    def format_weather(w):
        if not w: return None
        return {
            "rainfall_mm": w.rainfall_mm,
            "wind_speed_kmh": w.wind_speed_kmh,
            "pressure_hpa": w.pressure_hpa,
            "temperature_c": w.temperature_c,
            "fetched_at": w.created_at.isoformat() if w.created_at else None
        }

    def format_earthquake(e):
        if not e: return None
        return {
            "magnitude": e.magnitude,
            "depth_km": e.depth_km,
            "p_wave_amplitude": e.raw_data.get("p_wave_amplitude", 0.0) if e.raw_data else 0.0,
            "frequency_hz": e.raw_data.get("frequency_hz", 0.0) if e.raw_data else 0.0,
            "fetched_at": e.created_at.isoformat() if e.created_at else None
        }

    def format_nasa(n):
        if not n: return None
        return {
            "hotspot_count": n.hotspot_count,
            "max_brightness": n.max_brightness,
            "satellite_source": n.raw_data.get("satellite_source", "VIIRS_SNPP_NRT") if n.raw_data else "VIIRS_SNPP_NRT",
            "fetched_at": n.created_at.isoformat() if n.created_at else None
        }

    return {
        "weather": format_weather(weather),
        "earthquake": format_earthquake(earthquake),
        "nasa": format_nasa(nasa)
    }
