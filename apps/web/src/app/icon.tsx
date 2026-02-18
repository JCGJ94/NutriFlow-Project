
import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 24,
          background: 'transparent',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
        }}
      >
        <svg
            width="32"
            height="32"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="titaniumNeonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
            </defs>

            {/* Background */}
            <circle cx="50" cy="50" r="48" fill="#0f172a" />
            <circle cx="50" cy="50" r="46" stroke="#1e293b" strokeWidth="2" />

            {/* Dumbbell Base */}
             <g stroke="url(#titaniumNeonGrad)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M35 50 H65" strokeWidth="8" />
                
                <rect x="28" y="40" width="4" height="20" rx="1.5" stroke="none" fill="url(#titaniumNeonGrad)" />
                <rect x="68" y="40" width="4" height="20" rx="1.5" stroke="none" fill="url(#titaniumNeonGrad)" />
            </g>

            {/* Cutlery */}
            <g stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
                <path 
                  d="M35 75 L65 25" 
                  stroke="url(#titaniumNeonGrad)" 
                />
                <path 
                  d="M65 75 L35 25" 
                  stroke="url(#titaniumNeonGrad)" 
                />
            </g>
        </svg>
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported icons size metadata
      // config to also set the ImageResponse's width and height.
      ...size,
    }
  );
}
