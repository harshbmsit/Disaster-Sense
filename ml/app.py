import streamlit as st
import pandas as pd
import numpy as np
from models.flood_model import FloodModel
from models.earthquake_model import EarthquakeModel
from models.cyclone_model import CycloneModel
from utils.data_generator import generate_weather_data, generate_seismic_data

# Page config
st.set_page_config(page_title="Disaster Sense Dashboard", layout="wide")

st.title("🌊 Disaster Sense: Multi-Hazard Risk Assessment")
st.markdown("Real-time risk monitoring using ML models and mock sensor data.")

# Cache models
@st.cache_resource
def load_models():
    return FloodModel(), EarthquakeModel(), CycloneModel()

flood_model, earthquake_model, cyclone_model = load_models()

# Sidebar for controls
st.sidebar.header("Data Controls")
if st.sidebar.button("🔄 Refresh Sensor Data"):
    st.rerun()

# Generate data
weather_data = generate_weather_data()
seismic_data = generate_seismic_data()

# Run predictions
flood_risk = flood_model.predict(weather_data)
earthquake_risk = earthquake_model.predict(seismic_data)
cyclone_risk = cyclone_model.predict(weather_data)

# Fused Risk
fused_risk = (flood_risk * 0.4) + (earthquake_risk * 0.3) + (cyclone_risk * 0.3)

# Display Metrics
col1, col2, col3, col4 = st.columns(4)

def get_color(score):
    if score < 30: return "green"
    if score < 70: return "orange"
    return "red"

col1.metric("Flood Risk", f"{flood_risk:.1f}%")
col2.metric("Earthquake Risk", f"{earthquake_risk:.1f}%")
col3.metric("Cyclone Risk", f"{cyclone_risk:.1f}%")
col4.metric("Fused Global Risk", f"{fused_risk:.1f}%")

# Visualizations
st.divider()

left_col, right_col = st.columns(2)

with left_col:
    st.subheader("Sensor Telemetry")
    st.json({**weather_data, **seismic_data})

with right_col:
    st.subheader("Risk Distribution")
    risk_df = pd.DataFrame({
        "Hazard": ["Flood", "Earthquake", "Cyclone", "Fused"],
        "Risk Score": [flood_risk, earthquake_risk, cyclone_risk, fused_risk]
    })
    st.bar_chart(risk_df.set_index("Hazard"))

# Risk Status Alert
st.divider()
if fused_risk > 70:
    st.error(f"🚨 CRITICAL ALERT: Fused Risk Score is {fused_risk:.1f}%. Immediate attention required.")
elif fused_risk > 40:
    st.warning(f"⚠️ WARNING: Fused Risk Score is {fused_risk:.1f}%. Monitoring levels increased.")
else:
    st.success(f"✅ Status Nominal: Fused Risk Score is {fused_risk:.1f}%.")
