import os
import torch
import torch.nn as nn
import numpy as np
import pandas as pd

class CycloneTransformer(nn.Module):
    def __init__(self, input_size, num_heads, ff_dim, num_layers, output_size):
        super(CycloneTransformer, self).__init__()
        self.embedding = nn.Linear(input_size, 32)
        encoder_layer = nn.TransformerEncoderLayer(d_model=32, nhead=num_heads, dim_feedforward=ff_dim, batch_first=True)
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
        self.fc1 = nn.Linear(32, 16)
        self.fc2 = nn.Linear(16, output_size)
        self.relu = nn.ReLU()
        self.pooling = nn.AdaptiveAvgPool1d(1)

    def forward(self, x):
        x = self.embedding(x)
        x = self.transformer(x)
        # Global Average Pooling across timesteps
        x = x.transpose(1, 2)
        x = self.pooling(x).squeeze(-1)
        x = self.relu(self.fc1(x))
        x = self.fc2(x)
        return x

class CycloneModel:
    def __init__(self):
        self.model = None
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.model_path = os.path.join(base_dir, "saved_models", "cyclone_transformer.pt")
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.load_or_train()

    def load_or_train(self):
        self.model = CycloneTransformer(input_size=4, num_heads=4, ff_dim=32, num_layers=1, output_size=1).to(self.device)
        if os.path.exists(self.model_path):
            print("✅ Loading existing Cyclone Transformer model (PyTorch)...")
            self.model.load_state_dict(torch.load(self.model_path, map_location=self.device))
            self.model.eval()
        else:
            print("🔄 Training new Cyclone Transformer model (PyTorch)...")
            self._train_new_model()
            print(f"✅ Transformer Cyclone Model ready and saved to {self.model_path}")

    def _train_new_model(self):
        n_samples = 2000
        seq_length = 8
        n_features = 4

        # wind, pressure, temp, humidity
        wind = np.random.uniform(0, 300, (n_samples, seq_length))
        pressure = np.random.uniform(900, 1020, (n_samples, seq_length))
        temp = np.random.uniform(20, 32, (n_samples, seq_length))
        humidity = np.random.uniform(40, 100, (n_samples, seq_length))

        X = np.stack([wind, pressure, temp, humidity], axis=-1).astype(np.float32)
        
        last_wind = wind[:, -1]
        last_pressure = pressure[:, -1]
        last_temp = temp[:, -1]
        
        y = (last_wind * 0.3) + (np.maximum(0, 1010 - last_pressure) * 0.5) + ((last_temp - 26) * 5)
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
            weather_data.get('wind_speed_kmh', 0),
            weather_data.get('pressure_hpa', 1013),
            weather_data.get('sea_surface_temp_c', 28.0),
            80.0
        ]
        
        seq = np.array([current_data] * 8).astype(np.float32)
        X_pred = torch.tensor(seq).unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            prediction = self.model(X_pred)
            risk_score = float(prediction.cpu().numpy()[0][0])
            
        return float(np.clip(risk_score, 0, 100))
