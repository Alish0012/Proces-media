'use client';

import { motion } from 'framer-motion';
import type { Service } from '@/content/services';

export default function ServiceCard({ service, index = 0 }: { service: Service; index?: number }) {
  const isAccent = index % 2 === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className={`relative overflow-hidden rounded-2xl border border-white/10 p-8 transition-colors duration-300 hover:border-white/20 ${
        isAccent ? 'bg-tint-rose' : 'bg-tint-blue'
      }`}
    >
      <motion.div
        whileHover={{ rotate: 6, scale: 1.08 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className={`mb-5 flex h-14 w-14 items-center justify-center rounded-xl text-2xl ${
          isAccent ? 'bg-accent-500/15' : 'bg-brand-500/15'
        }`}
      >
        {service.icon}
      </motion.div>
      <h3 className="font-display text-xl font-semibold text-white">{service.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-white/60">{service.description}</p>
    </motion.div>
  );
}
