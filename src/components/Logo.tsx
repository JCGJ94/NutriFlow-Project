import React from 'react';
import Image from 'next/image';

type LogoProps = {
  className?: string;
  size?: number;
  variant?: 'symbol' | 'full';
};

/** The NutriFlow emblem (public/brand/logo.webp, 512px source) plus the wordmark. */
export const Logo: React.FC<LogoProps> = ({ className = '', size = 32, variant = 'full' }) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Image
        src="/brand/logo.webp"
        alt={variant === 'symbol' ? 'NutriFlow' : ''}
        width={size}
        height={size}
        className="shrink-0"
      />
      {variant === 'full' && (
        <span className="font-heading text-xl font-semibold tracking-tight text-ink">NutriFlow</span>
      )}
    </div>
  );
};
