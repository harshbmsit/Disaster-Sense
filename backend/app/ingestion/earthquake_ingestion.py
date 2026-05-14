import requests

def fetch_earthquake_data():
    url = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=12.97&longitude=77.59&maxradius=5&minmagnitude=1&orderby=time&limit=1"
    
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        features = data.get("features", [])
        if features:
            feature = features[0]
            properties = feature.get("properties", {})
            geometry = feature.get("geometry", {})
            
            magnitude = float(properties.get("mag", 0.0))
            coords = geometry.get("coordinates", [0.0, 0.0, 0.0])
            depth_km = float(coords[2]) if len(coords) >= 3 else 10.0
            p_wave_amplitude = magnitude * 0.8
            frequency_hz = 1.0 / (depth_km + 1)
        else:
            magnitude = 0.0
            depth_km = 10.0
            p_wave_amplitude = 0.0
            frequency_hz = 0.09
            
        result = {
            "magnitude": float(magnitude),
            "depth_km": float(depth_km),
            "p_wave_amplitude": float(p_wave_amplitude),
            "frequency_hz": float(frequency_hz),
            "raw_data": data
        }
        print(f"Earthquake data fetched: magnitude={result['magnitude']} depth={result['depth_km']}km")
        return result
        
    except Exception as e:
        print(f"Earthquake fetch failed: {e}. Using mock fallback values.")
        result = {
            "magnitude": 0.0,
            "depth_km": 10.0,
            "p_wave_amplitude": 0.0,
            "frequency_hz": 0.09,
            "raw_data": {"error": str(e), "mock": True}
        }
        print(f"Earthquake data fetched: magnitude={result['magnitude']} depth={result['depth_km']}km")
        return result
