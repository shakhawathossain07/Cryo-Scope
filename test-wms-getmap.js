const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

async function testWMSGetMap() {
  console.log('🧪 Testing Sentinel Hub WMS GetMap Request\n');
  console.log('============================================================\n');

  const clientId = process.env.SENTINEL_HUB_CLIENT_ID;
  const clientSecret = process.env.SENTINEL_HUB_CLIENT_SECRET;
  const instanceId = process.env.SENTINEL_HUB_INSTANCE_ID;
  
  console.log(`📋 Using credentials:`);
  console.log(`   Client ID: ${clientId}`);
  console.log(`   Instance ID: ${instanceId}\n`);

  try {
    // Step 1: Get OAuth token
    console.log('🔐 Getting OAuth token...');
    const tokenResponse = await axios.post(
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
      }
    );
    const token = tokenResponse.data.access_token;
    console.log('✅ Token obtained\n');

    // Step 2: Test WMS GetMap with EPSG:3857 (like the failing request)
    console.log('📍 Testing GetMap with EPSG:3857 (Web Mercator)...');
    const wmsUrl3857 = `https://sh.dataspace.copernicus.eu/ogc/wms/${instanceId}`;
    const params3857 = new URLSearchParams({
      SERVICE: 'WMS',
      VERSION: '1.3.0',
      REQUEST: 'GetMap',
      LAYERS: 'CH4',
      BBOX: '10018754.171394622,10018754.171394628,15028131.257091936,15028131.257091928',
      WIDTH: '256',
      HEIGHT: '256',
      FORMAT: 'image/png',
      CRS: 'EPSG:3857',
      TIME: '2025-09-25/2025-10-02',
      TRANSPARENT: 'true',
    });

    try {
      const response3857 = await axios.get(`${wmsUrl3857}?${params3857.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'arraybuffer',
        timeout: 30000,
      });
      console.log(`✅ EPSG:3857 Success! Status: ${response3857.status}, Size: ${response3857.data.byteLength} bytes\n`);
    } catch (error) {
      console.log(`❌ EPSG:3857 Failed! Status: ${error.response?.status}`);
      if (error.response?.data) {
        const errorText = Buffer.from(error.response.data).toString('utf-8');
        console.log(`   Error message: ${errorText.substring(0, 500)}\n`);
      }
    }

    // Step 3: Test WMS GetMap with EPSG:4326 (standard lat/lon)
    console.log('📍 Testing GetMap with EPSG:4326 (Lat/Lon)...');
    const params4326 = new URLSearchParams({
      SERVICE: 'WMS',
      VERSION: '1.3.0',
      REQUEST: 'GetMap',
      LAYERS: 'CH4',
      BBOX: '60,70,75,170', // minLat,minLon,maxLat,maxLon for WMS 1.3.0 + 4326
      WIDTH: '256',
      HEIGHT: '256',
      FORMAT: 'image/png',
      CRS: 'EPSG:4326',
      TIME: '2025-09-25/2025-10-02',
      TRANSPARENT: 'true',
    });

    try {
      const response4326 = await axios.get(`${wmsUrl3857}?${params4326.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'arraybuffer',
        timeout: 30000,
      });
      console.log(`✅ EPSG:4326 Success! Status: ${response4326.status}, Size: ${response4326.data.byteLength} bytes\n`);
    } catch (error) {
      console.log(`❌ EPSG:4326 Failed! Status: ${error.response?.status}`);
      if (error.response?.data) {
        const errorText = Buffer.from(error.response.data).toString('utf-8');
        console.log(`   Error message: ${errorText.substring(0, 500)}\n`);
      }
    }

    // Step 4: Test with a simpler time range (single date)
    console.log('📍 Testing GetMap with single date...');
    const paramsSingleDate = new URLSearchParams({
      SERVICE: 'WMS',
      VERSION: '1.3.0',
      REQUEST: 'GetMap',
      LAYERS: 'CH4',
      BBOX: '60,70,75,170',
      WIDTH: '256',
      HEIGHT: '256',
      FORMAT: 'image/png',
      CRS: 'EPSG:4326',
      TIME: '2025-10-02',
      TRANSPARENT: 'true',
    });

    try {
      const responseSingle = await axios.get(`${wmsUrl3857}?${paramsSingleDate.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'arraybuffer',
        timeout: 30000,
      });
      console.log(`✅ Single date Success! Status: ${responseSingle.status}, Size: ${responseSingle.data.byteLength} bytes\n`);
    } catch (error) {
      console.log(`❌ Single date Failed! Status: ${error.response?.status}`);
      if (error.response?.data) {
        const errorText = Buffer.from(error.response.data).toString('utf-8');
        console.log(`   Error message: ${errorText.substring(0, 500)}\n`);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response?.data) {
      console.error('Response:', error.response.data);
    }
  }

  console.log('============================================================');
}

testWMSGetMap();
