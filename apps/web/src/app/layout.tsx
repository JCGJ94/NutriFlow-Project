import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '../components/ThemeProvider';
import { ToastProvider } from '../context/ToastContext';
import { LanguageProvider } from '../context/LanguageContext';
import { ToastContainer } from '../components/ui/Toast';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const metadata: Metadata = {
  title: 'NutriFlow',
  description:
    'Genera planes de dieta semanales personalizados para perder peso de forma saludable. Combinaciones de alimentos adaptadas a tus objetivos y restricciones.',
  keywords: [
    'dieta',
    'nutrición',
    'pérdida de peso',
    'plan alimenticio',
    'salud',
    'alimentación saludable',
  ],
  authors: [{ name: 'NutriFlow' }],
  openGraph: {
    title: 'NutriFlow',
    description:
      'Genera planes de dieta semanales personalizados para perder peso de forma saludable.',
    type: 'website',
    locale: 'es_ES',
  },
};

import { UserProvider } from '../context/UserContext';

import { PlansProvider } from '../context/PlansContext';
import { ConfirmationProvider } from '../context/ConfirmationContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UserProvider>
            <PlansProvider>
            <LanguageProvider>
              <ConfirmationProvider>
              <ToastProvider>
              <Navbar />
              {children}
              <Footer />
              <ToastContainer />
              </ToastProvider>
              </ConfirmationProvider>
            </LanguageProvider>
            </PlansProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
