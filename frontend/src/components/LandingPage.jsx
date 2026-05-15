import React from 'react';
import { motion } from 'framer-motion';
import { Circle } from 'lucide-react';
import ElegantShape from './ElegantShape';

export default function LandingPage({ onLaunch }) {
  return (
    <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center font-sans overflow-hidden relative text-white">
      {/* Background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />
        <ElegantShape delay={0.3} width={600} height={140} rotate={12} gradient="from-indigo-500/[0.15]" className="left-[-10%] top-[20%]" />
        <ElegantShape delay={0.5} width={500} height={120} rotate={-15} gradient="from-rose-500/[0.15]" className="right-[-5%] top-[75%]" />
        <ElegantShape delay={0.4} width={300} height={80} rotate={-8} gradient="from-violet-500/[0.15]" className="left-[10%] bottom-[10%]" />
        <ElegantShape delay={0.6} width={200} height={60} rotate={20} gradient="from-amber-500/[0.15]" className="right-[20%] top-[15%]" />
        <ElegantShape delay={0.7} width={150} height={40} rotate={-25} gradient="from-cyan-500/[0.15]" className="left-[25%] top-[10%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />
      </div>

      <div className="z-10 flex flex-col items-center text-center px-4 w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8"
        >
          <Circle className="h-2 w-2 fill-rose-500/80 text-rose-500/80" />
          <span className="text-sm text-white/60 tracking-wide">AI — Early Warning System</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="text-6xl md:text-8xl font-bold tracking-tight mb-6"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
            Disaster
          </span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300">
            Intelligence
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="text-lg text-white/40 mb-12 font-light tracking-wide max-w-xl mx-auto"
        >
          Real-time AI fusion of flood, earthquake and cyclone risk.
          Powered by LSTM, Transformer and Isolation Forest models.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onLaunch}
          className="px-8 py-4 rounded-full text-white font-semibold text-lg tracking-wide transition-all"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.4), rgba(244,63,94,0.4))",
            border: "1px solid rgba(255,255,255,0.15)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 0 30px rgba(99,102,241,0.3), 0 0 60px rgba(244,63,94,0.1)"
          }}
        >
          🚀 Launch Dashboard
        </motion.button>
      </div>
    </div>
  );
}
