'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { SHOW_INFLUENCERS } from '@/lib/featureFlags';
import Magnetic from './Magnetic';

const primaryLinks = [
  { href: '/urunler', label: 'Ürünler' },
  { href: '/hizmetlerimiz', label: 'Hizmetlerimiz' },
];

const aboutLinks = [
  { href: '/referanslar', label: 'Referanslar' },
  ...(SHOW_INFLUENCERS ? [{ href: '/influencerlar', label: "Influencer'lar" }] : []),
  { href: '/dilek-ve-oneri', label: 'Dilek & Öneri' },
];

const allLinks = [...primaryLinks, { href: '/hakkimizda', label: 'Hakkımızda' }, ...aboutLinks];

function AboutDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link href="/hakkimizda" className="nav-link flex items-center gap-1">
        Hakkımızda
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-xs">
          ▾
        </motion.span>
      </Link>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="absolute left-1/2 top-full z-20 mt-3 w-48 -translate-x-1/2 rounded-2xl border border-white/10 bg-surface-card p-2"
          >
            {aboutLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-xl px-3 py-2 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { items } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-surface/80 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="group flex items-center gap-2 text-lg font-semibold tracking-tight">
          <motion.span
            className="font-display inline-flex items-center gap-2"
            whileHover={{ scale: 1.04 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Image src="/logo.png" alt="Proces Media" width={34} height={34} className="rounded-lg" priority />
            Proces<span className="text-brand-300">Media</span>
          </motion.span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {primaryLinks.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link whitespace-nowrap">
              {link.label}
            </Link>
          ))}
          <AboutDropdown />
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Link href="/sepet" className="nav-link">
            Sepet
            {items.length > 0 && (
              <motion.span
                key={items.length}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className="absolute -right-3 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent-500 text-xs"
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
              <Magnetic strength={0.25}>
                <Link href="/kayit" className="btn-primary !px-4 !py-2 text-sm">
                  Kayıt Ol
                </Link>
              </Magnetic>
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
            className="overflow-hidden border-t border-white/10 md:hidden"
          >
            <div className="container-page flex flex-col gap-4 py-4">
              {allLinks.map((link) => (
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
