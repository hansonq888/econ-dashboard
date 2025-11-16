# Render Deployment Guide

## 🚀 Updating Your Backend on Render

### Automatic Deployment (Recommended)

If your Render service is connected to a Git repository (GitHub, GitLab, etc.):

1. **Commit and push your changes:**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main  # or your branch name
   ```

2. **Render will automatically:**
   - Detect the push
   - Start a new deployment
   - Build and deploy your updated backend

3. **Monitor the deployment:**
   - Go to your Render dashboard
   - Click on your backend service
   - View the "Events" or "Logs" tab to see deployment progress

### Manual Redeploy

If you need to manually trigger a redeploy:

1. Go to https://dashboard.render.com
2. Click on your backend service
3. Click "Manual Deploy" in the top right
4. Select "Deploy latest commit"

### Required Environment Variables

Make sure these are set in your Render service settings:

- `FRED_KEY` - Your FRED API key (required)
- `OPENAI_KEY` - Your OpenAI API key (optional, for AI insights)

To update environment variables:
1. Go to your service in Render dashboard
2. Click "Environment" tab
3. Add or edit variables
4. Save changes (this will trigger a redeploy)

### Render Service Configuration

Your backend should be configured as:

- **Type:** Web Service
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn backend.app:app --host 0.0.0.0 --port $PORT`
- **Python Version:** 3.8+ (check your `runtime.txt` if you have one)

### Common Issues

1. **Deployment fails:**
   - Check the build logs in Render dashboard
   - Ensure all dependencies are in `requirements.txt`
   - Verify Python version compatibility

2. **Service won't start:**
   - Check the runtime logs
   - Verify environment variables are set correctly
   - Ensure the start command is correct

3. **Slow first request:**
   - Render free tier services spin down after 15 minutes of inactivity
   - First request after spin-down takes ~30 seconds to wake up
   - Consider upgrading to paid tier for always-on service

### Verifying Deployment

After deployment, check:
- Health endpoint: `https://your-service.onrender.com/health`
- Root endpoint: `https://your-service.onrender.com/`
- API endpoint: `https://your-service.onrender.com/series/unemployment?start=2020-01-01&end=2024-01-01`

### Updating Frontend to Use New Backend

If your backend URL changed, update your frontend:

1. Update `frontend/.env` or environment variables:
   ```
   VITE_API_BASE=https://your-backend-service.onrender.com
   ```

2. Redeploy your frontend (if also on Render or another platform)

