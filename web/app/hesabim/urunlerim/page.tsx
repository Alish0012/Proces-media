'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PageTransition from '@/components/PageTransition';
import { useAuth } from '@/lib/auth-context';
import { apiFetch, ApiError, API_URL } from '@/lib/api';

type PurchasedProduct = {
  id: number;
  slug: string;
  name: string;
  image_url?: string | null;
  is_subscription?: boolean;
  active?: boolean;
  expires_at?: string | null;
  license_key?: string | null;
};

export default function MyProductsPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<PurchasedProduct[]>([]);
  const [fetching, setFetching] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/giris?next=/hesabim/urunlerim');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!token) return;
    apiFetch<{ products: PurchasedProduct[] }>('/api/downloads/my-products', { token })
      .then((data) => setProducts(data.products))
      .catch(() => setProducts([]))
      .finally(() => setFetching(false));
  }, [token]);

  async function handleDownload(productId: number) {
    if (!token) return;
    setError(null);
    setDownloadingId(productId);
    try {
      const data = await apiFetch<{ downloadUrl: string }>(`/api/downloads/${productId}/token`, {
        method: 'POST',
        token,
      });
      window.location.href = `${API_URL}${data.downloadUrl}`;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'İndirme başlatılamadı.');
    } finally {
      setDownloadingId(null);
    }
  }

  if (loading || !user) return null;

  return (
    <PageTransition>
      <section className="container-page py-20">
        <h1 className="text-4xl font-bold">
          Ürünlerim<span className="gradient-text">.</span>
        </h1>
        <p className="mt-3 text-white/60">
          Satın aldığın eklentileri buradan indirebilirsin. Her indirme bağlantısı senin hesabına özel
          ve kısa süreliğine geçerlidir.
        </p>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        {fetching ? (
          <p className="mt-12 text-white/50">Yükleniyor...</p>
        ) : products.length === 0 ? (
          <p className="mt-12 text-white/50">Henüz satın alınmış bir ürün yok.</p>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p, i) => {
              const expired = p.is_subscription && p.active === false;
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="card-glow p-6"
                >
                  <h3 className="text-lg font-semibold text-white">{p.name}</h3>
                  {p.is_subscription && p.expires_at && (
                    <p className={`mt-1 text-xs ${expired ? 'text-red-400' : 'text-white/40'}`}>
                      {expired ? 'Süresi doldu: ' : 'Bitiş: '}
                      {new Date(p.expires_at).toLocaleDateString('tr-TR')}
                    </p>
                  )}
                  {p.is_subscription && p.license_key && (
                    <p className="mt-2 text-xs text-white/40">
                      Lisans anahtarı (eklentiye girin):
                      <br />
                      <span className="select-all font-mono text-sm text-white/80">{p.license_key}</span>
                    </p>
                  )}
                  {expired ? (
                    <Link href={`/urunler/${p.slug}`} className="btn-primary mt-6 block w-full text-center">
                      Yeniden Satın Al
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleDownload(p.id)}
                      disabled={downloadingId === p.id}
                      className="btn-primary mt-6 w-full disabled:opacity-50"
                    >
                      {downloadingId === p.id ? 'Hazırlanıyor...' : 'İndir'}
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </PageTransition>
  );
}
