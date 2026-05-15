import os
import torch
import torch.nn as nn
import numpy as np
import pandas as pd

class FloodLSTM(nn.Module):
    def __init__(self, input_size, hidden_size, num_layers, output_size):
        super(FloodLSTM, self).__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.dropout = nn.Dropout(0.2)
        self.fc1 = nn.Linear(hidden_size, 16)
        self.fc2 = nn.Linear(16, output_size)
        self.relu = nn.ReLU()

    def forward(self, x):
        out, _ = self.lstm(x)
        out = self.dropout(out[:, -1, :]) # Take last timestep
        out = self.relu(self.fc1(out))
        out = self.fc2(out)
        return out

class FloodModel:
    def __init__(self):
        self.model = None
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.model_path = os.path.join(base_dir, "saved_models", "flood_lstm.pt")
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.load_or_train()

    def load_or_train(self):
        self.model = FloodLSTM(input_size=4, hidden_size=64, num_layers=2, output_size=1).to(self.device)
        if os.path.exists(self.model_path):
            print("✅ Loading existing Flood LSTM model (PyTorch)...")
            self.model.load_state_dict(torch.load(self.model_path, map_location=self.device))
            self.model.eval()
        else:
            print("🔄 Training new Flood LSTM model (PyTorch)...")
            self._train_new_model()
            print(f"✅ LSTM Flood Model ready and saved to {self.model_path}")

    def _train_new_model(self):
        n_samples = 2000
        seq_length = 10
        n_features = 4

        # Generate synthetic data
        rainfall = np.random.uniform(0, 200, (n_samples, seq_length))
        river = np.random.uniform(0, 10, (n_samples, seq_length))
        pressure = np.random.uniform(980, 1020, (n_samples, seq_length))
        wind = np.random.uniform(0, 100, (n_samples, seq_length))

        X = np.stack([rainfall, river, pressure, wind], axis=-1).astype(np.float32)
        
        last_rain = rainfall[:, -1]
        last_river = river[:, -1]
        last_pressure = pressure[:, -1]
        last_wind = wind[:, -1]
        
        y = (last_rain * 0.4) + (last_river * 5) + (np.maximum(0, 1015 - last_pressure) * 2) + (last_wind * 0.1)
        y = np.clip(y + np.random.normal(0, 5, n_samples), 0, 100).astype(np.float32).reshape(-1, 1)

        X_tensor = torch.tensor(X).to(self.device)
        y_tensor = torch.tensor(y).to(self.device)

        criterion = nn.MSELoss()
        optimizer = torch.optim.Adam(self.model.parameters(), lr=0.001)

        self.model.train()
        for epoch in range(15):
            optimizer.zero_grad()
            outputs = self.model(X_tensor)
            loss = criterion(outputs, y_tensor)
            loss.backward()
            optimizer.step()
            if (epoch+1) % 5 == 0:
                print(f"Epoch [{epoch+1}/15], Loss: {loss.item():.4f}")

        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        torch.save(self.model.state_dict(), self.model_path)
        self.model.eval()

    def predict(self, weather_data) -> float:
        current_data = [
            weather_data.get('rainfall_mm', 0),
            weather_data.get('river_level_m', 5.0),
            weather_data.get('pressure_hpa', 1013),
            weather_data.get('wind_speed_kmh', 0)
        ]
        
        seq = np.array([current_data] * 10).astype(np.float32)
        X_pred = torch.tensor(seq).unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            prediction = self.model(X_pred)
            risk_score = float(prediction.cpu().numpy()[0][0])
            
        return float(np.clip(risk_score, 0, 100))
