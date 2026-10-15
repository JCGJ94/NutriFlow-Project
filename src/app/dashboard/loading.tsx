import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-paper-2 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-signal-text animate-spin mx-auto mb-4" />
        <p className="text-muted font-medium">Cargando tu panel...</p>
      </div>
    </div>
  );
}
