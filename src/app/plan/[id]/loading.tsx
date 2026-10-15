import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-page-gradient pt-16 flex items-center justify-center">
       <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin mx-auto" />
          <h2 className="text-xl font-heading font-semibold text-surface-900 dark:text-white">
            Cargando tu plan...
          </h2>
          <p className="text-surface-600 dark:text-surface-400">
            Preparando tus comidas y ejercicios
          </p>
       </div>
    </div>
  );
}
