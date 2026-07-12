'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTilt } from '@/lib/useTilt';

export type Product = {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: number | string;
  currency: string;
  image_url?: string | null;
  is_subscription?: boolean;
  monthly_price?: number | string | null;
  yearly_price?: number | string | null;
};

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const tilt = useTilt(6);

  return (
    <motion.div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      whileHover={{ y: -6 }}
      style={tilt.style}
      className="card group flex flex-col p-6"
    >
      <div className="relative mb-5 flex h-40 items-center justify-center overflow-hidden rounded-xl bg-tint-blue text-4xl">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full scale-100 object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <motion.span whileHover={{ rotate: 10, scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}>
            🧩
          </motion.span>
        )}
      </div>

      <h3 className="font-display text-lg font-semibold text-white">{product.name}</h3>
      <p className="mt-2 line-clamp-2 flex-1 text-sm text-white/60">{product.description}</p>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-xl font-semibold text-white">
          {product.is_subscription ? (
            <>
              {Number(product.monthly_price).toLocaleString('tr-TR')} {product.currency}
              <span className="text-sm font-normal text-white/50"> /ay</span>
            </>
          ) : (
            <>
              {Number(product.price).toLocaleString('tr-TR')} {product.currency}
            </>
          )}
        </span>
        <Link
          href={`/urunler/${product.slug}`}
          className="rounded-full border border-white/15 px-4 py-1.5 text-sm font-medium text-white/80 transition hover:border-white/30 hover:text-white"
        >
          İncele
        </Link>
      </div>
    </motion.div>
  );
}
