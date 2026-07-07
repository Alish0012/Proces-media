'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import type { Product } from './ProductCard';

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [added, setAdded] = useState(false);

  function handleClick() {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: Number(product.price),
      currency: product.currency,
      imageUrl: product.image_url,
    });
    setAdded(true);
    setTimeout(() => router.push('/sepet'), 500);
  }

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.95 }}
      animate={added ? { scale: [1, 1.08, 1] } : {}}
      className="btn-accent"
    >
      {added ? 'Sepete Eklendi ✓' : 'Sepete Ekle'}
    </motion.button>
  );
}
