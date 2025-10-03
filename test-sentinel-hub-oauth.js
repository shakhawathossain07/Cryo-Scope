/**
 * Test script to verify Sentinel Hub OAuth credentials
 * Run with: node test-sentinel-hub-oauth.js
 */

const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const CLIENT_ID = process.env.SENTINEL_HUB_CLIENT_ID;
const CLIENT_SECRET = process.env.SENTINEL_HUB_CLIENT_SECRET;
const INSTANCE_ID = process.env.SENTINEL_HUB_INSTANCE_ID;

console.log('🔍 Testing Sentinel Hub OAuth Configuration\n');
console.log('Client ID:', CLIENT_ID ? `${CLIENT_ID.substring(0, 20)}...` : 'MISSING');
console.log('Client Secret:', CLIENT_SECRET ? `${CLIENT_SECRET.substring(0, 10)}...` : 'MISSING');
console.log('Instance ID:', INSTANCE_ID ? `${INSTANCE_ID.substring(0, 20)}...` : 'MISSING');
console.log('');

if (!CLIENT_ID || !CLIENT_SECRET || !INSTANCE_ID) {
  console.error('❌ Missing credentials in .env.local file');
  process.exit(1);
}

const OAUTH_URLS = [
  {
    name: 'Copernicus Dataspace (Standard)',
    url: 'https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token'
  },
  {
    name: 'Sentinel Hub Services (Alternative)',
    url: 'https://services.sentinel-hub.com/oauth/token'
  }
];

async function testOAuthEndpoint(config) {
  console.log(`\n🔐 Testing: ${config.name}`);
  console.log(`   URL: ${config.url}`);
  
  try {
    const response = await axios.post(
      config.url,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
      }
    );

    console.log('   ✅ SUCCESS!');
    console.log('   Token type:', response.data.token_type);
    console.log('   Expires in:', response.data.expires_in, 'seconds');
    console.log('   Access token:', response.data.access_token.substring(0, 50) + '...');
    return { success: true, endpoint: config.name, token: response.data.access_token };
  } catch (error) {
    console.log('   ❌ FAILED');
    if (error.response) {
      console.log('   Status:', error.response.status, error.response.statusText);
      console.log('   Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('   Error:', error.message);
    }
    return { success: false, endpoint: config.name, error: error.message };
  }
}

async function testWMSAccess(token) {
  console.log('\n🌍 Testing WMS Access with token...');
  
  const wmsUrl = `https://sh.dataspace.copernicus.eu/ogc/wms/${INSTANCE_ID}`;
  const params = {
    SERVICE: 'WMS',
    VERSION: '1.3.0',
    REQUEST: 'GetCapabilities',
  };
  
  try {
    const response = await axios.get(wmsUrl, {
      params,
      headers: {
        'Authorization': `Bearer ${token}`
      },
      timeout: 10000,
    });
    
    console.log('   ✅ WMS GetCapabilities successful');
    console.log('   Response length:', response.data.length, 'characters');
    
    // Check if CH4 layer is mentioned
    if (response.data.includes('CH4') || response.data.includes('Methane')) {
      console.log('   ✅ CH4/Methane layer found in capabilities!');
    } else {
      console.log('   ⚠️ CH4 layer not found in capabilities');
    }
    
    return true;
  } catch (error) {
    console.log('   ❌ WMS request failed');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Error:', error.response.data ? error.response.data.substring(0, 200) : 'No data');
    } else {
      console.log('   Error:', error.message);
    }
    return false;
  }
}

async function main() {
  console.log('════════════════════════════════════════════════════\n');
  
  const results = [];
  
  // Test each OAuth endpoint
  for (const config of OAUTH_URLS) {
    const result = await testOAuthEndpoint(config);
    results.push(result);
    
    if (result.success && result.token) {
      await testWMSAccess(result.token);
    }
  }
  
  console.log('\n════════════════════════════════════════════════════');
  console.log('\n📊 SUMMARY:\n');
  
  const successfulEndpoint = results.find(r => r.success);
  
  if (successfulEndpoint) {
    console.log('✅ OAuth authentication successful!');
    console.log(`   Working endpoint: ${successfulEndpoint.endpoint}`);
    console.log('\n💡 Update your code to use this endpoint.');
  } else {
    console.log('❌ All OAuth attempts failed.');
    console.log('\n🔧 Troubleshooting steps:');
    console.log('   1. Verify OAuth client is activated in Sentinel Hub dashboard');
    console.log('   2. Check if client has "Sentinel Hub Services" scope enabled');
    console.log('   3. Confirm client ID and secret are copied correctly');
    console.log('   4. Wait a few minutes if client was just created');
    console.log('   5. Try regenerating the client secret');
  }
  
  console.log('\n════════════════════════════════════════════════════\n');
}

main().catch(console.error);
