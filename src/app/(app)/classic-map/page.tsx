'use client';

import { PageHeader } from '@/components/page-header';
import { GoogleMapsSatelliteMap } from '@/components/dashboard/google-maps-satellite-map';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Cpu, Layers3, MapPinned } from 'lucide-react';

export default function ClassicMapPage() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader
  title="Google Satellite Intelligence"
  description="Operational Arctic command center leveraging Google Maps satellite basemaps with Cryo-Scope overlays."
      />
      <main className="flex-1 overflow-auto p-4 pt-0 md:p-6 md:pt-0">
        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          <GoogleMapsSatelliteMap />
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers3 className="h-5 w-5 text-sky-500" />
                  Mission Layer Stack
                </CardTitle>
                <CardDescription>Live datasets synchronized with the embedded workspace.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between rounded border border-sky-500/40 bg-sky-500/10 p-3">
                  <span>LST Thermal Anomalies (MOD11A2)</span>
                  <Badge variant="secondary" className="bg-sky-900/30 text-sky-200 border-sky-500/50">
                    Live Tiles
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded border border-amber-500/40 bg-amber-500/10 p-3">
                  <span>Methane Flux (GOSAT Proxy)</span>
                  <Badge variant="secondary" className="bg-amber-900/30 text-amber-200 border-amber-500/50">
                    Modeled Flux
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded border border-emerald-500/40 bg-emerald-500/10 p-3">
                  <span>Permafrost Instability Index</span>
                  <Badge variant="secondary" className="bg-emerald-900/30 text-emerald-200 border-emerald-500/50">
                    Hybrid Signal
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Rapid Response Checklist
                </CardTitle>
                <CardDescription>Satellite-informed sequencing for ground teams.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="rounded border border-red-500/40 bg-red-500/10 p-3">
                  <p className="font-semibold text-red-600">1. Validate hotspot coordinates.</p>
                  <p className="text-muted-foreground">
                    Cross-reference Earth Engine pixels with GNSS fix ±10m before deployment.
                  </p>
                </div>
                <div className="rounded border border-yellow-500/40 bg-yellow-500/10 p-3">
                  <p className="font-semibold text-yellow-600">2. Capture SAR & optical evidence.</p>
                  <p className="text-muted-foreground">
                    Upload to the mission drive to refine the satellite composite overlays.
                  </p>
                </div>
                <div className="rounded border border-blue-500/40 bg-blue-500/10 p-3">
                  <p className="font-semibold text-blue-600">3. Log methane diagnostics.</p>
                  <p className="text-muted-foreground">
                    Stream ppm/ppb readings back to the operations console for anomaly tagging.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPinned className="h-5 w-5 text-primary" />
                  Mission Bookmarks
                </CardTitle>
                <CardDescription>Priority viewports stored in Earth Engine assets.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between rounded border border-primary/30 bg-primary/10 p-3">
                  <span>Yamal Peninsula, Russia</span>
                  <Badge variant="outline" className="border-primary/50 text-primary">
                    CRITICAL
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded border border-primary/30 bg-primary/10 p-3">
                  <span>Prudhoe Bay, Alaska</span>
                  <Badge variant="outline" className="border-primary/50 text-primary">
                    HIGH
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded border border-primary/30 bg-primary/10 p-3">
                  <span>Banks Island, Canada</span>
                  <Badge variant="outline" className="border-primary/50 text-primary">
                    HIGH
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded border border-primary/30 bg-primary/10 p-3">
                  <span>Ilulissat Icefjord, Greenland</span>
                  <Badge variant="outline" className="border-primary/50 text-primary">
                    ELEVATED
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-purple-500" />
                  Data Flow & Telemetry
                </CardTitle>
                <CardDescription>Secure streaming from Earth Engine into Cryo-Scope analytics.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between rounded border border-purple-500/40 bg-purple-500/10 p-3">
                  <span>Tile Refresh Cadence</span>
                  <Badge variant="secondary" className="bg-purple-900/30 text-purple-200 border-purple-500/50">
                    30s
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded border border-purple-500/40 bg-purple-500/10 p-3">
                  <span>Auth Channel</span>
                  <Badge variant="secondary" className="bg-purple-900/30 text-purple-200 border-purple-500/50">
                    API Token
                  </Badge>
                </div>
                <div className="rounded border border-purple-500/40 bg-purple-500/10 p-3 text-muted-foreground">
                  Load the API key via <code className="rounded bg-slate-900/80 px-1 py-0.5 text-[0.75rem] text-purple-200">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> and sync telemetry from Cryo-Scope analytics.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
