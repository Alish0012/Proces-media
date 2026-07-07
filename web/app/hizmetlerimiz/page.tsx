import PageTransition from '@/components/PageTransition';
import ServiceCard from '@/components/ServiceCard';
import { services } from '@/content/services';

export default function ServicesPage() {
  return (
    <PageTransition>
      <section className="container-page py-20">
        <h1 className="text-4xl font-bold">
          Hizmetlerimiz<span className="gradient-text">.</span>
        </h1>
        <p className="mt-3 max-w-xl text-white/60">
          Eklenti geliştirmenin ötesinde, markanızın dijital ihtiyaçlarına uçtan uca çözümler
          sunuyoruz.
        </p>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <ServiceCard key={s.title} service={s} index={i} />
          ))}
        </div>
      </section>
    </PageTransition>
  );
}
