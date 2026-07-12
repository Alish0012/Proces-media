'use client';

import { motion } from 'framer-motion';

// Referans tasarımın "gölgesiz, düz yüzey" ilkesine uyarlanmış, çok sakin bir
// arka plan: parlayan/bulanık blob yok, sadece çok hafif ve yavaş bir vignette
// hareketi — sayfa tamamen düz görünmesin diye minimal bir yaşam belirtisi.
export default function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-surface">
      <motion.div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(ellipse 900px 500px at 50% -10%, rgba(47,124,224,0.10), transparent 60%)',
        }}
        animate={{ opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
