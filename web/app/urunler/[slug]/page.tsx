import { notFound } from 'next/navigation';
import PageTransition from '@/components/PageTransition';
import AddToCartButton from '@/components/AddToCartButton';
import SubscriptionPlanSelector from '@/components/SubscriptionPlanSelector';
import type { Product } from '@/components/ProductCard';
import { API_URL } from '@/lib/api';

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_URL}/api/products/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.product;
  } catch {
    return null;
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  return (
    <PageTransition>
      <section className="container-page grid gap-12 py-20 lg:grid-cols-2">
        <div className="flex h-80 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-700/40 to-brand-900/40 text-6xl">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full rounded-2xl object-cover"
            />
          ) : (
            <span>🧩</span>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">{product.name}</h1>
          <p className="mt-4 text-lg leading-relaxed text-white/60">{product.description}</p>

          {product.is_subscription ? (
            <div className="mt-8">
              <SubscriptionPlanSelector product={product} />
            </div>
          ) : (
            <>
              <div className="mt-8 text-3xl font-bold text-white">
                {Number(product.price).toLocaleString('tr-TR')} {product.currency}
              </div>

              <div className="mt-8">
                <AddToCartButton product={product} />
              </div>
            </>
          )}

          <p className="mt-6 text-sm text-white/40">
            Satın alma sonrası ürün, hesabınıza bağlı &quot;Ürünlerim&quot; sayfasından indirilebilir.
          </p>
        </div>
      </section>
    </PageTransition>
  );
}
