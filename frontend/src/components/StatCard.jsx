import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StatCard({ title, value, icon, index, isPrimary }) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setPulse(true);
    const timeout = setTimeout(() => setPulse(false), 800);
    return () => clearTimeout(timeout);
  }, [value]);

  const primaryGlow = isPrimary ? 'rgba(99,102,241,0.15)' : 'rgba(0,0,0,0.3)';
  const pulseGlow = isPrimary ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.1)';

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        boxShadow: pulse ? `0 0 40px ${pulseGlow}` : `0 4px 20px ${primaryGlow}`
      }}
      transition={{ delay: pulse ? 0 : 0.1 * index, duration: pulse ? 0.8 : 0.4 }}
      whileHover={{ y: -2, boxShadow: isPrimary ? '0 0 30px rgba(99,102,241,0.3)' : '0 10px 30px rgba(0,0,0,0.5)' }}
      className={`relative overflow-hidden rounded-3xl p-6 flex flex-col justify-between h-[120px] cursor-pointer`}
      style={{
        background: isPrimary 
          ? 'linear-gradient(135deg, #1E1B4B 0%, #171717 100%)' 
          : 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
        border: isPrimary ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(32px)',
      }}
    >
      <h3 className={`text-xs font-semibold tracking-widest uppercase ${isPrimary ? 'text-indigo-200' : 'text-white/50'}`}>
        {title}
      </h3>
      <div className="flex justify-between items-end">
        <AnimatePresence mode="popLayout">
          <motion.span 
            key={value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-4xl font-bold text-white tracking-tight"
          >
            {typeof value === 'number' ? value.toFixed(1) : value}
          </motion.span>
        </AnimatePresence>
        <div className="text-3xl opacity-90">{icon}</div>
      </div>
    </motion.div>
  );
}
