import React from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function ArcticBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Arctic landscape base */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1663302310053-03e5a0554505?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmN0aWMlMjBwb2xhciUyMGxhbmRzY2FwZSUyMHNub3clMjBtb3VudGFpbnN8ZW58MXx8fHwxNzU5MjA0NTkwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Arctic landscape"
          className="w-full h-full object-cover"
        />
        {/* Dark overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/80 to-slate-800/70" />
      </div>

      {/* Aurora borealis effects */}
      <div className="absolute inset-0 opacity-60">
        {/* Northern lights gradient 1 */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-emerald-400/30 via-cyan-400/20 to-transparent rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '4s' }} />
        
        {/* Northern lights gradient 2 */}
        <div className="absolute top-16 right-1/3 w-80 h-80 bg-gradient-to-bl from-cyan-300/25 via-blue-400/20 to-transparent rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '6s', animationDelay: '2s' }} />
        
        {/* Northern lights gradient 3 */}
        <div className="absolute top-8 left-1/2 w-64 h-64 bg-gradient-to-r from-emerald-300/20 via-teal-400/15 to-transparent rounded-full blur-2xl animate-pulse" 
             style={{ animationDuration: '5s', animationDelay: '1s' }} />
      </div>

      {/* Atmospheric glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/20 to-slate-950/60" />
    </div>
  );
}