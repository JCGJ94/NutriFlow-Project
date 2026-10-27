'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, RefreshCw, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn, getMealTypeName, formatGrams } from '@/lib/utils';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface MealItem {
  id: string;
  ingredientName: string;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MealCardProps {
  meal: {
    id: string;
    mealType: string;
    isLocked: boolean;
    totalKcal: number;
    items: MealItem[];
  };
  onToggleLock: (mealId: string, isLocked: boolean) => void;
  onRegenerate: (mealId: string) => void;
  isRegenerating?: boolean;
}

export function MealCard({
  meal,
  onToggleLock,
  onRegenerate,
  isRegenerating = false,
}: MealCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { t, language } = useLanguage();
  
  return (
    <motion.div
      layout
      className="bg-paper-2 rounded-2xl border border-rule shadow-xs overflow-hidden transition-colors duration-300"
    >
      <div className="p-4 md:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg",
              meal.mealType === 'breakfast' ? "bg-amber-100 text-amber-600" :
              meal.mealType === 'lunch' ? "bg-paper-3 text-signal-text" :
              meal.mealType === 'dinner' ? "bg-indigo-100 text-signal-text" :
              "bg-rose-100 text-rose-600"
            )}>
              {getMealTypeName(meal.mealType, language).charAt(0)}
            </div>
            <div>
              <h4 className="font-heading font-bold text-ink leading-tight">
                {getMealTypeName(meal.mealType, language)}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-medium text-muted">
                  {Math.round(meal.totalKcal)} kcal
                </span>
                <span className="text-ink">|</span>
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs font-bold text-signal-text hover:text-signal-text underline underline-offset-2 flex items-center gap-1"
                >
                  {t('common.ingredientes_count').replace('{{count}}', meal.items.length.toString())}
                  {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-paper-2 p-1 rounded-xl transition-colors duration-300">
            <button
              onClick={() => onToggleLock(meal.id, meal.isLocked)}
              className={cn(
                "p-2 rounded-lg transition-all",
                meal.isLocked 
                  ? "bg-paper-2 shadow-xs text-amber-600 dark:text-amber-400" 
                  : "text-muted hover:text-ink"
              )}
              title={meal.isLocked ? t('common.unlock') : t('common.lock')}
            >
              {meal.isLocked ? <Lock size={18} /> : <Unlock size={18} />}
            </button>
            <button
              onClick={() => onRegenerate(meal.id)}
              disabled={meal.isLocked || isRegenerating}
              className={cn(
                "p-2 rounded-lg transition-all",
                isRegenerating 
                  ? "bg-paper-2 shadow-xs" 
                  : "text-muted hover:text-signal-text disabled:opacity-30"
              )}
              title={t('plans.regenerate_meal')}
            >
              {isRegenerating ? (
                <Loader2 size={18} className="animate-spin text-signal-text" />
              ) : (
                <RefreshCw size={18} />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-rule"
            >
              <ul className="space-y-3">
                {meal.items.map((item, idx) => (
                  <motion.li
                    key={item.id}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-ink">
                        {item.ingredientName}
                      </span>
                      <span className="text-[10px] font-bold text-muted uppercase tracking-wide">
                        {formatGrams(item.grams)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-black text-ink">
                          {Math.round(item.kcal)}
                        </span>
                        <span className="text-[10px] ml-0.5 text-muted font-bold uppercase">kcal</span>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-1 h-4 rounded-full bg-accent-200" title={`P: ${item.protein}g`} />
                        <div className="w-1 h-4 rounded-full bg-amber-200" title={`C: ${item.carbs}g`} />
                        <div className="w-1 h-4 rounded-full bg-rose-200" title={`G: ${item.fat}g`} />
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
