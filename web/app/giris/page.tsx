'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import PageTransition from '@/components/PageTransition';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push(searchParams.get('next') || '/hesabim/urunlerim');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Giriş başarısız.');
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
          className="card-glow w-full max-w-md p-8"
        >
          <h1 className="text-2xl font-bold">
            Giriş <span className="gradient-text">Yap</span>
          </h1>

          <div className="mt-8 space-y-4">
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
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />
          </div>

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary mt-6 w-full disabled:opacity-50">
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>

          <div className="mt-6 flex justify-between text-sm text-white/50">
            <Link href="/sifremi-unuttum" className="hover:text-white">
              Şifremi Unuttum
            </Link>
            <Link href="/kayit" className="hover:text-white">
              Hesabın yok mu? Kayıt ol
            </Link>
          </div>
        </motion.form>
      </section>
    </PageTransition>
  );
}
