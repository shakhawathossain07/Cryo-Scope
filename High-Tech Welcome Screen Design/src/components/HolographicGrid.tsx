import React from 'react';

export function HolographicGrid() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Main satellite grid */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-30" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="satellite-grid"
            x="0"
            y="0"
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 100 0 L 0 0 0 100"
              fill="none"
              stroke="rgb(6 182 212)"
              strokeWidth="0.5"
              opacity="0.6"
            />
          </pattern>
          
          <pattern
            id="fine-grid"
            x="0"
            y="0"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="rgb(16 185 129)"
              strokeWidth="0.2"
              opacity="0.3"
            />
          </pattern>

          <linearGradient id="gridGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor: 'rgb(6 182 212)', stopOpacity: 0.8}} />
            <stop offset="50%" style={{stopColor: 'rgb(16 185 129)', stopOpacity: 0.4}} />
            <stop offset="100%" style={{stopColor: 'rgb(6 182 212)', stopOpacity: 0.1}} />
          </linearGradient>
        </defs>

        {/* Background grid layers */}
        <rect width="100%" height="100%" fill="url(#fine-grid)" />
        <rect width="100%" height="100%" fill="url(#satellite-grid)" />

        {/* Animated scanning lines */}
        <g className="animate-pulse" style={{ animationDuration: '3s' }}>
          <line
            x1="0"
            y1="20%"
            x2="100%"
            y2="20%"
            stroke="rgb(6 182 212)"
            strokeWidth="1"
            opacity="0.8"
          />
          <line
            x1="0"
            y1="60%"
            x2="100%"
            y2="60%"
            stroke="rgb(16 185 129)"
            strokeWidth="1"
            opacity="0.6"
          />
        </g>

        {/* Vertical scanning lines */}
        <g className="animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }}>
          <line
            x1="25%"
            y1="0"
            x2="25%"
            y2="100%"
            stroke="rgb(6 182 212)"
            strokeWidth="1"
            opacity="0.5"
          />
          <line
            x1="75%"
            y1="0"
            x2="75%"
            y2="100%"
            stroke="rgb(16 185 129)"
            strokeWidth="1"
            opacity="0.4"
          />
        </g>

        {/* Radar sweep effect */}
        <g className="origin-center animate-spin" style={{ animationDuration: '8s' }}>
          <path
            d="M 50% 50% L 50% 20% A 30% 30% 0 0 1 80% 50% Z"
            fill="url(#gridGlow)"
            opacity="0.2"
          />
        </g>
      </svg>

      {/* Corner grid overlays */}
      <div className="absolute top-4 left-4 w-32 h-32 border border-cyan-400/40 bg-gradient-to-br from-cyan-400/10 to-transparent"></div>
      <div className="absolute top-4 right-4 w-32 h-32 border border-emerald-400/40 bg-gradient-to-bl from-emerald-400/10 to-transparent"></div>
      <div className="absolute bottom-4 left-4 w-32 h-32 border border-cyan-400/40 bg-gradient-to-tr from-cyan-400/10 to-transparent"></div>
      <div className="absolute bottom-4 right-4 w-32 h-32 border border-emerald-400/40 bg-gradient-to-tl from-emerald-400/10 to-transparent"></div>
    </div>
  );
}