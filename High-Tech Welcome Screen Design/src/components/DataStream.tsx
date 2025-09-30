import React from 'react';

export function DataStream() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Methane heatmap contours */}
      <div className="absolute top-20 left-8 w-64 h-48 opacity-60">
        <svg width="100%" height="100%" viewBox="0 0 256 192">
          <defs>
            <radialGradient id="methaneGradient1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style={{stopColor: 'rgb(239 68 68)', stopOpacity: 0.6}} />
              <stop offset="40%" style={{stopColor: 'rgb(251 146 60)', stopOpacity: 0.4}} />
              <stop offset="80%" style={{stopColor: 'rgb(34 197 94)', stopOpacity: 0.2}} />
              <stop offset="100%" style={{stopColor: 'transparent'}} />
            </radialGradient>
            <radialGradient id="methaneGradient2" cx="30%" cy="70%" r="40%">
              <stop offset="0%" style={{stopColor: 'rgb(251 146 60)', stopOpacity: 0.5}} />
              <stop offset="60%" style={{stopColor: 'rgb(34 197 94)', stopOpacity: 0.3}} />
              <stop offset="100%" style={{stopColor: 'transparent'}} />
            </radialGradient>
          </defs>
          
          <ellipse cx="128" cy="96" rx="80" ry="60" fill="url(#methaneGradient1)" className="animate-pulse" style={{animationDuration: '4s'}} />
          <ellipse cx="80" cy="140" rx="60" ry="40" fill="url(#methaneGradient2)" className="animate-pulse" style={{animationDuration: '6s', animationDelay: '1s'}} />
          
          {/* Contour lines */}
          <path d="M 50 96 Q 128 76 200 96 Q 180 120 128 116 Q 70 120 50 96" fill="none" stroke="rgb(34 197 94)" strokeWidth="1" opacity="0.8" />
          <path d="M 60 110 Q 128 90 190 110 Q 170 130 128 126 Q 80 130 60 110" fill="none" stroke="rgb(251 146 60)" strokeWidth="1" opacity="0.6" />
        </svg>
      </div>





      {/* Streaming data lines */}
      <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent">
        <div className="w-8 h-full bg-gradient-to-r from-cyan-400 to-cyan-300 animate-ping" style={{animationDuration: '2s'}}></div>
      </div>
      
      <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent">
        <div className="w-6 h-full bg-gradient-to-r from-emerald-400 to-emerald-300 animate-ping" style={{animationDuration: '3s', animationDelay: '0.5s'}}></div>
      </div>

      {/* Vertical data streams */}
      <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent">
        <div className="w-full h-12 bg-gradient-to-b from-cyan-400 to-cyan-300 animate-pulse"></div>
      </div>
      
      <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-emerald-400/30 to-transparent">
        <div className="w-full h-8 bg-gradient-to-b from-emerald-400 to-emerald-300 animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>
    </div>
  );
}