from models.flood_model import FloodModel
from models.earthquake_model import EarthquakeModel
from models.cyclone_model import CycloneModel
from utils.data_generator import generate_weather_data, generate_seismic_data

def main():
    # Load all 3 models
    flood_model = FloodModel()
    earthquake_model = EarthquakeModel()
    cyclone_model = CycloneModel()

    # Generate mock data
    weather_data = generate_weather_data()
    seismic_data = generate_seismic_data()

    # Run predictions
    flood_risk = flood_model.predict(weather_data)
    earthquake_risk = earthquake_model.predict(seismic_data)
    cyclone_risk = cyclone_model.predict(weather_data)

    # Fused Risk Score: weighted average
    # (flood 40% + earthquake 30% + cyclone 30%)
    fused_risk = (flood_risk * 0.4) + (earthquake_risk * 0.3) + (cyclone_risk * 0.3)

    # Print results
    print(f"Flood Risk Score: {flood_risk:.2f}")
    print(f"Earthquake Risk Score: {earthquake_risk:.2f}")
    print(f"Cyclone Risk Score: {cyclone_risk:.2f}")
    print(f"Fused Risk Score: {fused_risk:.2f}")

if __name__ == "__main__":
    main()
