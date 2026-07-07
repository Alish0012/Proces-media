import PageTransition from '@/components/PageTransition';
import BrandLogoMarquee from '@/components/BrandLogoMarquee';
import { brands } from '@/content/brands';

export default function ReferencesPage() {
  return (
    <PageTransition>
      <section className="container-page py-20">
        <h1 className="text-4xl font-bold">
          Referanslarımız<span className="gradient-text">.</span>
        </h1>
        <p className="mt-3 max-w-xl text-white/60">
          Birlikte çalışmaktan gurur duyduğumuz markalar.
        </p>

        <div className="mt-14">
          <BrandLogoMarquee brands={brands} />
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {brands.map((brand) => (
            <div
              key={brand.name}
              className="card-glow flex h-28 items-center justify-center p-6 text-center text-white/70"
            >
              <span className="font-semibold">{brand.name}</span>
            </div>
          ))}
        </div>
      </section>
    </PageTransition>
  );
}
