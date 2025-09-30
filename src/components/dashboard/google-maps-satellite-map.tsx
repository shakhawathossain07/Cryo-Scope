'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Crosshair, Radar, MapPin } from 'lucide-react';
import { useGoogleMaps } from '@/hooks/use-google-maps';
import { cn } from '@/lib/utils';

interface GoogleMapsSatelliteMapProps {
  className?: string;
}

const ARCTIC_CENTER: google.maps.LatLngLiteral = {
  lat: 71.5,
  lng: -126.0,
};

const HOTSPOT_POINTS: Array<{ lat: number; lng: number; weight: number; name: string; risk: string }> = [
  { lat: 70.2631, lng: 68.797, weight: 4, name: 'Yamal Peninsula', risk: 'CRITICAL' },
  { lat: 70.2548, lng: -148.5157, weight: 3.5, name: 'Prudhoe Bay', risk: 'CRITICAL' },
  { lat: 73.6544, lng: -120.1377, weight: 3, name: 'Banks Island', risk: 'HIGH' },
  { lat: 69.2167, lng: -51.0993, weight: 2.5, name: 'Ilulissat Icefjord', risk: 'HIGH' },
  { lat: 72.0, lng: 95.0, weight: 2, name: 'Laptev Sea Coast', risk: 'MEDIUM' },
];

export function GoogleMapsSatelliteMap({ className }: GoogleMapsSatelliteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const heatmapLayerRef = useRef<google.maps.visualization.HeatmapLayer | null>(null);
  const overlayMarkersRef = useRef<google.maps.Marker[]>([]);
  const { isReady, status, error } = useGoogleMaps(['visualization']);

  const heatmapGradient = useMemo(
    () => [
      'rgba(0, 255, 255, 0)',     // Transparent cyan
      'rgba(0, 255, 255, 0.2)',   // Light cyan
      'rgba(0, 191, 255, 0.4)',   // Sky blue  
      'rgba(0, 127, 255, 0.6)',   // Blue
      'rgba(127, 0, 255, 0.8)',   // Purple
      'rgba(255, 0, 127, 0.9)',   // Magenta
      'rgba(255, 0, 0, 1)'        // Red (highest risk)
    ],
    []
  );

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'CRITICAL': return '#dc2626';
      case 'HIGH': return '#ea580c';
      case 'MEDIUM': return '#ca8a04';
      case 'LOW': return '#16a34a';
      default: return '#6b7280';
    }
  };

  useEffect(() => {
    if (!isReady || !mapContainerRef.current) {
      return;
    }

    if (typeof google === 'undefined' || !google.maps) {
      return;
    }

    if (!mapRef.current) {
      mapRef.current = new google.maps.Map(mapContainerRef.current, {
        center: ARCTIC_CENTER,
        zoom: 5,
        mapTypeId: google.maps.MapTypeId.SATELLITE, // Start with pure satellite
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: google.maps.ControlPosition.TOP_CENTER,
          mapTypeIds: [
            google.maps.MapTypeId.ROADMAP,
            google.maps.MapTypeId.SATELLITE,
            google.maps.MapTypeId.HYBRID,
            google.maps.MapTypeId.TERRAIN
          ]
        },
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_CENTER
        },
        streetViewControl: true,
        streetViewControlOptions: {
          position: google.maps.ControlPosition.RIGHT_TOP
        },
        fullscreenControl: true,
        scaleControl: true,
        minZoom: 2,
        maxZoom: 20, // Google's reliable maximum
        // Force high-quality satellite tiles
        tilt: 0,
        gestureHandling: 'greedy',
        // Ensure satellite imagery loads properly
        styles: [
          {
            featureType: 'all',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          }
        ]
      });

      // Add zoom change listener with satellite tile management
      mapRef.current.addListener('zoom_changed', () => {
        const currentZoom = mapRef.current?.getZoom() || 5;
        const mapType = mapRef.current?.getMapTypeId();
        
        console.log(`Zoom changed to: ${currentZoom}, Map type: ${mapType}`);
        
        // Ensure we stay in satellite/hybrid modes for high zoom
        if (currentZoom > 15) {
          // At high zoom, prefer hybrid to show roads/labels
          if (mapType !== google.maps.MapTypeId.HYBRID && mapType !== google.maps.MapTypeId.SATELLITE) {
            mapRef.current?.setMapTypeId(google.maps.MapTypeId.HYBRID);
          }
          // Reduce heatmap for ground detail visibility
          if (heatmapLayerRef.current) {
            heatmapLayerRef.current.setOptions({ radius: 15, opacity: 0.2 });
          }
        } else if (currentZoom > 10) {
          // Medium zoom - balanced view
          if (heatmapLayerRef.current) {
            heatmapLayerRef.current.setOptions({ radius: 25, opacity: 0.4 });
          }
        } else {
          // Low zoom - full heatmap visibility
          if (heatmapLayerRef.current) {
            heatmapLayerRef.current.setOptions({ radius: 40, opacity: 0.6 });
          }
        }
      });

      // Add map type change listener to ensure satellite imagery
      mapRef.current.addListener('maptypeid_changed', () => {
        const mapType = mapRef.current?.getMapTypeId();
        console.log(`Map type changed to: ${mapType}`);
        
        // If user switches to roadmap at high zoom, suggest satellite
        const currentZoom = mapRef.current?.getZoom() || 5;
        if (currentZoom > 12 && mapType === google.maps.MapTypeId.ROADMAP) {
          console.log('High zoom with roadmap - satellite imagery recommended');
        }
      });

      // Add tiles loaded listener to detect loading issues
      mapRef.current.addListener('tilesloaded', () => {
        console.log('Map tiles loaded successfully');
      });

      // Add idle listener to detect when map stops moving
      mapRef.current.addListener('idle', () => {
        const bounds = mapRef.current?.getBounds();
        const zoom = mapRef.current?.getZoom();
        console.log(`Map idle at zoom ${zoom}, bounds:`, bounds?.toJSON());
        
        // Check if we're in Arctic regions where satellite coverage might be limited
        const center = mapRef.current?.getCenter();
        if (center && center.lat() > 75) {
          console.log('⚠️ Very high latitude - satellite imagery may be limited');
        }
      });

      // Add a custom map style for better satellite visibility
      const styledMapType = new google.maps.StyledMapType([
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [
            { color: '#193341' }
          ]
        },
        {
          featureType: 'landscape',
          elementType: 'geometry',
          stylers: [
            { color: '#2c5a66' }
          ]
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [
            { visibility: 'on' },
            { color: '#ffffff' },
            { weight: 0.8 }
          ]
        },
        {
          featureType: 'road',
          elementType: 'labels',
          stylers: [
            { visibility: 'on' }
          ]
        }
      ], {
        name: 'Arctic Enhanced'
      });

      mapRef.current.mapTypes.set('arctic_enhanced', styledMapType);
      
      // Add control button for Arctic Enhanced view
      const arcticControlDiv = document.createElement('div');
      arcticControlDiv.style.margin = '10px';
      
      const arcticControl = document.createElement('button');
      arcticControl.style.backgroundColor = '#fff';
      arcticControl.style.border = '2px solid #fff';
      arcticControl.style.borderRadius = '3px';
      arcticControl.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
      arcticControl.style.color = 'rgb(25,25,25)';
      arcticControl.style.cursor = 'pointer';
      arcticControl.style.fontFamily = 'Roboto,Arial,sans-serif';
      arcticControl.style.fontSize = '11px';
      arcticControl.style.lineHeight = '16px';
      arcticControl.style.margin = '0 5px';
      arcticControl.style.padding = '0 5px';
      arcticControl.style.textAlign = 'center';
      arcticControl.textContent = 'Arctic Enhanced';
      arcticControl.title = 'Switch to Arctic Enhanced view for better visibility';
      arcticControl.type = 'button';
      
      arcticControl.addEventListener('click', () => {
        const currentType = mapRef.current?.getMapTypeId();
        if (currentType === 'arctic_enhanced') {
          mapRef.current?.setMapTypeId(google.maps.MapTypeId.SATELLITE);
        } else {
          mapRef.current?.setMapTypeId('arctic_enhanced');
        }
      });
      
      arcticControlDiv.appendChild(arcticControl);
      mapRef.current.controls[google.maps.ControlPosition.TOP_LEFT].push(arcticControlDiv);
    }

    // Create heatmap if visualization library is available
    if (google.maps.visualization?.HeatmapLayer) {
      const heatmapData = HOTSPOT_POINTS.map<google.maps.visualization.WeightedLocation>((point) => ({
        location: new google.maps.LatLng(point.lat, point.lng),
        weight: point.weight,
      }));

      if (!heatmapLayerRef.current) {
        heatmapLayerRef.current = new google.maps.visualization.HeatmapLayer({
          dissipating: true,
          radius: 40,
          opacity: 0.7,
          gradient: heatmapGradient,
        });
      }

      heatmapLayerRef.current.setData(heatmapData);
      heatmapLayerRef.current.setMap(mapRef.current);
    }

    // Create markers for hotspots
    if (overlayMarkersRef.current.length === 0) {
      overlayMarkersRef.current = HOTSPOT_POINTS.map((point) => {
        const marker = new google.maps.Marker({
          position: { lat: point.lat, lng: point.lng },
          map: mapRef.current!,
          title: `${point.name} - ${point.risk}`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillOpacity: 0.9,
            fillColor: getRiskColor(point.risk),
            strokeOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });

        // Add info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">
                ${point.name}
              </h3>
              <p style="margin: 4px 0; color: #6b7280; font-size: 12px;">
                <strong>Risk Level:</strong> 
                <span style="color: ${getRiskColor(point.risk)}; font-weight: 600;">
                  ${point.risk}
                </span>
              </p>
              <p style="margin: 4px 0; color: #6b7280; font-size: 12px;">
                <strong>Coordinates:</strong> ${point.lat.toFixed(6)}°N, ${Math.abs(point.lng).toFixed(6)}°${point.lng < 0 ? 'W' : 'E'}
              </p>
              <p style="margin: 4px 0; color: #6b7280; font-size: 12px;">
                <strong>Intensity:</strong> ${((point.weight / 4) * 100).toFixed(0)}%
              </p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(mapRef.current!, marker);
        });

        return marker;
      });
    }

    return () => {
      if (heatmapLayerRef.current) {
        heatmapLayerRef.current.setMap(null);
        heatmapLayerRef.current = null;
      }
      overlayMarkersRef.current.forEach((marker) => marker.setMap(null));
      overlayMarkersRef.current = [];
    };
  }, [isReady, heatmapGradient]);

  const loadingMessage = useMemo(() => {
    switch (status) {
      case 'idle':
      case 'loading':
        return 'Loading Google satellite intelligence…';
      case 'error':
        return error ?? 'Google Maps API failed to load.';
      default:
        return null;
    }
  }, [status, error]);

  return (
    <Card className={cn('h-full overflow-hidden', className)}>
      <CardHeader className="flex flex-col gap-2 bg-slate-950 text-slate-50">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-lg font-semibold">
            Google Satellite Operations Console
          </CardTitle>
        </div>
        <CardDescription className="text-slate-300">
          High-resolution satellite imagery with ground-level detail. Click markers and zoom for roads, buildings, and infrastructure.
        </CardDescription>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="border-sky-500/40 text-sky-300">
            NASA Methane Estimate Overlay
          </Badge>
          <Badge variant="outline" className="border-amber-500/40 text-amber-300">
            Arctic Thermal Anomaly
          </Badge>
          <Badge variant="outline" className="border-emerald-500/40 text-emerald-300">
            Field Recon Markers
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative aspect-[4/3] bg-slate-900">
          <div ref={mapContainerRef} className="absolute inset-0" />
          {loadingMessage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/90 text-slate-100">
              <Radar className="h-8 w-8 animate-spin text-sky-400" />
              <p className="text-sm font-semibold">{loadingMessage}</p>
              {status === 'error' && (
                <div className="max-w-md text-center space-y-2">
                  <p className="text-xs text-slate-400">
                    {error}
                  </p>
                  <p className="text-xs text-slate-500">
                    Common fixes: Check API key, enable Maps JavaScript API, verify billing account
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="grid gap-3 border-t border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-200">
          <div className="flex items-center gap-2">
            <Crosshair className="h-4 w-4 text-emerald-400" />
            <span>Coordinates locked to {ARCTIC_CENTER.lat.toFixed(1)}°N, {Math.abs(ARCTIC_CENTER.lng).toFixed(1)}°W</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-400" />
            <span>Switch to Hybrid/Satellite view for imagery. Max zoom: 20 ({HOTSPOT_POINTS.length} monitored zones)</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span>If tiles don&apos;t load at high zoom, try switching map types or reducing zoom level</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
