import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-page-gradient pt-16 flex items-center justify-center">
       <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-signal-text animate-spin mx-auto" />
          <h2 className="text-xl font-heading font-semibold text-ink">
            Cargando tu plan...
          </h2>
          <p className="text-muted">
            Preparando tus comidas y ejercicios
          </p>
       </div>
    </div>
  );
}
