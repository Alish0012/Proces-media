'use client';

import Link from 'next/link';
import type { MouseEvent } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function AnimatedHero() {
  const mouseX = useMotionValue(400);
  const mouseY = useMotionValue(200);

  function handleMouseMove(e: MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }

  const spotlight = useMotionTemplate`radial-gradient(500px circle at ${mouseX}px ${mouseY}px, rgba(221,51,39,0.12), transparent 70%)`;

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden bg-brand-radial pb-24 pt-32"
    >
      <motion.div className="pointer-events-none absolute inset-0" style={{ background: spotlight }} />

      <motion.div
        className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl"
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute -top-10 right-1/4 h-[300px] w-[300px] rounded-full bg-accent-500/20 blur-3xl"
        animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.6, 0.4], x: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="container-page relative flex flex-col items-center text-center"
      >
        <motion.span
          variants={item}
          className="mb-6 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-widest text-white/60"
        >
          Eklenti Geliştirme & Dijital Çözümler
        </motion.span>

        <motion.h1 variants={item} className="max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">
          Fikirlerinizi <span className="gradient-text">güçlü eklentilere</span> dönüştürüyoruz
        </motion.h1>

        <motion.p variants={item} className="mt-6 max-w-xl text-lg text-white/60">
          Proces Media olarak kendi geliştirdiğimiz yazılım eklentilerini satışa sunuyor, markanız için
          özel çözümler üretiyoruz.
        </motion.p>

        <motion.div variants={item} className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/urunler" className="btn-primary">
            Ürünleri İncele
          </Link>
          <Link href="/hizmetlerimiz" className="btn-outline">
            Hizmetlerimiz
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
