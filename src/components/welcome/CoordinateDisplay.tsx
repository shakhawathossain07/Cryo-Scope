'use client';

import React from 'react';

export function CoordinateDisplay() {
  const coordinates = [
    { lat: '70.2°N', lng: '105.3°E', location: 'Siberian Tundra', status: 'ACTIVE' },
    { lat: '68.8°N', lng: '161.0°W', location: 'Alaska North Slope', status: 'MONITORING' },
    { lat: '74.5°N', lng: '109.5°W', location: 'Canadian Arctic', status: 'SCANNING' },
    { lat: '72.1°N', lng: '38.5°W', location: 'Greenland Ice Sheet', status: 'ACTIVE' }
  ];

  return (
    <div className="absolute inset-0 pointer-events-none">
      {coordinates.map((coord, i) => (
        <div
          key={i}
          className={`coordinate-display absolute coord-${i + 1}`}
        >
          <div className="bg-slate-900/80 border border-cyan-400/30 rounded-lg p-3 backdrop-blur-sm text-xs">
            <div className="text-cyan-400 font-mono">{coord.lat}, {coord.lng}</div>
            <div className="text-emerald-400 text-xs mt-1">{coord.location}</div>
            <div className="flex items-center mt-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse mr-2"></div>
              <span className="text-emerald-400 text-xs">{coord.status}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}