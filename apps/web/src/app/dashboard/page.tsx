'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  ShoppingCart,
  ChevronRight,
  Loader2,
  Settings,
  Sparkles,
  Trash2,
  Target,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { SmartRecommendations } from '@/components/dashboard/SmartRecommendations';
import { useToast } from '@/context/ToastContext';

interface PlanSummary {
  id: string;
  weekStart: string;
  targetKcal: number;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) return;

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Check if profile exists first
      const profileResponse = await fetch('/api/profiles', { headers });
      
      if (profileResponse.status === 404 || profileResponse.status === 406) {
        // Profile doesn't exist - redirect to onboarding
        console.log('Profile not found, redirecting to onboarding...');
        showToast('Por favor, completa tu perfil para continuar.', 'info');
        router.push('/onboarding');
        return;
      }

      if (!profileResponse.ok) {
        console.error('Failed to fetch profile:', profileResponse.status);
        showToast('Error al cargar tu perfil. Por favor, intenta nuevamente.', 'error');
        return;
      }

      // Fetch plans
      const response = await fetch('/api/plans', { headers });
      if (response.ok) {
        const text = await response.text();
        if (text) {
          const data = JSON.parse(text);
          setPlans(data);
        }
      } else {
        console.error('Failed to fetch plans:', response.status);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Error al cargar el dashboard.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewPlan = async () => {
    setIsGenerating(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        showToast('No se encontró sesión activa', 'error');
        return;
      }

      const response = await fetch('/api/plans/generate-week', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ useAi: true }),
      });

      if (response.ok) {
        const text = await response.text();
        if (text) {
          const plan = JSON.parse(text);
          showToast('Plan generado con éxito', 'success');
          router.push(`/plan/${plan.id}`);
        }
      } else {
        showToast('Error al generar el plan', 'error');
      }
    } catch (error) {
      console.error('Error generating plan:', error);
      showToast('Ocurrió un error inesperado', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const deletePlan = async (planId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este plan?')) return;
    
    setIsDeleting(planId);
    try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) return;

        const response = await fetch(`/api/plans/${planId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            setPlans(plans.filter(p => p.id !== planId));
            showToast('Plan eliminado correctamente', 'success');
        } else {
            showToast('Error al eliminar el plan', 'error');
        }
    } catch (error) {
        console.error('Error deleting plan:', error);
        showToast('Ocurrió un error al eliminar', 'error');
    } finally {
        setIsDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-gradient pt-16">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-surface-900 dark:text-white mb-2">
            ¡Bienvenido a tu panel!
          </h1>
          <p className="text-sm sm:text-base text-surface-600 dark:text-surface-300">
            Gestiona tus planes de dieta y listas de compra
          </p>
        </div>
        <SmartRecommendations />
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <button
            onClick={generateNewPlan}
            disabled={isGenerating}
            className="group relative overflow-hidden rounded-2xl border border-primary-100 dark:border-primary-900 bg-white dark:bg-surface-800 p-5 sm:p-6 transition-all hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700 text-left min-h-[120px] sm:min-h-auto"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkles className="w-32 h-32 text-primary-600 dark:text-primary-400 rotate-12" />
            </div>
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform">
                {isGenerating ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Sparkles className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-heading font-semibold text-surface-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  Generar con NutriFlow IA
                </h3>
                <p className="text-surface-600 dark:text-surface-300 text-sm">
                  Crea un plan inteligente adaptado a tus metas
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-surface-400 group-hover:text-primary-600 transition-colors" />
            </div>
          </button>

          <Link
            href="/settings"
            className="group relative overflow-hidden rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 p-5 sm:p-6 transition-all hover:shadow-lg hover:border-surface-300 dark:hover:border-surface-600 text-left min-h-[120px] sm:min-h-auto"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Settings className="w-32 h-32 text-surface-600 dark:text-surface-400 rotate-12" />
            </div>
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-surface-500 to-surface-700 flex items-center justify-center text-white shadow-lg shadow-surface-500/20 group-hover:scale-110 transition-transform">
                <Settings className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-heading font-semibold text-surface-900 dark:text-white mb-1 group-hover:text-surface-700 dark:group-hover:text-surface-200 transition-colors">
                  Configurar perfil
                </h3>
                <p className="text-surface-600 dark:text-surface-300 text-sm">
                  Actualiza tus datos y preferencias
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-surface-400 group-hover:text-surface-600 transition-colors" />
            </div>
          </Link>
        </div>

        {/* Active Plan or CTA */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-heading font-semibold text-surface-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-500" />
              Plan Activo
            </h2>
            <Link 
              href="/plans"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1"
            >
              Ver historial <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {!plans.find(p => p.status === 'active') ? (
            <div className="card text-center py-12 border-dashed border-2 border-surface-200 dark:border-surface-700 bg-transparent shadow-none">
              <div className="w-16 h-16 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-surface-400" />
              </div>
              <h3 className="text-lg font-medium text-surface-700 dark:text-surface-200 mb-2">
                No tienes un plan activo
              </h3>
              <p className="text-surface-500 dark:text-surface-400 mb-6 max-w-sm mx-auto">
                Genera tu primer plan nutricional inteligente para comenzar tu transformación.
              </p>
              <button
                onClick={generateNewPlan}
                disabled={isGenerating}
                className="btn-primary inline-flex items-center gap-2"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Generar mi primer plan
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {plans.filter(p => p.status === 'active').map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => router.push(`/plan/${plan.id}`)}
                  className="group relative overflow-hidden card p-0 flex flex-col md:flex-row cursor-pointer border-primary-200 dark:border-primary-800 hover:border-primary-400 dark:hover:border-primary-600 transition-all bg-white dark:bg-surface-800"
                >
                  <div className="absolute top-0 left-0 w-full h-1 md:w-1 md:h-full bg-primary-500"></div>
                  
                  <div className="p-6 flex-1 flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex flex-col items-center justify-center text-primary-600 dark:text-primary-400 flex-shrink-0">
                        <span className="text-xs font-bold uppercase tracking-wider">Semana</span>
                        <span className="text-lg font-bold">{new Date(plan.weekStart).getDate()}</span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-heading font-bold text-lg text-surface-900 dark:text-white">
                                Plan Nutricional Inteligente
                            </h3>
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                                En curso
                            </span>
                        </div>
                        <p className="text-surface-600 dark:text-surface-400 text-sm flex items-center gap-4">
                            <span className="flex items-center gap-1"><Target className="w-3 h-3" /> {plan.targetKcal} kcal</span>
                            <span className="hidden sm:inline text-surface-300">|</span>
                            <span>Creado el {new Date(plan.createdAt).toLocaleDateString()}</span>
                        </p>
                      </div>
                  </div>

                  <div className="bg-surface-50 dark:bg-surface-900/50 p-4 md:px-6 flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 md:border-l border-surface-100 dark:border-surface-700">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/shopping-list/${plan.id}`);
                        }}
                        className="btn-secondary text-xs py-2 flex items-center gap-2"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        Lista
                    </button>
                    
                     <button
                        onClick={(e) => {
                            e.stopPropagation();
                            deletePlan(plan.id);
                        }}
                        disabled={isDeleting === plan.id}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Eliminar plan"
                    >
                        {isDeleting === plan.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Trash2 className="w-5 h-5" />
                        )}
                    </button>
                    
                    <div className="hidden md:block text-surface-300">
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
