import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const getRiskColor = (score) => {
  if (score < 30) return '#68D391';
  if (score < 60) return '#63B3ED';
  if (score < 80) return '#F6AD55';
  return '#FC8181';
};

const getRiskLabel = (score) => {
  if (score < 30) return 'LOW';
  if (score < 60) return 'MODERATE';
  if (score < 80) return 'HIGH';
  return 'CRITICAL';
};

function RiskGauge({ score }) {
  const color = getRiskColor(score);
  const data = [
    { value: score },
    { value: 100 - score }
  ];
  
  return (
    <div className="relative w-full h-[220px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="70%"
            startAngle={180}
            endAngle={0}
            innerRadius={70}
            outerRadius={95}
            dataKey="value"
            stroke="none"
          >
            <Cell fill={color} />
            <Cell fill="rgba(255,255,255,0.06)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <span className="text-3xl font-black text-white">{score?.toFixed(1)}</span>
        <span className="text-xs text-white/50 tracking-widest mt-1">/100</span>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value, unit }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 border border-white/[0.06] flex flex-col gap-3"
      style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))' }}
    >
      <div className="flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs text-white/50 uppercase tracking-widest font-semibold">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-white">{value ?? '—'}</span>
        <span className="text-sm text-white/40">{unit}</span>
      </div>
    </motion.div>
  );
}

function RiskAreaBar({ name, score, rank }) {
  const color = getRiskColor(score);
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.08 }}
      className="flex items-center gap-3"
    >
      <span className="text-xs text-white/30 w-4 font-mono">#{rank + 1}</span>
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="text-sm text-white/80 font-medium">{name}</span>
          <span className="text-sm font-bold" style={{ color }}>{score?.toFixed(1)}</span>
        </div>
        <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.8, delay: rank * 0.1 }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${color}88, ${color})` }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default function FloodTab({ riskScores, sensorData, riskGrid }) {
  const floodRisk = riskScores?.flood_risk ?? 0;
  const color = getRiskColor(floodRisk);
  const riskLabel = getRiskLabel(floodRisk);

  const weather = sensorData?.weather || {};
  const rainfall = weather.rainfall_mm ?? null;
  const windSpeed = weather.wind_speed_kmh ?? null;
  const pressure = weather.pressure_hpa ?? null;

  // Sort risk grid by flood_risk descending
  const floodAreas = [...(riskGrid || [])].sort((a, b) => 
    (b.flood_risk || b.flood || 0) - (a.flood_risk || a.flood || 0)
  ).slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col lg:flex-row gap-6 h-full overflow-auto custom-scrollbar pb-4"
    >
      {/* Left Content */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Top Score Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl p-8 border border-white/[0.06] relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${color}15, ${color}05)` }}
        >
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <motion.span
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-red-500"
            />
            <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest">Live</span>
          </div>
          
          <span className="text-xs text-white/50 uppercase tracking-[0.2em] font-semibold">Flood Risk Score</span>
          <div className="flex items-end gap-3 mt-3">
            <motion.span 
              key={floodRisk}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-7xl font-black text-white"
            >
              {floodRisk?.toFixed(1)}
            </motion.span>
            <span className="text-2xl text-white/30 font-bold mb-2">/100</span>
          </div>
          <div className="mt-3 inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
            style={{ background: `${color}25`, color: color }}
          >
            {riskLabel}
          </div>
        </motion.div>

        {/* Sensor Data Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoCard icon="🌧️" label="Rainfall" value={rainfall} unit="mm" />
          <InfoCard icon="💨" label="Wind Speed" value={windSpeed} unit="km/h" />
          <InfoCard icon="🌡️" label="Pressure" value={pressure} unit="hPa" />
        </div>

        {/* Risk Gauge */}
        <div className="rounded-3xl p-6 border border-white/[0.06]"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))' }}
        >
          <h3 className="text-xs text-white/50 uppercase tracking-[0.2em] font-semibold mb-2">Flood Risk Gauge</h3>
          <RiskGauge score={floodRisk} />
        </div>
      </div>

      {/* Right: Flood Prone Areas */}
      <div className="lg:w-[340px] shrink-0">
        <div className="rounded-3xl p-6 border border-white/[0.06] h-full"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))' }}
        >
          <h3 className="text-xs text-white/50 uppercase tracking-[0.2em] font-semibold mb-6">🌊 Flood Prone Areas</h3>
          <div className="flex flex-col gap-5">
            {floodAreas.length > 0 ? (
              floodAreas.map((area, idx) => (
                <RiskAreaBar 
                  key={area.area || area.name || idx}
                  name={area.area || area.name}
                  score={area.flood_risk || area.flood || 0}
                  rank={idx}
                />
              ))
            ) : (
              <div className="text-white/30 text-sm text-center py-8">Loading area data...</div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
