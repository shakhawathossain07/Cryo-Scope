'use client';

import { cn } from '@/lib/utils';

interface FloatingElementsProps {
  className?: string;
}

export function FloatingElements({ className }: FloatingElementsProps) {
  return (
    <div className={cn('fixed inset-0 -z-10 pointer-events-none overflow-hidden', className)}>
      {/* Floating Holograms */}
      <div className="absolute top-20 left-20 animate-float-slow">
        <div className="relative">
          <div className="w-32 h-32 border border-cyan-400/30 rounded-lg backdrop-blur-sm bg-cyan-500/5 transform rotate-12 animate-pulse-glow">
            <div className="absolute inset-2 border border-cyan-300/20 rounded animate-spin-slow">
              <div className="absolute top-2 left-2 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
              <div className="absolute bottom-2 right-2 w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Data Cubes */}
      <div className="absolute top-1/3 right-32 animate-float-reverse">
        <div className="relative group">
          <div className="w-20 h-20 border border-amber-400/40 bg-amber-500/10 transform rotate-45 animate-rotate-3d">
            <div className="absolute inset-1 border border-amber-300/30 animate-counter-rotate">
              <div className="absolute inset-1 bg-gradient-to-br from-amber-400/20 to-transparent rounded-sm"></div>
            </div>
          </div>
          <div className="absolute -top-2 -left-2 w-6 h-6 border border-orange-400/50 bg-orange-500/20 rounded transform -rotate-12 animate-bob"></div>
        </div>
      </div>

      {/* Scanning Grid */}
      <div className="absolute bottom-40 left-1/4 animate-float">
        <div className="relative">
          <div className="w-40 h-24 border border-green-400/30 bg-green-500/5 backdrop-blur-sm rounded-lg">
            <div className="grid grid-cols-8 grid-rows-4 gap-1 p-2 h-full">
              {Array.from({ length: 32 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'rounded-sm transition-all duration-300',
                    i % 7 === 0 ? 'bg-green-400/60 animate-pulse animate-delay-1' :
                    i % 5 === 0 ? 'bg-emerald-400/40 animate-ping animate-delay-2' :
                    'bg-green-300/20'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Radar Sweep */}
      <div className="absolute top-1/2 right-20 animate-float-slow">
        <div className="relative w-36 h-36">
          <div className="absolute inset-0 border border-blue-400/30 rounded-full">
            <div className="absolute inset-2 border border-blue-300/20 rounded-full">
              <div className="absolute inset-4 border border-blue-200/10 rounded-full">
                <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-blue-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-ping"></div>
              </div>
            </div>
          </div>
          {/* Radar sweep line */}
          <div className="absolute top-1/2 left-1/2 w-16 h-0.5 bg-gradient-to-r from-blue-400 to-transparent transform -translate-y-1/2 origin-left animate-radar-sweep"></div>
          {/* Blips */}
          <div className="absolute top-6 right-8 w-1 h-1 bg-red-400 rounded-full animate-pulse"></div>
          <div className="absolute bottom-8 left-10 w-1 h-1 bg-yellow-400 rounded-full animate-ping"></div>
        </div>
      </div>

      {/* Matrix Rain Effect */}
      <div className="absolute top-0 right-0 w-32 h-full opacity-20">
        <div className="flex h-full">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex-1 relative">
              <div className={cn(
                "absolute top-0 w-full h-20 bg-gradient-to-b from-green-400 to-transparent animate-matrix-rain",
                i === 0 ? 'animate-delay-1' :
                i === 1 ? 'animate-delay-2' :
                i === 2 ? 'animate-delay-3' :
                i === 3 ? 'animate-delay-4' :
                'animate-delay-5'
              )}></div>
            </div>
          ))}
        </div>
      </div>

      {/* Pulsing Orbs */}
      <div className="absolute bottom-20 right-1/3">
        <div className="relative">
          <div className="w-8 h-8 bg-purple-500/30 rounded-full animate-pulse-orb"></div>
          <div className="absolute -top-4 -left-4 w-16 h-16 border border-purple-400/20 rounded-full animate-ping"></div>
        </div>
      </div>

      <div className="absolute top-2/3 left-1/3">
        <div className="relative">
          <div className="w-6 h-6 bg-pink-500/40 rounded-full animate-pulse-orb animate-delay-5"></div>
          <div className="absolute -top-3 -left-3 w-12 h-12 border border-pink-400/30 rounded-full animate-ping animate-delay-5"></div>
        </div>
      </div>

      {/* Holographic Text */}
      <div className="absolute top-16 right-1/4 animate-float-reverse">
        <div className="text-xs font-mono text-cyan-400/60 transform rotate-3 space-y-1">
          <div className="animate-typing">SATELLITE_LINK: ACTIVE</div>
          <div className="animate-typing animate-delay-2">METHANE_LEVELS: MONITORING</div>
          <div className="animate-typing animate-delay-5">ARCTIC_SCAN: IN_PROGRESS</div>
        </div>
      </div>

      {/* Data Streams */}
      <div className="absolute bottom-1/4 left-16">
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center space-x-1 text-xs font-mono text-emerald-400/50",
                i === 0 ? 'animate-delay-1' :
                i === 1 ? 'animate-delay-2' :
                i === 2 ? 'animate-delay-3' :
                i === 3 ? 'animate-delay-4' :
                'animate-delay-5'
              )}
            >
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <div className="w-20 h-px bg-gradient-to-r from-emerald-400/60 to-transparent animate-data-stream"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}