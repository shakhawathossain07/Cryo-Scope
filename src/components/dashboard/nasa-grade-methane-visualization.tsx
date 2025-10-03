'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Satellite, Loader2, AlertCircle, Info } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface NASAGradeMethaneVisualizationProps {
  regionId: string;
  regionName: string;
  bbox: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
  centerLat: number;
  centerLon: number;
}

export function NASAGradeMethaneVisualization({
  regionId,
  regionName,
  bbox,
  centerLat,
  centerLon,
}: NASAGradeMethaneVisualizationProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [showLayer, setShowLayer] = useState(true);
  const [dataDate, setDataDate] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const methaneLayerRef = useRef<L.ImageOverlay | null>(null);
  const mapInitialized = useRef<boolean>(false);

  // Initialize map - MILITARY GRADE PRECISION
  useEffect(() => {
    if (!containerRef.current || mapInitialized.current) return;

    console.log(`🗺️ [NASA CH4 Map] Initializing map for ${regionName}...`);
    console.log(`   📍 Center: ${centerLat.toFixed(6)}°N, ${centerLon.toFixed(6)}°${centerLon >= 0 ? 'E' : 'W'}`);
    console.log(`   📦 BBox: [${bbox.join(', ')}]`);

    try {
      // Create map centered on region with proper coordinates
      const map = L.map(containerRef.current, {
        center: [centerLat, centerLon],
        zoom: 4,
        minZoom: 2,
        maxZoom: 10,
        zoomControl: true,
        scrollWheelZoom: false,
        doubleClickZoom: true,
        dragging: true,
        worldCopyJump: false, // Critical for Alaska (crosses dateline)
        maxBounds: L.latLngBounds(
          L.latLng(bbox[1] - 10, bbox[0] - 10), // Southwest with buffer
          L.latLng(bbox[3] + 10, bbox[2] + 10)  // Northeast with buffer
        ),
        maxBoundsViscosity: 0.7,
      });

      // Add NASA GIBS base layer (Arctic-friendly)
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      
      const baseLayer = L.tileLayer(
        `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${dateStr}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`,
        {
          attribution: '© NASA GIBS',
          maxZoom: 9,
          tileSize: 256,
          errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
        }
      );

      baseLayer.on('tileerror', (error) => {
        console.warn(`⚠️ [${regionName}] Tile load error:`, error);
      });

      baseLayer.on('tileload', () => {
        console.log(`✅ [${regionName}] Base layer tiles loading...`);
      });

      baseLayer.addTo(map);

      mapRef.current = map;
      mapInitialized.current = true;

      console.log(`✅ [NASA CH4 Map] Map initialized for ${regionName}`);

      // Force map to invalidate size after a short delay
      setTimeout(() => {
        map.invalidateSize();
      }, 100);

    } catch (err) {
      console.error(`❌ [NASA CH4 Map] Failed to initialize map for ${regionName}:`, err);
      setError(`Map initialization failed: ${err}`);
    }

    return () => {
      if (mapRef.current) {
        console.log(`🧹 [NASA CH4 Map] Cleaning up map for ${regionName}`);
        mapRef.current.remove();
        mapRef.current = null;
        mapInitialized.current = false;
      }
    };
  }, [regionName, centerLat, centerLon, bbox]);

  // Load and display methane data - MILITARY GRADE PRECISION
  useEffect(() => {
    // Wait for map to be fully initialized
    if (!mapRef.current || !mapInitialized.current) {
      console.log(`⏳ [NASA CH4 Viz] Waiting for map initialization for ${regionName}...`);
      return;
    }

    if (!showLayer) {
      // Remove methane layer if toggled off
      if (methaneLayerRef.current) {
        console.log(`👁️ [NASA CH4 Viz] Hiding CH4 layer for ${regionName}`);
        methaneLayerRef.current.remove();
        methaneLayerRef.current = null;
      }
      setLoading(false);
      return;
    }

    const loadMethaneData = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log(`\n🔬 [NASA CH4 Viz] ========================================`);
        console.log(`🔬 [NASA CH4 Viz] Loading methane data for ${regionName}`);
        console.log(`🔬 [NASA CH4 Viz] ========================================`);

        // Convert bbox to EPSG:3857 (Web Mercator) for Sentinel Hub
        // bbox format: [minLon, minLat, maxLon, maxLat]
        const R = 6378137; // Earth radius in meters
        
        const minLon = bbox[0];
        const minLat = bbox[1];
        const maxLon = bbox[2];
        const maxLat = bbox[3];

        // Web Mercator transformation
        const minX = (minLon * Math.PI * R) / 180;
        const minY = Math.log(Math.tan((Math.PI / 4) + ((minLat * Math.PI) / 360))) * R;
        const maxX = (maxLon * Math.PI * R) / 180;
        const maxY = Math.log(Math.tan((Math.PI / 4) + ((maxLat * Math.PI) / 360))) * R;

        const projectedBbox = [minX, minY, maxX, maxY];

        console.log(`   📦 WGS84 BBox: [${minLon}, ${minLat}, ${maxLon}, ${maxLat}]`);
        console.log(`   📦 EPSG:3857 BBox: [${projectedBbox.map(v => v.toFixed(2)).join(', ')}]`);

        // Get data for last 30 days (more data for Arctic regions with limited coverage)
        const endDate = new Date();
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 30);

        const timeRange = {
          from: startDate.toISOString().split('T')[0] + 'T00:00:00Z',
          to: endDate.toISOString().split('T')[0] + 'T23:59:59Z'
        };

        console.log(`   📅 Time Range: ${timeRange.from} → ${timeRange.to}`);

        const requestBody = {
          bbox: projectedBbox,
          width: 512,
          height: 512,
          timeRange
        };

        console.log(`   🚀 Fetching from /api/sentinel-processing...`);

        const response = await fetch('/api/sentinel-processing', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        console.log(`   📡 Response status: ${response.status} ${response.statusText}`);
        console.log(`   📏 Response size: ${response.headers.get('content-length')} bytes`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const blob = await response.blob();
        console.log(`   🖼️ Blob size: ${blob.size} bytes, type: ${blob.type}`);

        if (blob.size === 0) {
          throw new Error('Received empty image from API');
        }

        const imageUrl = URL.createObjectURL(blob);

        // Remove previous methane layer if exists
        if (methaneLayerRef.current) {
          console.log(`   🧹 Removing previous CH4 overlay`);
          methaneLayerRef.current.remove();
          methaneLayerRef.current = null;
        }

        // CRITICAL: Leaflet bounds are [southwest, northeast]
        // southwest = [minLat, minLon], northeast = [maxLat, maxLon]
        const bounds = L.latLngBounds(
          L.latLng(minLat, minLon), // southwest corner
          L.latLng(maxLat, maxLon)  // northeast corner
        );

        console.log(`   🗺️ Leaflet Bounds: SW[${minLat}, ${minLon}], NE[${maxLat}, ${maxLon}]`);

        // Add methane overlay with HIGH opacity for visibility
        methaneLayerRef.current = L.imageOverlay(imageUrl, bounds, {
          opacity: 0.85, // Increased from 0.7 for better visibility
          interactive: false,
          className: 'nasa-ch4-overlay', // For debugging in DevTools
        }).addTo(mapRef.current!);

        console.log(`   ✅ CH4 overlay added to map`);

        // Verify overlay was added
        if (!methaneLayerRef.current) {
          throw new Error('Failed to add overlay to map');
        }

        setImageData(imageUrl);
        setDataDate(`${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`);
        setDebugInfo(`Loaded ${blob.size} bytes`);
        
        console.log(`✅ [NASA CH4 Viz] Successfully loaded methane visualization for ${regionName}`);
        console.log(`========================================\n`);

      } catch (err: any) {
        console.error(`\n❌ [NASA CH4 Viz] ========================================`);
        console.error(`❌ [NASA CH4 Viz] Error loading ${regionName}:`, err);
        console.error(`❌ [NASA CH4 Viz] ========================================\n`);
        setError(err.message || 'Failed to load methane data');
        setDebugInfo(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    // Add small delay to ensure map is fully ready
    const timer = setTimeout(() => {
      loadMethaneData();
    }, 300);

    // Cleanup
    return () => {
      clearTimeout(timer);
      if (imageData) {
        URL.revokeObjectURL(imageData);
      }
    };
  }, [regionId, regionName, bbox, showLayer, mapInitialized.current]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Satellite className="h-4 w-4 text-blue-500" />
            {regionName}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Sentinel-5P CH₄
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          📍 {centerLat.toFixed(2)}°N, {Math.abs(centerLon).toFixed(2)}°{centerLon >= 0 ? 'E' : 'W'}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              id={`methane-layer-${regionId}`}
              checked={showLayer}
              onCheckedChange={setShowLayer}
            />
            <Label htmlFor={`methane-layer-${regionId}`} className="text-sm">
              Show CH₄ Layer
            </Label>
          </div>
          <div className="flex flex-col items-end">
            {dataDate && (
              <span className="text-xs text-muted-foreground">
                {dataDate}
              </span>
            )}
            {debugInfo && (
              <span className="text-xs text-blue-400 font-mono">
                {debugInfo}
              </span>
            )}
          </div>
        </div>

        {/* Map Container */}
        <div className="relative aspect-square w-full rounded-lg border overflow-hidden">
          {/* Leaflet map */}
          <div ref={containerRef} className="absolute inset-0 z-0" />

          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <div className="text-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto" />
                <p className="text-xs text-white">Loading CH₄ data...</p>
              </div>
            </div>
          )}

          {/* Error overlay */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-yellow-500/10 z-10">
              <div className="text-center space-y-2 p-4">
                <AlertCircle className="h-8 w-8 mx-auto text-yellow-500" />
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  {error}
                </p>
                <p className="text-xs text-muted-foreground">
                  Data may be unavailable for this region/time
                </p>
              </div>
            </div>
          )}

          {/* Color Scale Legend */}
          {showLayer && !loading && (
            <div className="absolute bottom-2 right-2 bg-black/80 rounded p-2 z-20">
              <div className="text-xs text-white space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-2 bg-red-500"></div>
                  <span>&gt;2100 ppb</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-2 bg-orange-500"></div>
                  <span>2000-2100</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-2 bg-yellow-500"></div>
                  <span>1900-2000</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-2 bg-green-500"></div>
                  <span>1800-1900</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-2 bg-blue-500"></div>
                  <span>&lt;1800 ppb</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3 space-y-1 text-xs">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold text-blue-900 dark:text-blue-100">
                NASA-Grade CH₄ Visualization
              </p>
              <ul className="text-blue-800 dark:text-blue-200 space-y-0.5">
                <li>• Source: TROPOMI Sentinel-5P satellite</li>
                <li>• Resolution: 7×7 km spatial, daily temporal</li>
                <li>• Color scale: Scientific methane concentration (ppb)</li>
                <li>• Data: Most recent 7-day window</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
