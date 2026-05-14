import sys
import time

# Force UTF-8 for Windows console to handle emojis
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

from ingestion.data_fetcher import fetch_weather, fetch_earthquake
from models import FloodModel, EarthquakeModel, CycloneModel

FLOOD_WEIGHT      = 0.40
EARTHQUAKE_WEIGHT = 0.30
CYCLONE_WEIGHT    = 0.30

def get_alert_level(score):
    if score < 30:   return "🟢 Monitor"
    elif score < 60: return "🟡 Advisory"
    elif score < 80: return "🟠 Warning"
    else:            return "🔴 Critical"

def run_once(flood_model, earthquake_model, cyclone_model):
    print("\n" + "="*52)
    print("   DisasterSense — Real-Time Risk Assessment")
    print("="*52)

    # Fetch real data
    weather_data  = fetch_weather()
    seismic_data  = fetch_earthquake()

    print("\n📡 REAL DATA FETCHED:")
    print(f"   Weather : rainfall={weather_data['rainfall_mm']}mm  "
          f"wind={weather_data['wind_speed_kmh']:.1f}kmh  "
          f"pressure={weather_data['pressure_hpa']}hPa")
    print(f"   Seismic : amplitude={seismic_data['p_wave_amplitude']:.3f}  "
          f"freq={seismic_data['frequency_hz']:.2f}Hz  "
          f"depth={seismic_data['depth_km']:.1f}km")

    # Run predictions
    flood_score      = flood_model.predict(weather_data)
    earthquake_score = earthquake_model.predict(seismic_data)
    cyclone_score    = cyclone_model.predict(weather_data)
    fused_score      = round(
        FLOOD_WEIGHT * flood_score +
        EARTHQUAKE_WEIGHT * earthquake_score +
        CYCLONE_WEIGHT * cyclone_score, 2
    )

    print("\n🔥 RISK SCORES:")
    print(f"   Flood Risk Score      : {flood_score:>6.2f}/100  {get_alert_level(flood_score)}")
    print(f"   Earthquake Risk Score : {earthquake_score:>6.2f}/100  {get_alert_level(earthquake_score)}")
    print(f"   Cyclone Risk Score    : {cyclone_score:>6.2f}/100  {get_alert_level(cyclone_score)}")
    print(f"   {'─'*44}")
    print(f"   Fused Risk Score      : {fused_score:>6.2f}/100  {get_alert_level(fused_score)}")
    print(f"   (flood×{FLOOD_WEIGHT} + quake×{EARTHQUAKE_WEIGHT} + cyclone×{CYCLONE_WEIGHT})")

def main():
    print("🚀 Loading ML models...")
    flood_model      = FloodModel()
    earthquake_model = EarthquakeModel()
    cyclone_model    = CycloneModel()
    print("✅ All models loaded.\n")

    print("🔁 Running every 30 seconds. Press Ctrl+C to stop.\n")
    while True:
        run_once(flood_model, earthquake_model, cyclone_model)
        print("\n⏳ Next update in 30 seconds...")
        time.sleep(30)

if __name__ == "__main__":
    main()
