'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Satellite, Loader2, AlertCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface SentinelHubMethaneLayerProps {
  regionId: string;
  bbox: [number, number, number, number];
  centerLat: number;
  centerLon: number;
}

export function SentinelHubMethaneLayer({
  regionId,
  bbox,
  centerLat,
  centerLon,
}: SentinelHubMethaneLayerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLayer, setShowLayer] = useState(true);
  const methaneLayerRef = useRef<L.TileLayer | null>(null);
  const attemptRef = useRef<number>(0);

  useEffect(() => {
    // Ensure the container exists before initializing; allow init even while loading
    if (!containerRef.current || mapRef.current) return;

    try {
      // Initialize map
      const map = L.map(containerRef.current, {
        center: [centerLat, centerLon],
        zoom: 5,
        zoomControl: true,
      });

      mapRef.current = map;

      // Add base layer (EPSG:3857)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 10,
      }).addTo(map);

      // Add Sentinel Hub Sentinel-5P CH4 layer via proxy with retry strategy
      const instanceId = process.env.NEXT_PUBLIC_SENTINEL_HUB_INSTANCE_ID;
      if (!instanceId) {
        setError('Sentinel Hub not configured');
        setLoading(false);
      } else {
        const addLayerWithTimeRange = (timeRange: string) => {
          // Remove existing layer if present
          if (methaneLayerRef.current && map.hasLayer(methaneLayerRef.current)) {
            map.removeLayer(methaneLayerRef.current);
          }

          const proxyUrl = '/api/sentinel-wms';
          const methaneLayer = L.tileLayer.wms(proxyUrl, {
            layers: 'CH4',
            format: 'image/png',
            transparent: true,
            attribution: '© Sentinel Hub / Copernicus Sentinel-5P TROPOMI',
            opacity: 0.7,
            version: '1.3.0',
            crs: L.CRS.EPSG3857,
            // WMS/server hint for cached tiles
            // @ts-expect-error - tiled is a valid WMS parameter
            tiled: true,
            // @ts-expect-error - TIME is a valid WMS parameter
            time: timeRange,
          });

          methaneLayerRef.current = methaneLayer;

          let tilesLoaded = 0;
          const loadingTimeout: NodeJS.Timeout = setTimeout(() => {

          methaneLayer.on('loading', () => {
            console.log(`🔄 Loading Sentinel Hub tiles for ${regionId} (attempt ${attemptRef.current + 1})...`);
          });

          methaneLayer.on('tileload', () => {
            tilesLoaded++;
            console.log(`📦 Tile loaded for ${regionId} (${tilesLoaded} tiles)`);
            if (tilesLoaded > 0) {
              setLoading(false);
              setError(null);
            }
          });

          methaneLayer.on('tileerror', (error: unknown) => {
            console.error(`❌ Tile load error for ${regionId}:`, error);
          });

          methaneLayer.on('load', () => {
            console.log(`✅ Sentinel Hub layer initialized for ${regionId}`);
            setLoading(false);
            if (tilesLoaded === 0) {
              // No visible tiles loaded; likely transparent imagery for current timeRange
              // We'll trigger the timeout handler to potentially retry with expanded time range
            }
          });

          if (showLayer) methaneLayer.addTo(map);
            if (tilesLoaded === 0) {
              if (attemptRef.current === 0) {
                // Expand to last 30 days and retry once
                attemptRef.current = 1;
                const end = new Date();
                end.setDate(end.getDate() - 1);
                const start = new Date(end);
                start.setDate(start.getDate() - 30);
                const expanded = `${start.toISOString().split('T')[0]}/${end.toISOString().split('T')[0]}`;
                console.warn(`⏱️ No tiles loaded for ${regionId} with 7-day window; retrying with 30-day window ${expanded}`);
                addLayerWithTimeRange(expanded);
              } else {
                setError('No Sentinel-5P CH₄ imagery for this region/time window. Falling back to model estimates.');
                setLoading(false);
              }
            }
          }, 15000);

          return () => clearTimeout(loadingTimeout);
        };

        // First attempt: last 7 days (yesterday back 7)
        const endDate = new Date();
        endDate.setDate(endDate.getDate() - 1);
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 7);
        const initialRange = `${startDate.toISOString().split('T')[0]}/${endDate.toISOString().split('T')[0]}`;
        addLayerWithTimeRange(initialRange);
      }

      // Fit bounds to region
      const bounds = L.latLngBounds(
        L.latLng(bbox[1], bbox[0]), // SW corner
        L.latLng(bbox[3], bbox[2])  // NE corner
      );
      map.fitBounds(bounds);

    } catch (err) {
      console.error('Error initializing Sentinel Hub map:', err);
      setError('Failed to load map');
      setLoading(false);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [regionId, bbox, centerLat, centerLon]);

  useEffect(() => {
    if (!mapRef.current || !methaneLayerRef.current) return;

    if (showLayer) {
      methaneLayerRef.current.addTo(mapRef.current);
    } else {
      mapRef.current.removeLayer(methaneLayerRef.current);
    }
  }, [showLayer]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Satellite className="h-5 w-5 text-blue-500" />
            Sentinel-5P Methane Imagery
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Sentinel Hub
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Controls */}
        <div className="mb-3 flex items-center space-x-2">
          <Switch
            id={`methane-layer-${regionId}`}
            checked={showLayer}
            onCheckedChange={setShowLayer}
          />
          <Label htmlFor={`methane-layer-${regionId}`} className="text-sm">
            Show CH₄ Layer
          </Label>
        </div>

        {/* Map container is always mounted so Leaflet can initialize immediately */}
        <div className="relative">
          <div
            ref={containerRef}
            className="h-64 w-full rounded-lg border"
            style={{ zIndex: 0 }}
          />

          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          )}

          {/* Error overlay */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-yellow-50/90 dark:bg-yellow-950/70">
              <div className="text-center space-y-2 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto text-yellow-500" />
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 text-xs text-muted-foreground space-y-1">
          <p>• Source: Sentinel-5P TROPOMI via Sentinel Hub</p>
          <p>• Visual overlay of methane concentrations</p>
          <p>• Data may be sparse at high latitudes in October</p>
        </div>
      </CardContent>
    </Card>
  );
}
