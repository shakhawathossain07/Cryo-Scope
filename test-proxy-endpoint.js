const axios = require('axios');

async function testProxyEndpoint() {
  console.log('🧪 Testing Sentinel WMS Proxy Endpoint\n');
  console.log('============================================================\n');

  const proxyUrl = 'http://localhost:9002/api/sentinel-wms';
  
  // Test 1: Same parameters as the failing request
  const testParams1 = {
    service: 'WMS',
    request: 'GetMap',
    layers: 'CH4',
    styles: '',
    format: 'image/png',
    transparent: 'true',
    version: '1.3.0',
    tiled: 'true',
    time: '2025-09-25/2025-10-02',
    width: '256',
    height: '256',
    crs: 'EPSG:3857',
    bbox: '10018754.171394622,10018754.171394628,15028131.257091936,15028131.257091928',
  };

  console.log('📍 Test 1: EPSG:3857 (exactly like the failing request)...');
  console.log(`   URL: ${proxyUrl}?${new URLSearchParams(testParams1).toString()}\n`);

  try {
    const response1 = await axios.get(proxyUrl, {
      params: testParams1,
      responseType: 'arraybuffer',
      timeout: 30000,
    });
    console.log(`✅ Success! Status: ${response1.status}, Size: ${response1.data.byteLength} bytes`);
    console.log(`   Content-Type: ${response1.headers['content-type']}\n`);
  } catch (error) {
    console.log(`❌ Failed! Status: ${error.response?.status}`);
    if (error.response?.data) {
      const errorText = Buffer.from(error.response.data).toString('utf-8');
      console.log(`   Error: ${errorText}\n`);
    } else {
      console.log(`   Error: ${error.message}\n`);
    }
  }

  // Test 2: Simple EPSG:4326 request
  const testParams2 = {
    service: 'WMS',
    request: 'GetMap',
    layers: 'CH4',
    format: 'image/png',
    transparent: 'true',
    version: '1.3.0',
    time: '2025-09-25/2025-10-02',
    width: '256',
    height: '256',
    crs: 'EPSG:4326',
    bbox: '60,70,75,170',
  };

  console.log('📍 Test 2: EPSG:4326 (simpler coordinates)...');
  try {
    const response2 = await axios.get(proxyUrl, {
      params: testParams2,
      responseType: 'arraybuffer',
      timeout: 30000,
    });
    console.log(`✅ Success! Status: ${response2.status}, Size: ${response2.data.byteLength} bytes`);
    console.log(`   Content-Type: ${response2.headers['content-type']}\n`);
  } catch (error) {
    console.log(`❌ Failed! Status: ${error.response?.status}`);
    if (error.response?.data) {
      const errorText = Buffer.from(error.response.data).toString('utf-8');
      console.log(`   Error: ${errorText}\n`);
    } else {
      console.log(`   Error: ${error.message}\n`);
    }
  }

  console.log('============================================================');
}

testProxyEndpoint();
