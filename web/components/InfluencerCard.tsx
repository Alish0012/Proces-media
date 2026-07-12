'use client';

import { motion } from 'framer-motion';
import type { Influencer } from '@/content/influencers';
import { useTilt } from '@/lib/useTilt';

const platformIcon: Record<Influencer['platform'], string> = {
  Instagram: '📷',
  YouTube: '▶️',
  TikTok: '🎵',
};

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function InfluencerCard({
  influencer,
  index = 0,
}: {
  influencer: Influencer;
  index?: number;
}) {
  const isAccent = index % 2 === 1;
  const tilt = useTilt<HTMLAnchorElement>(7);

  return (
    <motion.a
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      href={influencer.profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      whileHover={{ y: -6 }}
      style={tilt.style}
      className="group relative block overflow-hidden rounded-3xl border border-white/10"
    >
      <div
        className={`flex aspect-[3/4] items-center justify-center ${
          isAccent ? 'bg-tint-rose' : 'bg-tint-blue'
        }`}
      >
        {influencer.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={influencer.photoUrl}
            alt={influencer.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className={`font-display text-5xl font-semibold ${isAccent ? 'text-accent-300' : 'text-brand-300'}`}>
            {initials(influencer.name)}
          </span>
        )}
      </div>

      <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-white/10 bg-surface/80 px-3 py-1 text-xs text-white/80 backdrop-blur-sm">
        {platformIcon[influencer.platform]} {influencer.platform}
      </span>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <p className="font-display font-semibold text-white">{influencer.name}</p>
        <p className="text-sm text-white/60">
          {influencer.handle}
          {influencer.followers && <span className="ml-2 text-white/40">· {influencer.followers}</span>}
        </p>
      </div>
    </motion.a>
  );
}
