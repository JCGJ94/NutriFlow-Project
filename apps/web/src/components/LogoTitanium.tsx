import React from 'react';

interface LogoTitaniumProps {
  size?: number;
  className?: string;
}

/**
 * LogoTitanium: The "Masterpiece" Neon Identity
 * Inspired by the AI generation: nutriflow_logo_final_v1_1770595365648.png
 * Features:
 * - Circular emblem background.
 * - Horizontal heavy-duty dumbbell.
 * - Crossed Fork and Knife (Technical silhouettes).
 * - Multi-layered neon glow (Violet to Emerald).
 */
export const LogoTitanium: React.FC<LogoTitaniumProps> = ({ size = 200, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      {/* Brand Gradient */}
      <linearGradient id="titaniumNeonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a855f7" /> {/* Bright Violet */}
        <stop offset="50%" stopColor="#8b5cf6" /> 
        <stop offset="100%" stopColor="#10b981" /> {/* Emerald */}
      </linearGradient>

      {/* Extreme Neon Glow Filter */}
      <filter id="neonTitaniumGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>

      {/* Secondary Soft Glow */}
      <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* Dark Circular Plate (The Foundation) */}
    <circle cx="50" cy="50" r="48" fill="#0f172a" />
    <circle cx="50" cy="50" r="46" stroke="#1e293b" strokeWidth="1" />

    {/* The Branding Group with Glow */}
    <g filter="url(#neonTitaniumGlow)">
      {/* 1. The Horizontal Dumbbell (Base Layer) */}
      <g stroke="url(#titaniumNeonGrad)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Central Handle */}
        <path d="M35 50 H65" strokeWidth="5" />
        
        {/* Weighted Plates (Left) */}
        <rect x="28" y="40" width="4" height="20" rx="1.5" stroke="none" fill="url(#titaniumNeonGrad)" />
        <rect x="22" y="42" width="3" height="16" rx="1" stroke="none" fill="url(#titaniumNeonGrad)" opacity="0.6" />
        <rect x="18" y="45" width="2" height="10" rx="0.5" stroke="none" fill="url(#titaniumNeonGrad)" opacity="0.3" />
        
        {/* Weighted Plates (Right) */}
        <rect x="68" y="40" width="4" height="20" rx="1.5" stroke="none" fill="url(#titaniumNeonGrad)" />
        <rect x="75" y="42" width="3" height="16" rx="1" stroke="none" fill="url(#titaniumNeonGrad)" opacity="0.6" />
        <rect x="80" y="45" width="2" height="10" rx="0.5" stroke="none" fill="url(#titaniumNeonGrad)" opacity="0.3" />
      </g>

      {/* 2. The Crossed Cutlery (Top Layer) */}
      <g stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        {/* The Knife (Leaning Left) */}
        <path 
          d="M35 75 L65 25" 
          stroke="url(#titaniumNeonGrad)" 
          strokeWidth="5" 
        />
        {/* Knife Blade Sharpness Detail */}
        <path d="M58 25 C63 25 68 35 68 45" stroke="url(#titaniumNeonGrad)" strokeWidth="2" opacity="0.8" />

        {/* The Fork (Leaning Right) */}
        <path 
          d="M65 75 L35 25" 
          stroke="url(#titaniumNeonGrad)" 
          strokeWidth="5" 
        />
        {/* Fork Tines Detail */}
        <path d="M35 25 V35 M30 25 V32 M40 25 V32" stroke="url(#titaniumNeonGrad)" strokeWidth="2.5" opacity="0.9" />
      </g>
    </g>

    {/* Technical Accents (Static) */}
    <circle cx="50" cy="50" r="3" fill="white" filter="url(#softGlow)" opacity="0.8" />
    
    {/* Final Outer Ring Glow */}
    <circle cx="50" cy="50" r="48" stroke="url(#titaniumNeonGrad)" strokeWidth="1.5" opacity="0.4" />
  </svg>
);
