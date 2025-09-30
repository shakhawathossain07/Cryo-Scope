'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, PlugZap, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoogleEarthEngineMapProps {
  className?: string;
}

export function GoogleEarthEngineMap({ className }: GoogleEarthEngineMapProps) {
  const configuredUrl = useMemo(() => {
    const envUrl = process.env.NEXT_PUBLIC_GEE_WEBAPP_URL;
    if (!envUrl) {
      return null;
    }

    const trimmed = envUrl.trim();
    if (trimmed.length === 0 || !trimmed.startsWith('http')) {
      return null;
    }

    return trimmed;
  }, []);

  const hasConfiguredUrl = Boolean(configuredUrl);

  return (
    <Card className={cn('h-full overflow-hidden', className)}>
      <CardHeader className="flex flex-col gap-2 bg-slate-950 text-slate-50">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-lg font-semibold">
            Google Earth Engine Operations Portal
          </CardTitle>
          {hasConfiguredUrl ? (
            <Button asChild size="sm" variant="secondary" className="gap-2">
              <a href={configuredUrl!} target="_blank" rel="noopener noreferrer">
                Open Console
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="gap-2" disabled>
              <PlugZap className="h-4 w-4" />
              Awaiting Configuration
            </Button>
          )}
        </div>
        <CardDescription className="text-slate-300">
          High-resolution Arctic overlays rendered via Earth Engine tileserver with live update cadence.
        </CardDescription>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="border-emerald-500/40 text-emerald-300">
            Thermal Anomaly LST
          </Badge>
          <Badge variant="outline" className="border-sky-500/40 text-sky-300">
            Methane Flux (COPERNICUS)
          </Badge>
          <Badge variant="outline" className="border-amber-500/40 text-amber-300">
            Permafrost Stability Model
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {hasConfiguredUrl ? (
          <div className="relative aspect-[4/3] bg-slate-900">
            <iframe
              src={configuredUrl!}
              title="Google Earth Engine Arctic Monitoring"
              className="h-full w-full border-0"
              allow="accelerometer; fullscreen; clipboard-write"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex h-full flex-col gap-6 p-8 text-slate-100">
            <div className="flex items-start gap-3 rounded border border-yellow-500/40 bg-yellow-500/10 p-4">
              <ShieldAlert className="mt-1 h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-semibold text-yellow-600">Custom Earth Engine workspace not connected.</p>
                <p className="text-sm text-yellow-600/80">
                  Provide a mission-specific Web App URL so the operations console can stream tiles inside Cryo-Scope.
                </p>
              </div>
            </div>
            <div className="space-y-3 rounded border border-slate-700 bg-slate-900/80 p-4 text-sm">
              <p className="font-semibold text-slate-200">Configure in <code>.env.local</code></p>
              <pre className="whitespace-pre-wrap rounded bg-slate-950/60 p-3 text-xs text-slate-300">
NEXT_PUBLIC_GEE_WEBAPP_URL=https://earthengine.googleapis.com/map/your-app-id
              </pre>
              <p className="text-slate-300">
                Share the URL from the Earth Engine Code Editor &gt; <span className="font-semibold">Deploy &amp; Manage</span> pane.
                Make sure the app allows access to your Cryo-Scope service account or IP range.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
