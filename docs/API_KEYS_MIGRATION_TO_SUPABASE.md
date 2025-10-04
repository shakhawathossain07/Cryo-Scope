# 🔐 API Keys Migration to Supabase - Implementation Guide

## ✅ What's Been Completed

### 1. Infrastructure Created
- ✅ **Database Table**: `supabase/migrations/001_api_keys_table.sql`
  - Secure table with Row Level Security (RLS)
  - Access tracking and analytics
  - Automated timestamp updates
  
- ✅ **Data Migration Script**: `supabase/migrations/002_insert_api_keys.sql`
  - Template for inserting API keys
  - Update with your actual keys before running
  
- ✅ **API Keys Service**: `src/lib/api-keys-service.ts`
  - Centralized key retrieval from Supabase
  - 5-minute in-memory caching
  - Automatic fallback to environment variables
  - Convenience methods for all keys

### 2. Files Updated
- ✅ `src/lib/scientific-report-service.ts` - OpenRouter key from Supabase
- ✅ `src/lib/sentinel-hub-service.ts` - Sentinel Hub credentials from Supabase
- ⚠️ `src/lib/nasa-data-service.ts` - **PARTIALLY UPDATED** (needs completion)

---

## 🚨 Remaining Work Required

### **CRITICAL**: Fix `nasa-data-service.ts`

The file has been partially updated but has compilation errors because `getEarthdataAuthConfig()` is now async but its callers haven't been updated to await it.

**Required Changes:**
1. Find all calls to `getEarthdataAuthConfig()` and add `await`
2. Make calling functions async if they aren't already
3. Update function signatures that changed from sync to async

**Affected Functions** (search for these):
- Any function calling `getEarthdataAuthConfig()` needs to:
  - Add `await auth = await getEarthdataAuthConfig()`
  - Be marked as `async`
  
**Example Fix:**
```typescript
// BEFORE:
function fetchData() {
  const auth = getEarthdataAuthConfig();
  if (!auth.isAuthenticated) return;
  // ...
}

// AFTER:
async function fetchData() {
  const auth = await getEarthdataAuthConfig();
  if (!auth.isAuthenticated) return;
  // ...
}
```

### Update API Routes
The following API routes need to be updated to use the new API keys service:

#### **Priority 1: Sentinel Hub Routes**
- `src/app/api/sentinel-processing/route.ts`
- `src/app/api/sentinel-wms/route.ts`

**Current Code Pattern:**
```typescript
const clientId = process.env.SENTINEL_HUB_CLIENT_ID;
const clientSecret = process.env.SENTINEL_HUB_CLIENT_SECRET;
```

**Updated Code Pattern:**
```typescript
import { ApiKeys } from '@/lib/api-keys-service';

const [clientId, clientSecret] = await Promise.all([
  ApiKeys.getSentinelHubClientId(),
  ApiKeys.getSentinelHubClientSecret()
]);
```

#### **Priority 2: Other Components**
Search for `process.env.NEXT_PUBLIC_SENTINEL_HUB_INSTANCE_ID` in:
- `src/app/(app)/dashboard/page.tsx`
- Any other client-side components

**Note**: Client-side components can't use server-side API keys service. Options:
1. Keep `NEXT_PUBLIC_*` variables in environment (they're public anyway)
2. Create an API route that returns public configuration
3. Pass instance ID from server components

---

## 📋 Step-by-Step Deployment Checklist

### Step 1: Run Database Migrations
```bash
# Navigate to Supabase dashboard → SQL Editor
# Run the SQL files in order:
1. supabase/migrations/001_api_keys_table.sql
2. Update values in 002_insert_api_keys.sql with your actual keys
3. Run 002_insert_api_keys.sql
```

### Step 2: Add Service Role Key to Environment
```bash
# In .env.local (for development)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# In Netlify (for production)
# Go to: Site settings → Environment variables
# Add: SUPABASE_SERVICE_ROLE_KEY
```

⚠️ **SECURITY**: Service role key must NEVER be exposed to client-side code or committed to git.

### Step 3: Fix Remaining Code Issues
1. Complete the `nasa-data-service.ts` async updates
2. Update API routes to use `ApiKeys` service
3. Test all integrations

### Step 4: Test Locally
```bash
npm run dev
# Visit http://localhost:9002
# Test each feature:
- Report generation (uses OpenRouter)
- Methane visualization (uses Sentinel Hub)
- Dashboard data (uses NASA APIs)
```

### Step 5: Deploy to Netlify
```bash
git add .
git commit -m "feat: migrate API keys to Supabase secure storage"
git push origin Legend
```

### Step 6: Verify Production
1. Check Netlify build logs
2. Test each API key-dependent feature
3. Monitor Supabase logs for key access

---

## 🔒 Security Best Practices

### DO ✅
- Store service role key only in secure environment variables
- Use RLS policies to restrict key access
- Rotate keys regularly
- Monitor key access via `last_accessed_at` and `access_count`
- Keep fallback to environment variables during transition

### DON'T ❌
- Never commit service role key to git
- Never expose service role key to client-side
- Don't disable RLS on `api_keys` table
- Don't hardcode keys in source files

---

## 🧪 Testing API Keys Service

### Manual Test
```typescript
// In a server-side file or API route
import { ApiKeys, getCacheStats } from '@/lib/api-keys-service';

// Test retrieval
const openRouterKey = await ApiKeys.getOpenRouterKey();
console.log('OpenRouter key:', openRouterKey ? '✅ Retrieved' : '❌ Missing');

// Check cache
console.log('Cache stats:', getCacheStats());
```

### Verify Fallback
```bash
# Temporarily disable Supabase service role key
# Keys should fallback to process.env values
# Re-enable service role key
# Keys should be retrieved from Supabase
```

---

## 📊 Monitoring & Maintenance

### Check Key Usage
```sql
-- Run in Supabase SQL Editor
SELECT 
  key_name,
  last_accessed_at,
  access_count,
  is_active
FROM api_keys
ORDER BY access_count DESC;
```

### Rotate a Key
```sql
-- Update a specific key
UPDATE api_keys
SET 
  key_value = 'new_key_value_here',
  updated_at = NOW()
WHERE key_name = 'OPENROUTER_API_KEY';
```

### Disable a Key
```sql
-- Temporarily disable without deleting
UPDATE api_keys
SET is_active = false
WHERE key_name = 'KEY_TO_DISABLE';
```

---

## 🐛 Troubleshooting

### Issue: "SUPABASE_SERVICE_ROLE_KEY not set"
**Solution**: Add service role key to environment variables

### Issue: "Failed to fetch API key"
**Causes**:
1. Table not created → Run migration 001
2. Key not inserted → Run migration 002 with actual values
3. RLS blocking access → Check policies (should allow service role)

### Issue: Build fails with "Cannot find name 'getEarthdataAuthConfig'"
**Solution**: Complete the async function updates in `nasa-data-service.ts`

### Issue: Runtime error "API key not found"
**Check**:
1. Key exists in Supabase `api_keys` table
2. Key is marked `is_active = true`
3. Service role key is correctly configured
4. Fallback environment variable exists (optional)

---

## 🎯 Current Status Summary

| Component | Status | Action Required |
|-----------|--------|-----------------|
| Database Table | ✅ Complete | Run migration SQL |
| API Keys Service | ✅ Complete | None |
| scientific-report-service.ts | ✅ Complete | None |
| sentinel-hub-service.ts | ✅ Complete | None |
| nasa-data-service.ts | ⚠️ Partial | Fix async/await calls |
| sentinel-processing API | ❌ Not Started | Update to use ApiKeys |
| sentinel-wms API | ❌ Not Started | Update to use ApiKeys |
| Environment Setup | ❌ Not Started | Add service role key |
| Database Populated | ❌ Not Started | Insert actual keys |

---

## 📞 Next Steps

1. **Immediate**: Fix compilation errors in `nasa-data-service.ts`
2. **High Priority**: Update API routes
3. **Before Deploy**: Run database migrations
4. **Before Deploy**: Add service role key to environment
5. **After Deploy**: Test all features thoroughly

---

## 📚 Reference

### API Keys Service Methods
```typescript
// Individual key retrieval
await ApiKeys.getOpenRouterKey()
await ApiKeys.getSentinelHubClientId()
await ApiKeys.getSentinelHubClientSecret()
await ApiKeys.getSentinelHubInstanceId()
await ApiKeys.getNasaApiKey()
await ApiKeys.getEarthdataBearerToken()
await ApiKeys.getEarthdataClientId()
await ApiKeys.getGoogleMapsApiKey()
await ApiKeys.getGeminiApiKey()

// Batch retrieval
const keys = await getApiKeys(['KEY1', 'KEY2', 'KEY3'])

// Cache management
clearKeyCache() // Force refresh
getCacheStats() // View cache metrics
```

### Environment Variables Needed
```bash
# Required for API keys service
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Get from Supabase dashboard

# Optional (fallback support)
OPENROUTER_API_KEY=sk-or-v1-...
SENTINEL_HUB_CLIENT_ID=sh-...
SENTINEL_HUB_CLIENT_SECRET=...
# etc.
```

---

**Last Updated**: October 4, 2025  
**Status**: Migration in progress - requires completion of async updates
