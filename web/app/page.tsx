import Link from 'next/link';
import AnimatedHero from '@/components/AnimatedHero';
import ProductCard, { Product } from '@/components/ProductCard';
import ServiceCard from '@/components/ServiceCard';
import BrandLogoMarquee from '@/components/BrandLogoMarquee';
import PageTransition from '@/components/PageTransition';
import { services } from '@/content/services';
import { brands } from '@/content/brands';
import { API_URL } from '@/lib/api';

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/api/products`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.products || []).slice(0, 3);
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const products = await getFeaturedProducts();

  return (
    <PageTransition>
      <AnimatedHero />

      <section className="container-page py-24">
        <div className="mb-12 flex items-end justify-between">
          <h2 className="text-3xl font-bold">
            Öne Çıkan <span className="gradient-text">Eklentiler</span>
          </h2>
          <Link href="/urunler" className="text-sm text-brand-300 hover:text-brand-200">
            Tümünü Gör →
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        ) : (
          <p className="text-white/50">
            Henüz ürün eklenmedi. Backend&apos;e ürün ekleyince burada görünecek.
          </p>
        )}
      </section>

      <section className="border-y border-white/5 bg-white/[0.02] py-24">
        <div className="container-page">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Neler <span className="gradient-text">Yapıyoruz</span>
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 3).map((s, i) => (
              <ServiceCard key={s.title} service={s} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-24">
        <h2 className="mb-10 text-center text-lg font-medium text-white/50">
          Birlikte çalıştığımız markalar
        </h2>
        <BrandLogoMarquee brands={brands} />
      </section>
    </PageTransition>
  );
}
