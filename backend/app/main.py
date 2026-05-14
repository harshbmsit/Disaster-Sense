import asyncio
from datetime import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.models.sensor_data import sensor_readings
from app.ingestion.weather_ingestion import fetch_weather_data
from app.ingestion.earthquake_ingestion import fetch_earthquake_data
from app.ingestion.nasa_ingestion import fetch_nasa_data

def run_ingestion_sync():
    """Runs synchronous fetching and DB insert logic."""
    try:
        # Weather
        try:
            w_data = fetch_weather_data()
            sensor_readings.insert_one({
                "source": "weather",
                "rainfall_mm": w_data["rainfall_mm"],
                "wind_speed_kmh": w_data["wind_speed_kmh"],
                "pressure_hpa": w_data["pressure_hpa"],
                "temperature_c": w_data["temperature_c"],
                "raw_data": w_data,
                "created_at": datetime.utcnow()
            })
            print(f"Weather data fetched: rainfall={w_data['rainfall_mm']}mm wind={w_data['wind_speed_kmh']}kmh...")
        except Exception as e:
            print(f"Failed to ingest weather: {e}")

        # Earthquake
        try:
            e_data = fetch_earthquake_data()
            sensor_readings.insert_one({
                "source": "earthquake",
                "magnitude": e_data["magnitude"],
                "depth_km": e_data["depth_km"],
                "p_wave_amplitude": e_data.get("p_wave_amplitude", 0.0),
                "frequency_hz": e_data.get("frequency_hz", 0.0),
                "raw_data": e_data,
                "created_at": datetime.utcnow()
            })
            print(f"Earthquake data fetched: magnitude={e_data['magnitude']} depth={e_data['depth_km']}km")
        except Exception as e:
            print(f"Failed to ingest earthquake: {e}")

        # NASA
        try:
            n_data = fetch_nasa_data()
            sensor_readings.insert_one({
                "source": "nasa",
                "hotspot_count": n_data["hotspot_count"],
                "max_brightness": n_data["max_brightness"],
                "satellite_source": n_data.get("satellite_source", "VIIRS_SNPP_NRT"),
                "raw_data": n_data,
                "created_at": datetime.utcnow()
            })
            print(f"NASA data fetched: hotspots={n_data['hotspot_count']} max_brightness={n_data['max_brightness']}")
        except Exception as e:
            print(f"Failed to ingest nasa: {e}")

    except Exception as e:
        print(f"Ingestion loop failed: {e}")

async def run_ingestion():
    # Use to_thread to avoid blocking the event loop with synchronous requests
    await asyncio.to_thread(run_ingestion_sync)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting up...")
    print("Connected to MongoDB ✅")
    
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
def get_sensor_data():
    latest_weather = sensor_readings.find_one(
        {"source": "weather"},
        sort=[("created_at", -1)]
    )
    latest_earthquake = sensor_readings.find_one(
        {"source": "earthquake"},
        sort=[("created_at", -1)]
    )
    latest_nasa = sensor_readings.find_one(
        {"source": "nasa"},
        sort=[("created_at", -1)]
    )

    def format_weather(w):
        if not w: return None
        return {
            "rainfall_mm": w.get("rainfall_mm"),
            "wind_speed_kmh": w.get("wind_speed_kmh"),
            "pressure_hpa": w.get("pressure_hpa"),
            "temperature_c": w.get("temperature_c"),
            "fetched_at": w.get("created_at").isoformat() if w.get("created_at") else None
        }

    def format_earthquake(e):
        if not e: return None
        return {
            "magnitude": e.get("magnitude"),
            "depth_km": e.get("depth_km"),
            "p_wave_amplitude": e.get("p_wave_amplitude"),
            "frequency_hz": e.get("frequency_hz"),
            "fetched_at": e.get("created_at").isoformat() if e.get("created_at") else None
        }

    def format_nasa(n):
        if not n: return None
        return {
            "hotspot_count": n.get("hotspot_count"),
            "max_brightness": n.get("max_brightness"),
            "satellite_source": n.get("satellite_source"),
            "fetched_at": n.get("created_at").isoformat() if n.get("created_at") else None
        }

    return {
        "weather": format_weather(latest_weather),
        "earthquake": format_earthquake(latest_earthquake),
        "nasa": format_nasa(latest_nasa)
    }
