'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Magnetic from './Magnetic';

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

// PM Silence Cutter'ın ne yaptığını gösteren sahte bir "ürün ekranı":
// klip parçaları, ortada kesilen bir sessizlik boşluğu ve altında waveform.
const clips = [2.2, 1.4, 0.9, 1.8, 1.1]; // flex oranları — kesim noktası 2. ve 3. klip arası
const waveform = Array.from({ length: 22 }, (_, i) => {
  if (i >= 9 && i <= 11) return 4; // "kesilen" sessiz bölge
  return Math.round(14 + Math.sin(i * 0.8) * 8 + Math.cos(i * 0.4) * 5);
});

const tags = ['Watermark Korumalı', 'Anında Teslimat', 'Lisans Doğrulandı ✓'];

const headline = [
  { text: 'Fikirlerinizi', emphasis: false },
  { text: 'güçlü', emphasis: true },
  { text: 'eklentilere', emphasis: true },
  { text: 'dönüştürüyoruz', emphasis: false },
];

export default function AnimatedHero() {
  return (
    <section className="relative overflow-hidden pb-24 pt-32">
      <div className="container-page grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.span
            variants={item}
            className="mb-6 inline-block rounded-full border border-white/10 px-4 py-1.5 text-xs uppercase tracking-widest text-white/50"
          >
            Eklenti Geliştirme &amp; Dijital Çözümler
          </motion.span>

          <h1 className="font-display max-w-2xl text-5xl font-semibold leading-[1.05] sm:text-6xl">
            {headline.map((word, i) => (
              <motion.span
                key={word.text}
                initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.09, ease: 'easeOut' }}
                className={`mr-[0.28em] inline-block ${word.emphasis ? 'text-brand-300' : ''}`}
              >
                {word.text}
              </motion.span>
            ))}
          </h1>

          <motion.p variants={item} className="mt-6 max-w-lg text-lg leading-relaxed text-white/60">
            Proces Media olarak kendi geliştirdiğimiz yazılım eklentilerini satışa sunuyor, markanız
            için özel çözümler üretiyoruz.
          </motion.p>

          <motion.div variants={item} className="mt-10 flex flex-wrap items-center gap-4">
            <Magnetic>
              <Link href="/urunler" className="btn-primary">
                Ürünleri İncele
              </Link>
            </Magnetic>
            <Magnetic>
              <Link href="/hizmetlerimiz" className="btn-outline">
                Hizmetlerimiz
              </Link>
            </Magnetic>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
          className="relative hidden aspect-square items-center justify-center rounded-3xl border border-white/10 bg-tint-blue p-8 lg:flex"
        >
          {/* Sahte ürün ekranı: PM Silence Cutter'ın timeline'ından bir kesit */}
          <div className="w-full rounded-2xl border border-white/10 bg-surface-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-accent-400/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-brand-300/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              </div>
              <div className="flex items-center gap-2 text-xs text-white/50">
                <Image src="/logo.png" alt="" width={16} height={16} className="rounded" />
                PM Silence Cutter
              </div>
            </div>

            <div className="relative mt-6 flex h-9 gap-1">
              {clips.map((flex, i) => (
                <div
                  key={i}
                  style={{ flex }}
                  className={`rounded-md ${i % 2 === 0 ? 'bg-brand-500/30' : 'bg-brand-400/20'}`}
                />
              ))}
              <motion.div
                className="absolute top-0 h-full w-px bg-accent-400"
                animate={{ left: ['2%', '96%', '2%'] }}
                transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="absolute -top-1.5 -translate-x-1/2 rounded-full bg-accent-400 px-1 py-0.5 text-[9px] leading-none text-surface">
                  ▸
                </span>
              </motion.div>
            </div>

            <div className="mt-3 flex h-8 items-end gap-[3px]">
              {waveform.map((h, i) => (
                <motion.span
                  key={i}
                  className={`w-[3px] rounded-full ${
                    i >= 9 && i <= 11 ? 'bg-accent-400' : 'bg-brand-300/60'
                  }`}
                  style={{ height: h }}
                  animate={{ scaleY: [1, 1.3, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: i * 0.07 }}
                />
              ))}
            </div>
            <p className="mt-2 text-[11px] text-white/40">0.6sn sessizlik otomatik kesildi</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-white/60"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
