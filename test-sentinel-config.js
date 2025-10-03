/**
 * Test script to verify Sentinel Hub / Copernicus Dataspace configuration
 * Run with: node test-sentinel-config.js
 */

require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

const COPERNICUS_OAUTH_URL = 'https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token';
const COPERNICUS_WMS_ENDPOINT = 'https://sh.dataspace.copernicus.eu/ogc/wms';

async function testSentinelHubConfig() {
  console.log('🧪 Testing Sentinel Hub / Copernicus Dataspace Configuration\n');
  console.log('=' .repeat(60));
  
  // Check environment variables
  console.log('\n📋 Environment Variables:');
  const clientId = process.env.SENTINEL_HUB_CLIENT_ID;
  const clientSecret = process.env.SENTINEL_HUB_CLIENT_SECRET;
  const instanceId = process.env.SENTINEL_HUB_INSTANCE_ID;
  
  console.log(`   Client ID: ${clientId ? '✅ ' + clientId : '❌ Not configured'}`);
  console.log(`   Client Secret: ${clientSecret ? '✅ ' + clientSecret.substring(0, 10) + '...' : '❌ Not configured'}`);
  console.log(`   Instance ID: ${instanceId ? '✅ ' + instanceId : '❌ Not configured'}`);
  
  if (!clientId || !clientSecret || !instanceId) {
    console.error('\n❌ Missing required environment variables!');
    process.exit(1);
  }
  
  // Test OAuth authentication
  console.log('\n\n🔐 Testing OAuth Authentication:');
  console.log(`   Endpoint: ${COPERNICUS_OAUTH_URL}`);
  
  try {
    const response = await axios.post(
      COPERNICUS_OAUTH_URL,
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
    
    const { access_token, expires_in, token_type } = response.data;
    console.log('   ✅ OAuth successful!');
    console.log(`   Token Type: ${token_type}`);
    console.log(`   Expires In: ${expires_in} seconds (${Math.floor(expires_in / 60)} minutes)`);
    console.log(`   Access Token: ${access_token.substring(0, 20)}...`);
    
    // Test WMS GetCapabilities
    console.log('\n\n🗺️  Testing WMS GetCapabilities:');
    const wmsUrl = `${COPERNICUS_WMS_ENDPOINT}/${instanceId}`;
    console.log(`   Endpoint: ${wmsUrl}`);
    
    try {
      const capabilitiesUrl = `${wmsUrl}?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities`;
      const wmsResponse = await axios.get(capabilitiesUrl, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
        timeout: 15000,
      });
      
      console.log('   ✅ WMS GetCapabilities successful!');
      console.log(`   Response size: ${wmsResponse.data.length} bytes`);
      
      // Check for CH4 layer
      const hasMethanLayer = wmsResponse.data.includes('CH4') || 
                             wmsResponse.data.includes('Methane');
      console.log(`   CH4 Layer: ${hasMethanLayer ? '✅ Available' : '⚠️  Not found in capabilities'}`);
      
      // Extract layer names
      const layerMatches = wmsResponse.data.match(/<Name>([^<]+)<\/Name>/g);
      if (layerMatches) {
        console.log('\n   📊 Available Layers:');
        const layers = layerMatches
          .map(m => m.replace(/<\/?Name>/g, ''))
          .filter(l => !l.startsWith('http')); // Filter out namespace URLs
        layers.slice(0, 15).forEach(layer => {
          console.log(`      - ${layer}`);
        });
        if (layers.length > 15) {
          console.log(`      ... and ${layers.length - 15} more`);
        }
      }
      
    } catch (wmsError) {
      console.error('   ❌ WMS GetCapabilities failed!');
      if (axios.isAxiosError(wmsError)) {
        console.error(`   Status: ${wmsError.response?.status}`);
        console.error(`   Message: ${wmsError.response?.statusText}`);
        console.error(`   Data: ${JSON.stringify(wmsError.response?.data).substring(0, 200)}`);
      }
    }
    
    // Generate sample WMS URL
    console.log('\n\n🖼️  Sample WMS URL for CH4 Layer:');
    const today = new Date().toISOString().split('T')[0];
    const sampleBbox = [70, 155, 75, 170]; // Alaska region
    const sampleUrl = `${wmsUrl}?` + new URLSearchParams({
      SERVICE: 'WMS',
      VERSION: '1.3.0',
      REQUEST: 'GetMap',
      LAYERS: 'CH4',
      BBOX: sampleBbox.join(','),
      WIDTH: '512',
      HEIGHT: '512',
      FORMAT: 'image/png',
      CRS: 'EPSG:4326',
      TIME: `${today}/${today}`,
      TRANSPARENT: 'true',
    }).toString();
    
    console.log(`   ${sampleUrl}`);
    console.log('\n   💡 You can test this URL in a browser (may require auth)');
    
    console.log('\n\n' + '='.repeat(60));
    console.log('✅ Configuration test completed successfully!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n\n❌ OAuth Authentication Failed!');
    if (axios.isAxiosError(error)) {
      console.error(`   Status: ${error.response?.status}`);
      console.error(`   Error: ${error.response?.data?.error}`);
      console.error(`   Description: ${error.response?.data?.error_description}`);
      console.error('\n💡 Troubleshooting:');
      console.error('   1. Verify your credentials at: https://shapps.dataspace.copernicus.eu/dashboard/');
      console.error('   2. Ensure the OAuth client is activated');
      console.error('   3. Check that the instance ID matches your configuration');
      console.error(`   4. Current Instance ID: ${instanceId}`);
    } else {
      console.error(`   ${error.message}`);
    }
    console.error('\n' + '='.repeat(60));
    process.exit(1);
  }
}

// Run the test
testSentinelHubConfig().catch(error => {
  console.error('\n💥 Unexpected error:', error);
  process.exit(1);
});
