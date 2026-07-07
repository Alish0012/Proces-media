import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedBackground from '@/components/AnimatedBackground';
import { AuthProvider } from '@/lib/auth-context';
import { CartProvider } from '@/lib/cart-context';

export const metadata: Metadata = {
  title: 'Proces Media',
  description: 'Proces Media — eklenti geliştirme ve dijital çözümler',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <AnimatedBackground />
        <div className="relative z-10">
          <AuthProvider>
            <CartProvider>
              <Navbar />
              <main className="min-h-[70vh]">{children}</main>
              <Footer />
            </CartProvider>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
