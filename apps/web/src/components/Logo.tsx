import React from 'react';
import { LogoTitanium } from './LogoTitanium';

type LogoProps = {
  className?: string;
  size?: number;
  variant?: 'symbol' | 'full';
};

export const Logo: React.FC<LogoProps> = ({ className = '', size = 32, variant = 'full' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LogoTitanium size={size} />
      
      {variant === 'full' && (
        <span className="text-xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-accent-500 dark:from-primary-400 dark:to-accent-400">
          NutriFlow
        </span>
      )}
    </div>
  );
};
