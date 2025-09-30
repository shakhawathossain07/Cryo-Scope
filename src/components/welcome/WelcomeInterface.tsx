'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function WelcomeInterface() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/dashboard');
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
      <div className="text-center space-y-8 max-w-2xl">
        {/* Main title */}
        <div className="space-y-4">
          <h1 className="text-6xl bg-gradient-to-r from-cyan-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
            CRYO-SCOPE
          </h1>
          <h2 className="text-2xl text-cyan-300">
            Arctic permafrost and methane monitoring system
          </h2>
          <div className="h-px w-64 mx-auto bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
        </div>

        {/* Status display */}
        <div className="bg-slate-900/60 border border-cyan-400/30 rounded-lg p-6 backdrop-blur-sm">
          <div className="grid grid-cols-2 gap-6">
            <div className="text-left">
              <div className="text-cyan-400 text-sm">Real-Time Satellite Monitoring</div>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse mr-2"></div>
                <span className="text-emerald-400 text-xs">ONLINE</span>
              </div>
            </div>
            <div className="text-left">
              <div className="text-cyan-400 text-sm">Methane Risk Assessment</div>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse mr-2"></div>
                <span className="text-emerald-400 text-xs">ACTIVE</span>
              </div>
            </div>
            <div className="text-left">
              <div className="text-cyan-400 text-sm">Climate Data Visualization</div>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse mr-2"></div>
                <span className="text-cyan-400 text-xs">READY</span>
              </div>
            </div>
            <div className="text-left">
              <div className="text-cyan-400 text-sm">Mission-Critical Interface</div>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse mr-2"></div>
                <span className="text-blue-400 text-xs">SECURE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white border-0 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
          >
            Get Started
          </Button>
        </div>

        {/* Mission info */}
        <div className="text-center space-y-2 text-sm text-cyan-300/80">
          <p>Monitor and predict permafrost thaw and methane emissions in Arctic regions</p>
          <p>Real-time satellite surveillance • Advanced cryosphere analysis</p>
          <div className="flex items-center justify-center space-x-4 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
            <div className="w-px h-4 bg-cyan-400/30"></div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <span>Secure</span>
            </div>
            <div className="w-px h-4 bg-cyan-400/30"></div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>Classified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}