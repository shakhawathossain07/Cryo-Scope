# ✅ Netlify Environment Variables Checklist

## 🚀 Quick Setup for Netlify Deployment

Copy and paste these environment variables into your Netlify dashboard:

**Go to**: https://app.netlify.com → Your Site → **Site settings** → **Environment variables**

---

## 📋 Required Variables (Copy-Paste Ready)

### 1. Supabase Configuration (CRITICAL ⚠️)

```
Variable: NEXT_PUBLIC_SUPABASE_URL
Value: https://siaxwbhyahlshwqzvafe.supabase.co
Scopes: ✅ All scopes
```

```
Variable: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpYXh3Ymh5YWhsc2h3cXp2YWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNjYwMzAsImV4cCI6MjA3NDc0MjAzMH0.PfjNCyUdsK7oqMeAPNF60DyPQyCeZGIj8aQe5tRQTOA
Scopes: ✅ All scopes
```

```
Variable: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpYXh3Ymh5YWhsc2h3cXp2YWZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTE2NjAzMCwiZXhwIjoyMDc0NzQyMDMwfQ.ALmzgaUPYmFYdSoY6Gmk_tVU0ff5cLvv6gQCGjwRlqY
Scopes: ✅ All scopes
⚠️ MOST CRITICAL - Required for API key retrieval from Supabase
```

---

### 2. Application Configuration

```
Variable: NEXT_PUBLIC_APP_ENV
Value: production
Scopes: ✅ All scopes
```

```
Variable: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
Value: AIzaSyAFXbZrqoRPLIYPBcv4IQ2Idks6CcV0WjE
Scopes: ✅ All scopes
```

```
Variable: NEXT_PUBLIC_SENTINEL_HUB_INSTANCE_ID
Value: c3a5b168-3586-40fd-8529-038154197e16
Scopes: ✅ All scopes
```

---

## 🎯 How to Add Variables (Step-by-Step)

1. **Log in to Netlify**: https://app.netlify.com
2. **Select your Cryo-Scope site**
3. Click **Site settings** (in the top navigation)
4. In the left sidebar, click **Environment variables**
5. Click **Add a variable** button
6. For each variable above:
   - Enter the **Variable name** (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - Enter the **Value** (copy from above)
   - Select **Scopes**: Check ✅ **All scopes**
   - Click **Create variable**
7. Repeat for all 6 variables
8. Click **Save** (if prompted)

---

## 🔍 Verification

After adding all variables, verify in Netlify:

### Check Variables List
You should see exactly **6 variables**:
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY ⭐ (Most critical)
- ✅ NEXT_PUBLIC_APP_ENV
- ✅ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
- ✅ NEXT_PUBLIC_SENTINEL_HUB_INSTANCE_ID

### Missing Variables?
All other API keys (OpenRouter, Sentinel Hub credentials, NASA keys) are now stored **in Supabase** and will be retrieved automatically using the `SUPABASE_SERVICE_ROLE_KEY`.

---

## 🚀 Deploy

### Option 1: Automatic (Recommended)
- Push to GitHub Legend branch (already done! ✅)
- Netlify will auto-deploy with new environment variables

### Option 2: Manual Trigger
1. Go to **Deploys** tab in Netlify
2. Click **Trigger deploy** → **Deploy site**
3. Wait for build to complete (~50 seconds)

---

## ✅ Post-Deployment Testing

After deployment completes, test your live site:

### 1. Dashboard Loads
- Visit: `https://your-site.netlify.app`
- Expected: Dashboard displays with NASA temperature data
- Check: No "Failed to fetch" errors

### 2. Methane Visualization
- Click on a region (e.g., Alaska)
- Expected: Sentinel Hub methane layer displays
- Check: Map loads without errors

### 3. Report Generation
- Click **Generate Scientific Report** button
- Expected: PDF downloads successfully with NASA-style formatting
- Check: Report contains data and visualizations

### 4. Browser Console
- Open DevTools (F12)
- Check Console tab
- Expected: No red errors related to API keys or Supabase

---

## 🔒 Security Notes

### ✅ Safe Practices
- All variables are stored securely in Netlify
- Service role key is never exposed to browser
- API keys retrieved server-side only
- RLS policies protect Supabase access

### ❌ Never Do This
- Don't share this file publicly
- Don't commit `.env.local` to GitHub
- Don't expose service role key in client code
- Don't post screenshots with visible keys

---

## 🆘 Troubleshooting

### Error: "Failed to fetch API key from Supabase"
**Solution**:
1. Verify `SUPABASE_SERVICE_ROLE_KEY` is added to Netlify
2. Check spelling and spacing (no extra spaces)
3. Verify all 6 variables are present
4. Trigger a fresh deploy

### Error: "Unauthorized" or "403 Forbidden"
**Solution**:
1. Verify you ran both SQL scripts in Supabase:
   - `supabase/RUN_THIS_FIRST.sql` (creates table)
   - `supabase/QUICK_INSERT_KEYS.sql` (inserts keys)
2. Check Supabase RLS policies allow service role access
3. Test locally first with `npm run dev`

### Build Fails
**Solution**:
1. Check build logs in Netlify Deploys tab
2. Clear cache: **Deploy settings** → **Clear cache and retry**
3. Verify all variable names match exactly (case-sensitive)
4. Check GitHub repo has latest code (Legend branch)

---

## 📊 Monitoring Success

### Check Supabase Access
In Supabase SQL Editor, run:
```sql
SELECT 
  key_name,
  access_count,
  last_accessed_at
FROM api_keys_info
ORDER BY access_count DESC;
```

**Expected**: After deployment and usage:
- Access counts increase for active keys
- `last_accessed_at` shows recent timestamps
- All keys show `is_active = true`

### Check Netlify Logs
1. Go to **Deploys** → Select latest deploy → **Functions log**
2. Look for successful Supabase connections
3. No "API key not found" errors

---

## 🎉 Success Indicators

Your deployment is successful when:

- ✅ All 6 environment variables added to Netlify
- ✅ Build completes in ~50 seconds
- ✅ Dashboard loads with live NASA data
- ✅ Methane visualization displays Sentinel layers
- ✅ Scientific reports generate successfully
- ✅ No console errors in browser DevTools
- ✅ Supabase shows increasing access counts
- ✅ All features work as expected in production

---

## 📚 Related Documentation

- **Full Deployment Guide**: `NETLIFY_DEPLOYMENT.md`
- **API Keys Migration**: `docs/API_KEYS_MIGRATION_TO_SUPABASE.md`
- **Database Setup**: `supabase/SETUP_INSTRUCTIONS.md`
- **Migration Summary**: `API_KEYS_MIGRATION_SUMMARY.md`
- **Completion Checklist**: `MIGRATION_COMPLETE.md`

---

**Last Updated**: October 4, 2025  
**Status**: Ready for Production ✅  
**Repository**: https://github.com/shakhawathossain07/Cryo-Scope  
**Branch**: Legend
