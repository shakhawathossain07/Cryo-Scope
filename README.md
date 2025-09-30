# Cryo-Scope: Permafrost Insights

AI-assisted Arctic permafrost monitoring dashboard with **real-time NASA satellite data** integration.

## � NASA API Integration ✅ ACTIVE

Your NASA API key has been successfully integrated: `1MPAn5qX...` (Authenticated)

The app now connects to real NASA satellite data sources:
- **NASA POWER API**: ✅ Real temperature and climate data (Arctic regions)
- **NASA GIBS**: ✅ Satellite imagery and visualizations  
- **NASA Earthdata**: ✅ Sentinel-5P TROPOMI methane data
- **NASA CMR**: ✅ Comprehensive metadata repository

### Live Data Status
- **API Connection**: ✅ Connected and authenticated
- **Rate Limit**: Available (1000+ requests/hour)
- **Data Coverage**: Arctic regions (Siberia, Alaska, Canada, Greenland)
- **Update Frequency**: Real-time satellite data

### Monitored Regions
- **Siberian Tundra** (70°N, 110°E) - Yamal Peninsula, Lena River Delta
- **Alaskan North Slope** (70.2°N, 148.5°W) - Prudhoe Bay, Teshekpuk Lake  
- **Canadian Arctic Archipelago** (74°N, 95°W) - Banks Island, Resolute
- **Greenland Ice Sheet Margin** (67°N, 50°W) - Kangerlussuaq, Ilulissat

## Prerequisites

- **Node.js** 18.18+ or 20+
- **npm** 9+ 
- **NASA API Key** (optional): Get from [https://api.nasa.gov](https://api.nasa.gov) for higher rate limits
- **NASA Earthdata Account** (free): Sign up at [https://urs.earthdata.nasa.gov](https://urs.earthdata.nasa.gov)

## Getting Started

### 1. Clone & install

```bash
git clone <repository-url>
cd Cryo-Scope-main
npm install --legacy-peer-deps
```

### 2. Configure environment variables

Create a `.env.local` file:

```ini
# NASA API Configuration
NEXT_PUBLIC_NASA_API_KEY=your_nasa_api_key_here
# Get your key from: https://api.nasa.gov
# Without a key, the app uses 'DEMO_KEY' (limited to 1000 requests/hour)

# NASA Earthdata authentication (server-side)
EARTHDATA_BEARER_TOKEN=your_earthdata_token_here
EARTHDATA_CLIENT_ID=cryo-scope-app
# Generate a personal bearer token at https://urs.earthdata.nasa.gov and rotate regularly.
# Do NOT prefix with NEXT_PUBLIC_; keep these secrets on the server only.

# Optional: Enhanced map tiles
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here

# Google Earth Engine integration
NEXT_PUBLIC_GEE_WEBAPP_URL=https://earthengine.googleapis.com/map/...your_app_id...

# Google Maps Satellite integration
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_javascript_api_key

# AI Features (Genkit)
GOOGLE_GENAI_API_KEY=your_google_api_key_here
```

### 3. Run the application

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) to view the dashboard.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Real-time Data**: NASA APIs, Sentinel Hub
- **Mapping**: Leaflet with NASA GIBS satellite tiles
- **UI**: Tailwind CSS, Radix UI
- **Charts**: Recharts
- **AI**: Google Genkit with Gemini 2.5

## Project Structure

```text
src/
  lib/
    nasa-data-service.ts   # NASA API integration
  components/
    dashboard/
      satellite-map.tsx    # Real-time satellite map
      interactive-map.tsx  # Legacy risk zone visualization
      google-earth-engine-map.tsx  # Earth Engine embed view
      google-maps-satellite-map.tsx  # Google Maps satellite integration
  hooks/
    use-google-maps.ts     # Loader for Google Maps JavaScript API
  app/
    (app)/
      dashboard/          # Main dashboard with live data
      analysis/           # Data analysis tools
      prediction/         # AI-powered predictions
      reporting/          # Risk assessment reports
```

## API Integration Details

### NASA Data Service

The `nasa-data-service.ts` file provides:

- Real-time temperature anomaly data
- Methane hotspot detection with risk levels
- SAR data availability information
- Regional risk assessments

> ℹ️ **Earthdata auth required**: Configure `EARTHDATA_BEARER_TOKEN` (and optional `EARTHDATA_CLIENT_ID`) on the server to unlock live Sentinel-5P methane ingestion. Without these, the app falls back to the calibrated methane baseline.

### Data Updates

- Temperature data: Updated daily from NASA POWER
- Methane concentrations: Near real-time from Sentinel-5P
- Satellite imagery: Latest available from NASA GIBS
- Risk assessments: Calculated in real-time

## Troubleshooting

- **Map not loading**: Ensure you have internet connectivity. NASA GIBS tiles are publicly accessible.
- **API rate limits**: Add your NASA API key to increase from 1000 to 30,000 requests/hour
- **CORS errors**: The app includes fallback data for demo purposes
- **Dependencies**: Run `npm install --legacy-peer-deps` if you encounter issues

## License

Contact maintainers for commercial use.
