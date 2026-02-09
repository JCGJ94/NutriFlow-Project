import React from 'react';

interface LogoZenProps {
  size?: number;
  className?: string;
}

/**
 * Zen Fusion (Minimalist Fusion)
 * The definitive identity for NutriFlow.
 * Concept: Continuous line fusion of a fork/knife and a dumbbell.
 */
export const LogoZen: React.FC<LogoZenProps> = ({ size = 200, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="zenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7c3aed" /> {/* Electric Violet */}
        <stop offset="100%" stopColor="#10b981" /> {/* Emerald Green */}
      </linearGradient>
    </defs>

    {/* The Zen Flow Path */}
    <g stroke="url(#zenGrad)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
      {/* 
        The "Dumbbell" part (Left)
        A strong vertical base with rounded caps that feel like weights.
      */}
      <path d="M25 35 V65" />
      <path d="M18 35 H32" strokeWidth="4" /> {/* Top plate */}
      <path d="M18 65 H32" strokeWidth="4" /> {/* Bottom plate */}

      {/* 
        The "Connection" (The continuous line vibe)
        A fluid curve that acts as the 'N' bar and the source of the 'F'.
      */}
      <path d="M25 35 C45 35 45 65 65 65" /> 

      {/* 
        The "Fork/Knife" part (Right)
        Transitioning into a sharp vertical pillar with minimalist tines.
      */}
      <path d="M65 25 V75" />
      <path d="M65 35 H80" strokeWidth="5" /> {/* Main fork tine / knife edge */}
      <path d="M65 52 H75" strokeWidth="4" /> {/* Secondary tine */}
    </g>

    {/* Subtle Tech Node */}
    <circle cx="25" cy="35" r="2" fill="#7c3aed" />
    <circle cx="65" cy="65" r="2" fill="#10b981" />
  </svg>
);
