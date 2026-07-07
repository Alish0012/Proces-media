export type Service = {
  title: string;
  description: string;
  icon: string;
};

export const services: Service[] = [
  {
    title: 'Özel Eklenti Geliştirme',
    description:
      'İhtiyacınıza özel tasarlanmış, performans odaklı eklentiler geliştiriyoruz — fikirden yayına kadar tüm süreci yönetiyoruz.',
    icon: '🧩',
  },
  {
    title: 'Entegrasyon Danışmanlığı',
    description:
      'Mevcut sistemlerinize eklentilerimizi sorunsuz entegre ediyor, kurulum sonrası teknik destek sağlıyoruz.',
    icon: '🔗',
  },
  {
    title: 'Bakım ve Güncelleme',
    description:
      'Satın aldığınız eklentiler için düzenli güncelleme, hata giderme ve versiyon takibi hizmeti sunuyoruz.',
    icon: '🛠️',
  },
  {
    title: 'Performans Optimizasyonu',
    description:
      'Eklentilerinizin ve sistemlerinizin daha hızlı, daha stabil çalışması için derinlemesine analiz ve iyileştirme yapıyoruz.',
    icon: '⚡',
  },
  {
    title: 'Marka için İçerik Üretimi',
    description:
      'Ürün tanıtım materyalleri, demo videoları ve dokümantasyon hazırlayarak eklentilerinizin doğru anlaşılmasını sağlıyoruz.',
    icon: '🎬',
  },
  {
    title: 'Teknik Danışmanlık',
    description:
      'Yazılım mimarisi, güvenlik ve ölçeklenebilirlik konularında ekibinize danışmanlık desteği veriyoruz.',
    icon: '💡',
  },
];
