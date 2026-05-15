import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const getRiskColor = (s) => s < 30 ? '#68D391' : s < 60 ? '#63B3ED' : s < 80 ? '#F6AD55' : '#FC8181';
const getRiskLabel = (s) => s < 30 ? 'LOW' : s < 60 ? 'MODERATE' : s < 80 ? 'HIGH' : 'CRITICAL';

function InfoCard({ icon, label, value, unit }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 border border-white/[0.06] flex flex-col gap-3"
      style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))' }}>
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
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: rank * 0.08 }} className="flex items-center gap-3">
      <span className="text-xs text-white/30 w-4 font-mono">#{rank + 1}</span>
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="text-sm text-white/80 font-medium">{name}</span>
          <span className="text-sm font-bold" style={{ color }}>{score?.toFixed(1)}</span>
        </div>
        <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.8, delay: rank * 0.1 }}
            className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${color}88, ${color})` }} />
        </div>
      </div>
    </motion.div>
  );
}

function genSeismicData(mag) {
  const b = mag || 2.5;
  return [
    { time: '-20m', magnitude: +(Math.max(0, b - 0.8 + Math.random() * 0.4)).toFixed(2) },
    { time: '-15m', magnitude: +(Math.max(0, b - 0.3 + Math.random() * 0.3)).toFixed(2) },
    { time: '-10m', magnitude: +(Math.max(0, b + Math.random() * 1.2)).toFixed(2) },
    { time: '-5m', magnitude: +(Math.max(0, b - 0.5 + Math.random() * 0.5)).toFixed(2) },
    { time: 'Now', magnitude: +b.toFixed(2) },
  ];
}

export default function EarthquakeTab({ riskScores, sensorData, riskGrid }) {
  const risk = riskScores?.earthquake_risk ?? 0;
  const color = getRiskColor(risk);
  const eq = sensorData?.earthquake || {};

  const quakeAreas = [...(riskGrid || [])].sort((a, b) =>
    (b.earthquake_risk || b.quake || 0) - (a.earthquake_risk || a.quake || 0)
  ).slice(0, 5);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
      className="flex flex-col gap-6 h-full overflow-auto custom-scrollbar pb-4">

      {/* Score Card */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl p-8 border border-white/[0.06] relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${color}15, ${color}05)` }}>
        <span className="text-xs text-white/50 uppercase tracking-[0.2em] font-semibold">Seismic Risk Score</span>
        <div className="flex items-end gap-3 mt-3">
          <motion.span key={risk} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-7xl font-black text-white">
            {risk?.toFixed(1)}
          </motion.span>
          <span className="text-2xl text-white/30 font-bold mb-2">/100</span>
        </div>
        <div className="mt-3 inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
          style={{ background: `${color}25`, color }}>{getRiskLabel(risk)}</div>
      </motion.div>

      {/* Sensor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InfoCard icon="📊" label="Magnitude" value={eq.magnitude} unit="Richter" />
        <InfoCard icon="🔻" label="Depth" value={eq.depth_km} unit="km" />
        <InfoCard icon="〰️" label="P-Wave Amp" value={eq.p_wave_amplitude} unit="μm/s" />
      </div>

      {/* Chart + Areas */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        <div className="flex-1 rounded-3xl p-6 border border-white/[0.06]"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))' }}>
          <h3 className="text-xs text-white/50 uppercase tracking-[0.2em] font-semibold mb-4">Seismic Activity Timeline</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={genSeismicData(eq.magnitude)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 10]} stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                <Line type="monotone" dataKey="magnitude" stroke="#F97316" strokeWidth={2.5}
                  dot={{ fill: '#F97316', r: 4, strokeWidth: 2, stroke: '#1A1A2E' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="lg:w-[340px] shrink-0">
          <div className="rounded-3xl p-6 border border-white/[0.06] h-full"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))' }}>
            <h3 className="text-xs text-white/50 uppercase tracking-[0.2em] font-semibold mb-6">⚠️ Earthquake Risk Areas</h3>
            <div className="flex flex-col gap-5">
              {quakeAreas.length > 0 ? quakeAreas.map((a, i) => (
                <RiskAreaBar key={a.area || a.name || i} name={a.area || a.name} score={a.earthquake_risk || a.quake || 0} rank={i} />
              )) : <div className="text-white/30 text-sm text-center py-8">Loading area data...</div>}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
