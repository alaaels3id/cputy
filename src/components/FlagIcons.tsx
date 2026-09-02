import React from 'react';

interface FlagProps {
  className?: string;
}

export const FlagEN: React.FC<FlagProps> = ({ className = 'w-5 h-3.5' }) => (
  <svg
    viewBox="0 0 640 480"
    className={`inline-block rounded-xs shadow-xs shrink-0 ${className}`}
    aria-label="English (US)"
  >
    <path fill="#bd3d44" d="M0 0h640v480H0z" />
    <path stroke="#fff" strokeWidth="37" d="M0 55.4h640M0 129.2h640M0 203h640M0 277h640M0 350.8h640M0 424.6h640" />
    <path fill="#192f5d" d="M0 0h256v258.5H0z" />
    {/* Clean geometric stars pattern representation */}
    <g fill="#fff">
      {[...Array(5)].map((_, r) => (
        <g key={r} transform={`translate(16, ${22 + r * 50})`}>
          {[...Array(6)].map((_, c) => (
            <circle key={c} cx={c * 42} cy="0" r="7" />
          ))}
        </g>
      ))}
      {[...Array(4)].map((_, r) => (
        <g key={r} transform={`translate(37, ${47 + r * 50})`}>
          {[...Array(5)].map((_, c) => (
            <circle key={c} cx={c * 42} cy="0" r="7" />
          ))}
        </g>
      ))}
    </g>
  </svg>
);

export const FlagAR: React.FC<FlagProps> = ({ className = 'w-5 h-3.5' }) => (
  <svg
    viewBox="0 0 640 480"
    className={`inline-block rounded-xs shadow-xs shrink-0 ${className}`}
    aria-label="العربية (Arabic)"
  >
    {/* Saudi Green Authentic Background */}
    <path fill="#0a6939" d="M0 0h640v480H0z" />
    {/* White Arabic Calligraphy Stylized Shahada / Emblem */}
    <g fill="#ffffff" transform="translate(100, 75) scale(0.68)">
      {/* Central Arabic typography decorative curves */}
      <path d="M70 120 C100 80, 160 80, 190 120 C220 160, 260 90, 310 110 C360 130, 410 70, 460 110 C510 150, 550 100, 580 130 C560 150, 500 130, 460 145 C410 125, 360 170, 310 135 C260 125, 220 180, 180 140 C140 110, 90 150, 70 120 Z" />
      <path d="M120 70 C140 50, 180 50, 200 70 C220 90, 260 40, 300 70 C340 100, 380 50, 420 80 C460 110, 500 60, 520 85 C490 100, 450 90, 420 95 C380 80, 340 120, 300 90 C260 70, 220 110, 180 85 C160 65, 130 90, 120 70 Z" />
      <circle cx="210" cy="45" r="8" />
      <circle cx="340" cy="40" r="8" />
      <circle cx="450" cy="48" r="8" />
      {/* Traditional Arabic Sword (Sayf) */}
      <g transform="translate(40, 190)">
        {/* Blade */}
        <path d="M540 22 C380 20, 200 24, 80 26 C60 27, 40 25, 30 20 C20 15, 30 35, 45 38 C70 42, 210 38, 380 34 C460 32, 530 28, 550 25 C560 23, 555 22, 540 22 Z" />
        {/* Guard */}
        <rect x="520" y="8" width="14" height="42" rx="3" />
        {/* Handle */}
        <rect x="534" y="22" width="48" height="14" rx="2" />
        {/* Pommel */}
        <circle cx="586" cy="29" r="10" />
      </g>
    </g>
  </svg>
);
