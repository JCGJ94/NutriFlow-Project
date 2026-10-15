'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Activity, 
  Info, 
  Sparkles,
  Loader2,
  FileText
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Navbar } from '@/components/Navbar';

interface Recommendation {
  doc_id: string;
  category: string;
  content: string;
  reason: string;
}

export default function ProtocolPage() {
  const { id } = useParams();
  const router = useRouter();
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProtocol() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/login');
          return;
        }

        const { data, error } = await supabase.rpc('get_user_recommendations', {
          target_user_id: user.id
        });

        if (error) throw error;
        
        const found = (data as Recommendation[]).find(r => r.doc_id === id);
        setRecommendation(found || null);
      } catch (err) {
        console.error('Error fetching protocol:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProtocol();
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="min-h-screen bg-surface-50 pt-32 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-heading font-bold text-surface-900 mb-4">Protocolo no encontrado</h1>
          <button onClick={() => router.back()} className="btn-primary">Volver atrás</button>
        </div>
      </div>
    );
  }

  const isSafety = recommendation.reason.includes('Seguridad');
  const isIMC = recommendation.reason.includes('IMC');

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-vscode pt-16 transition-colors duration-300">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          Volver al panel
        </button>

        {/* Protocol Header */}
        <div className="card mb-8 overflow-hidden relative">
          <div className={`absolute top-0 left-0 w-1.5 h-full ${
            isSafety ? 'bg-amber-500' : isIMC ? 'bg-blue-500' : 'bg-primary-500'
          }`} />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className={`p-4 rounded-2xl ${
                isSafety ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' : 
                isIMC ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 
                'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
              }`}>
                {isSafety ? <ShieldCheck className="w-8 h-8" /> : 
                 isIMC ? <Activity className="w-8 h-8" /> : 
                 <Info className="w-8 h-8" />}
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-surface-400 mb-2 block">
                  {recommendation.category.replace('_', ' ')}
                </span>
                <h1 className="text-2xl md:text-3xl font-heading font-bold text-surface-900 dark:text-white leading-tight">
                  {recommendation.reason}
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <article className="card prose prose-slate dark:prose-invert max-w-none">
          <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 mb-6 font-bold text-sm uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            Detalles del Protocolo
          </div>
          
          <div className="space-y-6 text-surface-700 dark:text-surface-300 leading-relaxed">
            {recommendation.content.split('\n').map((line, i) => {
              if (line.startsWith('## ')) {
                return <h2 key={i} className="text-xl font-heading font-bold text-surface-900 dark:text-white mt-8 mb-4 border-b border-surface-100 dark:border-surface-700 pb-2">{line.replace('## ', '')}</h2>;
              }
              if (line.startsWith('### ')) {
                return <h3 key={i} className="text-lg font-heading font-bold text-surface-900 dark:text-white mt-6 mb-3">{line.replace('### ', '')}</h3>;
              }
              if (line.startsWith('- ')) {
                return <li key={i} className="ml-4 list-disc mb-2">{line.replace('- ', '')}</li>;
              }
              if (line.match(/^\d+\. /)) {
                return <li key={i} className="ml-4 list-decimal mb-2">{line.replace(/^\d+\. /, '')}</li>;
              }
              if (line.trim() === '') return <div key={i} className="h-2" />;
              return <p key={i} className="mb-4">{line}</p>;
            })}
          </div>
        </article>

        {/* Action / Disclaimer */}
        <div className="mt-12 p-6 rounded-2xl bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/20 flex flex-col md:flex-row items-center gap-6">
          <div className="p-3 bg-white dark:bg-surface-800 rounded-xl shadow-sm">
            <Sparkles className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-surface-900 dark:text-white mb-1">Recomendación Basada en IA</h4>
            <p className="text-sm text-surface-600 dark:text-surface-400">
              Este protocolo ha sido generado por nuestro motor de inteligencia artificial especializado en nutrición para adaptarse exclusivamente a tu perfil. Consulta siempre con un profesional antes de realizar cambios drásticos en tu alimentación.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
