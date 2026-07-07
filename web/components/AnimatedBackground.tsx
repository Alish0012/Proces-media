'use client';

import { motion } from 'framer-motion';

export default function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#05060f]">
      <motion.div
        className="absolute h-[560px] w-[560px] rounded-full bg-brand-500/25 blur-[120px]"
        style={{ top: '-15%', left: '-10%' }}
        animate={{ x: [0, 90, 0], y: [0, 70, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute h-[460px] w-[460px] rounded-full bg-accent-500/20 blur-[110px]"
        style={{ top: '15%', right: '-10%' }}
        animate={{ x: [0, -70, 0], y: [0, 90, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
      />
      <motion.div
        className="absolute h-[420px] w-[420px] rounded-full bg-brand-400/15 blur-[100px]"
        style={{ bottom: '-12%', left: '35%' }}
        animate={{ x: [0, 60, 0], y: [0, -50, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />
      <motion.div
        className="absolute h-[300px] w-[300px] rounded-full bg-accent-500/10 blur-[90px]"
        style={{ bottom: '10%', right: '15%' }}
        animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
