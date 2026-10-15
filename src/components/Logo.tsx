import React from 'react';

type LogoProps = {
  className?: string;
  size?: number;
  variant?: 'symbol' | 'full';
};

/**
 * Seven arcs, one per day of the plan. The first day is lit.
 * `pathLength="7"` lets the dash pattern address one arc per unit.
 */
function WeekRing({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true" className="shrink-0">
      <g transform="rotate(-90 20 20)" strokeWidth="4" strokeLinecap="round">
        <circle cx="20" cy="20" r="15" pathLength="7" strokeDasharray="0.7 0.3" stroke="var(--rule)" />
        <circle cx="20" cy="20" r="15" pathLength="7" strokeDasharray="0.7 6.3" stroke="var(--signal)" />
      </g>
    </svg>
  );
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 32, variant = 'full' }) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <WeekRing size={size} />
      {variant === 'full' && (
        <span className="font-heading text-xl font-semibold tracking-tight text-ink">NutriFlow</span>
      )}
    </div>
  );
};
