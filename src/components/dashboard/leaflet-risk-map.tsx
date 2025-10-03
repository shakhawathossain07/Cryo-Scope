'use client';

import { useEffect, useRef } from 'react';
import type { RiskZone, MethaneHotspot } from '@/lib/nasa-data-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Satellite } from 'lucide-react';

// Import Leaflet types
import type L from 'leaflet';

interface LeafletRiskMapProps {
  zones: RiskZone[];
  hotspots: MethaneHotspot[];
  height?: number;
}

export function LeafletRiskMap({ zones, hotspots, height = 500 }: LeafletRiskMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || !mapRef.current) return;

    // Dynamically import Leaflet to avoid SSR issues
    const initMap = async () => {
  const L = (await import('leaflet')).default;

      // Fix Leaflet icon paths issue with Next.js
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      // Clean up existing map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Initialize map centered on Arctic
      if (!mapRef.current) return;
      const map = L.map(mapRef.current).setView([72, -95], 3); // Better center for viewing all Arctic regions
      mapInstanceRef.current = map;

      // Add OpenStreetMap tile layer (FREE, no API key needed!)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      // Debug: Log zones and hotspots
      console.log('🗺️ Leaflet Map - Zones:', zones.length, zones.map(z => ({ 
        region: z.regionId, 
        coords: [z.coordinates.lat, z.coordinates.lon],
        risk: z.riskLevel 
      })));
      console.log('🔥 Leaflet Map - Hotspots:', hotspots.length, hotspots.map(h => ({ 
        name: h.name, 
        coords: [h.lat, h.lon] 
      })));

      // Color mapping for risk levels
      const getRiskColor = (level: string): string => {
        switch (level) {
          case 'CRITICAL': return '#ef4444'; // red-500
          case 'HIGH': return '#f97316'; // orange-500
          case 'MEDIUM': return '#eab308'; // yellow-500
          case 'LOW': return '#22c55e'; // green-500
          default: return '#6b7280'; // gray-500
        }
      };

      // Create custom icon function
      const createCustomIcon = (color: string, isCritical: boolean) => {
        return L.divIcon({
          html: `<div style="
            background-color: ${color};
            width: ${isCritical ? '24px' : '20px'};
            height: ${isCritical ? '24px' : '20px'};
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ${isCritical ? 'animation: pulse 2s infinite;' : ''}
          "></div>
          <style>
            @keyframes pulse {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.2); opacity: 0.8; }
            }
          </style>`,
          className: 'custom-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
      };

      // Add risk zone markers
      const allMarkers: L.Marker[] = [];
      
      zones.forEach((zone) => {
        const color = getRiskColor(zone.riskLevel);
        const isCritical = zone.riskLevel === 'CRITICAL';
        const icon = createCustomIcon(color, isCritical);

        const marker = L.marker([zone.coordinates.lat, zone.coordinates.lon], { icon })
          .addTo(map);
        allMarkers.push(marker);

        // Create popup content
        const popupContent = `
          <div style="min-width: 200px;">
            <h3 style="font-weight: bold; margin: 0 0 8px 0; color: ${color};">
              ${zone.riskLevel} RISK
            </h3>
            <p style="margin: 4px 0;"><strong>Region:</strong> ${zone.regionId}</p>
            <p style="margin: 4px 0;"><strong>Risk Score:</strong> ${zone.riskScore}/100</p>
            <p style="margin: 4px 0;"><strong>Temperature:</strong> ${zone.factors.temperatureAnomaly >= 0 ? '+' : ''}${zone.factors.temperatureAnomaly.toFixed(1)}°C</p>
            <p style="margin: 4px 0;"><strong>Methane:</strong> ${zone.factors.estimatedMethane.toFixed(0)} PPB</p>
            <p style="margin: 4px 0; font-size: 11px; color: #666;">
              ${zone.coordinates.lat.toFixed(4)}°${zone.coordinates.lat >= 0 ? 'N' : 'S'}, 
              ${Math.abs(zone.coordinates.lon).toFixed(4)}°${zone.coordinates.lon >= 0 ? 'E' : 'W'}
            </p>
          </div>
        `;

        marker.bindPopup(popupContent);

        // Auto-open critical zone popups
        if (isCritical) {
          setTimeout(() => marker.openPopup(), 500);
        }
      });

      // Add methane hotspot markers (smaller, orange circles)
      hotspots.forEach((hotspot) => {
        const hotspotIcon = L.divIcon({
          html: `<div style="
            background-color: #fb923c;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            animation: pulse 3s infinite;
          "></div>`,
          className: 'hotspot-marker',
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        const hotspotMarker = L.marker([hotspot.lat, hotspot.lon], { icon: hotspotIcon })
          .addTo(map);
        allMarkers.push(hotspotMarker);

        const hotspotPopup = `
          <div style="min-width: 150px;">
            <h3 style="font-weight: bold; margin: 0 0 8px 0; color: #fb923c;">
              🔥 Methane Hotspot
            </h3>
            <p style="margin: 4px 0;"><strong>${hotspot.name}</strong></p>
            <p style="margin: 4px 0;"><strong>Risk:</strong> ${hotspot.risk}</p>
            <p style="margin: 4px 0; font-size: 11px; color: #666;">
              ${hotspot.lat.toFixed(4)}°${hotspot.lat >= 0 ? 'N' : 'S'}, 
              ${Math.abs(hotspot.lon).toFixed(4)}°${hotspot.lon >= 0 ? 'E' : 'W'}
            </p>
          </div>
        `;

        hotspotMarker.bindPopup(hotspotPopup);
      });

      // Automatically fit map bounds to show all markers
      if (allMarkers.length > 0) {
        const group = L.featureGroup(allMarkers);
        map.fitBounds(group.getBounds(), { 
          padding: [50, 50], // Add padding around markers
          maxZoom: 4 // Don't zoom in too close
        });
      }

      // Add legend
      const LegendControl = L.Control.extend({
        options: { position: 'bottomright' },
        onAdd: () => {
        const div = L.DomUtil.create('div', 'info legend');
        div.style.cssText = 'background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); color: #333; font-size: 13px; font-family: system-ui, -apple-system, sans-serif;';
        div.innerHTML = `
          <div style="font-weight: bold; margin-bottom: 8px; color: #000;">Risk Levels</div>
          <div style="margin: 4px 0; display: flex; align-items: center; color: #333;">
            <span style="display: inline-block; width: 16px; height: 16px; background: #ef4444; border-radius: 50%; margin-right: 8px; flex-shrink: 0;"></span>
            <span>Critical</span>
          </div>
          <div style="margin: 4px 0; display: flex; align-items: center; color: #333;">
            <span style="display: inline-block; width: 16px; height: 16px; background: #f97316; border-radius: 50%; margin-right: 8px; flex-shrink: 0;"></span>
            <span>High</span>
          </div>
          <div style="margin: 4px 0; display: flex; align-items: center; color: #333;">
            <span style="display: inline-block; width: 16px; height: 16px; background: #eab308; border-radius: 50%; margin-right: 8px; flex-shrink: 0;"></span>
            <span>Medium</span>
          </div>
          <div style="margin: 4px 0; display: flex; align-items: center; color: #333;">
            <span style="display: inline-block; width: 16px; height: 16px; background: #22c55e; border-radius: 50%; margin-right: 8px; flex-shrink: 0;"></span>
            <span>Low</span>
          </div>
          <div style="margin: 8px 0 4px 0; padding-top: 8px; border-top: 1px solid #ddd; display: flex; align-items: center; color: #333;">
            <span style="display: inline-block; width: 12px; height: 12px; background: #fb923c; border-radius: 50%; margin-right: 8px; flex-shrink: 0;"></span>
            <span style="font-size: 12px;">Methane Hotspot</span>
          </div>
        `;
        return div;
        }
      });
      new LegendControl().addTo(map);

      // Add info box
      const InfoControl = L.Control.extend({
        options: { position: 'topleft' },
        onAdd: () => {
        const div = L.DomUtil.create('div', 'info');
        div.style.cssText = 'background: rgba(255,255,255,0.95); padding: 12px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); max-width: 250px; color: #333; font-family: system-ui, -apple-system, sans-serif;';
        div.innerHTML = `
          <div style="font-weight: bold; margin-bottom: 4px; color: #000;">📡 Live Data</div>
          <div style="font-size: 13px; line-height: 1.5; color: #333;">
            <div>🗺️ ${zones.length} zones monitored</div>
            <div>🔥 ${hotspots.length} active hotspots</div>
            <div style="margin-top: 8px; font-size: 11px; color: #666;">
              ✅ Powered by OpenStreetMap<br/>
              ✅ No API key required<br/>
              ✅ 100% Free & Open Source
            </div>
          </div>
        `;
        return div;
        }
      });
      new InfoControl().addTo(map);
    };

    initMap();

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [zones, hotspots]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Satellite className="h-5 w-5 text-blue-500" />
          Arctic Risk Zones - Live Satellite View
          <span className="ml-auto text-xs font-normal text-muted-foreground">
            OpenStreetMap • No API Key Required
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          ref={mapRef} 
          style={{ height: `${height}px`, width: '100%', borderRadius: '8px' }}
          className="border border-muted"
        />
      </CardContent>
    </Card>
  );
}
