import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Bitcoin Market Score',
  description:
    'A daily-updated 0-100 score measuring the overall health, strength, sentiment and macro environment of the Bitcoin market.',
  applicationName: 'Bitcoin Market Score',
  keywords: ['Bitcoin', 'BTC', 'market score', 'crypto', 'macro', 'indicators'],
  openGraph: {
    title: 'Bitcoin Market Score',
    description:
      'Aggregates technical, crypto-native, derivatives, sentiment and macro data into a single 0-100 Bitcoin Market Score.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-brand-bg font-sans text-gray-200 antialiased">
        {children}
      </body>
    </html>
  );
}
