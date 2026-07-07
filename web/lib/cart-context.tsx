'use client';

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

export type CartItem = {
  productId: number;
  slug: string;
  name: string;
  price: number;
  currency: string;
  imageUrl?: string | null;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: number) => void;
  clear: () => void;
  total: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = 'procesmedia_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {
        setItems([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function addItem(item: CartItem) {
    setItems((prev) => (prev.some((i) => i.productId === item.productId) ? prev : [...prev, item]));
  }

  function removeItem(productId: number) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  function clear() {
    setItems([]);
  }

  const total = useMemo(() => items.reduce((sum, i) => sum + Number(i.price), 0), [items]);

  const value = useMemo(() => ({ items, addItem, removeItem, clear, total }), [items, total]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
