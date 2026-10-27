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
    protein: 'bg-signal',
    carbs: 'bg-amber-500',
    fat: 'bg-rose-500',
    calories: 'bg-signal',
  };

  const textMap = {
    protein: 'text-signal-text',
    carbs: 'text-amber-700',
    fat: 'text-rose-700',
    calories: 'text-signal-text',
  };


  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'rounded-2xl bg-paper-2 border border-rule shadow-xs flex flex-col items-center justify-center transition-all hover:shadow-md duration-300',
        size === 'lg' ? 'min-w-[100px]' : '',
        className
      )}
    >
      <div
        className={cn(
          'w-2 h-2 rounded-full mb-1',
          colorMap[color]
        )}
      />
      <span className="text-[10px] uppercase tracking-wider font-bold text-muted">
        {label}
      </span>
      <div className="flex items-baseline gap-0.5">
        <span className={cn('font-heading font-black', size === 'lg' ? 'text-2xl' : 'text-base', textMap[color])}>
          {Math.round(value)}
        </span>
        <span className="text-[10px] font-bold text-muted">{unit}</span>
      </div>
    </motion.div>
  );
}
