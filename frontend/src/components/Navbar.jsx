import React from 'react';
import { motion } from 'framer-motion';

const tabs = [
  { id: 'all', label: 'Live Heatmap', icon: '🗺️' },
  { id: 'flood', label: 'Flood AI', icon: '🌊' },
  { id: 'quake', label: 'Earthquake', icon: '⚠️' },
  { id: 'cyclone', label: 'Cyclone Tracker', icon: '🌀' },
  { id: 'alerts', label: 'Alert System', icon: '🚨' },
];

export default function Navbar({ activeTab, setActiveTab, isConnected, lastUpdated }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-4 bg-[#05050D] border-b border-white/[0.05]">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 shadow-[0_0_15px_rgba(56,189,248,0.5)]"></div>
        <span className="text-xl font-bold text-white tracking-wide">DisasterSense</span>
      </div>
      
      {/* Navigation Pills */}
      <nav className="flex items-center gap-1 overflow-x-auto custom-scrollbar mx-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab && setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 whitespace-nowrap ${
                isActive 
                  ? 'bg-[#1E293B] text-white shadow-lg border border-white/10' 
                  : 'text-white/40 hover:text-white/80 hover:bg-white/[0.03] border border-transparent'
              }`}
            >
              <span className="opacity-80">{tab.icon}</span>
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="navbar-underline"
                  className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Connection Indicator */}
      <div className="flex flex-col items-end min-w-[140px] shrink-0">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}
          />
          <span className={`text-xs font-bold tracking-wide ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
            {isConnected ? 'System Online' : 'Connecting...'}
          </span>
        </div>
        {isConnected && lastUpdated && (
          <span className="text-[10px] text-white/40 font-medium">Last updated: {lastUpdated}</span>
        )}
      </div>
    </header>
  );
}
