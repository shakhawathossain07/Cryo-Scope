-- ============================================
-- STEP 2 OF 2: INSERT YOUR API KEYS
-- ============================================
-- ⚠️  IMPORTANT: Run RUN_THIS_FIRST.sql BEFORE running this!
--
-- INSTRUCTIONS:
-- 1. Make sure you ran RUN_THIS_FIRST.sql (creates the table)
-- 2. Review the values below (pre-filled from your .env.local)
-- 3. Run this SQL in Supabase SQL Editor
-- 4. Verify by checking the SELECT results at the bottom
-- 5. Add SUPABASE_SERVICE_ROLE_KEY to your environment variables

-- ============================================
-- INSERT YOUR ACTUAL VALUES
-- ============================================

INSERT INTO api_keys (key_name, key_value, description, is_active) 
VALUES
  -- OpenRouter (for AI report generation)
  (
    'OPENROUTER_API_KEY', 
    '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',
    'OpenRouter API for AI report generation (Gemini 2.0 Flash)',
    true
  ),
  
  -- Sentinel Hub Credentials
  (
    'SENTINEL_HUB_CLIENT_ID', 
    'sh-2f9e2292-6d4a-4834-b1bf-aa5be2d54130',
    'Sentinel Hub OAuth Client ID for Copernicus Dataspace',
    true
  ),
  (
    'SENTINEL_HUB_CLIENT_SECRET', 
    'HSLDwMpNe8DBYXUw8lvby22urrnggVU2',
    'Sentinel Hub OAuth Client Secret for Copernicus Dataspace',
    true
  ),
  (
    'SENTINEL_HUB_INSTANCE_ID', 
    'c3a5b168-3586-40fd-8529-038154197e16',
    'Sentinel Hub Configuration Instance ID for CH₄ visualization',
    true
  ),
  
  -- NASA APIs
  (
    'NASA_API_KEY', 
    '1MPAn5qXiQTE3Vktj19FRcM4Nq8wDh3FlOcjkGJX',
    'NASA POWER API Key for temperature data',
    true
  ),
  (
    'EARTHDATA_BEARER_TOKEN', 
    'eyJ0eXAiOiJKV1QiLCJvcmlnaW4iOiJFYXJ0aGRhdGEgTG9naW4iLCJzaWciOiJlZGxqd3RwdWJrZXlfb3BzIiwiYWxnIjoiUlMyNTYifQ.eyJ0eXBlIjoiVXNlciIsInVpZCI6InNoYWtoYXdhdGhvc3NhaW4wNyIsImV4cCI6MTc2NDQ2MDc5OSwiaWF0IjoxNzU5MjEzMDQ4LCJpc3MiOiJodHRwczovL3Vycy5lYXJ0aGRhdGEubmFzYS5nb3YiLCJpZGVudGl0eV9wcm92aWRlciI6ImVkbF9vcHMiLCJhY3IiOiJlZGwiLCJhc3N1cmFuY2VfbGV2ZWwiOjN9.sg0yE6R1QaRTPMtz8n9TwmwSsWozhG5Vb7liVhfykHd5QCYsw-APKhBL_yEASZ5qJ0q3BH8Nv0wjjnXm40UllqZPL6e-PU2WIqe-un4dxYBSMtpU_utbGDj5smg4ItyRG_wCxE9EcpqQ7CvoaKPYvHcAfpMPVAKP-eBtkefvOQe4AYKEaWSI647hoKKz0ii1tXcefJP3QDi7ZpMb6KeV-3buF2aMnprnKxVq4oAQQC3TU6PlbToDlyLFOxRQtVO60U8kGkJMgF56QDsGJXlVg1c4i2RBAo2-UGyMIy1VFK_lEHfmoqSoWXm9qGDi7qJHKxjx43R4SM2vSzba4d6dyw',
    'NASA Earthdata Bearer Token for authenticated requests',
    true
  ),
  (
    'EARTHDATA_CLIENT_ID', 
    'cryo-scope-app',
    'NASA Earthdata Client ID',
    true
  ),
  
  -- Google Services
  (
    'GOOGLE_MAPS_API_KEY', 
    'AIzaSyAFXbZrqoRPLIYPBcv4IQ2Idks6CcV0WjE',
    'Google Maps JavaScript API Key for satellite views',
    true
  ),
  (
    'GEMINI_API_KEY', 
    'AIzaSyDGarEix-vnEV3PEfc_N2TboDDVitzoFak',
    'Google Gemini API Key (legacy - may not be used)',
    true
  )
ON CONFLICT (key_name) 
DO UPDATE SET 
  key_value = EXCLUDED.key_value,
  description = EXCLUDED.description,
  updated_at = NOW();

-- ============================================
-- VERIFY THE INSERT (run this to check)
-- ============================================
SELECT 
  key_name,
  LEFT(key_value, 20) || '...' as key_preview,
  description,
  is_active,
  created_at
FROM api_keys
ORDER BY key_name;

-- ============================================
-- EXPECTED OUTPUT
-- ============================================
-- You should see 9 rows with:
-- - key_name: The name of each API key
-- - key_preview: First 20 characters of the key (for verification)
-- - description: What the key is used for
-- - is_active: Should be 'true' for all
-- - created_at: Timestamp when inserted

-- ============================================
-- SECURITY CHECK
-- ============================================
-- Make sure you have replaced ALL 'your_..._here' placeholders!
-- Search this file for 'your_' to find any you might have missed.

-- ============================================
-- NEXT STEPS
-- ============================================
-- 1. Add SUPABASE_SERVICE_ROLE_KEY to your environment variables
--    (Get it from: Supabase Dashboard → Settings → API → service_role)
-- 2. Restart your application
-- 3. Test each feature that uses API keys
-- 4. Monitor key usage: SELECT * FROM api_keys_info;
