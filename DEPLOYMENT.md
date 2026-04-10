# Little Heartbeat - Deployment Guide

This guide covers deploying your Little Heartbeat pregnancy safety app as a **Progressive Web App (PWA)** for hackathon demos.

---

## 🚀 Quick Start (5 Minutes)

### Option 1: Expo Publish (Easiest)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for web
eas build --platform web

# Or publish directly
npx expo publish
```

Your app will be available at: `https://your-app-name.en.gy`

---

### Option 2: Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

**Or connect GitHub:**
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Framework: Expo
5. Deploy!

---

### Option 3: Netlify Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

**Or drag & drop:**
1. Run `npx expo export:web`
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
3. Drag the `dist` folder

---

## 📱 Building for Web

### Step 1: Export the App

```bash
# Create web build
npx expo export:web
```

This creates a `dist` folder with static files.

### Step 2: Preview Locally

```bash
# Serve the built files
npx serve dist
```

Your app is now at `http://localhost:3000`

---

## 🔧 Environment Variables

Create a `.env.production` file for production:

```env
# Google Gemini AI
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_key

# Google Maps
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key

# Supabase (optional)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## ⚙️ PWA Configuration

Your app already has PWA support. To enable full functionality:

### 1. Add Icons

Create icons in `assets/images/`:
- `icon-72.png` (72x72)
- `icon-96.png` (96x96)
- `icon-128.png` (128x128)
- `icon-144.png` (144x144)
- `icon-152.png` (152x152)
- `icon-192.png` (192x192)
- `icon-384.png` (384x384)
- `icon-512.png` (512x512)

### 2. Add Favicon

Place your favicon at `assets/images/favicon.png`

### 3. Add Splash Screen

Place your splash icon at `assets/images/splash-icon.png`

---

## 🎭 Demo Mode

The app includes a **Demo Mode** for hackathon presentations:

1. Look for the **"🎭 Demo Mode"** button on the dashboard
2. Click it to enable simulation controls
3. Use the panel to:
   - Switch between preset scenarios
   - Simulate location changes
   - Simulate health risk levels
   - Trigger SOS alerts

This is perfect for showing different emergency scenarios without real data.

---

## 🌐 Web-Specific Features

The app automatically detects web and provides fallbacks:

| Native Feature | Web Fallback |
|---------------|--------------|
| GPS Location | Browser Geolocation API |
| SMS | WhatsApp Web Link |
| Haptics | Vibration API |
| Push Notifications | Web Notifications |
| Contacts | Manual Entry |

---

## 📦 Production Build

### For Vercel

Create `vercel.json`:

```json
{
  "buildCommand": "npx expo export:web",
  "outputDirectory": "dist",
  "framework": "nextjs",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### For Netlify

Create `netlify.toml`:

```toml
[build]
  command = "npx expo export:web"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🎯 Hackathon Demo Tips

### 1. Use Demo Mode
- Enable demo mode from the app
- Pre-configure scenarios before presenting
- Practice transitions between states

### 2. Show Key Flows
- **Normal Flow**: Show healthy dashboard, heartbeat feature
- **Risk Detection**: Simulate symptoms, show AI analysis
- **Emergency Flow**: Trigger SOS, show location sharing
- **Hospital Finder**: Show nearby hospitals with directions

### 3. Demo URLs
- **Vercel**: `https://little-heartbeat.vercel.app`
- **Netlify**: `https://little-heartbeat.netlify.app`
- **Expo**: `https://expo.dev/@yourusername/little-heartbeat`

### 4. Mobile-First Demo
1. Open URL on your phone
2. Add to Home Screen (PWA)
3. Demo as if it's a real app

---

## 🔒 Security Notes

### API Keys
- Never commit real API keys to GitHub
- Use environment variables
- Add `.env` to `.gitignore`

### HTTPS Required
- PWA features (notifications, location) require HTTPS
- All deployment platforms provide HTTPS by default

---

## 📋 Pre-Hackathon Checklist

- [ ] Set up Expo account
- [ ] Get Gemini API key
- [ ] Get Google Maps API key (if using)
- [ ] Deploy to Vercel or Netlify
- [ ] Test on mobile browser
- [ ] Test "Add to Home Screen"
- [ ] Practice demo scenarios
- [ ] Prepare backup (screenshot/video)

---

## 🆘 Troubleshooting

### Location not working on web
```javascript
// The app uses browser geolocation automatically
// Make sure to allow location permission in browser
```

### White screen after build
```bash
# Clear cache and rebuild
npx expo start --clear
npx expo export:web
```

### Icons not showing
```bash
# Regenerate icons
npx expo generate-app-icons
```

### Service worker not registering
```javascript
// Service worker only works in production (HTTPS)
// Test locally with: npx serve dist
```

---

## 📞 Support

- **Expo Docs**: https://docs.expo.dev
- **PWA Guide**: https://docs.expo.dev/distribution/publishing-websites/
- **Vercel Deploy**: https://vercel.com/docs/deployments/exports
- **Netlify Deploy**: https://docs.netlify.com/

---

**Good luck with your hackathon! 🚀💗**
