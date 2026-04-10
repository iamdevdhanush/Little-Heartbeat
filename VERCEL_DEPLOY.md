# VERCEL DEPLOYMENT GUIDE - Little Heartbeat

## 🚨 QUICK FIX SUMMARY

### Problem
Vercel fails because:
1. Wrong build command (`npx expo export:web` doesn't exist)
2. Missing `installCommand`
3. Framework detection conflicts

### Solution (Files Updated)
- `vercel.json` - Fixed with correct commands
- `package.json` - Fixed scripts

---

## 📋 PRE-REQUISITES

1. Node.js 18+ installed
2. GitHub account
3. Vercel account (free tier works)

---

## 🔧 STEP-BY-STEP DEPLOYMENT

### Option A: GitHub + Vercel Dashboard (RECOMMENDED)

#### Step 1: Push to GitHub
```bash
cd little-heartbeat

# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/little-heartbeat.git
git branch -M main
git push -u origin main
```

#### Step 2: Import to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. **Configure Project**:

   | Setting | Value |
   |---------|-------|
   | **Framework Preset** | `Other` |
   | **Build Command** | `npx expo export --platform web` |
   | **Output Directory** | `dist` |
   | **Install Command** | `npm install` |

5. Click **"Deploy"**

#### Step 3: Wait for Build
- Takes ~2-3 minutes
- Watch build logs for errors
- Deploy URL: `https://your-project.vercel.app`

---

### Option B: Vercel CLI (Faster)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Build locally first
npm run build:web

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## ⚙️ VERIFIED CONFIGURATION

### vercel.json (FINAL)
```json
{
  "framework": null,
  "buildCommand": "npx expo export --platform web",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "devCommand": "npx expo start",
  "cleanUrls": true,
  "trailingSlash": false,
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" },
        { "key": "Service-Worker-Allowed", "value": "/" }
      ]
    },
    {
      "source": "/manifest.json",
      "headers": [
        { "key": "Content-Type", "value": "application/manifest+json" },
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### package.json scripts (FINAL)
```json
{
  "scripts": {
    "start": "expo start",
    "web": "expo start --web",
    "build:web": "npx expo export --platform web",
    "preview:web": "npx serve dist",
    "deploy:vercel": "npm run build:web && npx vercel --prod"
  }
}
```

---

## ❌ COMMON ERRORS & FIXES

### Error 1: "Build command not found"
```
Error: Command "expo export:web" not found
```
**Fix:** Use `npx expo export --platform web` (correct command)

---

### Error 2: Blank white screen
```
App loads but shows white screen
```
**Fix:** 
1. Check browser console for errors
2. Ensure `outputDirectory` is `dist`
3. Clear Vercel cache: Settings → General → "Redeploy"

---

### Error 3: Assets not loading
```
Images/CSS/JS not found (404)
```
**Fix:** 
1. Check `app.json` web config has correct paths
2. Ensure rewrites are configured in vercel.json
3. Run `npx expo export --platform web` locally to verify

---

### Error 4: Routing issues
```
Pages not found or 404 errors
```
**Fix:** 
```json
// Add to vercel.json
"rewrites": [
  { "source": "/(.*)", "destination": "/index.html" }
]
```

---

### Error 5: Build timeout
```
Build exceeded 60 second limit
```
**Fix:** 
1. Vercel free tier = 60s limit
2. Use Vercel Pro for longer builds
3. Or: Build locally and deploy pre-built files

---

### Error 6: Module not found
```
Cannot find module 'expo-location'
```
**Fix:** 
```bash
npm install
```
Ensure `installCommand` is `npm install` in vercel.json

---

## 🧪 TEST BEFORE DEPLOYING

### 1. Test Local Build
```bash
npm run build:web
npm run preview:web
```
Open `http://localhost:3000`

### 2. Check dist folder contents
```
dist/
├── _expo/           # Bundled assets
├── assets/          # Images & fonts
├── index.html       # Main HTML
├── manifest.json    # PWA manifest
├── sw.js           # Service worker
└── metadata.json
```

---

## 📱 PWA SETUP (OPTIONAL)

Your app already has PWA support! To enable:

### 1. Add to Home Screen
- Open app in mobile Chrome/Safari
- Tap "Share" → "Add to Home Screen"

### 2. Install Prompt (appears automatically)
The custom HTML adds an install prompt after 10 seconds.

### 3. Verify PWA
```javascript
// Check if installed
window.matchMedia('(display-mode: standalone)').matches
```

---

## 🎯 HACKATHON QUICK DEPLOY (5 MINUTES)

```bash
# 1. Build
npm run build:web

# 2. Install Vercel CLI
npm install -g vercel

# 3. Deploy
vercel --prod

# 4. Done! Get URL
```

---

## 🔄 ENVIRONMENT VARIABLES

If your app uses API keys:

1. Vercel Dashboard → Project → Settings → Environment Variables
2. Add:
   - `EXPO_PUBLIC_GEMINI_API_KEY`
   - `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
3. Redeploy

---

## 📊 MONITORING

### Vercel Dashboard
- **Analytics** - Page views, performance
- **Logs** - Real-time request logs
- **Functions** - Serverless function invocations

### Common Metrics
- **First Contentful Paint (FCP)** - Should be < 1.5s
- **Largest Contentful Paint (LCP)** - Should be < 2.5s
- **Time to Interactive (TTI)** - Should be < 3.5s

---

## 🚀 CUSTOM DOMAIN (OPTIONAL)

1. Vercel Dashboard → Project → Settings → Domains
2. Add your domain (e.g., `little-heartbeat.vercel.app`)
3. Update DNS records as instructed
4. SSL is automatic

---

## 🆘 STILL STUCK?

### 1. Check Build Logs
Vercel Dashboard → Deployment → Logs

### 2. Rebuild
Settings → General → "Redeploy"

### 3. Clear Cache
Settings → General → "Clear Cache"

### 4. Contact Support
[Vercel Support](https://vercel.com/help)

---

## ✅ DEPLOYMENT CHECKLIST

- [ ] `vercel.json` has correct config
- [ ] `package.json` has correct scripts
- [ ] `npm run build:web` works locally
- [ ] GitHub repo is connected (if using dashboard)
- [ ] Build command: `npx expo export --platform web`
- [ ] Output directory: `dist`
- [ ] Install command: `npm install`

---

## 📞 COMMANDS REFERENCE

```bash
# Build for web
npm run build:web

# Preview locally
npm run preview:web

# Deploy to Vercel (preview)
vercel

# Deploy to Vercel (production)
vercel --prod

# Alternative deploy
npm run deploy:vercel
```

---

**Deploy URL format:** `https://[project-name]-[team].vercel.app`

Example: `https://little-heartbeat-john123.vercel.app`
