-- ====================================================================
-- VERIFICATION SCRIPT: Check if API Keys are in Supabase
-- ====================================================================
-- Run this in Supabase SQL Editor to verify your setup
-- URL: https://supabase.com/dashboard/project/siaxwbhyahlshwqzvafe/sql

-- ====================================================================
-- STEP 1: Check if table exists
-- ====================================================================
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_name = 'api_keys';

-- Expected: 1 row showing 'api_keys' table
-- If 0 rows: Run supabase/RUN_THIS_FIRST.sql first!

-- ====================================================================
-- STEP 2: Count total API keys
-- ====================================================================
SELECT COUNT(*) as total_keys FROM api_keys;

-- Expected: 9 keys
-- If 0: Run supabase/QUICK_INSERT_KEYS.sql
-- If less than 9: Some keys are missing

-- ====================================================================
-- STEP 3: List all API keys (with preview)
-- ====================================================================
SELECT 
  key_name,
  LEFT(key_value, 30) || '...' as key_preview,
  is_active,
  access_count,
  last_accessed_at,
  created_at
FROM api_keys
ORDER BY key_name;

-- Expected 9 rows:
-- 1. EARTHDATA_BEARER_TOKEN
-- 2. EARTHDATA_CLIENT_ID
-- 3. GEMINI_API_KEY
-- 4. GOOGLE_MAPS_API_KEY
-- 5. NASA_API_KEY
-- 6. OPENROUTER_API_KEY
-- 7. SENTINEL_HUB_CLIENT_ID
-- 8. SENTINEL_HUB_CLIENT_SECRET
-- 9. SENTINEL_HUB_INSTANCE_ID

-- ====================================================================
-- STEP 4: Check for inactive or missing keys
-- ====================================================================
SELECT 
  key_name,
  is_active,
  CASE 
    WHEN key_value IS NULL THEN '❌ NULL'
    WHEN key_value = '' THEN '❌ EMPTY'
    WHEN LENGTH(key_value) < 10 THEN '⚠️ TOO SHORT'
    ELSE '✅ OK'
  END as status
FROM api_keys
ORDER BY is_active DESC, key_name;

-- All should show:
-- is_active = true
-- status = '✅ OK'

-- ====================================================================
-- STEP 5: Check RLS policies (security)
-- ====================================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'api_keys';

-- Expected: 2 policies
-- 1. api_keys_select_policy (SELECT for service_role)
-- 2. api_keys_update_policy (UPDATE for service_role)

-- ====================================================================
-- STEP 6: Test access with service role
-- ====================================================================
-- This query simulates what your app does
SELECT 
  key_value,
  is_active
FROM api_keys
WHERE key_name = 'OPENROUTER_API_KEY'
  AND is_active = true;

-- Expected: 1 row with your OpenRouter key
-- If error: Check RLS policies and service role key

-- ====================================================================
-- STEP 7: Check access tracking
-- ====================================================================
SELECT 
  key_name,
  access_count,
  last_accessed_at,
  CASE 
    WHEN last_accessed_at IS NULL THEN '⚠️ Never accessed'
    WHEN last_accessed_at > NOW() - INTERVAL '1 hour' THEN '✅ Recently used'
    WHEN last_accessed_at > NOW() - INTERVAL '1 day' THEN '⚠️ Used today'
    ELSE '❌ Not used recently'
  END as usage_status
FROM api_keys
ORDER BY access_count DESC;

-- If all show "Never accessed": App is NOT using Supabase (still using env vars!)
-- If some show "Recently used": App IS using Supabase ✅

-- ====================================================================
-- TROUBLESHOOTING QUERIES
-- ====================================================================

-- If you need to reset access counts:
-- UPDATE api_keys SET access_count = 0, last_accessed_at = NULL;

-- If you need to reactivate a key:
-- UPDATE api_keys SET is_active = true WHERE key_name = 'YOUR_KEY_NAME';

-- If you need to update a key value:
-- UPDATE api_keys SET key_value = 'new_value' WHERE key_name = 'YOUR_KEY_NAME';

-- ====================================================================
-- EXPECTED RESULTS SUMMARY
-- ====================================================================
-- ✅ Table exists: 1 row
-- ✅ Total keys: 9
-- ✅ All keys active: true
-- ✅ All keys have values: status = '✅ OK'
-- ✅ RLS policies: 2 policies
-- ✅ Service role access: Returns key value
-- ✅ Access tracking: Shows usage (if app is using Supabase)

-- If any check fails, see FIX_DEMO_KEY_ISSUE.md for solutions!
