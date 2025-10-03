# Sentinel WMS 400 Error Fix

**Date**: October 3, 2025  
**Issue**: WMS GetMap requests returning 400 (Bad Request)  
**Status**: ✅ RESOLVED

## Problem Description

The Sentinel Hub methane layer was failing to load map tiles with 400 errors:

```
GET http://localhost:9002/api/sentinel-wms?service=WMS&request=GetMap&layers=CH4&... 400 (Bad Request)
Error: {"error":"BBOX parameter is required"}
```

## Root Cause

The `/api/sentinel-wms` proxy route was using **case-sensitive** parameter lookups with `searchParams.get('BBOX')`. However, Leaflet's WMS tile layer sends parameters in **lowercase** (`bbox`, `layers`, `crs`, etc.).

This caused the proxy to think required parameters were missing, even though they were present in the URL.

## Solution

Modified `src/app/api/sentinel-wms/route.ts` to use **case-insensitive** parameter extraction:

### Before:
```typescript
const bbox = searchParams.get('BBOX');
const layers = searchParams.get('LAYERS');
const crs = searchParams.get('CRS');
// etc...
```

### After:
```typescript
// Helper function to get parameter case-insensitively
const getParam = (name: string): string | null => {
  // Try exact match first
  let value = searchParams.get(name);
  if (value) return value;
  
  // Try uppercase
  value = searchParams.get(name.toUpperCase());
  if (value) return value;
  
  // Try lowercase
  value = searchParams.get(name.toLowerCase());
  if (value) return value;
  
  return null;
};

const bbox = getParam('BBOX');
const layers = getParam('LAYERS');
const crs = getParam('CRS');
// etc...
```

## Testing

### Verification Tests

1. **Direct Sentinel Hub API**: ✅ Working
   ```bash
   node test-sentinel-config.js
   ```

2. **WMS GetMap with various projections**: ✅ Working
   ```bash
   node test-wms-getmap.js
   ```

3. **Proxy endpoint**: ✅ Working (after fix)
   ```bash
   node test-proxy-endpoint.js
   ```

### Test Results

All tests now pass:
- ✅ EPSG:3857 (Web Mercator) requests
- ✅ EPSG:4326 (Lat/Lon) requests
- ✅ Date range queries (e.g., `2025-09-25/2025-10-02`)
- ✅ Single date queries (e.g., `2025-10-02`)

## Impact

This fix enables:
- ✅ Sentinel-5P CH₄ (methane) layers to display correctly
- ✅ Real-time satellite methane concentration overlays
- ✅ Interactive map tiles for all Arctic regions:
  - Alaska (North Slope)
  - Canada (Mackenzie Delta)
  - Greenland (Scoresby Sound)
  - Siberia (Taymyr Peninsula)

## Files Modified

- `src/app/api/sentinel-wms/route.ts` - Added case-insensitive parameter handling

## Files Added (Testing)

- `test-wms-getmap.js` - Tests direct Sentinel Hub WMS requests
- `test-proxy-endpoint.js` - Tests the proxy endpoint

## Next Steps

1. Monitor browser console for any remaining tile load errors
2. Verify methane layer displays correctly for all regions
3. Check that historical data (30-day fallback) works when recent data is unavailable

## Technical Notes

### WMS Parameter Case Sensitivity

The WMS 1.3.0 specification states that parameter names are case-insensitive. However:
- Some clients (like Leaflet) send lowercase parameters
- Some servers expect uppercase parameters
- URLSearchParams in JavaScript is case-sensitive

**Best practice**: Always handle WMS parameters case-insensitively on the server side.

### Leaflet WMS Tile Layer Behavior

Leaflet's `L.tileLayer.wms()` sends parameters in **lowercase** by default:
- `bbox` (not `BBOX`)
- `layers` (not `LAYERS`)
- `crs` (not `CRS`)
- etc.

This is standard behavior and should be expected when using Leaflet.

## Related Documentation

- [COPERNICUS_DATASPACE_SETUP.md](./COPERNICUS_DATASPACE_SETUP.md) - OAuth and configuration setup
- [SENTINEL_HUB_OAUTH_SETUP.md](./SENTINEL_HUB_OAUTH_SETUP.md) - OAuth troubleshooting
- [WMS 1.3.0 Specification](https://www.ogc.org/standards/wms) - Official OGC WMS standard
