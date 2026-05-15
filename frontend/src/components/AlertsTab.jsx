import React from 'react';
import { motion } from 'framer-motion';

const severityConfig = {
  critical: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', dot: '#EF4444', text: 'text-red-400' },
  warning:  { bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.2)', dot: '#F97316', text: 'text-orange-400' },
  advisory: { bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', dot: '#3B82F6', text: 'text-blue-400' },
  monitor:  { bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.2)', dot: '#6B7280', text: 'text-gray-400' },
};

function getSevConfig(level) {
  if (!level) return severityConfig.monitor;
  const l = level.toLowerCase();
  if (l.includes('critical')) return severityConfig.critical;
  if (l.includes('warning')) return severityConfig.warning;
  if (l.includes('advisory')) return severityConfig.advisory;
  return severityConfig.monitor;
}

function SummaryCard({ label, count, color, icon }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 border border-white/[0.06] flex flex-col gap-2"
      style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))' }}>
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <span className="text-xs text-white/50 uppercase tracking-widest font-semibold">{label}</span>
      </div>
      <span className="text-4xl font-black" style={{ color }}>{count}</span>
    </motion.div>
  );
}

function timeAgo(dateString) {
  if (!dateString) return '';
  const serverTime = new Date(dateString);
  const now = new Date();
  const adjustedTime = new Date(serverTime.getTime() + (5.5 * 60 * 60 * 1000));
  const diff = Math.floor((now - adjustedTime) / 60000);
  if (isNaN(diff)) return dateString;
  if (diff < 1) return 'just now';
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

export default function AlertsTab({ alerts, shelters, rescueTeams }) {
  const displayAlerts = alerts && alerts.length > 0 ? alerts : [];
  const criticalCount = displayAlerts.filter(a => a.level?.toLowerCase().includes('critical')).length;
  const warningCount = displayAlerts.filter(a => a.level?.toLowerCase().includes('warning')).length;
  const advisoryCount = displayAlerts.filter(a => a.level?.toLowerCase().includes('advisory')).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
      className="flex flex-col gap-6 h-full overflow-auto custom-scrollbar pb-4">

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Total Alerts" count={displayAlerts.length} color="#FFFFFF" icon="📋" />
        <SummaryCard label="Critical" count={criticalCount} color="#EF4444" icon="🔴" />
        <SummaryCard label="Warning" count={warningCount} color="#F97316" icon="🟠" />
        <SummaryCard label="Advisory" count={advisoryCount} color="#3B82F6" icon="🔵" />
      </div>

      {/* Alerts Table */}
      <div className="rounded-3xl border border-white/[0.06] overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))' }}>
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
          <h3 className="text-xs text-white/50 uppercase tracking-[0.2em] font-semibold">All Alerts</h3>
          <span className="text-[10px] text-white/30 uppercase tracking-widest">Auto-refresh 30s</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-xs text-white/40 uppercase tracking-wider font-semibold px-4 py-3">Type</th>
                <th className="text-left text-xs text-white/40 uppercase tracking-wider font-semibold px-4 py-3">Location</th>
                <th className="text-left text-xs text-white/40 uppercase tracking-wider font-semibold px-4 py-3">Severity</th>
                <th className="text-left text-xs text-white/40 uppercase tracking-wider font-semibold px-4 py-3">Time</th>
                <th className="text-left text-xs text-white/40 uppercase tracking-wider font-semibold px-4 py-3">Description</th>
              </tr>
            </thead>
            <tbody>
              {displayAlerts.length > 0 ? displayAlerts.map((alert, idx) => {
                const sev = getSevConfig(alert.level);
                return (
                  <motion.tr key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                    style={{ background: sev.bg }}>
                    <td className="px-4 py-3 text-white/80 font-medium">{alert.type}</td>
                    <td className="px-4 py-3 text-white/60">{alert.area || alert.location || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase ${sev.text}`}>
                        <span className="w-2 h-2 rounded-full" style={{ background: sev.dot }}></span>
                        {alert.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/40 text-xs">{alert.created_at ? timeAgo(alert.created_at) : '—'}</td>
                    <td className="px-4 py-3 text-white/50 text-xs max-w-[250px] truncate">{alert.message || alert.description || '—'}</td>
                  </motion.tr>
                );
              }) : (
                <tr><td colSpan={5} className="text-center text-white/30 py-12">No alerts available</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom: Rescue Teams + Shelters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rescue Teams */}
        <div className="rounded-3xl p-6 border border-white/[0.06]"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))' }}>
          <h3 className="text-xs text-white/50 uppercase tracking-[0.2em] font-semibold mb-4">🚁 Rescue Teams</h3>
          <div className="flex flex-col gap-3">
            {rescueTeams && rescueTeams.length > 0 ? rescueTeams.map((team, i) => {
              const deployed = team.status?.toLowerCase() === 'deployed';
              return (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between py-3 px-4 rounded-xl border border-white/[0.04]"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex flex-col">
                    <span className="text-sm text-white font-medium">{team.name || team.team_name}</span>
                    <span className="text-xs text-white/40">{team.location || team.assigned_area || '—'}</span>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase ${deployed ? 'text-orange-400' : 'text-green-400'}`}>
                    <span className={`w-2 h-2 rounded-full ${deployed ? 'bg-orange-400' : 'bg-green-400'}`}></span>
                    {team.status}
                  </span>
                </motion.div>
              );
            }) : <div className="text-white/30 text-sm text-center py-6">No rescue team data</div>}
          </div>
        </div>

        {/* Shelters */}
        <div className="rounded-3xl p-6 border border-white/[0.06]"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))' }}>
          <h3 className="text-xs text-white/50 uppercase tracking-[0.2em] font-semibold mb-4">🏠 Shelter Status</h3>
          <div className="flex flex-col gap-3">
            {shelters && shelters.length > 0 ? shelters.map((s, i) => {
              const cap = s.capacity || 100;
              const occ = s.occupied || s.current_occupancy || 0;
              const avail = cap - occ;
              const pct = Math.round((occ / cap) * 100);
              const full = pct >= 95;
              return (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="py-3 px-4 rounded-xl border border-white/[0.04]"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-white font-medium">{s.name || s.shelter_name}</span>
                    <span className={`text-xs font-bold ${full ? 'text-red-400' : 'text-green-400'}`}>
                      {avail} available
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
                      className={`h-full rounded-full ${full ? 'bg-red-500' : 'bg-green-500'}`} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-white/30">{occ}/{cap} occupied</span>
                    <span className="text-[10px] text-white/30">{pct}%</span>
                  </div>
                </motion.div>
              );
            }) : <div className="text-white/30 text-sm text-center py-6">No shelter data</div>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
