'use client';

import React from 'react';

export function ParticleField() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Floating particles */}
      <div className="particle-container">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`particle particle-${i + 1}`}
          />
        ))}
      </div>

      {/* Data streams */}
      <div className="data-streams">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`data-stream stream-${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}