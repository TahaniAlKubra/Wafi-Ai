import React from 'react';

interface WafiLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const WafiLogo: React.FC<WafiLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const dimensions = {
    sm: { box: 'w-8 h-8', icon: 24, text: 'text-lg', subText: 'text-[10px]' },
    md: { box: 'w-10 h-10', icon: 32, text: 'text-xl', subText: 'text-xs' },
    lg: { box: 'w-12 h-12', icon: 40, text: 'text-2xl', subText: 'text-sm' },
  }[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Triadic Gradient Logo Container */}
      <div
        className={`${dimensions.box} rounded-2xl bg-gradient-to-tr from-blue-600 via-violet-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-violet-500/20 shrink-0 relative overflow-hidden group`}
      >
        {/* Subtle Shine Glow Effect */}
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {/* Custom SVG Merging Open Book + Arabic Calligraphic 'و' / Wafi curve + AI Spark ✨ */}
        <svg
          width={dimensions.icon}
          height={dimensions.icon}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-xs"
        >
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="wafi-spark-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
            <linearGradient id="wafi-pages-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#e0e7ff" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Left & Right Pages of Open Book forming the fluid base */}
          <path
            d="M8 32C14 29 20 30 24 33C28 30 34 29 40 32V16C34 13 28 14 24 17C20 14 14 13 8 16V32Z"
            fill="url(#wafi-pages-grad)"
            stroke="white"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Calligraphic Arabic Letter 'و' (Waw) integrated as the bookmark & fluid core */}
          <path
            d="M24 16C21 16 18.5 18 18.5 21.5C18.5 24.5 21 26.5 24 26.5C27 26.5 28.5 25 28.5 23.5C28.5 22 27 21 25.5 21C24.5 21 23.8 21.5 23.8 22.2M24 26.5C22 30 19 34 15 36"
            stroke="url(#wafi-spark-grad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* AI Sparkle ✨ 1 (Top Center Star) */}
          <path
            d="M24 6L25.2 9.8L29 11L25.2 12.2L24 16L22.8 12.2L19 11L22.8 9.8L24 6Z"
            fill="url(#wafi-spark-grad)"
          />

          {/* AI Sparkle ✨ 2 (Top Right Tiny Star) */}
          <path
            d="M35 10L35.6 11.9L37.5 12.5L35.6 13.1L35 15L34.4 13.1L32.5 12.5L34.4 11.9L35 10Z"
            fill="#5eead4"
          />

          {/* Center Spine Glow Line */}
          <line x1="24" y1="17" x2="24" y2="33" stroke="white" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.6" />
        </svg>
      </div>

      {/* Brand Text & Subtitle */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <h1 className={`${dimensions.text} font-black tracking-tight leading-none`}>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-violet-600 to-teal-500">
                وافي
              </span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-violet-600 to-teal-500 font-extrabold text-xs sm:text-sm">
                Wafi
              </span>
            </h1>
          </div>
          <p className={`${dimensions.subText} font-bold text-slate-500 mt-0.5 tracking-tight`}>
            رفيقك الذكي للمذاكرة
          </p>
        </div>
      )}
    </div>
  );
};
