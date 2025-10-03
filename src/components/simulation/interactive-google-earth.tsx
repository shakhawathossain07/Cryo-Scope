'use client';

import { useEffect, useRef } from 'react';

export default function InteractiveGoogleEarth() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Placeholder: In real setup, initialize Google Earth Web or CesiumJS here
    // Keeps layout stable and avoids SSR import issues
  }, []);

  return (
    <div ref={containerRef} className="w-full min-h-[70vh] rounded-lg border flex items-center justify-center bg-muted/30">
      <div className="text-sm text-muted-foreground">
        Interactive Google Earth placeholder — integration pending.
      </div>
    </div>
  );
}
