import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export const runtime = 'nodejs';

// Cache token to avoid repeated OAuth calls
let cachedToken: {
  access_token: string;
  expires_at: number;
} | null = null;

async function getAccessToken(): Promise<string> {
  const clientId = process.env.SENTINEL_HUB_CLIENT_ID;
  const clientSecret = process.env.SENTINEL_HUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Sentinel Hub credentials not configured');
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

    console.log(`📍 WMS Request: BBOX=${bbox}, LAYERS=${layers}, TIME=${time}`);

    if (!bbox) {
      console.error('❌ WMS Proxy: Missing BBOX parameter');
      return NextResponse.json(
        { error: 'BBOX parameter is required' },
        { status: 400 }
      );
    }

    // Build WMS URL
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
    // Pass-through any additional params not explicitly handled
    searchParams.forEach((value, key) => {
      const upper = key.toUpperCase();
      if (!params.has(upper)) {
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
