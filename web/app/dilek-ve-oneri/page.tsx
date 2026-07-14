'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import PageTransition from '@/components/PageTransition';
import { useAuth } from '@/lib/auth-context';
import { apiFetch, ApiError } from '@/lib/api';

type Category = 'oneri' | 'hata' | 'diger';

const categories: { value: Category; label: string }[] = [
  { value: 'oneri', label: 'Öneri' },
  { value: 'hata', label: 'Hata Bildirimi' },
  { value: 'diger', label: 'Diğer' },
];

export default function FeedbackPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<Category>('oneri');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/giris?next=/dilek-ve-oneri');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  if (authLoading || !user) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch<{ message: string }>('/api/feedback', {
        method: 'POST',
        token,
        body: { name, email, category, message },
      });
      setSent(true);
      setMessage('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gönderilemedi, lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageTransition>
      <section className="container-page py-20">
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">
          Dilek ve <span className="text-brand-300">Öneri</span>
        </h1>
        <p className="mt-3 max-w-xl text-white/60">
          Ürünlerimiz veya sitemiz hakkında görüşlerinizi bizimle paylaşın — her mesaj ekibimize
          ulaşır.
        </p>

        <div className="mt-12 max-w-xl">
          {sent ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-8 text-center"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/15 text-2xl">
                ✓
              </div>
              <h2 className="font-display text-xl font-semibold text-white">Teşekkürler!</h2>
              <p className="mt-2 text-white/60">Mesajınız bize ulaştı, en kısa sürede döneceğiz.</p>
              <button onClick={() => setSent(false)} className="btn-outline mt-6">
                Yeni Mesaj Gönder
              </button>
            </motion.div>
          ) : (
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="card space-y-4 p-8"
            >
              <div className="grid gap-4 sm:grid-cols-2">
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
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCategory(c.value)}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      category === c.value
                        ? 'border-brand-400 bg-brand-500/15 text-white'
                        : 'border-white/15 text-white/60 hover:border-white/30'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <textarea
                required
                rows={5}
                placeholder="Mesajınız"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="input-field resize-none"
              />

              {error && <p className="text-sm text-red-400">{error}</p>}

              <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
                {loading ? 'Gönderiliyor...' : 'Gönder'}
              </button>
            </motion.form>
          )}
        </div>
      </section>
    </PageTransition>
  );
}
