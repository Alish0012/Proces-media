'use client';

import { motion } from 'framer-motion';
import type { Service } from '@/content/services';

export default function ServiceCard({ service, index = 0 }: { service: Service; index?: number }) {
  const isAccent = index % 2 === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -6 }}
      className="card-glow group p-8 hover:border-white/20 hover:bg-white/[0.07]"
    >
      <span
        className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100 ${
          isAccent ? 'bg-accent-500' : 'bg-brand-500'
        }`}
      />

      <motion.div
        whileHover={{ rotate: 8, scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className={`mb-5 flex h-14 w-14 items-center justify-center rounded-xl text-2xl ${
          isAccent ? 'bg-accent-500/15' : 'bg-brand-500/15'
        }`}
      >
        {service.icon}
      </motion.div>
      <h3 className="text-lg font-semibold text-white">{service.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-white/60">{service.description}</p>
    </motion.div>
  );
}
