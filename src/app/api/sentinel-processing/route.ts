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
 * NASA-Grade Methane Visualization Evalscript - MILITARY PRECISION
 * Visualizes Sentinel-5P TROPOMI CH4 concentrations with scientific color scale
 * 
 * Color Scale (ppb equivalent):
 * - Dark Blue: <1750 ppb (Very Low)
 * - Blue: 1750-1850 ppb (Background)
 * - Green: 1850-1950 ppb (Normal)
 * - Yellow: 1950-2050 ppb (Elevated)
 * - Orange: 2050-2150 ppb (High)
 * - Red: 2150+ ppb (Critical)
 * 
 * ENHANCED: Increased visibility, handles sparse data, debug output
 */
const METHANE_EVALSCRIPT = `
//VERSION=3
function setup() {
  return {
    input: [{
      bands: ["CH4", "dataMask"],
      units: "DN"
    }],
    output: {
      bands: 4
    }
  };
}

function evaluatePixel(sample) {
  // CH4 values are in mol/m² - convert to ppb equivalent for visualization
  // TROPOMI typical range: 0.0018 to 0.0022 mol/m² ≈ 1700-2200 ppb
  let ch4 = sample.CH4;
  
  // Check if we have valid data
  if (sample.dataMask === 0 || ch4 === 0) {
    // No data - return transparent
    return [0, 0, 0, 0];
  }
  
  // Normalize to ppb scale (scientific conversion)
  // Standard atmosphere: 1 mol/m² column ≈ 1 ppm = 1000 ppb
  // TROPOMI measures total column, typical values 0.0018-0.0022 mol/m²
  let ch4_ppb = ch4 * 1000000; // Convert mol/m² to ppb equivalent
  
  // Define color scale thresholds (ppb)
  let veryLow = 1750;
  let background = 1850;
  let normal = 1950;
  let elevated = 2050;
  let high = 2150;
  
  let r, g, b, a;
  
  if (ch4_ppb < veryLow) {
    // Very low - dark blue (rare, likely data quality issue)
    r = 0.0;
    g = 0.0;
    b = 0.5;
    a = 0.6;
  } else if (ch4_ppb < background) {
    // Background - blue
    r = 0.0;
    g = 0.4;
    b = 1.0;
    a = 0.7;
  } else if (ch4_ppb < normal) {
    // Normal - green
    r = 0.0;
    g = 0.9;
    b = 0.2;
    a = 0.8;
  } else if (ch4_ppb < elevated) {
    // Elevated - yellow
    r = 1.0;
    g = 0.95;
    b = 0.0;
    a = 0.85;
  } else if (ch4_ppb < high) {
    // High - orange
    r = 1.0;
    g = 0.5;
    b = 0.0;
    a = 0.9;
  } else {
    // Critical - red
    r = 1.0;
    g = 0.0;
    b = 0.0;
    a = 0.95;
  }
  
  // For debugging: if we have ANY valid CH4 data, ensure it's visible
  // Minimum opacity for valid data points
  if (sample.dataMask > 0 && ch4 > 0) {
    a = Math.max(a, 0.5);
  }
  
  return [r, g, b, a];
}
`;

export async function POST(request: NextRequest) {
  try {
    console.log('\n🔬 ======================================');
    console.log('🔬 Processing API: Incoming CH4 visualization request');
    console.log('🔬 ======================================');
    
    const body = await request.json();
    const { bbox, width = 512, height = 512, timeRange } = body;

    console.log(`   📦 BBox: [${bbox?.join(', ') || 'undefined'}]`);
    console.log(`   📐 Dimensions: ${width}×${height}`);
    console.log(`   📅 Time Range: ${timeRange?.from || 'default'} → ${timeRange?.to || 'default'}`);

    if (!bbox || !Array.isArray(bbox) || bbox.length !== 4) {
      console.error('   ❌ Invalid bbox format');
      return NextResponse.json(
        { error: 'Invalid bbox. Expected [minX, minY, maxX, maxY]' },
        { status: 400 }
      );
    }

    // Get OAuth token
    console.log('   🔐 Requesting OAuth token...');
    const token = await getAccessToken();
    console.log('   ✅ OAuth token obtained');

    // Build Processing API request
    const processingRequest = {
      input: {
        bounds: {
          bbox: bbox,
          properties: {
            crs: "http://www.opengis.net/def/crs/EPSG/0/3857"
          }
        },
        data: [
          {
            type: "sentinel-5p-l2",
            dataFilter: {
              timeRange: timeRange || {
                from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T00:00:00Z',
                to: new Date().toISOString().split('T')[0] + 'T23:59:59Z'
              },
              mosaickingOrder: "mostRecent",
              maxCloudCoverage: 100 // Arctic regions often have clouds
            }
          }
        ]
      },
      output: {
        width: width,
        height: height,
        responses: [
          {
            identifier: "default",
            format: {
              type: "image/png"
            }
          }
        ]
      },
      evalscript: METHANE_EVALSCRIPT
    };

    console.log(`   🚀 Sending request to Sentinel Hub Processing API...`);
    console.log(`   🌐 URL: https://sh.dataspace.copernicus.eu/api/v1/process`);

    // Make authenticated request to Sentinel Hub Processing API
    const response = await axios.post(
      'https://sh.dataspace.copernicus.eu/api/v1/process',
      processingRequest,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'image/png'
        },
        responseType: 'arraybuffer',
        timeout: 45000, // Increased timeout for Arctic regions
      }
    );

    console.log(`   ✅ Processing API Response: ${response.status}`);
    console.log(`   📏 Image Size: ${response.data.byteLength} bytes`);
    console.log(`   📊 Content-Type: ${response.headers['content-type']}`);

    if (response.data.byteLength === 0) {
      console.warn('   ⚠️ Received empty response from Processing API');
      return NextResponse.json(
        { error: 'No data available for this region/time' },
        { status: 404 }
      );
    }

    console.log('✅ ======================================');
    console.log('✅ Successfully generated CH4 visualization');
    console.log('✅ ======================================\n');

    // Return the image
    return new NextResponse(response.data, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=1800', // 30 minutes cache
        'X-Image-Size': response.data.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('\n❌ ======================================');
    console.error('❌ Sentinel Hub Processing API error:');
    console.error('❌ ======================================');
    console.error(error);
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error(`   Response Status: ${error.response.status}`);
        const errorText = error.response.data?.toString?.() || JSON.stringify(error.response.data);
        console.error(`   Response Data: ${errorText.substring(0, 500)}`);
      } else if (error.request) {
        console.error(`   No response received from Sentinel Hub`);
        console.error(`   Request timeout or network error`);
      }
      console.error('❌ ======================================\n');
      
      return NextResponse.json(
        { 
          error: 'Failed to fetch Sentinel Hub data',
          details: error.response?.data || error.message,
          hint: 'Data may be unavailable for this Arctic region/time period'
        },
        { status: error.response?.status || 500 }
      );
    }

    console.error('❌ ======================================\n');
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
