import PageTransition from '@/components/PageTransition';
import InfluencerCard from '@/components/InfluencerCard';
import { influencers } from '@/content/influencers';

export default function InfluencersPage() {
  return (
    <PageTransition>
      <section className="container-page py-20">
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">
          Influencer&apos;<span className="text-accent-300">larımız</span>
        </h1>
        <p className="mt-3 max-w-xl text-white/60">
          Ürünlerimizi içerikleriyle hayata geçiren, birlikte çalışmaktan gurur duyduğumuz
          içerik üreticileri.
        </p>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {influencers.map((influencer, i) => (
            <InfluencerCard key={influencer.handle} influencer={influencer} index={i} />
          ))}
        </div>
      </section>
    </PageTransition>
  );
}
