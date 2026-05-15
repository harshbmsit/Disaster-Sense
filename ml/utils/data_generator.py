import random

def generate_weather_data():
    """
    Generates mock weather sensor data.
    Returns:
        dict: rainfall_mm, river_level_m, wind_speed_kmh, pressure_hpa, sea_surface_temp_c
    """
    return {
        "rainfall_mm": random.uniform(0, 500),
        "river_level_m": random.uniform(0, 15),
        "wind_speed_kmh": random.uniform(0, 300),
        "pressure_hpa": random.uniform(900, 1050),
        "sea_surface_temp_c": random.uniform(20, 35)
    }

def generate_seismic_data():
    """
    Generates mock seismic sensor data.
    Returns:
        dict: p_wave_amplitude, frequency_hz, depth_km
    """
    return {
        "p_wave_amplitude": random.uniform(0, 100),
        "frequency_hz": random.uniform(0.1, 20),
        "depth_km": random.uniform(0, 700)
    }
