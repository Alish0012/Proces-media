'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import PageTransition from '@/components/PageTransition';
import { useAuth } from '@/lib/auth-context';

export default function AccountPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/giris?next=/hesabim');
  }, [loading, user, router]);

  if (loading || !user) return null;

  return (
    <PageTransition>
      <section className="container-page py-20">
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">
          Hesabım<span className="text-brand-300">.</span>
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mt-10 max-w-lg p-8"
        >
          <p className="text-sm text-white/50">Ad Soyad</p>
          <p className="text-lg text-white">{user.name}</p>

          <p className="mt-6 text-sm text-white/50">E-posta</p>
          <p className="text-lg text-white">{user.email}</p>

          <a href="/hesabim/urunlerim" className="btn-outline mt-8 inline-flex">
            Ürünlerime Git
          </a>
        </motion.div>
      </section>
    </PageTransition>
  );
}
