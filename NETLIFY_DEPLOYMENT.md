# 🚀 Netlify Deployment Guide - Supabase API Keys

## ⚠️ CRITICAL: Environment Variable Setup

For Netlify deployment to work with Supabase-stored API keys, you **MUST** add the `SUPABASE_SERVICE_ROLE_KEY` to Netlify's environment variables.

## 📋 Netlify Environment Variables Setup

### Step 1: Access Netlify Site Settings

1. Go to your Netlify dashboard: https://app.netlify.com
2. Select your **Cryo-Scope** site
3. Navigate to: **Site settings** → **Environment variables**

### Step 2: Add Required Environment Variables

Add the following environment variables. **All of these are REQUIRED**:

#### Supabase Configuration (CRITICAL)
```
NEXT_PUBLIC_SUPABASE_URL=https://siaxwbhyahlshwqzvafe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpYXh3Ymh5YWhsc2h3cXp2YWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNjYwMzAsImV4cCI6MjA3NDc0MjAzMH0.PfjNCyUdsK7oqMeAPNF60DyPQyCeZGIj8aQe5tRQTOA

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpYXh3Ymh5YWhsc2h3cXp2YWZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTE2NjAzMCwiZXhwIjoyMDc0NzQyMDMwfQ.ALmzgaUPYmFYdSoY6Gmk_tVU0ff5cLvv6gQCGjwRlqY
```

#### Other Required Variables
```
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAFXbZrqoRPLIYPBcv4IQ2Idks6CcV0WjE
NEXT_PUBLIC_SENTINEL_HUB_INSTANCE_ID=c3a5b168-3586-40fd-8529-038154197e16
```

### Step 3: Variable Scopes

For each variable, set the appropriate scope:
- **All variables**: Check ✅ **All scopes** (or at minimum: **Production**, **Deploy Previews**, **Branch deploys**)

### Step 4: Save and Redeploy

1. Click **Save** after adding all variables
2. Trigger a new deployment:
   - Option A: Push a new commit to GitHub (automatic)
   - Option B: Go to **Deploys** → **Trigger deploy** → **Deploy site**

## 🔍 How It Works

### Architecture

```
┌─────────────────────────────────────────────────────┐
│  Netlify Production Environment                     │
│                                                      │
│  1. User visits site                                │
│  2. Server-side API routes execute                  │
│  3. ApiKeys service calls Supabase with             │
│     SUPABASE_SERVICE_ROLE_KEY                       │
│  4. API keys retrieved from Supabase database       │
│  5. Keys used for NASA, Sentinel Hub, OpenRouter    │
└─────────────────────────────────────────────────────┘
```

### What Happens Without SUPABASE_SERVICE_ROLE_KEY?

❌ **Without the service role key**, the application will:
1. Fail to connect to Supabase securely
2. Fall back to environment variables (which won't exist in Netlify if not set)
3. Result in API failures for:
   - NASA data retrieval
   - Sentinel Hub methane visualization
   - AI report generation

✅ **With the service role key**, the application will:
1. Successfully retrieve all API keys from Supabase
2. Use those keys for external API calls
3. Work exactly as intended in production

## 🎯 Verification Checklist

After deployment, verify the following:

### 1. Check Build Logs
- Go to: **Deploys** → Select latest deploy → **Deploy log**
- Look for: ✅ No errors related to missing environment variables
- Build should complete successfully

### 2. Test Live Site
Visit your deployed site and test:

- [ ] **Dashboard loads** - NASA data should populate
- [ ] **Methane Visualization** - Sentinel Hub layers should display
- [ ] **Report Generation** - AI reports should generate successfully
- [ ] **No console errors** - Check browser DevTools for errors

### 3. Monitor Supabase
- Go to: Supabase Dashboard → **API** → **Logs**
- Look for: Successful requests from Netlify's IP addresses
- Expected: Requests to `api_keys` table with service role authentication

## 🔒 Security Notes

### Safe to Commit to GitHub
✅ This deployment guide (with keys) can be committed because:
- It's in your **private repository**
- Only you and authorized collaborators have access
- Netlify reads environment variables securely

### Never Expose Publicly
❌ **DO NOT**:
- Share this file publicly
- Commit to public repositories
- Include in public documentation
- Post screenshots with visible keys

### Key Rotation
If you need to rotate keys:
1. Update keys in Supabase database (`api_keys` table)
2. No need to redeploy Netlify (keys are fetched dynamically)
3. For `SUPABASE_SERVICE_ROLE_KEY` rotation:
   - Generate new key in Supabase Dashboard
   - Update in Netlify environment variables
   - Trigger new deployment

## 📊 Monitoring

### Check API Key Usage
Run in Supabase SQL Editor:
```sql
SELECT 
  key_name,
  access_count,
  last_accessed_at,
  created_at
FROM api_keys_info
ORDER BY access_count DESC;
```

### Expected Results
After deployment and usage:
- `access_count` should increase for active keys
- `last_accessed_at` should update with recent timestamps
- All `is_active` should be `true`

## 🆘 Troubleshooting

### Issue: "Failed to fetch API key from Supabase"
**Solution**: 
1. Verify `SUPABASE_SERVICE_ROLE_KEY` is set in Netlify
2. Check Supabase logs for authentication errors
3. Verify RLS policies allow `service_role` access

### Issue: "API key not found in database"
**Solution**:
1. Verify you ran both SQL scripts in Supabase
2. Check: `SELECT * FROM api_keys;` in Supabase SQL Editor
3. Should see 9 rows with all keys

### Issue: Build fails with environment variable errors
**Solution**:
1. Clear Netlify cache: **Deploys** → **Deploy settings** → **Clear cache and retry**
2. Verify all variables are saved with correct scopes
3. Trigger fresh deployment

## ✅ Deployment Checklist

Before going live, confirm:

- [ ] All SQL scripts executed in Supabase (RUN_THIS_FIRST.sql + QUICK_INSERT_KEYS.sql)
- [ ] 9 API keys visible in Supabase `api_keys` table
- [ ] `SUPABASE_SERVICE_ROLE_KEY` added to Netlify environment variables
- [ ] All other required variables added to Netlify
- [ ] Latest code pushed to GitHub Legend branch
- [ ] Netlify deployment triggered and successful
- [ ] Dashboard loads with NASA data
- [ ] Methane visualization displays Sentinel Hub layers
- [ ] Report generation works with OpenRouter
- [ ] No console errors in browser DevTools

## 🎉 Success!

Once all checks pass, your Cryo-Scope application is successfully deployed with secure, centralized API key management via Supabase!

---

**Last Updated**: October 4, 2025  
**Branch**: Legend  
**Deployment Target**: Netlify (Production)
