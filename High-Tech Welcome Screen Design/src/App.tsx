import React from 'react';
import { ArcticBackground } from './components/ArcticBackground';
import { HolographicGrid } from './components/HolographicGrid';
import { DataStream } from './components/DataStream';
import { ParticleField } from './components/ParticleField';
import { CoordinateDisplay } from './components/CoordinateDisplay';
import { WelcomeInterface } from './components/WelcomeInterface';

export default function App() {
  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden">
      {/* Background arctic landscape with aurora */}
      <ArcticBackground />
      
      {/* Holographic satellite grid overlay */}
      <HolographicGrid />
      
      {/* Data streams and methane heatmap */}
      <DataStream />
      
      {/* Particle field effects */}
      <ParticleField />
      
      {/* Floating coordinate displays */}
      <CoordinateDisplay />
      
      {/* Central welcome interface */}
      <WelcomeInterface />
    </div>
  );
}