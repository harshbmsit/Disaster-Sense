import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ElegantShape from './ElegantShape';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import RiskMap from './RiskMap';
import StatCard from './StatCard';
import FloodTab from './FloodTab';
import EarthquakeTab from './EarthquakeTab';
import CycloneTab from './CycloneTab';
import AlertsTab from './AlertsTab';
import { useBackendData } from '../hooks/useBackendData';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('all');
  const { riskScores, alerts, riskGrid, sensorData, shelters, rescueTeams, isConnected, lastUpdated } = useBackendData();

  const { flood_risk, earthquake_risk, cyclone_risk, fused_score, alert_level } = riskScores;

  const getBannerStyle = (level) => {
    if (!level) return { bg: 'rgba(59,130,246,0.1)', color: '#3B82F6' };
    const l = level.toLowerCase();
    if (l.includes('monitor')) return { bg: 'rgba(34,197,94,0.1)', color: '#22C55E' };
    if (l.includes('advisory')) return { bg: 'rgba(59,130,246,0.1)', color: '#3B82F6' };
    if (l.includes('warning')) return { bg: 'rgba(249,115,22,0.1)', color: '#F97316' };
    return { bg: 'rgba(239,68,68,0.1)', color: '#EF4444' };
  };

  const bannerStyle = getBannerStyle(alert_level);

  const isHeatmapTab = activeTab === 'all';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-[#070710] text-white flex flex-col font-sans h-screen relative overflow-hidden"
    >
      {/* Deep Background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B0F19] via-transparent to-[#1F1626] blur-3xl" />
        <ElegantShape delay={0.3} width={800} height={200} rotate={12} gradient="from-indigo-500/[0.05]" className="left-[-10%] top-[20%]" />
        <ElegantShape delay={0.5} width={700} height={150} rotate={-15} gradient="from-rose-500/[0.05]" className="right-[-5%] top-[75%]" />
      </div>

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} isConnected={isConnected} lastUpdated={lastUpdated} />

      <div className="flex flex-col flex-1 overflow-hidden pt-[76px] relative z-10 p-6 gap-6 max-w-[1600px] mx-auto w-full">

        {/* Top Row: Stat Cards — visible on ALL tabs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 shrink-0">
          <StatCard index={1} title="FUSED SCORE" value={fused_score} icon="⚡" isPrimary={true} />
          <StatCard index={2} title="FLOOD RISK" value={flood_risk} icon="🌊" isPrimary={false} />
          <StatCard index={3} title="EARTHQUAKE RISK" value={earthquake_risk} icon="🌍" isPrimary={false} />
          <StatCard index={4} title="CYCLONE RISK" value={cyclone_risk} icon="🌀" isPrimary={false} />
        </div>

        {/* Tab Content Area */}
        <AnimatePresence mode="wait">
          {isHeatmapTab ? (
            /* Tab 1: Live Heatmap — original layout with sidebar + map */
            <motion.div
              key="heatmap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-1 overflow-hidden gap-6"
            >
              {/* Left Column: Live Alerts */}
              <Sidebar activeTab={activeTab} alerts={alerts} />

              {/* Right Column: Map Area */}
              <main className="flex-1 relative flex flex-col rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/[0.05]">

                {/* The Map acts as the background for the main area */}
                <div className="absolute inset-0 z-0">
                  <RiskMap riskGrid={riskGrid} filter="all" />
                </div>

                {/* Floating UI Elements on top of the Map */}
                <div className="relative z-10 flex flex-col h-full pointer-events-none">

                  {/* Map Top Banner */}
                  <div
                    className="w-full backdrop-blur-md border-b border-white/[0.05] p-3 flex justify-center items-center pointer-events-auto shadow-lg transition-colors duration-500"
                    style={{ background: bannerStyle.bg }}
                  >
                    <h3 className="font-bold text-sm tracking-widest flex items-center gap-2">
                      <span className="text-white/80 uppercase">OVERALL BENGALURU RISK:</span>
                      <motion.span
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-white font-black"
                      >
                        {fused_score?.toFixed(1) || fused_score}/100
                      </motion.span>
                      <span className="font-bold uppercase" style={{ color: bannerStyle.color }}>— {alert_level}</span>
                    </h3>
                  </div>

                  {/* Map Title and Live Indicator */}
                  <div className="p-6 flex justify-between items-start pointer-events-auto">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.05)] border border-white/10 flex items-center justify-center backdrop-blur-sm">
                        📍
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-white tracking-wide">Live Risk Heatmap</span>
                        <span className="text-xs text-white/40">Leaflet.js map integration</span>
                      </div>
                    </div>
                  </div>

                  {/* LIVE Indicator Overlay inside Map */}
                  <div className="absolute top-20 right-6 z-[1000] pointer-events-auto">
                    <div className="px-3 py-1.5 rounded-full bg-[rgba(3,3,3,0.6)] backdrop-blur-md border border-white/10 flex items-center gap-2 shadow-lg">
                      {isConnected ? (
                        <>
                          <motion.span
                            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-2 h-2 rounded-full bg-red-500"
                          />
                          <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Live</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-gray-500" />
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Offline</span>
                        </>
                      )}
                    </div>
                  </div>

                </div>
              </main>
            </motion.div>
          ) : (
            /* Tabs 2-5: Full width content */
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex-1 overflow-hidden"
            >
              {activeTab === 'flood' && (
                <FloodTab riskScores={riskScores} sensorData={sensorData} riskGrid={riskGrid} />
              )}
              {activeTab === 'quake' && (
                <EarthquakeTab riskScores={riskScores} sensorData={sensorData} riskGrid={riskGrid} />
              )}
              {activeTab === 'cyclone' && (
                <CycloneTab riskScores={riskScores} sensorData={sensorData} riskGrid={riskGrid} />
              )}
              {activeTab === 'alerts' && (
                <AlertsTab alerts={alerts} shelters={shelters} rescueTeams={rescueTeams} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
