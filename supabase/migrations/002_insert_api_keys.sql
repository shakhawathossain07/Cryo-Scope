-- Insert API Keys Script
-- Run this manually from Supabase SQL Editor with your actual API keys
-- IMPORTANT: Use the service role, not anon key, when running this script

-- Replace the placeholder values with your actual API keys before running

INSERT INTO api_keys (key_name, key_value, description, is_active) VALUES
  (
    'OPENROUTER_API_KEY', 
    'sk-or-v1-YOUR_KEY_HERE', 
    'OpenRouter API for AI report generation (Gemini 2.0 Flash)',
    true
  ),
  (
    'SENTINEL_HUB_CLIENT_ID', 
    'sh-YOUR_CLIENT_ID_HERE', 
    'Sentinel Hub OAuth Client ID for Copernicus Dataspace',
    true
  ),
  (
    'SENTINEL_HUB_CLIENT_SECRET', 
    'YOUR_CLIENT_SECRET_HERE', 
    'Sentinel Hub OAuth Client Secret for Copernicus Dataspace',
    true
  ),
  (
    'SENTINEL_HUB_INSTANCE_ID', 
    'c3a5b168-3586-40fd-8529-038154197e16', 
    'Sentinel Hub Configuration Instance ID for CH₄ visualization',
    true
  ),
  (
    'NASA_API_KEY', 
    'YOUR_NASA_KEY_HERE', 
    'NASA POWER API Key for temperature data',
    true
  ),
  (
    'EARTHDATA_BEARER_TOKEN', 
    'YOUR_EARTHDATA_TOKEN_HERE', 
    'NASA Earthdata Bearer Token for authenticated requests',
    true
  ),
  (
    'EARTHDATA_CLIENT_ID', 
    'cryo-scope-app', 
    'NASA Earthdata Client ID',
    true
  ),
  (
    'GOOGLE_MAPS_API_KEY', 
    'YOUR_GOOGLE_MAPS_KEY_HERE', 
    'Google Maps JavaScript API Key for satellite views',
    true
  ),
  (
    'GEMINI_API_KEY', 
    'YOUR_GEMINI_KEY_HERE', 
    'Google Gemini API Key (legacy - may not be used)',
    true
  )
ON CONFLICT (key_name) 
DO UPDATE SET 
  key_value = EXCLUDED.key_value,
  updated_at = NOW();

-- Verify the insert
SELECT key_name, description, is_active, created_at 
FROM api_keys 
ORDER BY key_name;
