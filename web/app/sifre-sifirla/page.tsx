'use client';

import { Suspense, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import PageTransition from '@/components/PageTransition';
import { apiFetch, ApiError } from '@/lib/api';

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!token) {
      setError('Geçersiz bağlantı. Lütfen e-postandaki bağlantıyı kullan.');
      return;
    }

    setLoading(true);
    try {
      const data = await apiFetch<{ message: string }>('/api/auth/reset-password', {
        method: 'POST',
        body: { token, password },
      });
      setMessage(data.message);
      setTimeout(() => router.push('/giris'), 1500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Bir hata oluştu.');
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
            Şifre <span className="text-brand-300">Sıfırla</span>
          </h1>

          <div className="mt-6">
            <input
              type="password"
              required
              minLength={8}
              placeholder="Yeni şifre (en az 8 karakter)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />
          </div>

          {message && <p className="mt-4 text-sm text-emerald-400">{message}</p>}
          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary mt-6 w-full disabled:opacity-50">
            {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
          </button>
        </motion.form>
      </section>
    </PageTransition>
  );
}
