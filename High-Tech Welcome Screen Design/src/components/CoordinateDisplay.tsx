import React from 'react';

export function CoordinateDisplay() {
  return (
    <div className="absolute inset-0 pointer-events-none">


      {/* Floating coordinate points */}
      <div className="absolute top-1/4 left-8">
        <div className="relative">
          <div className="w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
        </div>
      </div>

      <div className="absolute top-1/3 right-12">
        <div className="relative">
          <div className="w-3 h-3 bg-cyan-400 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
        </div>
      </div>

      <div className="absolute bottom-1/4 left-1/4">
        <div className="relative">
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-ping" style={{animationDelay: '2s'}}></div>
        </div>
      </div>

      <div className="absolute bottom-1/3 right-1/4">
        <div className="relative">
          <div className="w-3 h-3 bg-emerald-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
        </div>
      </div>

      {/* Navigation compass */}
      <div className="absolute bottom-8 right-8">
        <div className="relative w-16 h-16 bg-slate-900/90 border border-cyan-400/40 rounded-full backdrop-blur-sm">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-cyan-400 text-xs">N</div>
          </div>
          <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-0.5 h-6 bg-gradient-to-b from-cyan-400 to-transparent"></div>
          <div className="absolute top-1/2 right-1 transform -translate-y-1/2 h-0.5 w-6 bg-gradient-to-r from-emerald-400 to-transparent"></div>
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-0.5 h-6 bg-gradient-to-t from-blue-400 to-transparent"></div>
          <div className="absolute top-1/2 left-1 transform -translate-y-1/2 h-0.5 w-6 bg-gradient-to-l from-emerald-400 to-transparent"></div>
        </div>
      </div>

      {/* Signal strength indicators */}
      <div className="absolute top-1/2 left-8 space-y-1">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          <div className="text-emerald-400 text-xs">SAT-1</div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          <div className="text-cyan-400 text-xs">SAT-2</div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="text-blue-400 text-xs">SAT-3</div>
        </div>
      </div>
    </div>
  );
}