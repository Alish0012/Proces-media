import PageTransition from '@/components/PageTransition';
import StatCounter from '@/components/StatCounter';

export default function AboutPage() {
  return (
    <PageTransition>
      <section className="container-page py-20">
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">
          Hakkımızda<span className="text-accent-300">.</span>
        </h1>

        <div className="mt-8 grid gap-12 lg:grid-cols-2">
          <div className="space-y-5 text-white/70">
            <p>
              Proces Media, yazılım ve dijital medya alanında üretken çözümler geliştirmek amacıyla
              kuruldu. Kendi geliştirdiğimiz eklentileri üreterek, ihtiyaç duyulan alanlarda pratik ve
              performanslı araçlar sunuyoruz.
            </p>
            <p>
              Amacımız, geliştiricilerin ve işletmelerin günlük iş akışlarını kolaylaştıracak,
              güvenilir ve sürdürülebilir eklentiler üretmek. Her ürünümüzün arkasında sürekli destek
              ve güncelleme anlayışı var.
            </p>
            <p>
              Küçük ama odaklı bir ekip olarak, her projeye özenle yaklaşıyor; kaliteden ödün
              vermeden hızlı ve şeffaf bir üretim süreci yürütüyoruz.
            </p>
          </div>

          <div className="card grid grid-cols-2 gap-8 p-10">
            <StatCounter value={12} suffix="+" label="Yayınlanan Eklenti" color="brand" />
            <StatCounter value={40} suffix="+" label="Mutlu Müşteri" color="accent" />
            <StatCounter value={99} suffix="%" label="Destek Memnuniyeti" color="brand" />
            <StatCounter value={3} suffix="+" label="Yıllık Deneyim" color="accent" />
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
