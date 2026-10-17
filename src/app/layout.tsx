import type { Metadata } from 'next';
import { Petrona } from 'next/font/google';
import './globals.css';
import { Providers } from '../components/Providers';
import { ToastContainer } from '../components/ui/Toast';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

// One family for the whole site: Petrona, variable weight, used as Light 300 Italic.
const petrona = Petrona({
  variable: '--font-petrona',
  subsets: ['latin', 'latin-ext'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nutriflow.app';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'NutriFlow | Planes de Dieta Personalizados con IA',
    template: '%s | NutriFlow',
  },
  description:
    'Genera planes de dieta semanales personalizados y listas de compra inteligentes para perder peso de forma saludable con el poder de la IA.',
  keywords: [
    'dieta',
    'nutrición',
    'pérdida de peso',
    'plan alimenticio',
    'salud',
    'alimentación saludable',
    'inteligencia artificial',
    'recetas',
    'lista de compra',
  ],
  authors: [{ name: 'NutriFlow Team', url: 'https://nutriflow.app' }],
  creator: 'NutriFlow',
  publisher: 'NutriFlow',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'NutriFlow | Tu Nutricionista con IA',
    description:
      'Crea tu plan de alimentación ideal en segundos. Balance nutricional científico adaptado a tus gustos y objetivos.',
    url: appUrl,
    siteName: 'NutriFlow',
    locale: 'es_ES',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'NutriFlow AI Diet Planner',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NutriFlow | Planes de Dieta con IA',
    description:
      'Genera tu dieta perfecta y lista de compra en segundos. Sin complicaciones.',
    creator: '@nutriflow_app',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};



import { JsonLd } from '../components/seo/JsonLd';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={petrona.variable} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'NutriFlow',
            url: 'https://nutriflow.app',
            logo: 'https://nutriflow.app/logo.png',
            sameAs: [
              'https://twitter.com/nutriflow_app',
              'https://instagram.com/nutriflow_app',
            ],
            contactPoint: {
              '@type': 'ContactPoint',
              email: 'contact@nutriflow.app',
              contactType: 'customer support',
            },
          }}
        />
        <Providers>
          <Navbar />
          {children}
          <Footer />
          <ToastContainer />
        </Providers>
      </body>
    </html>
  );
}
