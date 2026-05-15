import React from 'react';
import { motion } from 'framer-motion';

export default function MapPlaceholder() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.9 }}
      className="w-full h-[500px] flex items-center justify-center shrink-0"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        boxShadow: 'inset 0 0 60px rgba(99,102,241,0.05)'
      }}
    >
      <motion.span 
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="text-xl font-medium text-white/30 tracking-wide"
      >
        🗺️ Leaflet Map loads in Phase 6
      </motion.span>
    </motion.div>
  );
}
