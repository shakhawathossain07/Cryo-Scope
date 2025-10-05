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
 * NASA-Grade Methane Visualization Evalscript - MAXIMUM VISIBILITY
 * Visualizes Sentinel-5P TROPOMI CH4 concentrations with scientific color scale
 * 
 * CRITICAL FIX: Sentinel-5P CH4 comes in mol/m² units (e.g. 0.00186 = 1860 ppb)
 * Need to convert and handle actual data format correctly
 */
const METHANE_EVALSCRIPT = `
//VERSION=3
function setup() {
  return {
    input: [{
      bands: ["CH4"],
      units: "DN"  // Get raw data number
    }],
    output: {
      bands: 4,
      sampleType: "AUTO"
    }
  };
}

function evaluatePixel(sample) {
  let ch4Raw = sample.CH4;
  
  // Check for truly missing data
  if (ch4Raw == null || ch4Raw === undefined || ch4Raw < 0) {
    return [0, 0, 0, 0];  // Transparent for no-data
  }
  
  // Sentinel-5P CH4 is in mol/m² (e.g., 0.00186 mol/m²)
  // Convert to ppb equivalent: multiply by 1,000,000
  // Typical range: 0.00175 - 0.00195 mol/m² = 1750-1950 ppb
  let ch4 = ch4Raw;
  
  // If value is very small (mol/m² format), convert to ppb
  if (ch4 > 0 && ch4 < 0.01) {
    ch4 = ch4 * 1000000;  // Convert mol/m² to ppb equivalent
  }
  
  // If still zero or negative, treat as no-data
  if (ch4 <= 0) {
    return [0, 0, 0, 0];
  }
  
  // Normalize to expected CH4 range (1700-2200 ppb for Arctic)
  let minCH4 = 1700;
  let maxCH4 = 2200;
  let normalized = Math.max(0, Math.min(1, (ch4 - minCH4) / (maxCH4 - minCH4)));
  
  // Apply scientific color gradient: blue (low) -> red (high)
  let r, g, b;
  
  if (normalized < 0.2) {
    // Deep blue (1700-1800 ppb)
    let t = normalized / 0.2;
    r = 0.0;
    g = t * 0.4;
    b = 0.7 + t * 0.3;
  } else if (normalized < 0.4) {
    // Blue to cyan (1800-1900 ppb)
    let t = (normalized - 0.2) / 0.2;
    r = 0.0;
    g = 0.4 + t * 0.6;
    b = 1.0;
  } else if (normalized < 0.6) {
    // Cyan to green (1900-2000 ppb)
    let t = (normalized - 0.4) / 0.2;
    r = 0.0;
    g = 1.0;
    b = 1.0 * (1.0 - t);
  } else if (normalized < 0.8) {
    // Green to yellow/orange (2000-2100 ppb)
    let t = (normalized - 0.6) / 0.2;
    r = t * 1.0;
    g = 1.0;
    b = 0.0;
  } else {
    // Orange to red (2100-2200+ ppb - HIGH)
    let t = (normalized - 0.8) / 0.2;
    r = 1.0;
    g = 1.0 * (1.0 - t * 0.6);
    b = 0.0;
  }
  
  // MAXIMUM VISIBILITY - 95% opacity for any valid CH4 data
  return [r, g, b, 0.95];
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
    console.log(`   📏 Image Size: ${response.data.byteLength} bytes (${(response.data.byteLength / 1024).toFixed(2)} KB)`);
    console.log(`   📊 Content-Type: ${response.headers['content-type']}`);

    if (response.data.byteLength === 0) {
      console.warn('   ⚠️ Received empty response from Processing API');
      return NextResponse.json(
        { error: 'No data available for this region/time' },
        { status: 404 }
      );
    }
    
    // Check if image is suspiciously small (might be transparent)
    if (response.data.byteLength < 2000) {
      console.warn(`   ⚠️ Very small image (${response.data.byteLength} bytes) - likely sparse data`);
      console.warn(`   💡 This is NORMAL for Arctic regions in October (limited sunlight)`);
      console.warn(`   💡 Sentinel-5P coverage is sparse at high latitudes`);
    } else {
      console.log(`   ✨ Good image size - likely contains visible CH4 data`);
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
