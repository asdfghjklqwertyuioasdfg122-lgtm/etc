import React from 'react';

interface BluePyramidLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showText?: boolean;
  textVariant?: 'light' | 'dark' | 'white';
  subtitle?: string;
  animate?: boolean;
  className?: string;
}

export const BluePyramidLogo: React.FC<BluePyramidLogoProps> = ({
  size = 'md',
  showText = false,
  textVariant = 'dark',
  subtitle,
  animate = false,
  className = '',
}) => {
  const sizeMap = {
    xs: { svg: 'w-6 h-6', box: 'w-7 h-7', text: 'text-sm', sub: 'text-[9px]' },
    sm: { svg: 'w-8 h-8', box: 'w-9 h-9', text: 'text-base', sub: 'text-[10px]' },
    md: { svg: 'w-10 h-10', box: 'w-11 h-11', text: 'text-lg', sub: 'text-xs' },
    lg: { svg: 'w-14 h-14', box: 'w-16 h-16', text: 'text-xl', sub: 'text-xs' },
    xl: { svg: 'w-20 h-20', box: 'w-24 h-24', text: 'text-2xl', sub: 'text-sm' },
    hero: { svg: 'w-32 h-32 md:w-40 md:h-40', box: 'w-36 h-36 md:w-48 md:h-48', text: 'text-3xl md:text-4xl', sub: 'text-sm md:text-base' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Geometric Blue Pyramid SVG */}
      <div
        className={`relative flex items-center justify-center ${currentSize.box} ${
          animate ? 'animate-pulse transition-transform hover:scale-105 duration-300' : ''
        }`}
      >
        <svg
          viewBox="0 0 100 100"
          className={`${currentSize.svg} drop-shadow-md select-none`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Left Face Gradient (Deep Royal & Primary Blue) */}
            <linearGradient id="pyramidLeftGrad" x1="50" y1="12" x2="10" y2="86" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2F80ED" />
              <stop offset="45%" stopColor="#1565C0" />
              <stop offset="100%" stopColor="#0A4DA3" />
            </linearGradient>

            {/* Right Face Gradient (Accent to Royal Blue) */}
            <linearGradient id="pyramidRightGrad" x1="50" y1="12" x2="90" y2="86" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="50%" stopColor="#2F80ED" />
              <stop offset="100%" stopColor="#1565C0" />
            </linearGradient>

            {/* Base Shadow & Reflection Gradient */}
            <linearGradient id="pyramidBaseGrad" x1="50" y1="86" x2="50" y2="96" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0A4DA3" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0A4DA3" stopOpacity="0" />
            </linearGradient>

            {/* Center Peak Crystal Highlight */}
            <linearGradient id="pyramidPeakGrad" x1="50" y1="8" x2="50" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#93C5FD" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Base Ellipse Grounding Shadow */}
          <ellipse cx="50" cy="89" rx="38" ry="7" fill="url(#pyramidBaseGrad)" />

          {/* Left Geometric Facet */}
          <polygon
            points="50,14 12,84 50,84"
            fill="url(#pyramidLeftGrad)"
          />

          {/* Right Geometric Facet */}
          <polygon
            points="50,14 50,84 88,84"
            fill="url(#pyramidRightGrad)"
          />

          {/* Geometric Inner Cutout / Stepped Layers (Modern FinTech Egyptian Architecture) */}
          <polygon
            points="50,38 32,84 50,84"
            fill="#0A4DA3"
            opacity="0.35"
          />
          <polygon
            points="50,38 50,84 68,84"
            fill="#93C5FD"
            opacity="0.3"
          />

          {/* Micro Geometric Lines / Modern Circuit Lines on the Pyramid */}
          <line x1="50" y1="14" x2="50" y2="84" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.8" />
          <line x1="28" y1="54" x2="72" y2="54" stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.4" strokeDasharray="2 2" />
          <line x1="20" y1="70" x2="80" y2="70" stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.3" strokeDasharray="3 2" />

          {/* Apex Golden/Cyan Crystal Spark */}
          <circle cx="50" cy="14" r="3" fill="#FFFFFF" />
          <polygon points="50,8 48,16 52,16" fill="url(#pyramidPeakGrad)" />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight ${currentSize.text} ${
                textVariant === 'white'
                  ? 'text-white'
                  : textVariant === 'light'
                  ? 'text-blue-100'
                  : 'text-[#0A4DA3]'
              }`}
            >
              ETC
            </span>
            <span
              className={`font-bold ${currentSize.text} ${
                textVariant === 'white'
                  ? 'text-blue-200'
                  : textVariant === 'light'
                  ? 'text-blue-200'
                  : 'text-slate-800'
              }`}
            >
              ERP
            </span>
          </div>
          {subtitle && (
            <span
              className={`font-medium ${currentSize.sub} ${
                textVariant === 'white' || textVariant === 'light'
                  ? 'text-blue-200'
                  : 'text-slate-500'
              }`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
