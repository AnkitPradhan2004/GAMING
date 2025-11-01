# Netlify Deployment Guide for GAMING Frontend

## Step 1: Prepare Your Project

### 1.1 Verify Build is Ready

```bash
cd client
npm run build
```

✅ Build output should be in `dist/` folder

### 1.2 Create `netlify.toml` Configuration File

This file tells Netlify how to build and serve your app.

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 1.3 Ensure `.env` File is in Place

```
# client/.env
VITE_API_URL=https://gaming-102m.onrender.com
VITE_SOCKET_URL=https://gaming-102m.onrender.com
```

---

## Step 2: Deploy to Netlify

### Option A: Git-Connected Deployment (Recommended)

#### Prerequisites:

- GitHub account with your GAMING repo
- Netlify account (https://app.netlify.com - sign up free)

#### Steps:

1. **Go to Netlify Dashboard**

   - Visit: https://app.netlify.com
   - Click "New site from Git"

2. **Connect GitHub**

   - Click "GitHub"
   - Authorize Netlify to access your repositories
   - Select: `AnkitPradhan2004/GAMING`

3. **Configure Build Settings**

   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`

4. **Set Environment Variables**

   - Click "Environment" or during setup
   - Add these variables:
     - Key: `VITE_API_URL`
     - Value: `https://gaming-102m.onrender.com`
   - Add another:
     - Key: `VITE_SOCKET_URL`
     - Value: `https://gaming-102m.onrender.com`

5. **Deploy**
   - Click "Deploy site"
   - Wait 2-5 minutes for deployment

---

### Option B: Drag & Drop Deployment

1. **Build Your Project**

   ```bash
   cd client
   npm run build
   ```

2. **Go to Netlify**
   - Visit: https://app.netlify.com
   - Drag and drop the `client/dist/` folder
   - Deployment starts immediately

---

## Step 3: Post-Deployment Configuration

### 3.1 Add Custom Domain (Optional)

1. Go to Site Settings → Domain management
2. Add your custom domain
3. Configure DNS

### 3.2 Enable HTTPS

- Netlify automatically provides free SSL/TLS certificates

### 3.3 Configure Redirects (Important for React Router)

Add to `netlify.toml`:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

This ensures React Router handles all routes properly.

---

## Step 4: Test Your Deployed App

After deployment:

1. **Test Authentication**

   - Go to your Netlify URL
   - Click "Sign Up"
   - Create a new account
   - Verify JWT token is stored

2. **Test Login**

   - Logout or use another tab
   - Login with your credentials
   - Verify you're redirected to game page

3. **Test Protected Routes**

   - Try accessing `/game` without logging in
   - Should redirect to `/login`

4. **Test Real-time Features**

   - Game page should connect to backend
   - Socket.io should initialize
   - Real-time updates should work

5. **Test Wallet Operations**
   - Deposit money
   - Withdraw money
   - Check balance updates

---

## Step 5: Netlify Dashboard Overview

### Build & Deploy

- View build logs
- Rollback to previous deployments
- Trigger manual builds

### Domain Settings

- Custom domain configuration
- SSL certificates
- DNS configuration

### Site Settings

- Build settings
- Environment variables
- Redirects
- Headers

### Monitoring

- Analytics
- Performance metrics
- Error tracking

---

## Common Issues & Solutions

### Issue: Blank Page After Deployment

**Solution**: Check Netlify redirect rules

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Issue: API Calls Failing

**Verify**:

- Environment variables are set in Netlify
- Backend URL is correct: `https://gaming-102m.onrender.com`
- Backend CORS allows your Netlify domain

### Issue: Socket.io Connection Failing

**Solution**: Update backend CORS to include your Netlify URL

```
# On Render backend:
CLIENT_URL=https://your-netlify-domain.netlify.app,https://gaming-102m.onrender.com
```

### Issue: Build Failing

**Check**:

- All dependencies installed: `npm i`
- Build locally first: `npm run build`
- Check Netlify build logs for errors

---

## Deployment Checklist

- [ ] `netlify.toml` created in client directory
- [ ] `.env` file configured with backend URLs
- [ ] `npm run build` works locally
- [ ] GitHub account with GAMING repo
- [ ] Netlify account created
- [ ] GitHub connected to Netlify
- [ ] Build settings configured correctly
- [ ] Environment variables set in Netlify
- [ ] Site deployed successfully
- [ ] Authentication tested
- [ ] Protected routes tested
- [ ] API calls verified
- [ ] Real-time features working
- [ ] Domain configured (optional)

---

## After Deployment

### 1. Monitor Performance

- Check Netlify Analytics
- Monitor error logs
- Track build times

### 2. Set Up Auto-Deploy

- Netlify auto-deploys on git push
- No manual deployment needed
- Just push to main branch

### 3. Continuous Updates

- Make changes locally
- Test with `npm run dev`
- Push to GitHub
- Netlify automatically deploys

---

## Your Frontend Deployment URLs

After deployment, you'll get:

- **Default URL**: `https://your-project-name.netlify.app`
- **Custom URL**: (if you add custom domain)
- **API Backend**: `https://gaming-102m.onrender.com`

---

## Support & Documentation

- Netlify Docs: https://docs.netlify.com
- React Router on Netlify: https://docs.netlify.com/routing/overview/
- Vite Guide: https://vitejs.dev/guide/

---

## ✅ READY TO DEPLOY!

Your frontend is fully configured and ready for Netlify deployment. Follow the steps above to get your app live! 🚀
