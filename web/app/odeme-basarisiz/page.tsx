import Link from 'next/link';
import PageTransition from '@/components/PageTransition';

export default async function PaymentFailedPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;

  return (
    <PageTransition>
      <section className="container-page py-24 text-center">
        <div className="mx-auto max-w-md card-glow p-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15 text-3xl">
            ✕
          </div>
          <h1 className="text-2xl font-bold text-white">Ödeme Tamamlanamadı</h1>
          <p className="mt-3 text-white/60">
            {orderId ? `#${orderId} numaralı siparişiniz` : 'Siparişiniz'} için ödeme
            gerçekleştirilemedi. Kart bilgilerinizi kontrol edip tekrar deneyebilirsiniz.
          </p>
          <Link href="/sepet" className="btn-primary mt-8 inline-flex">
            Sepete Dön
          </Link>
        </div>
      </section>
    </PageTransition>
  );
}
