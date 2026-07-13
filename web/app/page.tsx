import Link from 'next/link';
import AnimatedHero from '@/components/AnimatedHero';
import ProductCard, { Product } from '@/components/ProductCard';
import ServiceCard from '@/components/ServiceCard';
import BrandLogoMarquee from '@/components/BrandLogoMarquee';
import InfluencerCard from '@/components/InfluencerCard';
import PageTransition from '@/components/PageTransition';
import Magnetic from '@/components/Magnetic';
import { services } from '@/content/services';
import { brands } from '@/content/brands';
import { influencers } from '@/content/influencers';
import { API_URL } from '@/lib/api';
import { SHOW_INFLUENCERS } from '@/lib/featureFlags';

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
          <h2 className="font-display text-3xl font-semibold">
            Öne Çıkan <span className="text-brand-300">Eklentiler</span>
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

      <section className="border-y border-white/10 bg-surface-band py-24">
        <div className="container-page">
          <h2 className="font-display mb-12 text-center text-3xl font-semibold">
            Neler <span className="text-accent-300">Yapıyoruz</span>
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

      {SHOW_INFLUENCERS && (
        <section className="container-page py-24">
          <div className="mb-12 flex items-end justify-between">
            <h2 className="font-display text-3xl font-semibold">
              Birlikte Çalıştığımız <span className="text-accent-300">Influencer&apos;lar</span>
            </h2>
            <Link href="/influencerlar" className="text-sm text-brand-300 hover:text-brand-200">
              Tümünü Gör →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {influencers.slice(0, 4).map((influencer, i) => (
              <InfluencerCard key={influencer.handle} influencer={influencer} index={i} />
            ))}
          </div>
        </section>
      )}

      <section className="border-y border-white/10 bg-surface-band py-20">
        <div className="container-page flex flex-col items-center gap-6 text-center">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Görüşünüz <span className="text-brand-300">bizim için değerli</span>
          </h2>
          <p className="max-w-lg text-white/60">
            Ürünlerimiz veya sitemiz hakkında bir öneriniz mi var? Ya da bir hata mı fark ettiniz?
            Bize ulaştırın.
          </p>
          <Magnetic>
            <Link href="/dilek-ve-oneri" className="btn-accent">
              Dilek ve Öneri Gönder
            </Link>
          </Magnetic>
        </div>
      </section>
    </PageTransition>
  );
}
