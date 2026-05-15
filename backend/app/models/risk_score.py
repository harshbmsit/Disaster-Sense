from datetime import datetime
from app.models.sensor_data import db

risk_scores = db["risk_scores"]


def save_risk_score(flood_risk: float, earthquake_risk: float, cyclone_risk: float) -> dict:
    """Calculate fused score, determine alert level, and save to MongoDB."""
    fused_score = round(flood_risk * 0.4 + earthquake_risk * 0.3 + cyclone_risk * 0.3, 2)

    if fused_score >= 80:
        alert_level = "Critical"
        alert_color = "red"
    elif fused_score >= 60:
        alert_level = "Warning"
        alert_color = "orange"
    elif fused_score >= 30:
        alert_level = "Advisory"
        alert_color = "blue"
    else:
        alert_level = "Monitor"
        alert_color = "gray"

    doc = {
        "flood_risk": flood_risk,
        "earthquake_risk": earthquake_risk,
        "cyclone_risk": cyclone_risk,
        "fused_score": fused_score,
        "alert_level": alert_level,
        "alert_color": alert_color,
        "created_at": datetime.utcnow()
    }

    risk_scores.insert_one(doc)
    print(f"Risk score saved: fused={fused_score} level={alert_level}")
    return doc


def get_latest_risk_score() -> dict | None:
    """Return the latest risk score document from MongoDB."""
    doc = risk_scores.find_one(sort=[("created_at", -1)])
    if doc:
        print("Latest risk score fetched from MongoDB")
    return doc
