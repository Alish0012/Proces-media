'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import PageTransition from '@/components/PageTransition';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(name, email, password);
      router.push('/hesabim/urunlerim');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kayıt başarısız.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageTransition>
      <section className="container-page flex min-h-[70vh] items-center justify-center py-20">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="card w-full max-w-md p-8"
        >
          <h1 className="font-display text-2xl font-semibold">
            Kayıt <span className="text-brand-300">Ol</span>
          </h1>

          <div className="mt-8 space-y-4">
            <input
              type="text"
              required
              placeholder="Ad Soyad"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
            />
            <input
              type="email"
              required
              placeholder="E-posta"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
            <input
              type="password"
              required
              minLength={8}
              placeholder="Şifre (en az 8 karakter)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />
          </div>

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary mt-6 w-full disabled:opacity-50">
            {loading ? 'Kayıt oluşturuluyor...' : 'Kayıt Ol'}
          </button>

          <p className="mt-6 text-center text-sm text-white/50">
            Zaten hesabın var mı?{' '}
            <Link href="/giris" className="text-brand-300 hover:text-brand-200">
              Giriş yap
            </Link>
          </p>
        </motion.form>
      </section>
    </PageTransition>
  );
}
