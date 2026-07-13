import Link from 'next/link';
import Image from 'next/image';
import { SHOW_INFLUENCERS } from '@/lib/featureFlags';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-12">
      <div className="container-page flex flex-col items-center justify-between gap-6 text-sm text-white/50 md:flex-row">
        <div>
          <p className="font-display flex items-center gap-2 font-semibold text-white">
            <Image src="/logo.png" alt="Proces Media" width={28} height={28} className="rounded-md" />
            Proces<span className="text-brand-300">Media</span>
          </p>
          <p className="mt-1">© {new Date().getFullYear()} Proces Media. Tüm hakları saklıdır.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          <Link href="/hizmetlerimiz" className="hover:text-white">
            Hizmetlerimiz
          </Link>
          <Link href="/hakkimizda" className="hover:text-white">
            Hakkımızda
          </Link>
          <Link href="/referanslar" className="hover:text-white">
            Referanslar
          </Link>
          {SHOW_INFLUENCERS && (
            <Link href="/influencerlar" className="hover:text-white">
              Influencer&apos;lar
            </Link>
          )}
          <Link href="/dilek-ve-oneri" className="hover:text-white">
            Dilek &amp; Öneri
          </Link>
          <Link href="/urunler" className="hover:text-white">
            Ürünler
          </Link>
        </div>
      </div>
    </footer>
  );
}
