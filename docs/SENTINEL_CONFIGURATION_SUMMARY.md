# Sentinel Hub Configuration Update Summary

## 📋 Changes Made

### 1. ✅ Updated Environment Variables (.env.local)

**Changed:**
```bash
# Old Instance ID (incorrect)
SENTINEL_HUB_INSTANCE_ID=18ac4625-7282-465c-9ce9-6f9e8411d3c0

# New Instance ID (from your Copernicus Dataspace dashboard)
SENTINEL_HUB_INSTANCE_ID=c3a5b168-3586-40fd-8529-038154197e16
```

**Updated Comments:**
- Changed from "Optional: Sentinel Hub API" → "Copernicus Dataspace API"
- Added correct endpoint reference: `https://sh.dataspace.copernicus.eu/ogc/*`
- Specified it's for Sentinel-5P data

### 2. ✅ Updated Sentinel Hub Service (src/lib/sentinel-hub-service.ts)

**Changes Made:**

#### a) Endpoint Priority Reordered
- **Old**: Try Sentinel Hub commercial first, then Copernicus
- **New**: Try Copernicus Dataspace first (FREE), then Sentinel Hub as fallback

#### b) OAuth Flow Updated
- Attempts Copernicus Dataspace authentication first
- Provides better error messages with setup instructions
- Shows available layers (CH4, CO, NO2, O3, SO2, HCHO) on success
- Displays instance ID for debugging

#### c) WMS Endpoint Selection Fixed
- **Old Logic**: Used `sentinel-hub` as primary
- **New Logic**: Uses `copernicus` as primary for Sentinel-5P layers

#### d) Leaflet Configuration Updated
- Now explicitly uses `COPERNICUS_WMS_ENDPOINT` for CH4 layer
- Ensures correct endpoint regardless of which service authenticated

### 3. ✅ Created Test Script (test-sentinel-config.js)

**Features:**
- Tests OAuth authentication with Copernicus Dataspace
- Verifies WMS GetCapabilities endpoint
- Lists all available layers in your configuration
- Checks for CH4 layer availability
- Generates sample WMS URL for testing
- Provides detailed error messages and troubleshooting steps

**Usage:**
```powershell
node test-sentinel-config.js
```

### 4. ✅ Created Setup Documentation (docs/COPERNICUS_DATASPACE_SETUP.md)

**Contents:**
- Step-by-step guide to create Copernicus Dataspace account
- Instructions for creating OAuth client credentials
- How to create and configure instance with Sentinel-5P layers
- Troubleshooting guide for common issues
- Layer information and specifications
- Important URLs and resources

---

## ⚠️ Current Status

### What's Working ✅
- Configuration files updated with correct instance ID
- Service code updated to use Copernicus Dataspace
- Test script created and functional
- Documentation complete

### What Needs Your Action ⚡
Your current OAuth credentials are **NOT valid** for Copernicus Dataspace:

```
Client ID: ec0990e6-c694-434f-8d4d-0fe96cc678f8
Client Secret: tg3octnm9J...
Status: 401 - Invalid client or Invalid client credentials
```

**These credentials were likely created on:**
- Sentinel Hub commercial platform (services.sentinel-hub.com)
- A different Copernicus account
- Or may be expired/deactivated

---

## 🎯 Next Steps (Required)

### Option 1: Use Copernicus Dataspace (Recommended - FREE)

1. **Create New Credentials:**
   - Go to https://shapps.dataspace.copernicus.eu/dashboard/
   - Create OAuth client (grant type: client_credentials)
   - Create configuration with Sentinel-5P layers

2. **Update .env.local:**
   ```bash
   SENTINEL_HUB_CLIENT_ID=sh-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
   SENTINEL_HUB_CLIENT_SECRET=YOUR_NEW_SECRET
   SENTINEL_HUB_INSTANCE_ID=YOUR_CONFIG_INSTANCE_ID
   NEXT_PUBLIC_SENTINEL_HUB_INSTANCE_ID=YOUR_CONFIG_INSTANCE_ID
   ```

3. **Test Configuration:**
   ```powershell
   node test-sentinel-config.js
   ```

4. **Restart Dev Server:**
   ```powershell
   npm run dev
   ```

**Follow the guide:** `docs/COPERNICUS_DATASPACE_SETUP.md`

### Option 2: Use Existing Sentinel Hub Commercial Account

If you have a **paid** Sentinel Hub account at https://apps.sentinel-hub.com:

1. Log in to your dashboard
2. Get your OAuth credentials
3. Create a configuration with Sentinel-5P support
4. Update .env.local with those credentials

**Note:** This requires a commercial subscription.

---

## 🧪 Testing Your Setup

Once you have valid credentials:

```powershell
# 1. Test the configuration
node test-sentinel-config.js

# Expected output:
# ✅ OAuth successful!
# ✅ WMS GetCapabilities successful!
# CH4 Layer: ✅ Available
# 📊 Available Layers:
#    - CH4
#    - CO
#    - NO2
#    ...

# 2. If successful, restart your app
npm run dev

# 3. Navigate to the dashboard to see CH4 layers
# URL: http://localhost:3000/dashboard
```

---

## 📊 Available Layers (After Setup)

Your configuration instance shows these layers are available:

| Layer ID | Description | Use Case |
|----------|-------------|----------|
| **CH4** / **METHANE** | Methane concentration | Primary - Permafrost monitoring |
| **CO** / **CARBON-MONOXIDE** | Carbon monoxide | Combustion/biomass burning |
| **NO2** / **NITROGEN-DIOXIDE** | Nitrogen dioxide | Air quality/pollution |
| **O3** / **OZONE** | Ozone concentration | Atmospheric chemistry |
| **SO2** / **SULFUR-DIOXIDE** | Sulfur dioxide | Volcanic/industrial |
| **HCHO** / **FORMALDEHYDE** | Formaldehyde | Biogenic emissions |
| Various cloud layers | Cloud properties | Data quality filtering |

---

## 🔧 Files Modified

| File | Changes |
|------|---------|
| `.env.local` | Updated instance ID from `18ac...` to `c3a5...` |
| `src/lib/sentinel-hub-service.ts` | Reordered OAuth priority, fixed endpoint logic |
| `test-sentinel-config.js` | Created new test script |
| `docs/COPERNICUS_DATASPACE_SETUP.md` | Created setup guide |
| `docs/SENTINEL_CONFIGURATION_SUMMARY.md` | This file |

---

## 💡 Why These Changes?

1. **Correct Instance ID**: Your layer list showed instance ID `c3a5b168...`, but your .env had `18ac4625...`

2. **Free vs Paid**: Copernicus Dataspace is **FREE** for Sentinel-5P data, while services.sentinel-hub.com is commercial

3. **Layer Availability**: The CH4, CO, NO2 layers you need are specifically configured in the Copernicus Dataspace instance

4. **Proper Endpoints**: Sentinel-5P TROPOMI data must use the Copernicus endpoints, not commercial Sentinel Hub

---

## 📞 Support Resources

- **Copernicus Dataspace Help**: https://helpcenter.dataspace.copernicus.eu/
- **Forum**: https://forum.dataspace.copernicus.eu/
- **Documentation**: https://documentation.dataspace.copernicus.eu/
- **Email Support**: help@dataspace.copernicus.eu

---

## ✅ Success Criteria

You'll know everything is working when:

1. `node test-sentinel-config.js` shows ✅ for OAuth and WMS
2. CH4 layer appears in available layers list
3. Your dashboard displays methane overlay maps
4. No authentication errors in browser console
5. WMS tiles load successfully on the map

---

**Last Updated**: October 3, 2025
**Configuration Instance ID**: c3a5b168-3586-40fd-8529-038154197e16
**Platform**: Copernicus Dataspace (https://dataspace.copernicus.eu/)
