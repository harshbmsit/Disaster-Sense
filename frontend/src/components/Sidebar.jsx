import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AlertCard from './AlertCard';

export default function Sidebar({ activeTab, alerts }) {
  const fallbackAlerts = [
    { type: "FLOOD WARNING", location: "Koramangala", message: "Heavy rainfall detected.", level: "Warning", color: "orange", time: "2 mins ago" },
    { type: "CYCLONE ADVISORY", location: "Whitefield", message: "Wind speed increasing.", level: "Advisory", color: "blue", time: "8 mins ago" },
    { type: "EARTHQUAKE MONITOR", location: "Electronic City", message: "Minor seismic activity detected.", level: "Monitor", color: "green", time: "15 mins ago" },
    { type: "CRITICAL FLOOD ALERT", location: "Bellandur", message: "Severe flooding imminent.", level: "Critical", color: "red", time: "22 mins ago" },
    { type: "FLOOD ADVISORY", location: "HSR Layout", message: "Water levels rising.", level: "Advisory", color: "blue", time: "35 mins ago" },
  ];

  function timeAgo(dateString) {
    if (!dateString) return '';
    const serverTime = new Date(dateString);
    const now = new Date();
    
    // Add 5.5 hours offset for IST timezone fix
    const adjustedTime = new Date(serverTime.getTime() + (5.5 * 60 * 60 * 1000));
    const diff = Math.floor((now - adjustedTime) / 60000);
    
    if (isNaN(diff)) return dateString; 
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff} mins ago`;
    if (diff < 1440) return `${Math.floor(diff/60)} hrs ago`;
    return `${Math.floor(diff/1440)} days ago`;
  }

  const getLevelColor = (level) => {
    if (!level) return 'gray';
    const l = level.toLowerCase();
    if (l.includes('monitor')) return 'green';
    if (l.includes('advisory')) return 'blue';
    if (l.includes('warning')) return 'orange';
    if (l.includes('critical')) return 'red';
    return 'gray';
  };

  const displayAlerts = alerts && alerts.length > 0 ? alerts : fallbackAlerts;

  return (
    <aside className="w-[380px] shrink-0 flex flex-col gap-4 overflow-hidden pointer-events-auto relative">
      <div className="flex items-center justify-between px-2 mb-2">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
          Live Alerts
        </h2>
        <span className="text-xs text-white/40 uppercase tracking-widest font-semibold">{displayAlerts.length} UPDATES</span>
      </div>
      
      <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-2 h-full pb-4">
        <AnimatePresence mode="popLayout">
          {displayAlerts.map((a, idx) => {
            const rawType = a.type || a.level || 'ALERT';
            const displayType = rawType.charAt(0).toUpperCase() + rawType.slice(1);
            return (
              <AlertCard 
                key={`${rawType}-${idx}`} 
                index={idx} 
                type={displayType} 
                location={a.area || a.location || 'Unknown Location'} 
                description={a.message || a.description || ''}
                score={a.score || (a.level === 'Critical' ? 95 : a.level === 'Warning' ? 75 : a.level === 'Advisory' ? 45 : 15)}
                level={a.level || 'Monitor'} 
                color={a.color || getLevelColor(a.level)} 
                time={a.created_at ? timeAgo(a.created_at) : a.time} 
              />
            );
          })}
        </AnimatePresence>
      </div>
    </aside>
  );
}
