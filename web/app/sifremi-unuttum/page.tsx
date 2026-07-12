'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import PageTransition from '@/components/PageTransition';
import { apiFetch, ApiError } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const data = await apiFetch<{ message: string }>('/api/auth/forgot-password', {
        method: 'POST',
        body: { email },
      });
      setMessage(data.message);
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
            Şifremi <span className="text-brand-300">Unuttum</span>
          </h1>
          <p className="mt-3 text-sm text-white/60">
            Hesabına kayıtlı e-posta adresini gir, sana şifre sıfırlama bağlantısı gönderelim.
          </p>

          <div className="mt-6">
            <input
              type="email"
              required
              placeholder="E-posta"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
          </div>

          {message && <p className="mt-4 text-sm text-emerald-400">{message}</p>}
          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary mt-6 w-full disabled:opacity-50">
            {loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
          </button>
        </motion.form>
      </section>
    </PageTransition>
  );
}
