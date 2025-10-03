# Copernicus Dataspace Configuration Guide

## ⚠️ Current Issue

Your OAuth credentials (`ec0990e6-c694-434f-8d4d-0fe96cc678f8`) are returning `invalid_client` when authenticating with Copernicus Dataspace.

## 🔧 Solution: Create New Copernicus Dataspace Credentials

### Step 1: Sign Up / Sign In

1. Go to **[Copernicus Dataspace](https://dataspace.copernicus.eu/)**
2. Click **"Sign In"** or **"Register"** (top right)
3. Create account or log in with existing credentials

### Step 2: Access the Dashboard

1. After logging in, go to **[Dashboard](https://shapps.dataspace.copernicus.eu/dashboard/)**
2. Or navigate to: `https://shapps.dataspace.copernicus.eu/dashboard/`

### Step 3: Create OAuth Client

1. In the dashboard, click **"OAuth clients"** in the left sidebar
2. Click **"+ Create new OAuth client"** button
3. Fill in the form:
   - **Name**: `Cryo-Scope App`
   - **Redirect URIs**: Leave blank (not needed for client_credentials)
   - **Grant Types**: Select **"Client Credentials"**
4. Click **"Create"**
5. **IMPORTANT**: Copy your **Client ID** and **Client Secret** immediately!
   - You won't be able to see the secret again
   - Client ID format: `sh-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - Client Secret format: Random alphanumeric string

### Step 4: Create Configuration Instance

1. In the dashboard, click **"Configurations"** in the left sidebar
2. Click **"+ Create configuration"** button
3. Fill in the form:
   - **Name**: `Cryo-Scope Sentinel-5P Methane`
   - **Description**: `Sentinel-5P TROPOMI layers for permafrost monitoring`
4. Click **"Create"**

### Step 5: Add Sentinel-5P Layers

1. Open your new configuration
2. Click **"+ Add layer"** button
3. Add the following layers:

   **For Methane (Primary):**
   - Layer ID: `CH4` or `METHANE`
   - Data Collection: `Sentinel-5P`
   - Layer Type: `Methane (CH4)`

   **Optional Additional Layers:**
   - `CO` - Carbon Monoxide
   - `NO2` - Nitrogen Dioxide
   - `O3` - Ozone
   - `SO2` - Sulfur Dioxide
   - `HCHO` - Formaldehyde

4. Save your configuration
5. **Copy the Configuration Instance ID**
   - Format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - You'll find this in the configuration details

### Step 6: Update Your .env.local File

Replace the current Sentinel Hub values with your NEW credentials:

```bash
# Copernicus Dataspace API for Sentinel-5P data
# OAuth Client credentials for Copernicus Dataspace (https://dataspace.copernicus.eu/)
SENTINEL_HUB_CLIENT_ID=sh-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
SENTINEL_HUB_CLIENT_SECRET=YOUR_NEW_CLIENT_SECRET_HERE
SENTINEL_HUB_INSTANCE_ID=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
NEXT_PUBLIC_SENTINEL_HUB_INSTANCE_ID=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
```

### Step 7: Test Your Configuration

```powershell
# Test the configuration
node test-sentinel-config.js

# If successful, restart your dev server
npm run dev
```

## 📊 Expected Test Output

When successful, you should see:

```
✅ OAuth successful!
Token Type: Bearer
Expires In: 3600 seconds (60 minutes)

✅ WMS GetCapabilities successful!
CH4 Layer: ✅ Available

📊 Available Layers:
   - CH4
   - CO
   - NO2
   - O3
   - SO2
   - HCHO
   ...
```

## 🔍 Troubleshooting

### Issue: "invalid_client" Error

**Cause**: OAuth credentials are incorrect or not valid for Copernicus Dataspace

**Solution**:
1. Double-check you copied the credentials correctly
2. Ensure you're using credentials from **Copernicus Dataspace** (not Sentinel Hub commercial)
3. Verify the OAuth client is **activated** in the dashboard
4. Try creating a new OAuth client

### Issue: "Instance not found" Error

**Cause**: Configuration Instance ID doesn't match your OAuth client

**Solution**:
1. Verify the Instance ID in your configuration dashboard
2. Ensure the configuration is linked to your OAuth client
3. Try creating a new configuration

### Issue: "CH4 Layer Not Available"

**Cause**: Layer not added to configuration

**Solution**:
1. Open your configuration in the dashboard
2. Click "+ Add layer"
3. Add the CH4/Methane layer from Sentinel-5P collection
4. Save and wait a few minutes for propagation

## 🌐 Important URLs

- **Main Portal**: https://dataspace.copernicus.eu/
- **Dashboard**: https://shapps.dataspace.copernicus.eu/dashboard/
- **OAuth Endpoint**: https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token
- **WMS Endpoint**: https://sh.dataspace.copernicus.eu/ogc/wms/{INSTANCE_ID}
- **Documentation**: https://documentation.dataspace.copernicus.eu/

## 📖 Additional Resources

- [Copernicus Dataspace API Documentation](https://documentation.dataspace.copernicus.eu/APIs.html)
- [Sentinel-5P TROPOMI Data Guide](https://sentinels.copernicus.eu/web/sentinel/user-guides/sentinel-5p-tropomi)
- [WMS Protocol Specification](https://www.ogc.org/standards/wms)

## ✅ After Setup

Once configured correctly, your Cryo-Scope application will be able to:
- Display real-time methane (CH4) concentration maps
- Overlay satellite data on interactive maps
- Track permafrost degradation indicators
- Identify methane hotspots in Arctic regions

## 🎯 Layer Information

### CH4 (Methane) Layer

- **Source**: Sentinel-5P TROPOMI
- **Resolution**: 7 km × 3.5 km (at nadir)
- **Temporal Coverage**: Daily (weather permitting)
- **Update Frequency**: Near real-time (within 3 hours)
- **Units**: ppbv (parts per billion by volume)
- **Typical Range**: 1750-1950 ppbv
- **Hotspot Threshold**: >2000 ppbv

Perfect for monitoring:
- Permafrost methane emissions
- Arctic wetland emissions
- Natural gas infrastructure leaks
- Biomass burning events
