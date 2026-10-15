import { Metadata } from 'next';
import { LandingContent } from '../components/landing/LandingContent';

export const metadata: Metadata = {
  title: 'NutriFlow | Generador de Dietas con IA',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'NutriFlow | Dieta y Lista de Compra en Segundos',
    description: 'Transforma tu cuerpo con planes de alimentación personalizados generados por Inteligencia Artificial. Prueba gratis.',
  },
};

export default function LandingPage() {
  return <LandingContent />;
}
