'use client';

import React from 'react';
import { ArcticBackground } from './ArcticBackground';
import { HolographicGrid } from './HolographicGrid';
import { ParticleField } from './ParticleField';
import { CoordinateDisplay } from './CoordinateDisplay';
import { WelcomeInterface } from './WelcomeInterface';

export function WelcomeScreen() {
  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden">
      {/* Background arctic landscape with aurora */}
      <ArcticBackground />
      
      {/* Holographic satellite grid overlay */}
      <HolographicGrid />
      
      {/* Particle field effects */}
      <ParticleField />
      
      {/* Floating coordinate displays */}
      <CoordinateDisplay />
      
      {/* Central welcome interface */}
      <WelcomeInterface />
    </div>
  );
}