# Satellite Map Feature (No API Key Required!)

## Overview

The Satellite Map feature provides an interactive, real-time visualization of Arctic permafrost monitoring regions using **free, open-source mapping libraries**. This feature uses **Leaflet.js** with ESRI World Imagery tiles, requiring **NO API KEYS** or billing setup. It complements the Risk Reporting system by offering a geographic interface to view temperature anomalies, methane concentrations, and risk assessments across monitored regions.

## Key Benefits

✅ **No API Key Required** - Uses free tile providers (ESRI, OpenStreetMap)  
✅ **No Billing Setup** - Completely free with no usage limits  
✅ **High-Quality Satellite Imagery** - ESRI World Imagery comparable to Google Maps  
✅ **Open Source** - Built on Leaflet.js, the leading open-source mapping library  
✅ **Fast & Lightweight** - No external dependencies or authentication overhead

## Features

### 1. Interactive Satellite Map
- **Leaflet.js Integration**: Professional open-source mapping library
- **Multiple Map Layers**:
  - 🛰️ **Satellite View**: ESRI World Imagery (high-quality satellite tiles)
  - 🗺️ **Terrain View**: ESRI World Topo Map (topographic details)
  - 🏙️ **Street Map**: OpenStreetMap (detailed street-level data)
- **Arctic Region Focus**: Centered on the Arctic Circle with initial view of all monitored regions
- **No Rate Limits**: Unlimited map loads and interactions
- **Full-Screen Support**: Expand map to full screen for detailed analysis

### 2. Region Markers & Information
- **Color-Coded Risk Markers**: Visual indicators showing risk levels
  - 🔴 **Critical Risk** (Red): Risk Score 76-100
  - 🟠 **High Risk** (Orange): Risk Score 51-75
  - 🟡 **Medium Risk** (Amber): Risk Score 26-50
  - 🟢 **Low Risk** (Emerald): Risk Score 0-25

- **Interactive Info Windows**: Click any marker to view:
  - Region name and location
  - Current temperature and anomaly
  - Methane concentration (ppb)
  - Risk level and score

### 3. Risk Zone Visualization
- **Dynamic Risk Circles**: Visual representation of risk zones
  - Circle radius scales with risk score (100km - 600km)
  - Color-coded to match risk level
  - Semi-transparent overlays for easy viewing
  - Toggle on/off via layer controls

### 4. Layer Controls
- **Map Layers Panel**: Toggle different visualization layers
  - Risk Zones: Show/hide risk area circles
  - Legend: Color-coded risk level guide
- **Region Count Badge**: Shows total monitored regions

### 5. Side Panel Information
- **Selected Region Details**:
  - Current temperature with min/max range
  - Temperature anomaly highlighting
  - Methane concentration levels
  - Risk score and level assessment
  - Quick report generation button

- **All Regions Summary**:
  - Grid view of all 4 Arctic regions
  - Quick overview of each region's status
  - Click to select and view on map

## Technical Architecture

### Technology Stack

**Core Libraries**:
- **Leaflet.js** v1.9+ - Industry-standard open-source mapping library
- **React-Leaflet** - React bindings for Leaflet
- **Next.js Dynamic Imports** - Prevent SSR issues with maps

**Tile Providers** (All Free, No API Keys):
- **ESRI World Imagery** - High-resolution satellite imagery
- **ESRI World Topo Map** - Detailed topographic maps
- **OpenStreetMap** - Comprehensive street-level mapping

### Components

#### `GoogleSatelliteMapViewer` (Now Leaflet-Based)
**Location**: `src/components/satellite-map/google-satellite-map-viewer.tsx`

**Props**:
```typescript
interface GoogleSatelliteMapViewerProps {
  regions: RegionData[];
  onRegionSelect?: (region: RegionData) => void;
}
```

**Key Features**:
- Dynamic imports for SSR compatibility
- React hooks for state management
- Leaflet.js map integration
- Custom markers and popups
- Layer toggle functionality (3 map types + risk zones)
- No authentication or API keys required

#### `SatelliteMapPage`
**Location**: `src/app/(app)/satellite-map/page.tsx`

**Features**:
- Data fetching from transparent-dashboard API
- Region selection state management
- 4-column responsive layout
- Integration with report generation

### Data Flow

```
1. Page Load
   ↓
2. Fetch Region Data from /api/transparent-dashboard
   ↓
3. Transform Data to RegionData Format
   ↓
4. Pass to GoogleSatelliteMapViewer
   ↓
5. Render Map with Markers & Circles
   ↓
6. User Interaction (Click Marker)
   ↓
7. Update Selected Region in Parent
   ↓
8. Display Region Details in Side Panel
```

### API Integration

**Endpoint**: `/api/transparent-dashboard`

**Response Format**:
```typescript
{
  realTemperatureData: [
    {
      regionId: string;
      regionName: string;
      coordinates: { lat: number; lon: number };
      temperature: {
        current: number;
        anomaly: number;
        max: number;
        min: number;
      };
    }
  ],
  methaneData: [
    {
      regionId: string;
      concentration: number;
      unit: string;
    }
  ],
  algorithmicRiskAssessment: {
    zones: [
      {
        regionId: string;
        riskLevel: string;
        riskScore: number;
      }
    ]
  }
}
```

## Configuration

### Environment Variables

**No environment variables required!** 🎉

The map works out-of-the-box with no configuration needed.

### Installation

Required npm packages (already included):
```bash
npm install leaflet react-leaflet @types/leaflet
```

### Tile Provider Information

**ESRI World Imagery**:
- URL: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`
- License: Free for non-commercial and commercial use
- Attribution: © Esri
- Max Zoom: 19

**ESRI World Topo Map**:
- URL: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}`
- License: Free for non-commercial and commercial use
- Attribution: © Esri

**OpenStreetMap**:
- URL: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- License: ODbL (Open Database License)
- Attribution: © OpenStreetMap contributors

## Usage Guide

### For Scientists & Researchers

1. **Navigate to Satellite Map**:
   - Click "Google Satellite Map" in the sidebar
   - Wait for map to load

2. **Explore Regions**:
   - Pan and zoom to view Arctic regions
   - Click markers to see detailed information
   - Use map type controls to change views

3. **Analyze Risk Zones**:
   - Toggle "Risk Zones" layer to visualize impact areas
   - Larger circles = higher risk scores
   - Color indicates severity level

4. **View Region Details**:
   - Select a region by clicking its marker
   - Review temperature, methane, and risk data
   - Click "Generate Report" for detailed analysis

5. **Compare Regions**:
   - Use summary cards at bottom to compare all regions
   - Click any card to focus on that region

### For Developers

**Add New Region**:
```typescript
// In page.tsx, regions are auto-fetched from API
// To manually add, update the data transformation:
const newRegion = {
  regionId: "new-region",
  regionName: "New Arctic Region",
  coordinates: { lat: 75.0, lon: -120.0 },
  temperature: { current: -5.2, anomaly: 2.1, max: 0.5, min: -12.3 },
  methane: { concentration: 1892, unit: "ppb" },
  riskLevel: "HIGH",
  riskScore: 68
};
```

**Customize Marker Appearance**:
```typescript
// In google-satellite-map-viewer.tsx, modify icon property:
icon: {
  path: google.maps.SymbolPath.CIRCLE,
  scale: 12, // Adjust size
  fillColor: getRiskColor(region.riskLevel),
  fillOpacity: 0.9,
  strokeColor: '#ffffff',
  strokeWeight: 2,
}
```

**Add New Layer**:
```typescript
// Example: Add heatmap layer
const heatmap = new google.maps.visualization.HeatmapLayer({
  data: heatmapData,
  map: googleMapRef.current,
});
```

## Performance Optimization

### Current Optimizations
- Lazy loading of Google Maps script
- Efficient marker clustering for large datasets
- Debounced map updates
- Memoized region data transformations

### Future Improvements
- Server-side caching of region data
- Progressive loading of region details
- WebGL-based custom overlays for better performance
- Marker clustering for 50+ regions

## Monitoring & Analytics

### Key Metrics to Track
- Map load time
- API response time
- User interactions (marker clicks, layer toggles)
- Region selection patterns
- Report generation frequency

### Error Handling
- API key validation on mount
- Graceful fallback for missing data
- Error boundaries for component failures
- User-friendly error messages

## Security Considerations

### API Key Protection
- Use `NEXT_PUBLIC_` prefix for client-side access
- Restrict API key to specific domains
- Enable billing alerts in Google Cloud
- Rotate keys periodically

### Data Privacy
- No user location tracking
- Anonymized usage analytics
- GDPR compliance for European users
- Secure HTTPS communication

## Troubleshooting

### Common Issues

**1. Map Not Loading**
```
Error: "Failed to load Google Maps script"
Solution: 
- Verify NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local
- Check if Maps JavaScript API is enabled
- Verify billing is enabled in Google Cloud
```

**2. Markers Not Appearing**
```
Error: Markers array is empty
Solution:
- Check /api/transparent-dashboard endpoint
- Verify data transformation in page.tsx
- Ensure coordinates are valid (lat: -90 to 90, lon: -180 to 180)
```

**3. Info Window Not Opening**
```
Error: InfoWindow content is undefined
Solution:
- Verify region data includes all required fields
- Check console for JavaScript errors
- Ensure marker click listener is attached
```

**4. Risk Circles Not Showing**
```
Error: Circles not visible
Solution:
- Toggle "Risk Zones" layer on
- Check if showRiskZones state is true
- Verify circle radius calculation (should be > 0)
```

## Roadmap

### Phase 2 Features (Planned)
- [ ] Heatmap overlay for temperature anomalies
- [ ] Time-series animation of historical data
- [ ] Custom polygon drawing for region analysis
- [ ] Export map as high-resolution image
- [ ] 3D terrain view integration
- [ ] Real-time data updates via WebSockets

### Phase 3 Features (Future)
- [ ] Machine learning predictions on map
- [ ] Collaborative annotation tools
- [ ] Integration with external GIS data
- [ ] Mobile app with offline map support
- [ ] AR visualization on mobile devices

## References

### Documentation
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Next.js Script Component](https://nextjs.org/docs/app/api-reference/components/script)
- [Transparent Dashboard API](./DASHBOARD_TRANSFORMATION_PLAN.md)

### Related Features
- [Risk Reporting](./IMPLEMENTATION_COMPLETE.md)
- [Sentinel Hub Integration](./SENTINEL_HUB_ACTIVE_CONFIG.md)
- [NASA Data Service](./COPERNICUS_DATASPACE_SETUP.md)

## Support

For issues or questions:
1. Check this documentation first
2. Review console errors in browser
3. Verify API credentials and quotas
4. Contact development team with error logs

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Maintainer**: Cryo-Scope Development Team
