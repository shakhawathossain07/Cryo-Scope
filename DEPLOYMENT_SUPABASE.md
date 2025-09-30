# Cryo-Scope Deployment Guide with Supabase Backend

## Overview
This guide will help you deploy the Cryo-Scope application to Netlify with Supabase as the backend database.

## Prerequisites
- A Netlify account
- A Supabase project (already provided: https://siaxwbhyahlshwqzvafe.supabase.co)
- Git repository (recommended for automatic deployments)

## Step 1: Set Up Supabase Database

### 1.1 Create Database Tables
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to your project: https://siaxwbhyahlshwqzvafe.supabase.co
3. Go to the SQL Editor
4. Copy and paste the contents of `supabase-schema.sql` into the editor
5. Run the SQL commands to create tables and sample data

### 1.2 Verify Database Setup
1. Go to Table Editor in Supabase dashboard
2. You should see three tables:
   - `permafrost_data`
   - `risk_assessments` 
   - `predictions`
3. Each table should have sample data

## Step 2: Deploy to Netlify

### Option A: Deploy via GitHub (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add Supabase integration and Netlify config"
   git push origin main
   ```

2. **Connect to Netlify**:
   - Go to https://netlify.com
   - Click "New site from Git"
   - Connect your GitHub repository
   - Netlify will automatically detect the build settings from `netlify.toml`

3. **Environment Variables**:
   The environment variables are already configured in `netlify.toml`, but you can also set them in Netlify UI:
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://siaxwbhyahlshwqzvafe.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpYXh3Ymh5YWhsc2h3cXp2YWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNjYwMzAsImV4cCI6MjA3NDc0MjAzMH0.PfjNCyUdsK7oqMeAPNF60DyPQyCeZGIj8aQe5tRQTOA`

### Option B: Manual Deploy

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   - Go to https://netlify.com
   - Drag and drop the `.next` folder to the deploy area
   - OR zip the entire project and upload it

## Step 3: Verify Deployment

1. **Check the application**:
   - Navigate to your deployed Netlify URL
   - Test the futuristic animations
   - Try using the analysis, prediction, and reporting features

2. **Verify database integration**:
   - Use the application features that save data
   - Check your Supabase dashboard to see if data is being created
   - Monitor the Tables in Supabase for new entries

## Configuration Files

### netlify.toml
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18.17.0"
  NPM_VERSION = "9.6.7"
  NEXT_PRIVATE_TARGET = "server"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[context.production.environment]
  NODE_ENV = "production"
  NEXT_PUBLIC_SUPABASE_URL = "https://siaxwbhyahlshwqzvafe.supabase.co"
  NEXT_PUBLIC_SUPABASE_ANON_KEY = "your_anon_key_here"
```

### next.config.ts
- Configured for Netlify deployment
- Supports server actions
- Image optimization enabled

## Features Integrated with Supabase

### Data Storage
- **Permafrost Data**: Temperature, depth, methane levels, coordinates
- **Risk Assessments**: Regional risk levels, factors, mitigation strategies  
- **Predictions**: Methane hotspots, temperature trends, confidence scores

### Real-time Updates
- Live data synchronization
- Real-time subscriptions for data changes
- Automatic UI updates when new data arrives

### Database Functions
- High-risk prediction queries
- Latest reading aggregations
- Spatial data indexing for location-based queries

## Troubleshooting

### Common Issues

1. **"Please drop a folder containing an index.html file"**
   - Solution: Use the GitHub integration method instead of manual upload
   - Ensure `netlify.toml` is properly configured

2. **Environment Variables Not Working**
   - Check that variables are set in both `.env.local` and `netlify.toml`
   - Verify the Supabase URL and API key are correct

3. **Database Connection Errors**
   - Verify Supabase project is active
   - Check that RLS policies allow anonymous access
   - Ensure tables are created using the provided schema

4. **Build Failures**
   - Run `npm run build` locally first to test
   - Check for TypeScript errors
   - Verify all dependencies are installed

### Debug Steps

1. **Check build logs** in Netlify dashboard
2. **Monitor Supabase logs** in the database dashboard
3. **Use browser DevTools** to check for JavaScript errors
4. **Test API endpoints** using the Supabase dashboard API explorer

## Next Steps

1. **Custom Domain**: Set up a custom domain in Netlify
2. **SSL Certificate**: Netlify provides free SSL certificates
3. **Performance Monitoring**: Use Netlify Analytics
4. **Database Optimization**: Add indexes for better query performance
5. **Real-time Features**: Implement live data streaming
6. **User Authentication**: Add Supabase Auth for user management

## Support

- Netlify Documentation: https://docs.netlify.com/
- Supabase Documentation: https://supabase.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment

Your Cryo-Scope application is now ready for production with a powerful Supabase backend!