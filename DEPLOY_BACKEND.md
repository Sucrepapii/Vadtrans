# Railway Deployment - Quick Start Guide

## ⚡ 5-Minute Deployment

### Step 1: Go to Railway

**Open:** https://railway.app

### Step 2: Login

- Click **"Login with GitHub"**
- Authorize Railway

### Step 3: Create New Project

- Click **"New Project"**
- Select **"Deploy from GitHub repo"**
- Choose: **`sucre-samuel1/Vadtrans`**

### Step 4: Configure Server

- Railway will create a service automatically
- Click on the service
- Go to **Settings**:
  - **Root Directory:** `server`
  - **Start Command:** `npm start`
  - **Build Command:** Leave empty (default)

### Step 5: Add Environment Variables

Click **Variables** tab and add:

```
NODE_ENV=production
JWT_SECRET=vadtrans_secret_key_2024
JWT_EXPIRE=7d
CLIENT_URL=https://your-vercel-app.vercel.app
VERCEL_URL=https://your-vercel-app.vercel.app
```

### Step 6: Deploy

- Click **Deploy**
- Wait 2-3 minutes
- Copy your Railway URL (e.g., `https://vadtrans-production.up.railway.app`)

### Step 7: Update Vercel

1. Go to **Vercel Dashboard**
2. Your project → **Settings** → **Environment Variables**
3. Add:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://your-railway-url.up.railway.app/api`
   - **Environment:** Production
4. **Save** and **Redeploy**

### Done! 🎉

Test login on mobile - should work now!

---

## Troubleshooting

**If deployment fails:**

- Check Railway logs for errors
- Ensure all environment variables are set
- Make sure ROOT directory is `server` not `./server`

**If Vercel still shows errors:**

- Wait 2-3 minutes for deployment
- Hard refresh browser (Ctrl+Shift+R)
- Check Vercel deployment logs
