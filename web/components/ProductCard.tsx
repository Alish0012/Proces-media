'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export type Product = {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: number | string;
  currency: string;
  image_url?: string | null;
};

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      whileHover={{ y: -8, scale: 1.015 }}
      className="card-glow group flex flex-col p-6 hover:border-brand-400/50 hover:bg-white/[0.07] hover:shadow-xl hover:shadow-brand-500/10"
    >
      <div className="relative mb-5 flex h-40 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-700/40 to-brand-900/40 text-4xl">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full scale-100 object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <motion.span whileHover={{ rotate: 12, scale: 1.15 }} transition={{ type: 'spring', stiffness: 300 }}>
            🧩
          </motion.span>
        )}
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      </div>

      <h3 className="text-lg font-semibold text-white">{product.name}</h3>
      <p className="mt-2 line-clamp-2 flex-1 text-sm text-white/60">{product.description}</p>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-xl font-bold text-white">
          {Number(product.price).toLocaleString('tr-TR')} {product.currency}
        </span>
        <Link
          href={`/urunler/${product.slug}`}
          className="flex items-center gap-1 text-sm font-medium text-brand-300 transition group-hover:text-brand-200"
        >
          İncele <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </motion.div>
  );
}
