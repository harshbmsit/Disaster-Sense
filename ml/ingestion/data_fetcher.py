import os
import requests
from dotenv import load_dotenv

# Load from ml/.env
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

def fetch_weather():
    api_key = os.getenv("OPENWEATHER_API_KEY")
    url = f"http://api.openweathermap.org/data/2.5/weather?q=Bangalore&appid={api_key}&units=metric"
    
    try:
        if not api_key or api_key == "paste_the_real_key_here":
            raise ValueError("No valid API Key")
        
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        
        rain = data.get("rain", {})
        rainfall_mm = rain.get("1h", 0.0)
        
        wind = data.get("wind", {})
        wind_speed_kmh = wind.get("speed", 0.0) * 3.6
        
        main = data.get("main", {})
        pressure_hpa = main.get("pressure", 1013.0)
        sea_surface_temp_c = main.get("temp", 28.0)
        
        print(f"✅ Weather fetched: rainfall={rainfall_mm}mm wind={wind_speed_kmh:.1f}kmh pressure={pressure_hpa}hPa")
        return {
            "rainfall_mm": rainfall_mm,
            "river_level_m": 5.0,
            "wind_speed_kmh": wind_speed_kmh,
            "pressure_hpa": pressure_hpa,
            "sea_surface_temp_c": sea_surface_temp_c
        }
    except Exception as e:
        print("⚠️  Weather API failed — using mock data")
        return {
            "rainfall_mm": 8.5,
            "river_level_m": 5.0,
            "wind_speed_kmh": 25.0,
            "pressure_hpa": 1013.0,
            "sea_surface_temp_c": 28.0
        }

def fetch_earthquake():
    url = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=12.97&longitude=77.59&maxradius=10&minmagnitude=0.5&orderby=time&limit=1"
    
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        
        features = data.get("features", [])
        if features:
            properties = features[0].get("properties", {})
            geometry = features[0].get("geometry", {})
            
            magnitude = properties.get("mag", 0.0)
            coordinates = geometry.get("coordinates", [0, 0, 0])
            depth_km = coordinates[2] if len(coordinates) > 2 else 50.0
            
            p_wave_amplitude = min(magnitude * 1.5, 10.0)
            frequency_hz = max(10.0 - depth_km * 0.01, 0.5)
            
            print(f"✅ Earthquake fetched: magnitude={magnitude} depth={depth_km}km")
            return {
                "p_wave_amplitude": p_wave_amplitude,
                "frequency_hz": frequency_hz,
                "depth_km": depth_km
            }
        else:
            raise ValueError("No earthquake data")
    except Exception as e:
        print("⚠️  No recent earthquake data — using safe defaults")
        return {
            "p_wave_amplitude": 0.2,
            "frequency_hz": 5.0,
            "depth_km": 50.0
        }
