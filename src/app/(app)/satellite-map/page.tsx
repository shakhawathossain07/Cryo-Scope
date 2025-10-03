'use client';

import dynamic from 'next/dynamic';
import { PageHeader } from '@/components/page-header';

// Import PrecisionMapViewer with SSR disabled to avoid Leaflet window errors
const PrecisionMapViewer = dynamic(
  () => import('@/components/satellite-map/precision-map-viewer').then(mod => ({ default: mod.PrecisionMapViewer })),
  { ssr: false }
);

export default function SatelliteMapPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader
        heading="Military-Grade Satellite Intelligence"
        text="Real-time high-resolution satellite imagery with precise geolocation and permafrost monitoring across Arctic regions"
      />
      
      <div className="space-y-4">
        <PrecisionMapViewer />
      </div>
    </div>
  );
}
