import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 bg-white dark:bg-zinc-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-heading font-bold text-surface-900 dark:text-white mb-8">
            Términos de Servicio
          </h1>
          <div className="prose dark:prose-invert max-w-none">
            <p>Última actualización: {new Date().toLocaleDateString()}</p>
            <p>Bienvenido a NutriFlow. Al usar nuestra aplicación, aceptas estos términos...</p>
            <h2 className="text-2xl font-bold text-surface-900 dark:text-white mt-8 mb-4">1. Uso del Servicio</h2>
            <p>...</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
