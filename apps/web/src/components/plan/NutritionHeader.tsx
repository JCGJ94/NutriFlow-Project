'use client';

import { MacroBadge } from './MacroBadge';

interface NutritionHeaderProps {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  title?: string;
}

export function NutritionHeader({ kcal, protein, carbs, fat, title = "Objetivo Diario" }: NutritionHeaderProps) {
  return (
    <div className="bg-white dark:bg-surface-800 rounded-3xl border border-surface-100 dark:border-surface-700 p-6 md:p-8 shadow-sm transition-colors duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-xs font-black uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400 mb-2 block">
            NutriFlow Analysis
          </span>
          <h2 className="text-3xl font-heading font-black text-surface-900 dark:text-white leading-tight">
            {title}
          </h2>
          <p className="text-surface-500 dark:text-surface-400 mt-2 max-w-sm">
            Balance nutricional optimizado basado en tu perfil biológico y objetivos de salud.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <MacroBadge label="Calorías" value={kcal} unit="kcal" color="calories" size="lg" />
          <MacroBadge label="Proteína" value={protein} color="protein" size="lg" />
          <MacroBadge label="Carbos" value={carbs} color="carbs" size="lg" />
          <MacroBadge label="Grasas" value={fat} color="fat" size="lg" />
        </div>
      </div>
      
      {/* Progress bar subtle indicator */}
      <div className="mt-8 h-1.5 w-full bg-surface-50 rounded-full overflow-hidden flex">
        <div className="h-full bg-accent-500" style={{ width: '30%' }} />
        <div className="h-full bg-amber-500" style={{ width: '45%' }} />
        <div className="h-full bg-rose-500" style={{ width: '25%' }} />
      </div>
    </div>
  );
}
