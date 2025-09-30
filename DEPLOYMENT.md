# Cryo-Scope Deployment Guide

## 🚀 Deploy to Netlify

### Option 1: Direct Deploy (Recommended)

1. **Fork or Clone** this repository to your GitHub account
2. **Connect to Netlify**:
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Choose GitHub and select your repository
   - Netlify will automatically detect the Next.js app

3. **Environment Variables** (Optional):
   Add these in Netlify Dashboard → Site Settings → Environment Variables:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   GEMINI_API_KEY=your_gemini_api_key
   GOOGLE_API_KEY=your_google_api_key
   ```

4. **Deploy**: Netlify will automatically build and deploy your app!

### Option 2: Manual Deploy

1. **Build locally**:
   ```bash
   npm install
   npm run build
   ```

2. **Upload to Netlify**:
   - Drag and drop the `.next` folder to Netlify's manual deploy area
   - Or use Netlify CLI: `netlify deploy --prod --dir=.next`

## 🔧 Build Configuration

- **Framework**: Next.js 15.3.3
- **Build Command**: `npm run build`
- **Node Version**: 18.17.0
- **Plugin**: @netlify/plugin-nextjs (automatically handles SSR/SSG)

## 🎨 Features Included

✅ **Futuristic Animated Background**: Canvas-based particle systems and holographic elements
✅ **Transparent UI**: Glass morphism effect with backdrop blur
✅ **Responsive Design**: Works on all devices
✅ **NASA API Integration**: Real climate data (requires API key)
✅ **Google Maps**: Satellite imagery (requires API key)
✅ **AI-Powered Analysis**: Genkit integration for risk assessment

## 🌐 Live Demo

Once deployed, your Arctic monitoring dashboard will be available at:
`https://your-site-name.netlify.app`

## 🛠️ Post-Deploy

1. **Custom Domain**: Add your custom domain in Netlify settings
2. **HTTPS**: Automatically enabled by Netlify
3. **Performance**: Optimized for fast loading with Next.js
4. **Analytics**: Enable Netlify Analytics for insights

## 🎯 Performance

- **First Load JS**: ~101 kB (highly optimized)
- **Static Generation**: All pages pre-rendered for speed
- **CDN**: Global delivery via Netlify's edge network
- **Caching**: Automatic caching for static assets

## � Dependency Fix Applied

**✅ RESOLVED**: React/react-leaflet dependency conflicts that were causing Netlify build failures have been fixed. See **NETLIFY_FIX.md** for technical details.

## �🗃️ Alternative: Deploy with Supabase Backend

For a full-featured deployment with database integration, see **DEPLOYMENT_SUPABASE.md** for instructions on:
- Setting up Supabase as your backend database
- Storing permafrost data, risk assessments, and predictions  
- Real-time data synchronization
- Enhanced application functionality with persistent data storage

Your Cryo-Scope app is now ready for the world! 🌍❄️🛰️