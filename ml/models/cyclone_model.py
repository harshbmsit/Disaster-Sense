import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

class CycloneModel:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=10)
        self._train_placeholder()

    def _train_placeholder(self):
        # Generate synthetic training data
        n_samples = 100
        X = pd.DataFrame({
            'rainfall_mm': np.random.uniform(0, 500, n_samples),
            'river_level_m': np.random.uniform(0, 15, n_samples),
            'wind_speed_kmh': np.random.uniform(0, 300, n_samples),
            'pressure_hpa': np.random.uniform(900, 1050, n_samples),
            'sea_surface_temp_c': np.random.uniform(20, 35, n_samples)
        })
        # Risk score logic: High wind speed and sea surface temp, low pressure -> higher risk
        y = (X['wind_speed_kmh'] / 300 * 50) + (X['sea_surface_temp_c'] / 35 * 30) + ((1050 - X['pressure_hpa']) / 150 * 20)
        y = np.clip(y, 0, 100)
        self.model.fit(X, y)

    def predict(self, weather_data):
        df = pd.DataFrame([weather_data])
        risk_score = self.model.predict(df)[0]
        return float(np.clip(risk_score, 0, 100))
