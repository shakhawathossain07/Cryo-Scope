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
        preferCanvas: true, // Better performance for overlays
        renderer: L.canvas(), // Use canvas renderer for better rendering
      });

      // Add base layer with fallback strategy
      // Use OpenStreetMap as reliable base (works globally including Arctic)
      const baseLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 10,
          minZoom: 2,
          tileSize: 256,
          subdomains: ['a', 'b', 'c'],
          errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
          crossOrigin: true,
        }
      );

      baseLayer.addTo(map);

      mapRef.current = map;
      mapInitialized.current = true;

      console.log(`✅ [NASA CH4 Map] Map initialized for ${regionName}`);

      // Force map to invalidate size after multiple delays to ensure proper rendering
      setTimeout(() => {
        map.invalidateSize();
        console.log(`🔄 [NASA CH4 Map] First size invalidation for ${regionName}`);
      }, 100);
      
      setTimeout(() => {
        map.invalidateSize();
        console.log(`🔄 [NASA CH4 Map] Second size invalidation for ${regionName}`);
      }, 500);
      
      setTimeout(() => {
        map.invalidateSize();
        console.log(`🔄 [NASA CH4 Map] Final size invalidation for ${regionName}`);
      }, 1000);

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

        // CRITICAL FIX: Arctic has NO data in October (polar night)
        // Use last AVAILABLE data from summer months (May-September)
        const currentMonth = new Date().getMonth(); // 0-11 (October = 9)
        
        let endDate: Date;
        let startDate: Date;
        
        // If we're in polar night months (October-March), use summer data
        if (currentMonth >= 9 || currentMonth <= 2) {
          // Use data from most recent summer (May-September)
          endDate = new Date(new Date().getFullYear(), 8, 30); // Sept 30
          startDate = new Date(endDate);
          startDate.setMonth(startDate.getMonth() - 4); // May 1 - Sept 30
          console.log(`   ❄️ Polar night period - using summer archive data`);
        } else {
          // Use recent 30-day data (sunlight available)
          endDate = new Date();
          startDate = new Date(endDate);
          startDate.setDate(startDate.getDate() - 30);
        }

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
          
          // Check if it's a "no data" error (expected) vs actual error
          const errorMsg = errorData.error || `HTTP ${response.status}`;
          const isNoDataError = errorMsg.includes('No data available') || 
                                errorMsg.includes('no data') || 
                                response.status === 404;
          
          if (isNoDataError) {
            // This is expected for Arctic regions in October - don't throw, just show info
            console.warn(`   ⚠️ No CH4 data available for ${regionName} (expected for October)`);
            setError('Limited satellite coverage for this region/season');
            setDebugInfo('⚠️ No data - sparse Arctic coverage');
            setLoading(false);
            return; // Don't throw error
          }
          
          throw new Error(errorMsg);
        }

        const blob = await response.blob();
        console.log(`   🖼️ Blob size: ${blob.size} bytes, type: ${blob.type}`);

        if (blob.size === 0) {
          console.warn(`   ⚠️ Empty image received for ${regionName} - no CH4 data available`);
          setError('Limited satellite coverage for this region/season');
          setDebugInfo('⚠️ No data - sparse Arctic coverage');
          setLoading(false);
          return; // Don't throw error for empty data
        }
        
        // Check if image is very small (likely transparent/no data)
        if (blob.size < 2000) {
          console.warn(`   ⚠️ Very small image (${blob.size} bytes) - sparse CH4 data for ${regionName}`);
          // Continue anyway - will display what little data exists
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

        // Add methane overlay with MAXIMUM opacity for visibility
        methaneLayerRef.current = L.imageOverlay(imageUrl, bounds, {
          opacity: 0.95, // Maximum visibility for CH4 layer
          interactive: false,
          className: 'nasa-ch4-overlay', // For debugging in DevTools
          crossOrigin: 'anonymous', // Enable CORS
          errorOverlayUrl: '', // Prevent error tile cascade
        }).addTo(mapRef.current!);

        console.log(`   ✅ CH4 overlay added to map with 95% opacity`);

        // Verify overlay was added
        if (!methaneLayerRef.current) {
          throw new Error('Failed to add overlay to map');
        }

        setImageData(imageUrl);
        setDataDate(`${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`);
        setDebugInfo(`✅ ${(blob.size / 1024).toFixed(1)}KB CH₄ layer loaded`);
        
        console.log(`✅ [NASA CH4 Viz] Successfully loaded methane visualization for ${regionName}`);
        console.log(`   🎨 Image Size: ${(blob.size / 1024).toFixed(2)} KB`);
        console.log(`   📊 Layer opacity: 95%`);
        console.log(`========================================\n`);

      } catch (err: any) {
        // Distinguish between expected data availability issues and actual errors
        const isDataAvailabilityIssue = 
          err.message?.includes('No data') || 
          err.message?.includes('no data') ||
          err.message?.includes('404') ||
          err.message?.includes('empty image');
        
        if (isDataAvailabilityIssue) {
          // Expected issue - just log as warning
          console.warn(`⚠️ [NASA CH4 Viz] Limited data for ${regionName}:`, err.message);
          setError('Limited satellite coverage for this region/season');
          setDebugInfo('⚠️ Sparse Arctic coverage');
        } else {
          // Unexpected error - log as error
          console.error(`\n❌ [NASA CH4 Viz] ========================================`);
          console.error(`❌ [NASA CH4 Viz] Unexpected error loading ${regionName}:`, err);
          console.error(`❌ [NASA CH4 Viz] ========================================\n`);
          setError(err.message || 'Failed to load methane data');
          setDebugInfo(`Error: ${err.message}`);
        }
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
              <div className="flex flex-col items-end">
                <span className="text-xs text-muted-foreground">
                  {dataDate}
                </span>
                {/* Show archive indicator during polar night */}
                {(new Date().getMonth() >= 9 || new Date().getMonth() <= 2) && (
                  <span className="text-[10px] text-amber-400">
                    (Summer archive)
                  </span>
                )}
              </div>
            )}
            {debugInfo && (
              <span className="text-xs text-blue-400 font-mono">
                {debugInfo}
              </span>
            )}
          </div>
        </div>

        {/* Map Container */}
        <div className="relative w-full h-80 rounded-lg border overflow-hidden">
          {/* Leaflet map */}
          <div ref={containerRef} className="absolute inset-0 z-0" />

          {/* Color Scale Legend - Only show when layer is active */}
          {showLayer && imageData && !loading && !error && (
            <div className="absolute bottom-2 right-2 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-lg p-2 shadow-lg text-xs">
              <div className="font-semibold mb-1 text-center">CH₄ (ppb)</div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-12 bg-gradient-to-t from-blue-500 via-green-500 via-yellow-500 via-orange-500 to-red-500 rounded"></div>
                <div className="flex flex-col justify-between h-12 text-[10px] text-muted-foreground">
                  <div>2200+</div>
                  <div>2000</div>
                  <div>1800</div>
                </div>
              </div>
            </div>
          )}

          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <div className="text-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto" />
                <p className="text-xs text-white">Loading CH₄ data...</p>
              </div>
            </div>
          )}

          {/* Error/Info overlay */}
          {error && !loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-amber-500/5 dark:bg-amber-500/10 z-10">
              <div className="text-center space-y-2 p-4 max-w-xs">
                <Info className="h-7 w-7 mx-auto text-amber-500" />
                <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
                  Limited Satellite Coverage
                </p>
                <p className="text-xs text-muted-foreground">
                  {error}
                </p>
                <div className="text-[10px] text-muted-foreground space-y-1 pt-2 border-t border-amber-200 dark:border-amber-800">
                  <p className="italic">Arctic regions above 60°N have sparse</p>
                  <p className="italic">CH₄ data in October due to limited sunlight</p>
                  <p className="font-semibold text-amber-600 dark:text-amber-400 mt-2">
                    Best coverage: May-September
                  </p>
                </div>
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
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-2 flex-1">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-semibold text-blue-900 dark:text-blue-100">
                  Sentinel-5P CH₄ Visualization
                </p>
                <ul className="text-blue-800 dark:text-blue-200 space-y-0.5">
                  <li>• TROPOMI satellite: 7×7 km resolution</li>
                  <li>• 30-day composite (most recent data)</li>
                  <li>• Color scale: 1700-2200+ ppb CH₄</li>
                </ul>
              </div>
            </div>
            {imageData && !loading && !error && (
              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30 ml-2">
                ✓ Active
              </Badge>
            )}
          </div>
          {debugInfo && (
            <p className="font-mono text-blue-600 dark:text-blue-400 pt-1 border-t border-blue-200 dark:border-blue-800">
              {debugInfo}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
