# 🚨 URGENT: Netlify Environment Variables Configuration

**Status**: ⚠️ **BUILD FIXED** - Now configure environment variables in Netlify

---

## ✅ Issue Fixed

The build-time error has been resolved by making `OPENROUTER_API_KEY` lazy-initialized. The API key is now only required at **runtime** (when users generate reports), not during the build phase.

**Changes Made**:
- Modified `src/lib/scientific-report-service.ts` to use lazy initialization
- Environment variable is now checked only when the API is actually called
- Build will succeed even without the API key configured

---

## 🔑 Required Environment Variables for Netlify

### Step 1: Access Netlify Environment Variables

1. Go to your Netlify dashboard: https://app.netlify.com
2. Select your **Cryo-Scope** site
3. Go to **Site settings** → **Environment variables**
4. Click **"Add a variable"** or **"Add environment variables"**

---

### Step 2: Add These Variables

Copy and paste these **exactly** into Netlify:

#### **CRITICAL (Required for Report Generation)**

```bash
OPENROUTER_API_KEY=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
```

#### **CRITICAL (Required for Methane Visualization)**

```bash
SENTINEL_HUB_CLIENT_ID=sh-2f9e2292-6d4a-4834-b1bf-aa5be2d54130
SENTINEL_HUB_CLIENT_SECRET=HSLDwMpNe8DBYXUw8lvby22urrnggVU2
SENTINEL_HUB_INSTANCE_ID=c3a5b168-3586-40fd-8529-038154197e16
NEXT_PUBLIC_SENTINEL_HUB_INSTANCE_ID=c3a5b168-3586-40fd-8529-038154197e16
```

#### **IMPORTANT (Database & NASA APIs)**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://siaxwbhyahlshwqzvafe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpYXh3Ymh5YWhsc2h3cXp2YWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNjYwMzAsImV4cCI6MjA3NDc0MjAzMH0.PfjNCyUdsK7oqMeAPNF60DyPQyCeZGIj8aQe5tRQTOA

NEXT_PUBLIC_NASA_API_KEY=1MPAn5qXiQTE3Vktj19FRcM4Nq8wDh3FlOcjkGJX
```

#### **OPTIONAL (Enhanced Features)**

```bash
GEMINI_API_KEY=AIzaSyDGarEix-vnEV3PEfc_N2TboDDVitzoFak
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAFXbZrqoRPLIYPBcv4IQ2Idks6CcV0WjE

EARTHDATA_BEARER_TOKEN=eyJ0eXAiOiJKV1QiLCJvcmlnaW4iOiJFYXJ0aGRhdGEgTG9naW4iLCJzaWciOiJlZGxqd3RwdWJrZXlfb3BzIiwiYWxnIjoiUlMyNTYifQ.eyJ0eXBlIjoiVXNlciIsInVpZCI6InNoYWtoYXdhdGhvc3NhaW4wNyIsImV4cCI6MTc2NDQ2MDc5OSwiaWF0IjoxNzU5MjEzMDQ4LCJpc3MiOiJodHRwczovL3Vycy5lYXJ0aGRhdGEubmFzYS5nb3YiLCJpZGVudGl0eV9wcm92aWRlciI6ImVkbF9vcHMiLCJhY3IiOiJlZGwiLCJhc3N1cmFuY2VfbGV2ZWwiOjN9.sg0yE6R1QaRTPMtz8n9TwmwSsWozhG5Vb7liVhfykHd5QCYsw-APKhBL_yEASZ5qJ0q3BH8Nv0wjjnXm40UllqZPL6e-PU2WIqe-un4dxYBSMtpU_utbGDj5smg4ItyRG_wCxE9EcpqQ7CvoaKPYvHcAfpMPVAKP-eBtkefvOQe4AYKEaWSI647hoKKz0ii1tXcefJP3QDi7ZpMb6KeV-3buF2aMnprnKxVq4oAQQC3TU6PlbToDlyLFOxRQtVO60U8kGkJMgF56QDsGJXlVg1c4i2RBAo2-UGyMIy1VFK_lEHfmoqSoWXm9qGDi7qJHKxjx43R4SM2vSzba4d6dyw
EARTHDATA_CLIENT_ID=cryo-scope-app
```

---

### Step 3: Configure in Netlify UI

For each variable:

1. **Key**: Enter the variable name (e.g., `OPENROUTER_API_KEY`)
2. **Value**: Paste the value from above
3. **Scopes**: Select **"All environments"** or **"Production"**
4. Click **"Save"**

**Repeat for all variables listed above.**

---

## 🚀 Trigger New Build

After adding environment variables:

### Option 1: Redeploy (Recommended)

1. Go to **Deploys** tab in Netlify
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait for build to complete

### Option 2: Push New Commit

```bash
# Make a small change and push
git commit --allow-empty -m "chore: Trigger rebuild with env vars"
git push origin Legend
```

---

## ✅ Expected Build Output

Once environment variables are configured, you should see:

```
✓ Compiled successfully in 20.0s
✓ Collecting page data
✓ Generating static pages (18/18)
✓ Finalizing page optimization
```

**No more errors!** ✅

---

## 📊 What Each Variable Does

### Report Generation
- `OPENROUTER_API_KEY`: Powers AI report generation with Gemini 2.0 Flash
- **Impact if missing**: Report generation will fail at runtime (not at build time)

### Methane Visualization
- `SENTINEL_HUB_CLIENT_ID/SECRET`: Authenticate with Copernicus Dataspace
- `SENTINEL_HUB_INSTANCE_ID`: Access Sentinel-5P TROPOMI CH₄ data
- **Impact if missing**: Methane overlays won't display on maps

### Database & Storage
- `NEXT_PUBLIC_SUPABASE_URL/ANON_KEY`: Database connection
- **Impact if missing**: Data persistence features affected

### NASA APIs
- `NEXT_PUBLIC_NASA_API_KEY`: NASA POWER API for temperature data
- **Impact if missing**: Uses DEMO_KEY (rate-limited)

### Optional Features
- `GEMINI_API_KEY`: Backup AI model (if OpenRouter fails)
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Enhanced map features
- `EARTHDATA_BEARER_TOKEN`: Direct NASA Earthdata access

---

## 🔍 Verify Deployment

After successful build:

### 1. Check Homepage
Visit: `https://your-site.netlify.app`
- Should load without errors

### 2. Test Dashboard
Visit: `https://your-site.netlify.app/dashboard`
- Should display Arctic regions
- Methane overlays should load

### 3. Test Report Generation
Visit: `https://your-site.netlify.app/reporting`
- Click "Generate Report"
- Should create scientific report
- PDF export should work

### 4. Check Browser Console
- Press F12
- Go to Console tab
- Should see no API key errors

---

## 🐛 Troubleshooting

### Build Still Fails?

**Check**:
1. All environment variables spelled correctly (case-sensitive)
2. No extra spaces in values
3. Variables set to "All environments" or "Production"

**Solution**:
1. Delete and re-add the variable
2. Trigger new deploy
3. Check deploy logs for different error

### Report Generation Fails at Runtime?

**Error**: "OPENROUTER_API_KEY environment variable is not set"

**Solution**:
1. Verify `OPENROUTER_API_KEY` is in Netlify environment variables
2. Value should start with `sk-or-v1-`
3. Redeploy site after adding

### Methane Maps Don't Load?

**Error**: OAuth or authentication errors in console

**Solution**:
1. Verify all 4 `SENTINEL_HUB_*` variables are set
2. Check `CLIENT_ID` starts with `sh-`
3. Ensure `INSTANCE_ID` is the UUID format

---

## 📋 Quick Copy-Paste List

**Minimum Required for Production**:

```
OPENROUTER_API_KEY=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
SENTINEL_HUB_CLIENT_ID=sh-2f9e2292-6d4a-4834-b1bf-aa5be2d54130
SENTINEL_HUB_CLIENT_SECRET=HSLDwMpNe8DBYXUw8lvby22urrnggVU2
SENTINEL_HUB_INSTANCE_ID=c3a5b168-3586-40fd-8529-038154197e16
NEXT_PUBLIC_SENTINEL_HUB_INSTANCE_ID=c3a5b168-3586-40fd-8529-038154197e16
NEXT_PUBLIC_SUPABASE_URL=https://siaxwbhyahlshwqzvafe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpYXh3Ymh5YWhsc2h3cXp2YWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNjYwMzAsImV4cCI6MjA3NDc0MjAzMH0.PfjNCyUdsK7oqMeAPNF60DyPQyCeZGIj8aQe5tRQTOA
NEXT_PUBLIC_NASA_API_KEY=1MPAn5qXiQTE3Vktj19FRcM4Nq8wDh3FlOcjkGJX
```

---

## 🎯 Next Steps

1. ✅ Code fix pushed to **Legend** branch
2. ⏳ **Configure environment variables in Netlify** (YOU ARE HERE)
3. ⏳ Trigger new deployment
4. ⏳ Verify all features work
5. ✅ Production ready!

---

**⚠️ IMPORTANT**: Do not commit `.env.local` to Git! These keys are in your local file only. Add them to Netlify UI.

**🔒 SECURITY**: All sensitive keys should only be in:
- Netlify environment variables UI (for production)
- Your local `.env.local` file (for development)
- Never in Git commits!

---

**Last Updated**: October 4, 2025  
**Status**: ✅ Code Fixed, ⏳ Awaiting Netlify Configuration  
**Branch**: Legend  
**Commit**: 5937acc - "fix: Make OPENROUTER_API_KEY optional during build time"
