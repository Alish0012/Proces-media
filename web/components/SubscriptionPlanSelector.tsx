'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import type { Product } from './ProductCard';

type BillingPeriod = 'monthly' | 'yearly';

export default function SubscriptionPlanSelector({ product }: { product: Product }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [period, setPeriod] = useState<BillingPeriod>('monthly');
  const [added, setAdded] = useState(false);

  const price = period === 'monthly' ? product.monthly_price : product.yearly_price;

  function handleClick() {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: Number(price),
      currency: product.currency,
      imageUrl: product.image_url,
      billingPeriod: period,
    });
    setAdded(true);
    setTimeout(() => router.push('/sepet'), 500);
  }

  return (
    <div>
      <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
        {(['monthly', 'yearly'] as const).map((option) => (
          <button
            key={option}
            onClick={() => setPeriod(option)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              period === option ? 'bg-brand-500 text-white' : 'text-white/60 hover:text-white'
            }`}
          >
            {option === 'monthly' ? 'Aylık' : 'Yıllık'}
          </button>
        ))}
      </div>

      <div className="mt-6 text-3xl font-bold text-white">
        {Number(price).toLocaleString('tr-TR')} {product.currency}
        <span className="text-base font-normal text-white/50">
          {period === 'monthly' ? ' /ay' : ' /yıl'}
        </span>
      </div>

      <div className="mt-6">
        <motion.button
          onClick={handleClick}
          whileTap={{ scale: 0.95 }}
          animate={added ? { scale: [1, 1.08, 1] } : {}}
          className="btn-accent"
        >
          {added ? 'Sepete Eklendi ✓' : 'Sepete Ekle'}
        </motion.button>
      </div>
    </div>
  );
}
