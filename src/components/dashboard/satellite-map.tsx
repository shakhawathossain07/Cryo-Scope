'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Thermometer, AlertTriangle, Satellite, Eye } from 'lucide-react';
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
  const markersRef = useRef<L.LayerGroup | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [70.0, 110.0], // Start at Siberia
      zoom: 4,
      zoomControl: true,
      attributionControl: true
    });

    // Add NASA GIBS satellite imagery as base layer
    L.tileLayer('https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/2024-01-01/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg', {
      attribution: '© NASA GIBS',
      maxZoom: 9,
      tileSize: 256
    }).addTo(map);

    // Alternative: OpenStreetMap with Arctic focus
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
      opacity: 0.3
    }).addTo(map);

    // Create markers layer group
    markersRef.current = L.layerGroup().addTo(map);
    
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update map view when region changes
  useEffect(() => {
    if (!mapRef.current) return;
    
    const region = REGION_COORDINATES[selectedRegion as keyof typeof REGION_COORDINATES];
    if (region) {
      mapRef.current.flyTo([region.lat, region.lon], 5, {
        duration: 1.5
      });
      loadRegionData(selectedRegion);
    }
  }, [selectedRegion]);

  // Load real data for the selected region
  const loadRegionData = async (regionId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/regions/${regionId}/metrics`, {
        method: 'GET',
        cache: 'no-store'
      });
      if (!response.ok) {
        throw new Error(`Region metrics request failed with status ${response.status}`);
      }
      const data: {
        hotspots: MethaneHotspot[];
        temperature: { currentTemp: number; anomaly: number; maxTemp: number; minTemp: number };
      } = await response.json();

      setHotspots(data.hotspots);
      setTemperature(data.temperature);
      updateMapMarkers(data.hotspots);
    } catch (error) {
      console.error('Error loading region data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update markers on the map
  const updateMapMarkers = (hotspotsData: MethaneHotspot[]) => {
    if (!markersRef.current || !mapRef.current) return;

    // Clear existing markers
    markersRef.current.clearLayers();

    // Add new markers for methane hotspots
    if (layers.methane) {
      hotspotsData.forEach(hotspot => {
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div class="relative">
              <div class="${
                hotspot.risk === 'high' ? 'bg-red-500' : 
                hotspot.risk === 'medium' ? 'bg-yellow-500' : 
                'bg-green-500'
              } rounded-full w-4 h-4 border-2 border-white shadow-lg animate-pulse"></div>
            </div>
          `,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });

        const marker = L.marker([hotspot.lat, hotspot.lon], { icon })
          .bindPopup(`
            <div class="p-2">
              <h3 class="font-bold">${hotspot.name || 'Methane Hotspot'}</h3>
              <p>CH₄ Concentration: <strong>${hotspot.concentration} ppb</strong></p>
              <p>Risk Level: <span class="${
                hotspot.risk === 'high' ? 'text-red-500' : 
                hotspot.risk === 'medium' ? 'text-yellow-500' : 
                'text-green-500'
              }">${hotspot.risk.toUpperCase()}</span></p>
              <p class="text-xs text-gray-500">Source: ${hotspot.source}</p>
              <p class="text-xs text-gray-500">Confidence: ${hotspot.confidence ?? hotspot.dataSource?.confidence ?? '—'}%</p>
              <p class="text-xs text-gray-500">Lat: ${hotspot.lat.toFixed(2)}°, Lon: ${hotspot.lon.toFixed(2)}°</p>
            </div>
          `);
        
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
  };

  // Toggle layer visibility
  const toggleLayer = (layer: keyof LayerControl) => {
    const newLayers = { ...layers, [layer]: !layers[layer] };
    setLayers(newLayers);
    
    if (layer === 'methane' || layer === 'temperature') {
      updateMapMarkers(hotspots);
    }
  };

  // Refresh data
  const refreshData = () => {
    loadRegionData(selectedRegion);
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
            <Button size="sm" variant="outline" onClick={refreshData} disabled={loading}>
              Refresh
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
              <p className="text-xs text-muted-foreground">Data Source</p>
              <p className="font-semibold text-xs">NASA/ESA</p>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        <div 
          ref={mapContainerRef}
          className="h-[500px] w-full rounded-b-lg map-container"
        />
      </CardContent>
    </Card>
  );
}
