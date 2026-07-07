import ProductCard, { Product } from '@/components/ProductCard';
import PageTransition from '@/components/PageTransition';
import { API_URL } from '@/lib/api';

async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/api/products`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || [];
  } catch {
    return [];
  }
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <PageTransition>
      <section className="container-page py-20">
        <h1 className="text-4xl font-bold">
          Tüm <span className="gradient-text">Eklentiler</span>
        </h1>
        <p className="mt-3 max-w-xl text-white/60">
          Geliştirdiğimiz eklentileri inceleyin, satın alın ve hesabınıza bağlı üye panelinden anında
          indirin.
        </p>

        {products.length > 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        ) : (
          <p className="mt-12 text-white/50">Henüz ürün eklenmedi.</p>
        )}
      </section>
    </PageTransition>
  );
}
