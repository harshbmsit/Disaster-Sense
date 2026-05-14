import os
import requests
from dotenv import load_dotenv

load_dotenv()

def fetch_weather_data():
    api_key = os.getenv("OPENWEATHER_API_KEY")
    url = f"http://api.openweathermap.org/data/2.5/weather?q=Bangalore&appid={api_key}&units=metric"
    
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        rainfall_mm = data.get("rain", {}).get("1h", 0.0)
        wind_speed_kmh = data.get("wind", {}).get("speed", 0.0) * 3.6
        pressure_hpa = data.get("main", {}).get("pressure", 1013.0)
        temperature_c = data.get("main", {}).get("temp", 28.0)
        
        result = {
            "rainfall_mm": float(rainfall_mm),
            "wind_speed_kmh": float(wind_speed_kmh),
            "pressure_hpa": float(pressure_hpa),
            "temperature_c": float(temperature_c),
            "raw_data": data
        }
        print(f"Weather data fetched: rainfall={result['rainfall_mm']}mm wind={result['wind_speed_kmh']:.2f}kmh pressure={result['pressure_hpa']}hPa temp={result['temperature_c']}°C")
        return result
        
    except Exception as e:
        print(f"Weather fetch failed: {e}. Using mock fallback values.")
        result = {
            "rainfall_mm": 8.5,
            "wind_speed_kmh": 25.0,
            "pressure_hpa": 1013.0,
            "temperature_c": 28.0,
            "raw_data": {"error": str(e), "mock": True}
        }
        print(f"Weather data fetched: rainfall={result['rainfall_mm']}mm wind={result['wind_speed_kmh']}kmh pressure={result['pressure_hpa']}hPa temp={result['temperature_c']}°C")
        return result
