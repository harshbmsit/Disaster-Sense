import React from 'react';
import { motion } from 'framer-motion';

const CircularProgress = ({ value, colorHex }) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-12 h-12 shrink-0">
      <svg className="transform -rotate-90 w-12 h-12">
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="3"
          fill="transparent"
        />
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          cx="24"
          cy="24"
          r={radius}
          stroke={colorHex}
          strokeWidth="3"
          fill="transparent"
          strokeDasharray={circumference}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[11px] font-bold text-white">{value}</span>
    </div>
  );
};

export default function AlertCard({ type, location, description, level, color, time, index }) {
  const badgeColors = {
    gray: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    blue: 'bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30',
    orange: 'bg-[#F97316]/20 text-[#F97316] border-[#F97316]/30',
    red: 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30',
  };

  const hexColors = {
    gray: '#9CA3AF',
    blue: '#60A5FA',
    orange: '#FB923C',
    red: '#F87171',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 * index }}
      whileHover={{ backgroundColor: "rgba(255,255,255,0.06)" }}
      className="p-4 flex gap-4 cursor-pointer transition-all relative overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderLeft: `3px solid ${hexColors[color]}`,
        borderRadius: '16px',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="font-bold text-white tracking-wide text-xs">{type}</span>
          <span className="text-[10px] text-white/40">{time}</span>
        </div>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-bold text-white tracking-wide text-sm">{location}</span>
          <span className="text-xs text-white/50 leading-relaxed">{description}</span>
        </div>
      </div>
      <div className="flex items-center justify-center border-l border-white/5 pl-4 shrink-0">
        <span className={`text-[9px] px-2.5 py-1 rounded-full border ${badgeColors[color]} tracking-widest uppercase font-bold`}>
          {level}
        </span>
      </div>
    </motion.div>
  );
}
