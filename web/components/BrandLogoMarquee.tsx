'use client';

import { motion } from 'framer-motion';
import type { Brand } from '@/content/brands';

function BrandPill({ brand }: { brand: Brand }) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.05 }}
      className="mx-4 flex h-16 min-w-[160px] items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 text-white/70 transition-colors duration-300 hover:border-accent-400/50 hover:bg-white/[0.08] hover:text-white"
    >
      {brand.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={brand.logoUrl} alt={brand.name} className="max-h-8 max-w-full object-contain" />
      ) : (
        <span className="whitespace-nowrap text-sm font-semibold tracking-wide">{brand.name}</span>
      )}
    </motion.div>
  );
}

export default function BrandLogoMarquee({ brands }: { brands: Brand[] }) {
  const loop = [...brands, ...brands];

  return (
    <div className="relative overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <motion.div
        className="flex w-max"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      >
        {loop.map((brand, i) => (
          <BrandPill key={`${brand.name}-${i}`} brand={brand} />
        ))}
      </motion.div>
    </div>
  );
}
