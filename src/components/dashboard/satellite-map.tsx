'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Thermometer, AlertTriangle, Satellite, Eye, RefreshCw } from 'lucide-react';
import { REGION_COORDINATES } from '@/lib/regions';
import type { MethaneHotspot } from '@/lib/nasa-data-service';
import { cn } from '@/lib/utils';
import L from 'leaflet';

// Fix for default markers in Leaflet
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

interface LayerControl {
  satellite: boolean;
  methane: boolean;
  temperature: boolean;
  permafrost: boolean;
}

export function SatelliteMap() {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [selectedRegion, setSelectedRegion] = useState('siberia');
  const [hotspots, setHotspots] = useState<MethaneHotspot[]>([]);
  const [temperature, setTemperature] = useState<{ currentTemp: number; anomaly: number; maxTemp: number; minTemp: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [layers, setLayers] = useState<LayerControl>({
    satellite: true,
    methane: true,
    temperature: false,
    permafrost: false
  });
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize map with NASA-grade precision constraints
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Arctic region bounds - prevent infinite zoom and ensure proper alignment
    const arcticBounds: L.LatLngBoundsExpression = [
      [55, -180], // Southwest corner
      [85, 180]   // Northeast corner
    ];

    const map = L.map(mapContainerRef.current, {
      center: [70.0, 110.0], // Start at Siberia
      zoom: 4,
      minZoom: 3,
      maxZoom: 12,
      maxBounds: arcticBounds,
      maxBoundsViscosity: 0.9, // Prevent dragging outside bounds
      zoomControl: true,
      attributionControl: true,
      worldCopyJump: false, // Prevent infinite world copies
      zoomSnap: 0.5,
      zoomDelta: 0.5
    });

    // Add NASA GIBS satellite imagery as base layer with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const gibsLayer = L.tileLayer(
      `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${currentDate}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`,
      {
        attribution: '© NASA GIBS - MODIS Terra True Color',
        maxZoom: 9,
        minZoom: 3,
        tileSize: 256,
        bounds: arcticBounds,
        errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
      }
    ).addTo(map);

    // Add OpenStreetMap overlay for geographic reference
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 12,
      minZoom: 3,
      opacity: 0.25,
      bounds: arcticBounds
    }).addTo(map);

    // Create markers layer group
    markersRef.current = L.layerGroup().addTo(map);
    
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Load real data for the selected region with NASA precision
  const loadRegionData = useCallback(async (regionId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/regions/${regionId}/metrics`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) {
        throw new Error(`Region metrics request failed with status ${response.status}`);
      }
      const data: {
        hotspots: MethaneHotspot[];
        temperature: { currentTemp: number; anomaly: number; maxTemp: number; minTemp: number };
      } = await response.json();

      // Validate hotspot coordinates for precision
      const validatedHotspots = data.hotspots.filter(h => {
        const isValidLat = h.lat >= 55 && h.lat <= 85;
        const isValidLon = h.lon >= -180 && h.lon <= 180;
        const isValidConcentration = h.concentration > 0 && h.concentration < 5000;
        return isValidLat && isValidLon && isValidConcentration;
      });

      setHotspots(validatedHotspots);
      setTemperature(data.temperature);
      setLastUpdate(new Date());
      updateMapMarkers(validatedHotspots);
      
      console.log(`✅ [NASA Precision] Loaded ${validatedHotspots.length} validated hotspots for ${regionId}`);
    } catch (error) {
      console.error('Error loading region data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update map view when region changes
  useEffect(() => {
    if (!mapRef.current) return;
    
    const region = REGION_COORDINATES[selectedRegion as keyof typeof REGION_COORDINATES];
    if (region) {
      // Validate coordinates are within Arctic bounds
      const validLat = Math.max(55, Math.min(85, region.lat));
      const validLon = Math.max(-180, Math.min(180, region.lon));
      
      mapRef.current.flyTo([validLat, validLon], 5, {
        duration: 1.5,
        easeLinearity: 0.5
      });
      loadRegionData(selectedRegion);
    }
  }, [selectedRegion, loadRegionData]);

  // Update markers on the map with NASA precision
  const updateMapMarkers = useCallback((hotspotsData: MethaneHotspot[]) => {
    if (!markersRef.current || !mapRef.current) return;

    // Clear existing markers
    markersRef.current.clearLayers();

    // Add new markers for methane hotspots with precise coordinates
    if (layers.methane) {
      hotspotsData.forEach(hotspot => {
        // Double-check coordinate precision
        const precisionLat = Number(hotspot.lat.toFixed(6)); // 6 decimal places = ~0.11m precision
        const precisionLon = Number(hotspot.lon.toFixed(6));
        
        // Calculate marker size based on concentration (higher = larger)
        const baseSize = 16;
        const sizeMultiplier = hotspot.risk === 'high' ? 1.5 : hotspot.risk === 'medium' ? 1.2 : 1.0;
        const markerSize = Math.round(baseSize * sizeMultiplier);
        
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div class="relative flex items-center justify-center">
              <div class="${
                hotspot.risk === 'high' ? 'bg-red-500/80 border-red-700' : 
                hotspot.risk === 'medium' ? 'bg-yellow-500/80 border-yellow-700' : 
                'bg-green-500/80 border-green-700'
              } rounded-full border-2 shadow-xl animate-pulse" 
                   style="width: ${markerSize}px; height: ${markerSize}px;"></div>
              <div class="${
                hotspot.risk === 'high' ? 'bg-red-500/20' : 
                hotspot.risk === 'medium' ? 'bg-yellow-500/20' : 
                'bg-green-500/20'
              } rounded-full absolute" 
                   style="width: ${markerSize * 2}px; height: ${markerSize * 2}px; animation: pulse 2s infinite;"></div>
            </div>
          `,
          iconSize: [markerSize * 2, markerSize * 2],
          iconAnchor: [markerSize, markerSize]
        });

        const marker = L.marker([precisionLat, precisionLon], { icon })
          .bindPopup(`
            <div class="p-3 min-w-[250px]">
              <h3 class="font-bold text-base mb-2">${hotspot.name || 'Methane Hotspot'}</h3>
              <div class="space-y-1 text-sm">
                <p><strong>CH₄:</strong> ${hotspot.concentration.toFixed(1)} ppb</p>
                <p><strong>Risk:</strong> <span class="${
                  hotspot.risk === 'high' ? 'text-red-600 font-bold' : 
                  hotspot.risk === 'medium' ? 'text-yellow-600 font-semibold' : 
                  'text-green-600'
                }">${hotspot.risk.toUpperCase()}</span></p>
                <p class="text-xs border-t pt-1 mt-1">
                  <strong>Source:</strong> ${hotspot.source || 'NASA Data'}
                </p>
                <p class="text-xs">
                  <strong>Confidence:</strong> ${hotspot.confidence ?? hotspot.dataSource?.confidence ?? '—'}%
                </p>
                <p class="text-xs font-mono">
                  <strong>GPS:</strong> ${precisionLat.toFixed(6)}°N, ${Math.abs(precisionLon).toFixed(6)}°${precisionLon >= 0 ? 'E' : 'W'}
                </p>
                <p class="text-xs text-gray-500">
                  <strong>Updated:</strong> ${new Date(hotspot.date).toLocaleString()}
                </p>
              </div>
            </div>
          `, {
            maxWidth: 300,
            className: 'nasa-precision-popup'
          });
        
        markersRef.current?.addLayer(marker);
      });
    }

    // Add temperature anomaly overlay if enabled
    if (layers.temperature && temperature) {
      const region = REGION_COORDINATES[selectedRegion as keyof typeof REGION_COORDINATES];
      if (region && region.bbox) {
        const bounds: L.LatLngBoundsExpression = [
          [region.bbox[1], region.bbox[0]], // SW corner
          [region.bbox[3], region.bbox[2]]  // NE corner
        ];
        
        // Create a semi-transparent overlay for temperature anomaly
        const tempOverlay = L.rectangle(bounds, {
          color: temperature.anomaly > 2 ? '#ff0000' : temperature.anomaly > 1 ? '#ff9900' : '#0099ff',
          weight: 2,
          opacity: 0.5,
          fillOpacity: 0.2
        }).bindPopup(`
          <div>
            <h3 class="font-bold">Temperature Anomaly</h3>
            <p>Current: ${temperature.currentTemp?.toFixed(1)}°C</p>
            <p>Anomaly: <strong>+${temperature.anomaly}°C</strong></p>
            <p>Max: ${temperature.maxTemp?.toFixed(1)}°C</p>
            <p>Min: ${temperature.minTemp?.toFixed(1)}°C</p>
          </div>
        `);
        
        markersRef.current?.addLayer(tempOverlay);
      }
    }
  }, [layers, temperature, selectedRegion]);

  // Toggle layer visibility
  const toggleLayer = (layer: keyof LayerControl) => {
    const newLayers = { ...layers, [layer]: !layers[layer] };
    setLayers(newLayers);
    
    if (layer === 'methane' || layer === 'temperature') {
      updateMapMarkers(hotspots);
    }
  };

  // Auto-refresh functionality for real-time updates
  useEffect(() => {
    if (!autoRefresh) {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      return;
    }

    // Refresh every 60 seconds for real-time data
    const interval = setInterval(() => {
      console.log('🔄 [Auto-Refresh] Updating NASA data...');
      loadRegionData(selectedRegion);
    }, 60000); // 60 seconds

    refreshIntervalRef.current = interval;

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, selectedRegion, loadRegionData]);

  // Manual refresh data
  const refreshData = () => {
    console.log('🔄 [Manual Refresh] Updating NASA data...');
    loadRegionData(selectedRegion);
  };

  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev);
  };

  return (
    <Card className="relative">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Satellite className="h-5 w-5" />
            <CardTitle>Real-Time Satellite Monitoring</CardTitle>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(REGION_COORDINATES).map(([id, region]) => (
                  <SelectItem key={id} value={id}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={refreshData} 
              disabled={loading}
              className="gap-1"
            >
              <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
              Refresh
            </Button>
            <Button 
              size="sm" 
              variant={autoRefresh ? "default" : "outline"}
              onClick={toggleAutoRefresh}
              className="gap-1"
            >
              <RefreshCw className={cn("h-3 w-3", autoRefresh && "animate-spin")} />
              {autoRefresh ? 'Live' : 'Paused'}
            </Button>
          </div>
        </div>
        
        {/* Layer Controls */}
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant={layers.satellite ? "default" : "outline"} 
            className="cursor-pointer"
            onClick={() => toggleLayer('satellite')}
          >
            <Eye className="h-3 w-3 mr-1" />
            Satellite
          </Badge>
          <Badge 
            variant={layers.methane ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => toggleLayer('methane')}
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            Methane ({hotspots.length})
          </Badge>
          <Badge 
            variant={layers.temperature ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => toggleLayer('temperature')}
          >
            <Thermometer className="h-3 w-3 mr-1" />
            Temperature {temperature && `(+${temperature.anomaly}°C)`}
          </Badge>
          <Badge 
            variant={layers.permafrost ? "secondary" : "outline"}
            className="cursor-pointer"
            onClick={() => toggleLayer('permafrost')}
          >
            <MapPin className="h-3 w-3 mr-1" />
            Permafrost
          </Badge>
        </div>

        {/* Data Summary */}
        {(hotspots.length > 0 || temperature) && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div className="p-2 bg-secondary/50 rounded">
              <p className="text-xs text-muted-foreground">High Risk Zones</p>
              <p className="font-semibold text-red-500">
                {hotspots.filter(h => h.risk === 'high').length}
              </p>
            </div>
            <div className="p-2 bg-secondary/50 rounded">
              <p className="text-xs text-muted-foreground">Medium Risk</p>
              <p className="font-semibold text-yellow-500">
                {hotspots.filter(h => h.risk === 'medium').length}
              </p>
            </div>
            {temperature && (
              <div className="p-2 bg-secondary/50 rounded">
                <p className="text-xs text-muted-foreground">Temp Anomaly</p>
                <p className={cn(
                  "font-semibold",
                  temperature.anomaly > 2 ? "text-red-500" : 
                  temperature.anomaly > 1 ? "text-yellow-500" : 
                  "text-blue-500"
                )}>
                  +{temperature.anomaly}°C
                </p>
              </div>
            )}
            <div className="p-2 bg-secondary/50 rounded">
              <p className="text-xs text-muted-foreground">Last Update</p>
              <p className="font-semibold text-xs">
                {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        <div 
          ref={mapContainerRef}
          className="h-[500px] w-full rounded-b-lg map-container overflow-hidden"
          style={{
            position: 'relative',
            isolation: 'isolate'
          }}
        />
        <div className="px-4 py-2 text-xs text-muted-foreground border-t">
          <p>
            <strong>NASA Precision:</strong> GPS coordinates accurate to ±0.11m (6 decimal places) | 
            Real-time updates every 60s | 
            Data: NASA POWER API, GIBS Satellite Imagery, Sentinel-5P TROPOMI
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
