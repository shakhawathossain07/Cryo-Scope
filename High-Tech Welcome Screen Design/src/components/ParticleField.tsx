import React from 'react';

export function ParticleField() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-60 animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDuration: `${2 + Math.random() * 3}s`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}

      {/* Larger glowing particles */}
      {[...Array(8)].map((_, i) => (
        <div
          key={`large-${i}`}
          className="absolute w-2 h-2 bg-emerald-400 rounded-full opacity-40 animate-ping"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDuration: `${3 + Math.random() * 4}s`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}

      {/* Particle trails */}
      <div className="absolute top-1/4 left-1/4 w-64 h-1 bg-gradient-to-r from-cyan-400/60 via-cyan-300/40 to-transparent animate-pulse" 
           style={{animationDuration: '2s'}} />
      
      <div className="absolute top-3/4 right-1/4 w-48 h-1 bg-gradient-to-l from-emerald-400/60 via-emerald-300/40 to-transparent animate-pulse" 
           style={{animationDuration: '3s', animationDelay: '1s'}} />
      
      <div className="absolute top-1/2 left-1/2 w-32 h-1 bg-gradient-to-r from-blue-400/60 via-blue-300/40 to-transparent animate-pulse" 
           style={{animationDuration: '2.5s', animationDelay: '0.5s'}} />

      {/* Orbital particle paths */}
      <div className="absolute top-1/3 left-1/3 w-32 h-32 border border-cyan-400/20 rounded-full animate-spin" 
           style={{animationDuration: '10s'}}>
        <div className="absolute -top-1 -left-1 w-2 h-2 bg-cyan-400 rounded-full"></div>
      </div>
      
      <div className="absolute bottom-1/3 right-1/3 w-24 h-24 border border-emerald-400/20 rounded-full animate-spin" 
           style={{animationDuration: '15s', animationDirection: 'reverse'}}>
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full"></div>
      </div>

      {/* Energy field effect */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <circle cx="20%" cy="30%" r="3" fill="rgb(6 182 212)" filter="url(#glow)" className="animate-pulse" />
          <circle cx="80%" cy="20%" r="2" fill="rgb(16 185 129)" filter="url(#glow)" className="animate-pulse" style={{animationDelay: '1s'}} />
          <circle cx="60%" cy="80%" r="4" fill="rgb(59 130 246)" filter="url(#glow)" className="animate-pulse" style={{animationDelay: '2s'}} />
          <circle cx="15%" cy="70%" r="2" fill="rgb(6 182 212)" filter="url(#glow)" className="animate-pulse" style={{animationDelay: '0.5s'}} />
          <circle cx="90%" cy="60%" r="3" fill="rgb(16 185 129)" filter="url(#glow)" className="animate-pulse" style={{animationDelay: '1.5s'}} />
        </svg>
      </div>
    </div>
  );
}