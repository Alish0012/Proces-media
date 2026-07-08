'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';

const links = [
  { href: '/urunler', label: 'Ürünler' },
  { href: '/hizmetlerimiz', label: 'Hizmetlerimiz' },
  { href: '/hakkimizda', label: 'Hakkımızda' },
  { href: '/referanslar', label: 'Referanslar' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { items } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#05060f]/80 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="group flex items-center gap-2 text-lg font-bold tracking-tight">
          <motion.span
            className="inline-flex items-center gap-2"
            whileHover={{ scale: 1.06, rotate: -2 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Image src="/logo.png" alt="Proces Media" width={36} height={36} className="rounded-lg" priority />
            Proces<span className="gradient-text">Media</span>
          </motion.span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Link href="/sepet" className="nav-link">
            Sepet
            {items.length > 0 && (
              <motion.span
                key={items.length}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className="absolute -right-3 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent-500 text-xs shadow-md shadow-accent-500/50"
              >
                {items.length}
              </motion.span>
            )}
          </Link>
          {user ? (
            <>
              <Link href="/hesabim/urunlerim" className="nav-link">
                Ürünlerim
              </Link>
              <button onClick={logout} className="btn-outline !px-4 !py-2 text-sm">
                Çıkış Yap
              </button>
            </>
          ) : (
            <>
              <Link href="/giris" className="nav-link">
                Giriş Yap
              </Link>
              <Link href="/kayit" className="btn-primary !px-4 !py-2 text-sm">
                Kayıt Ol
              </Link>
            </>
          )}
        </div>

        <button
          className="text-white md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menüyü aç/kapat"
        >
          <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
            {open ? '✕' : '☰'}
          </motion.div>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-white/5 md:hidden"
          >
            <div className="container-page flex flex-col gap-4 py-4">
              {links.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                  {link.label}
                </Link>
              ))}
              <Link href="/sepet" onClick={() => setOpen(false)}>
                Sepet ({items.length})
              </Link>
              {user ? (
                <>
                  <Link href="/hesabim/urunlerim" onClick={() => setOpen(false)}>
                    Ürünlerim
                  </Link>
                  <button onClick={logout} className="text-left text-white/70">
                    Çıkış Yap
                  </button>
                </>
              ) : (
                <>
                  <Link href="/giris" onClick={() => setOpen(false)}>
                    Giriş Yap
                  </Link>
                  <Link href="/kayit" onClick={() => setOpen(false)}>
                    Kayıt Ol
                  </Link>
                </>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
