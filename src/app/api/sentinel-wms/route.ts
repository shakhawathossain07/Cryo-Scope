import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { ApiKeys } from '@/lib/api-keys-service';

export const runtime = 'nodejs';

// Cache token to avoid repeated OAuth calls
let cachedToken: {
  access_token: string;
  expires_at: number;
} | null = null;

async function getAccessToken(): Promise<string> {
  const [clientId, clientSecret] = await Promise.all([
    ApiKeys.getSentinelHubClientId(),
    ApiKeys.getSentinelHubClientSecret()
  ]);

  if (!clientId || !clientSecret) {
    throw new Error('Sentinel Hub credentials not configured in Supabase or environment');
  }

  // Return cached token if still valid (with 5 minute buffer)
  if (cachedToken && cachedToken.expires_at > Date.now() + 300000) {
    return cachedToken.access_token;
  }

  // Get new token from Copernicus Dataspace
  const response = await axios.post(
    'https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token',
    new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 10000,
    }
  );

  const { access_token, expires_in } = response.data;
  
  cachedToken = {
    access_token,
    expires_at: Date.now() + (expires_in * 1000),
  };

  return access_token;
}

/**
 * Proxy endpoint for Sentinel Hub WMS requests
 * This adds OAuth authentication that can't be done from the browser
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🌐 WMS Proxy: Incoming request');
    
    const instanceId = process.env.SENTINEL_HUB_INSTANCE_ID;
    
    if (!instanceId) {
      console.error('❌ WMS Proxy: Instance ID not configured');
      return NextResponse.json(
        { error: 'Sentinel Hub not configured' },
        { status: 500 }
      );
    }

    // Get OAuth token
    const token = await getAccessToken();
    console.log('✅ WMS Proxy: OAuth token obtained');

    // Get query parameters from the request (case-insensitive)
    const searchParams = request.nextUrl.searchParams;
    
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
    
    const service = (getParam('SERVICE') || 'WMS').toUpperCase();
    const version = getParam('VERSION') || '1.3.0';
    const requestType = getParam('REQUEST') || 'GetMap';
    const layers = getParam('LAYERS') || 'CH4';
    const bbox = getParam('BBOX');
    const width = getParam('WIDTH') || '512';
    const height = getParam('HEIGHT') || '512';
    const format = getParam('FORMAT') || 'image/png';
    const crs = getParam('CRS') || 'EPSG:3857';
    const time = getParam('TIME') || `${new Date().toISOString().split('T')[0]}/${new Date().toISOString().split('T')[0]}`;
    const transparent = getParam('TRANSPARENT') || 'true';
    const styles = getParam('STYLES') || '';
    const tiled = getParam('TILED');
    
    // Custom evalscript for CH4 visualization with color mapping
    const ch4Evalscript = `
//VERSION=3
function setup() {
  return {
    input: [{
      bands: ["CH4"],
      units: "DN"
    }],
    output: { 
      bands: 4,
      sampleType: "AUTO"
    }
  };
}

function evaluatePixel(sample) {
  // CH4 values from Sentinel-5P TROPOMI (typical range: 1750-1950 ppb)
  const ch4 = sample.CH4;
  
  // No data check
  if (ch4 === 0 || ch4 == null) {
    return [0, 0, 0, 0]; // Transparent for no data
  }
  
  // Normalize CH4 values
  const minCH4 = 1750;
  const maxCH4 = 1950;
  const normalized = Math.max(0, Math.min(1, (ch4 - minCH4) / (maxCH4 - minCH4)));
  
  // Color scale: blue (low) -> cyan -> green -> yellow -> orange -> red (high)
  let r, g, b;
  
  if (normalized < 0.2) {
    // Deep blue to blue
    const t = normalized / 0.2;
    r = 0;
    g = t * 0.3;
    b = 0.8 + t * 0.2;
  } else if (normalized < 0.4) {
    // Blue to cyan
    const t = (normalized - 0.2) / 0.2;
    r = 0;
    g = 0.3 + t * 0.7;
    b = 1.0;
  } else if (normalized < 0.6) {
    // Cyan to green
    const t = (normalized - 0.4) / 0.2;
    r = 0;
    g = 1.0;
    b = 1.0 * (1 - t);
  } else if (normalized < 0.8) {
    // Green to yellow/orange
    const t = (normalized - 0.6) / 0.2;
    r = t;
    g = 1.0;
    b = 0;
  } else {
    // Orange to red
    const t = (normalized - 0.8) / 0.2;
    r = 1.0;
    g = 1.0 * (1 - t * 0.5);
    b = 0;
  }
  
  return [r, g, b, 0.85]; // 85% opacity for good visibility
}
`;

    console.log(`📍 WMS Request: BBOX=${bbox}, LAYERS=${layers}, TIME=${time}`);

    if (!bbox) {
      console.error('❌ WMS Proxy: Missing BBOX parameter');
      return NextResponse.json(
        { error: 'BBOX parameter is required' },
        { status: 400 }
      );
    }

    // Build WMS URL - Use Process API for better control with evalscript
    const wmsUrl = `https://sh.dataspace.copernicus.eu/ogc/wms/${instanceId}`;
    const params = new URLSearchParams();
    params.set('SERVICE', service);
    params.set('VERSION', version);
    params.set('REQUEST', requestType);
    params.set('LAYERS', layers);
    if (bbox) params.set('BBOX', bbox);
    params.set('WIDTH', width);
    params.set('HEIGHT', height);
    params.set('FORMAT', format);
    params.set('CRS', crs);
    if (time) params.set('TIME', time);
    params.set('TRANSPARENT', transparent);
    
    // Add custom evalscript for CH4 visualization
    if (layers.toUpperCase() === 'CH4') {
      params.set('EVALSCRIPT', Buffer.from(ch4Evalscript).toString('base64'));
      params.set('SHOWLOGO', 'false');
      params.set('MAXCC', '100'); // Max cloud coverage
      console.log('✨ Added custom CH4 color mapping evalscript');
    }
    
    // Pass-through any additional params not explicitly handled
    searchParams.forEach((value, key) => {
      const upper = key.toUpperCase();
      if (!params.has(upper) && upper !== 'EVALSCRIPT') {
        params.set(upper, value);
      }
    });

    console.log(`🚀 Fetching: ${wmsUrl}?${params.toString()}`);

    // Make authenticated request to Sentinel Hub
    const response = await axios.get(`${wmsUrl}?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      responseType: 'arraybuffer',
      timeout: 30000,
    });

    console.log(`✅ WMS Response: ${response.status}, Content-Type: ${response.headers['content-type']}, Size: ${response.data.byteLength} bytes`);

    // Return the image with appropriate headers
    return new NextResponse(response.data, {
      status: 200,
      headers: {
        'Content-Type': response.headers['content-type'] || 'image/png',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('❌ Sentinel Hub WMS proxy error:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error(`   Response Status: ${error.response.status}`);
        console.error(`   Response Data: ${error.response.data?.toString().substring(0, 500)}`);
      }
      return NextResponse.json(
        { 
          error: 'Failed to fetch Sentinel Hub data',
          details: error.response?.data || error.message
        },
        { status: error.response?.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
