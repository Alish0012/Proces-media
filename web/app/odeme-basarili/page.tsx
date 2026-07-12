import Link from 'next/link';
import PageTransition from '@/components/PageTransition';

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;

  return (
    <PageTransition>
      <section className="container-page py-24 text-center">
        <div className="mx-auto max-w-md card p-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15 text-3xl">
            ✓
          </div>
          <h1 className="font-display text-2xl font-semibold text-white">Ödemeniz Alındı</h1>
          <p className="mt-3 text-white/60">
            {orderId ? `#${orderId} numaralı siparişiniz` : 'Siparişiniz'} başarıyla tamamlandı.
            Ürününüzü hesabınızdan indirebilirsiniz.
          </p>
          <Link href="/hesabim/urunlerim" className="btn-primary mt-8 inline-flex">
            Ürünlerime Git
          </Link>
        </div>
      </section>
    </PageTransition>
  );
}
