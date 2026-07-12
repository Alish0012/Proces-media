'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import PageTransition from '@/components/PageTransition';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { apiFetch, ApiError } from '@/lib/api';

type CheckoutResponse = {
  orderId: number;
  paymentPageUrl?: string; // iyzico
  payment?: { postUrl: string; fields: Record<string, string> }; // shopier
};

const PAYMENT_PROVIDER = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER || 'shopier';

export default function CartPage() {
  const { items, removeItem, total, clear } = useCart();
  const { token, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [identityNumber, setIdentityNumber] = useState('');
  const [phone, setPhone] = useState('');

  // TC Kimlik/telefon zorunluluğu iyzico'ya özgü (dolandırıcılık kontrolü) —
  // Shopier'in klasik ödeme formu bu bilgileri istemiyor.
  const needsBuyerInfo =
    PAYMENT_PROVIDER === 'iyzico' && !!user && (!user.identity_number || !user.phone);

  async function handleCheckout() {
    setError(null);
    if (!user || !token) {
      router.push('/giris?next=/sepet');
      return;
    }
    if (needsBuyerInfo && (!identityNumber.trim() || !phone.trim())) {
      setError('Ödeme için TC Kimlik No ve telefon gereklidir.');
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch<CheckoutResponse>('/api/orders', {
        method: 'POST',
        token,
        body: {
          items: items.map((i) => ({
            productId: i.productId,
            ...(i.billingPeriod ? { billingPeriod: i.billingPeriod } : {}),
          })),
          ...(needsBuyerInfo ? { identityNumber: identityNumber.trim(), phone: phone.trim() } : {}),
        },
      });

      clear();

      if (data.paymentPageUrl) {
        window.location.href = data.paymentPageUrl;
        return;
      }

      if (data.payment) {
        // Shopier'in ödeme formunu otomatik submit eden gizli bir form oluşturup yönlendiriyoruz.
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.payment.postUrl;
        Object.entries(data.payment.fields).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Sipariş oluşturulamadı.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageTransition>
      <section className="container-page py-20">
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">
          Sepetim<span className="text-accent-300">.</span>
        </h1>

        {items.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-white/50">Sepetiniz boş.</p>
            <Link href="/urunler" className="btn-primary mt-6 inline-flex">
              Ürünlere Göz At
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-10 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.productId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="card flex items-center justify-between p-5"
                  >
                    <div>
                      <p className="font-medium text-white">
                        {item.name}
                        {item.billingPeriod && (
                          <span className="ml-2 text-xs text-white/50">
                            ({item.billingPeriod === 'monthly' ? 'Aylık' : 'Yıllık'})
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-white/50">
                        {item.price.toLocaleString('tr-TR')} {item.currency}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-sm text-white/40 hover:text-red-400"
                    >
                      Kaldır
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="card h-fit p-6">
              <div className="flex items-center justify-between text-lg">
                <span className="text-white/60">Toplam</span>
                <span className="font-bold text-white">{total.toLocaleString('tr-TR')} TRY</span>
              </div>

              {needsBuyerInfo && (
                <div className="mt-6 space-y-3">
                  <p className="text-xs text-white/40">
                    Ödeme için (iyzico dolandırıcılık kontrolü amacıyla) bu bilgiler bir kereliğine
                    gereklidir, hesabınıza kaydedilir.
                  </p>
                  <div>
                    <label className="text-xs text-white/50">TC Kimlik No</label>
                    <input
                      type="text"
                      value={identityNumber}
                      onChange={(e) => setIdentityNumber(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brand-400"
                      maxLength={11}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/50">Telefon</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+90 5xx xxx xx xx"
                      className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brand-400"
                    />
                  </div>
                </div>
              )}

              {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="btn-accent mt-6 w-full disabled:opacity-50"
              >
                {loading ? 'Yönlendiriliyor...' : 'Ödemeye Geç'}
              </button>
              {!user && (
                <p className="mt-3 text-center text-xs text-white/40">
                  Ödeme yapmak için giriş yapmanız gerekir.
                </p>
              )}
            </div>
          </div>
        )}
      </section>
    </PageTransition>
  );
}
