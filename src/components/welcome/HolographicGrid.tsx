'use client';

import React from 'react';

export function HolographicGrid() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Satellite orbital paths */}
      <div className="absolute inset-0">
        {/* Orbital ring 1 */}
        <div className="orbital-ring-1" />
        
        {/* Orbital ring 2 */}
        <div className="orbital-ring-2" />
        
        {/* Orbital ring 3 */}
        <div className="orbital-ring-3" />
      </div>

      {/* Grid lines */}
      <div className="absolute inset-0 opacity-20">
        {/* Vertical lines */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`v-${i}`}
            className={`absolute top-0 h-full w-px bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent grid-v-${i + 1}`}
          />
        ))}
        
        {/* Horizontal lines */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`h-${i}`}
            className={`absolute left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent grid-h-${i + 1}`}
          />
        ))}
      </div>

      {/* Corner brackets */}
      <div className="corner-brackets" />
    </div>
  );
}