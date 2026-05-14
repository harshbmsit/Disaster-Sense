import os
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

class EarthquakeModel:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.model_path = os.path.join(base_dir, "saved_models", "earthquake_isolation_forest.pkl")
        self.load_or_train()

    def load_or_train(self):
        if os.path.exists(self.model_path):
            print("✅ Loading existing Earthquake Isolation Forest model...")
            data = joblib.load(self.model_path)
            self.model = data['model']
            self.scaler = data['scaler']
        else:
            print("🔄 Training new Earthquake Isolation Forest model...")
            self._train_new_model()
            print(f"✅ Isolation Forest Earthquake Model ready and saved to {self.model_path}")

    def _train_new_model(self):
        # 1. Generate synthetic training data
        n_samples = 1500
        
        # Normal seismic readings (80% of data)
        n_normal = int(n_samples * 0.8)
        normal_data = pd.DataFrame({
            'p_wave_amplitude': np.random.uniform(0, 2, n_normal),
            'frequency_hz': np.random.uniform(0.5, 5, n_normal),
            'depth_km': np.random.uniform(5, 30, n_normal),
            'magnitude': np.random.uniform(0, 2, n_normal)
        })
        
        # Anomalous readings (20% of data — earthquakes)
        n_anomalous = n_samples - n_normal
        anomalous_data = pd.DataFrame({
            'p_wave_amplitude': np.random.uniform(5, 20, n_anomalous),
            'frequency_hz': np.random.uniform(8, 20, n_anomalous),
            'depth_km': np.random.uniform(2, 15, n_anomalous),
            'magnitude': np.random.uniform(3, 8, n_anomalous)
        })
        
        X = pd.concat([normal_data, anomalous_data], ignore_index=True)
        X = X.sample(frac=1).reset_index(drop=True) # Shuffle
        
        # Scale data
        self.scaler.fit(X)
        X_scaled = self.scaler.transform(X)

        # 2. Train Isolation Forest
        self.model = IsolationForest(
            n_estimators=200,
            contamination=0.2,
            random_state=42,
            max_samples='auto'
        )
        self.model.fit(X_scaled)
        
        # 3. Save
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        joblib.dump({'model': self.model, 'scaler': self.scaler}, self.model_path)

    def predict(self, seismic_data) -> float:
        """
        Takes dict: {magnitude, depth_km, p_wave_amplitude, frequency_hz}
        """
        df = pd.DataFrame([{
            'p_wave_amplitude': seismic_data.get('p_wave_amplitude', 0),
            'frequency_hz': seismic_data.get('frequency_hz', 0),
            'depth_km': seismic_data.get('depth_km', 0),
            'magnitude': seismic_data.get('magnitude', 0)
        }])
        
        X_scaled = self.scaler.transform(df)
        
        # IsolationForest predict: 1 for normal, -1 for anomaly
        is_anomaly = self.model.predict(X_scaled)[0] == -1
        magnitude = seismic_data.get('magnitude', 0)
        
        # Risk Mapping
        if not is_anomaly:
            risk_score = magnitude * 12 # Base risk for normal tremors
        else:
            risk_score = 60 + (magnitude * 8) # High risk for anomalies
            
        return float(np.clip(risk_score, 0, 100))
