# Vercel Frontend Deployment Guide

This guide will help you deploy your React gaming application to Vercel.

## Prerequisites

- Vercel account (sign up at https://vercel.com)
- GitHub account with your repository
- Backend deployed and running at https://gaming-102m.onrender.com

## Deployment Options

### Option 1: Git-Connected Deployment (Recommended)

1. **Visit Vercel Dashboard**
   - Go to https://vercel.com/dashboard
   - Click "Add New..." → "Project"

2. **Connect GitHub Repository**
   - Click "Import Git Repository"
   - Select your repository: `AnkitPradhan2004/GAMING`
   - Click "Continue"

3. **Configure Project**
   - **Project Name**: gaming-frontend (or your choice)
   - **Framework Preset**: React
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Set Environment Variables**
   - Click "Environment Variables"
   - Add the following:
     ```
     VITE_API_URL = https://gaming-102m.onrender.com
     VITE_SOCKET_URL = https://gaming-102m.onrender.com
     ```
   - Click "Deploy"

5. **Wait for Deployment**
   - Vercel will automatically build and deploy your app
   - You'll get a deployment URL like `https://gaming-frontend-xxxxx.vercel.app`

### Option 2: Using Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy from Project Directory**
   ```bash
   cd /Users/avipawar/Desktop/Gaming/GAMING/client
   vercel
   ```

3. **Answer Configuration Prompts**
   - Set project name
   - Confirm framework (React)
   - Confirm build command: `npm run build`
   - Confirm output directory: `dist`

4. **Add Environment Variables**
   ```bash
   vercel env add VITE_API_URL
   # Enter: https://gaming-102m.onrender.com
   
   vercel env add VITE_SOCKET_URL
   # Enter: https://gaming-102m.onrender.com
   ```

5. **Redeploy with Environment Variables**
   ```bash
   vercel --prod
   ```

## Post-Deployment Configuration

### 1. Update Backend CORS (Important)
Your backend needs to allow requests from your Vercel domain:

On Render backend dashboard:
- Go to Environment → Edit
- Update `CLIENT_URL`:
  ```
  https://your-vercel-app.vercel.app,http://localhost:5173,http://localhost:5174
  ```
- Save changes (backend will restart)

### 2. Test Your Deployment

Visit your Vercel URL and test:
- ✅ Home page loads
- ✅ Login page loads and can authenticate
- ✅ API calls work (check browser Network tab)
- ✅ Socket.io connection established
- ✅ Protected routes work after login

### 3. Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Environment Variables Reference

| Variable | Value | Purpose |
|----------|-------|---------|
| `VITE_API_URL` | `https://gaming-102m.onrender.com` | Backend API endpoint |
| `VITE_SOCKET_URL` | `https://gaming-102m.onrender.com` | Socket.io endpoint |

## Troubleshooting

### Build Fails
- Check logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node version compatibility
- Try locally: `npm run build`

### API Calls Fail (CORS Error)
- Update `CLIENT_URL` on Render backend with Vercel domain
- Check browser Network tab for CORS headers
- Ensure environment variables are set in Vercel dashboard

### Socket.io Connection Issues
- Verify `VITE_SOCKET_URL` is set correctly
- Check backend is accessible from Vercel (test in browser console)
- Look at browser console for connection errors

### Blank Page / 404 Errors
- Verify `vercel.json` rewrites are configured
- Check that React Router routes are properly defined
- Clear browser cache and do hard refresh (Cmd+Shift+R)

### Stuck on Loading
- Check if backend is running on Render
- Verify environment variables are correctly set
- Look for errors in browser DevTools Console tab

## Monitoring & Analytics

Vercel provides free monitoring:
- Dashboard shows deployment history
- Analytics for page views and response times
- Alerts for build failures

## Continuous Deployment

Once connected to GitHub:
- Every push to `main` branch automatically deploys
- You can see deployment status in GitHub PR checks
- Rollback to previous deployments anytime from Vercel dashboard

## Next Steps

1. Deploy to Vercel using one of the options above
2. Test all features on the deployed URL
3. Share your deployed URL with users
4. Monitor for any issues in Vercel dashboard

---

**Useful Links:**
- Vercel Dashboard: https://vercel.com/dashboard
- Project Settings: `https://vercel.com/projects` → Select project → Settings
- Environment Variables Docs: https://vercel.com/docs/concepts/projects/environment-variables
