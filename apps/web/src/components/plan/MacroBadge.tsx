'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MacroBadgeProps {
  label: string;
  value: number;
  unit?: string;
  color: 'protein' | 'carbs' | 'fat' | 'calories';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function MacroBadge({
  label,
  value,
  unit = 'g',
  color,
  className,
  size = 'md',
}: MacroBadgeProps) {
  const colorMap = {
    protein: 'from-accent-500 to-accent-600 shadow-accent-200',
    carbs: 'from-amber-500 to-amber-600 shadow-amber-200',
    fat: 'from-rose-500 to-rose-600 shadow-rose-200',
    calories: 'from-primary-500 to-primary-600 shadow-primary-200',
  };

  const textMap = {
    protein: 'text-accent-700',
    carbs: 'text-amber-700',
    fat: 'text-rose-700',
    calories: 'text-primary-700',
  };


  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'rounded-2xl bg-white dark:bg-surface-800 border border-surface-100 dark:border-surface-700 shadow-sm flex flex-col items-center justify-center transition-all hover:shadow-md duration-300',
        size === 'lg' ? 'min-w-[100px]' : '',
        className
      )}
    >
      <div
        className={cn(
          'w-2 h-2 rounded-full mb-1 bg-gradient-to-tr',
          colorMap[color]
        )}
      />
      <span className="text-[10px] uppercase tracking-wider font-bold text-surface-400">
        {label}
      </span>
      <div className="flex items-baseline gap-0.5">
        <span className={cn('font-heading font-black', size === 'lg' ? 'text-2xl' : 'text-base', textMap[color])}>
          {Math.round(value)}
        </span>
        <span className="text-[10px] font-bold text-surface-400">{unit}</span>
      </div>
    </motion.div>
  );
}
