import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

class EarthquakeModel:
    def __init__(self):
        # IsolationForest is used for anomaly detection
        self.model = IsolationForest(contamination=0.1, random_state=42)
        self._train_placeholder()

    def _train_placeholder(self):
        # Train on "normal" seismic data
        n_samples = 100
        X = pd.DataFrame({
            'p_wave_amplitude': np.random.uniform(0, 20, n_samples),
            'frequency_hz': np.random.uniform(5, 15, n_samples),
            'depth_km': np.random.uniform(10, 100, n_samples)
        })
        self.model.fit(X)

    def predict(self, seismic_data):
        df = pd.DataFrame([seismic_data])
        # decision_function returns the anomaly score (lower is more anomalous)
        # We normalize this to 0-100 risk.
        score = self.model.decision_function(df)[0]
        # Map score (roughly -0.5 to 0.5) to risk 0-100
        # More anomalous (lower score) -> Higher risk
        risk_score = 100 * (1 - (score + 0.5)) 
        return float(np.clip(risk_score, 0, 100))
