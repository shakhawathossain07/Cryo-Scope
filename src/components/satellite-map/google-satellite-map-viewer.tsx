'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Layers, Circle as CircleIcon, Map as MapIcon } from 'lucide-react';

interface RegionData {
  regionId: string;
  regionName: string;
  coordinates: { lat: number; lon: number };
  bbox?: [number, number, number, number]; // [west, south, east, north]
  areaCoverage?: {
    squareKm: number;
    squareMiles: number;
    description: string;
  };
  temperature: {
    current: number;
    anomaly: number;
    max: number;
    min: number;
  };
  methane: {
    concentration: number;
    unit: string;
  };
  riskLevel: string;
  riskScore: number;
}

interface GoogleSatelliteMapViewerProps {
  regions: RegionData[];
  onRegionSelect?: (region: RegionData) => void;
}

export function GoogleSatelliteMapViewer({ regions, onRegionSelect }: GoogleSatelliteMapViewerProps) {
  const [showRiskZones, setShowRiskZones] = useState(true);
  const [mapLayer, setMapLayer] = useState<'satellite' | 'terrain' | 'osm'>('satellite');
  const [isMounted, setIsMounted] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const circlesRef = useRef<any[]>([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !mapContainerRef.current) return;

    // Only initialize if not already initialized
    if (mapInstanceRef.current) return;

    // Dynamically import Leaflet
    import('leaflet').then((L) => {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      // Fix default marker icon issue
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      // Initialize map
      const map = L.map(mapContainerRef.current, {
        center: [70.0, -100.0],
        zoom: 3,
        minZoom: 2,
        maxZoom: 18,
        zoomControl: true,
        attributionControl: true,
        preferCanvas: false,
        zoomSnap: 0.5,
        zoomDelta: 0.5,
        wheelPxPerZoomLevel: 60,
        maxBounds: [[-90, -180], [90, 180]],
        maxBoundsViscosity: 1.0,
      });

      // Position zoom control to bottom-right to avoid overlap
      map.zoomControl.setPosition('bottomright');
      
      // Force map to fit container properly
      setTimeout(() => {
        map.invalidateSize();
      }, 100);

      mapInstanceRef.current = map;

      // Add tile layer
      const tileUrl = getMapTileUrl(mapLayer);
      const attribution = getAttribution(mapLayer);
      
      L.tileLayer(tileUrl, {
        attribution,
        maxZoom: 19,
        tileSize: 256,
        detectRetina: true,
        updateWhenIdle: false,
        keepBuffer: 2,
      }).addTo(map);

      // Add markers and circles
      updateMapMarkers(L);

      // Handle resize
      const resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });

      if (mapContainerRef.current) {
        resizeObserver.observe(mapContainerRef.current);
      }

      // Store observer for cleanup
      (mapInstanceRef.current as any)._resizeObserver = resizeObserver;
    });

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        const observer = (mapInstanceRef.current as any)._resizeObserver;
        if (observer) {
          observer.disconnect();
        }
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isMounted]);

  // Update markers when regions or settings change
  useEffect(() => {
    if (!mapInstanceRef.current || !isMounted) return;

    import('leaflet').then((L) => {
      updateMapMarkers(L);
    });
  }, [regions, showRiskZones, isMounted]);

  // Update tile layer when map layer changes
  useEffect(() => {
    if (!mapInstanceRef.current || !isMounted) return;

    import('leaflet').then((L) => {
      // Remove all tile layers
      mapInstanceRef.current.eachLayer((layer: any) => {
        if (layer instanceof L.TileLayer) {
          mapInstanceRef.current.removeLayer(layer);
        }
      });

      // Add new tile layer
      const tileUrl = getMapTileUrl(mapLayer);
      const attribution = getAttribution(mapLayer);
      
      L.tileLayer(tileUrl, {
        attribution,
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
    });
  }, [mapLayer, isMounted]);

  function updateMapMarkers(L: any) {
    if (!mapInstanceRef.current) return;

    // Clear existing markers and circles
    markersRef.current.forEach(marker => marker.remove());
    circlesRef.current.forEach(circle => circle.remove());
    markersRef.current = [];
    circlesRef.current = [];

    regions.forEach((region) => {
      // Use high-precision coordinates (military-grade: 6 decimal places = ~0.11m precision)
      const lat = parseFloat(region.coordinates.lat.toFixed(6));
      const lon = parseFloat(region.coordinates.lon.toFixed(6));
      
      // Create marker with precise positioning
      const marker = L.marker([lat, lon], {
        icon: L.divIcon({
          className: 'custom-div-icon',
          html: `<div class="risk-marker" style="
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: ${getRiskColor(region.riskLevel)};
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
            position: absolute;
            left: -10px;
            top: -10px;
          "></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
          popupAnchor: [0, -10],
        }),
        title: `${region.regionName} (${lat.toFixed(4)}°, ${lon.toFixed(4)}°)`,
        riseOnHover: true,
      }).addTo(mapInstanceRef.current);

      // Create popup content with area coverage
      const areaCoverageInfo = region.areaCoverage
        ? `
            <div style="margin: 4px 0; padding-top: 4px; border-top: 1px solid #e5e7eb;">
              <strong>Area Coverage:</strong>
              <div style="margin-top: 2px; font-size: 11px;">
                ${region.areaCoverage.squareKm.toLocaleString()} km²<br/>
                (${region.areaCoverage.squareMiles.toLocaleString()} sq mi)
              </div>
            </div>
            <div style="margin: 4px 0; font-size: 11px; color: #6b7280;">
              ${region.areaCoverage.description}
            </div>
          `
        : '';

      const popupContent = `
        <div style="min-width: 220px; font-family: system-ui, sans-serif;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">${region.regionName}</h3>
          <div style="margin: 8px 0;">
            <span style="background: ${getRiskColor(region.riskLevel)}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">
              ${region.riskLevel} RISK
            </span>
          </div>
          <div style="margin-top: 12px; font-size: 12px;">
            <div style="margin: 4px 0;">
              <strong>Coordinates:</strong> ${region.coordinates.lat.toFixed(4)}°N, ${Math.abs(region.coordinates.lon).toFixed(4)}°${region.coordinates.lon < 0 ? 'W' : 'E'}
            </div>
            <div style="margin: 4px 0;">
              <strong>Temperature:</strong> ${region.temperature.current.toFixed(2)}°C
            </div>
            <div style="margin: 4px 0;">
              <strong>Anomaly:</strong> <span style="color: #f97316;">+${region.temperature.anomaly.toFixed(2)}°C</span>
            </div>
            <div style="margin: 4px 0;">
              <strong>Methane:</strong> ${region.methane.concentration} ${region.methane.unit}
            </div>
            <div style="margin: 4px 0;">
              <strong>Risk Score:</strong> ${region.riskScore}/100
            </div>
            ${areaCoverageInfo}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        if (onRegionSelect) {
          onRegionSelect(region);
        }
      });

      markersRef.current.push(marker);

      // Add risk zone circle if enabled (shows actual area coverage)
      if (showRiskZones) {
        const circle = L.circle([lat, lon], {
          radius: getCircleRadius(region),
          fillColor: getRiskColor(region.riskLevel),
          fillOpacity: 0.15,
          color: getRiskColor(region.riskLevel),
          opacity: 0.5,
          weight: 2,
        }).addTo(mapInstanceRef.current);

        circlesRef.current.push(circle);
      }
    });

    // Fit bounds to show all markers
    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current);
      mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [50, 50] });
    }
  }

  function getRiskColor(riskLevel: string): string {
    switch (riskLevel) {
      case 'CRITICAL':
        return '#dc2626';
      case 'HIGH':
        return '#ea580c';
      case 'MEDIUM':
        return '#f59e0b';
      case 'LOW':
        return '#10b981';
      default:
        return '#6b7280';
    }
  }

  function getCircleRadius(region: RegionData): number {
    // Calculate radius from actual area coverage for military-grade precision
    if (region.areaCoverage) {
      // Formula: radius = sqrt(area / π)
      // Area in km² needs to be converted to meters for Leaflet
      const areaInSquareMeters = region.areaCoverage.squareKm * 1000000; // km² to m²
      const radiusInMeters = Math.sqrt(areaInSquareMeters / Math.PI);
      
      // Apply risk score multiplier to show affected area
      // Higher risk = larger visual representation (10% to 100% of actual area)
      const riskMultiplier = 0.1 + (region.riskScore / 100) * 0.9;
      
      return radiusInMeters * riskMultiplier;
    }
    
    // Fallback: Use risk score-based calculation (100km to 600km)
    return 100000 + (region.riskScore * 5000);
  }

  function getMapTileUrl(layer: string): string {
    switch (layer) {
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'terrain':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
      case 'osm':
      default:
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  }

  function getAttribution(layer: string): string {
    switch (layer) {
      case 'satellite':
      case 'terrain':
        return '&copy; <a href="https://www.esri.com/">Esri</a>';
      case 'osm':
      default:
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
    }
  }

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full rounded-lg"
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
          overflow: 'hidden'
        }}
      />

      {/* Leaflet CSS */}
      <style jsx global>{`
        @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
        
        .leaflet-container {
          width: 100% !important;
          height: 100% !important;
          position: absolute !important;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1;
          overflow: hidden;
        }
        
        .leaflet-pane {
          z-index: auto;
        }
        
        .leaflet-tile-container {
          position: absolute;
          transform: translate3d(0, 0, 0);
        }
        
        .leaflet-tile {
          position: absolute;
          backface-visibility: hidden;
        }
        
        .leaflet-top,
        .leaflet-bottom {
          z-index: 1000;
          pointer-events: none;
        }
        
        .leaflet-top > *,
        .leaflet-bottom > * {
          pointer-events: auto;
        }
        
        .custom-div-icon {
          background: none;
          border: none;
        }
        
        .risk-marker {
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        
        .risk-marker:hover {
          transform: scale(1.2);
        }
        
        /* Prevent gaps between tiles */
        .leaflet-tile-pane {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
        }
        
        /* Ensure smooth panning */
        .leaflet-zoom-anim .leaflet-zoom-animated {
          will-change: transform;
        }
        
        /* Position Leaflet controls to avoid overlap */
        .leaflet-control-zoom {
          margin-right: 10px;
          margin-bottom: 10px;
        }
        
        .leaflet-control-attribution {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(4px);
          font-size: 10px;
          padding: 2px 5px;
          margin-right: 0;
          margin-bottom: 0;
        }
        
        /* Make attribution more compact */
        .leaflet-control-attribution a {
          font-size: 10px;
        }
      `}</style>

      {/* Layer Controls - Compact Top Right */}
      <div className="absolute top-4 right-4 bg-background/90 backdrop-blur rounded-lg shadow-lg p-2 space-y-1 z-[1001] max-w-[140px]">
        <div className="flex items-center gap-1 mb-1 pb-1 border-b">
          <Layers className="h-3 w-3" />
          <span className="text-xs font-semibold">Layers</span>
        </div>

        <div className="space-y-0.5">
          <Button
            variant={mapLayer === 'satellite' ? 'default' : 'ghost'}
            size="sm"
            className="w-full justify-start text-xs h-7 px-2"
            onClick={() => setMapLayer('satellite')}
          >
            <MapIcon className="h-3 w-3 mr-1" />
            Satellite
          </Button>
          <Button
            variant={mapLayer === 'terrain' ? 'default' : 'ghost'}
            size="sm"
            className="w-full justify-start text-xs h-7 px-2"
            onClick={() => setMapLayer('terrain')}
          >
            <MapIcon className="h-3 w-3 mr-1" />
            Terrain
          </Button>
          <Button
            variant={mapLayer === 'osm' ? 'default' : 'ghost'}
            size="sm"
            className="w-full justify-start text-xs h-7 px-2"
            onClick={() => setMapLayer('osm')}
          >
            <MapIcon className="h-3 w-3 mr-1" />
            Street
          </Button>
        </div>

        <div className="pt-1 border-t">
          <Button
            variant={showRiskZones ? 'default' : 'ghost'}
            size="sm"
            className="w-full justify-start text-xs h-7 px-2"
            onClick={() => setShowRiskZones(!showRiskZones)}
          >
            <CircleIcon className="h-3 w-3 mr-1" />
            Risk Zones
          </Button>
        </div>
      </div>

      {/* Legend - Bottom Left Compact */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur rounded-lg shadow-lg p-2 z-[1001] max-w-[140px]">
        <p className="text-xs font-semibold mb-1">Risk Levels</p>
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#dc2626' }}></div>
            <span className="text-xs">Critical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#ea580c' }}></div>
            <span className="text-xs">High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#f59e0b' }}></div>
            <span className="text-xs">Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#10b981' }}></div>
            <span className="text-xs">Low</span>
          </div>
        </div>
      </div>

      {/* Info Badge - Top Left Compact */}
      <div className="absolute top-4 left-4 bg-background/90 backdrop-blur rounded-lg shadow-lg px-2 py-1 z-[1001]">
        <p className="text-xs font-semibold">
          {regions.length} Regions • Free Maps
        </p>
      </div>
    </div>
  );
}
