import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import TopStrip from '@/components/TopStrip';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import SubmitStoryModal from '@/components/SubmitStoryModal';
import ScrollRevealInit from '@/components/ScrollRevealInit';
import BackToTop from '@/components/BackToTop';

export const metadata: Metadata = {
  title: 'Bihar Say — Inspiring Stories, Culture, Startups & Progress',
  description: 'Join over 15,000+ members and 8.5 Lakh+ monthly readers worldwide. Discover grassroots innovation, cultural pride, economic resurgence, and inspiring change across Bihar.',
  keywords: ['Bihar Say', 'Bihar News', 'Bihar Startups', 'Patna', 'Bihar Culture', 'Bihari Diaspora', 'Makhana', 'Neehar R'],
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Bihar Say — Stories Setting the Pace for Bihar',
    description: 'Discover grassroots innovation, cultural pride, economic resurgence, and inspiring change across Bihar.',
    url: 'https://biharsay.com',
    siteName: 'Bihar Say',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: 'https://biharsay.com/og-banner.png',
        width: 1200,
        height: 630,
        alt: 'Bihar Say Media Network — Stories Setting the Pace for Bihar',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bihar Say — Inspiring Stories, Culture, Startups & Progress',
    description: 'Join over 15,000+ members and 8.5 Lakh+ monthly readers worldwide.',
    images: ['https://biharsay.com/og-banner.png'],
    site: '@bsaybihar',
    creator: '@bsaybihar',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adsenseClientId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID;

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {adsenseClientId && (
          <Script
            id="adsbygoogle-init"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        <AuthProvider>
          <ScrollRevealInit />
          <TopStrip />
          <Header />
          <main className="wrap">
            {children}
          </main>
          <Footer />
          <BackToTop />
          <AuthModal />
          <SubmitStoryModal />
        </AuthProvider>
      </body>
    </html>
  );
}
