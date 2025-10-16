# Vercel Deployment Guide

## 🚀 Quick Deploy to Vercel

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy from Project Root
```bash
vercel
```

### 4. Set Environment Variables
In your Vercel dashboard, add these environment variables:
- `FRED_KEY` - Your FRED API key
- `OPENAI_KEY` - Your OpenAI API key (optional, for AI insights)

## 📁 Project Structure
```
fred-visualizer/
├── api/                    # Vercel serverless functions
│   ├── health.py          # Health check endpoint
│   ├── series/
│   │   └── [seriesName].py # Dynamic series endpoint
│   ├── cache/
│   │   └── stats.py       # Cache statistics
│   └── insights/
│       └── overall.py     # Overall economic insights
├── frontend/              # React frontend
├── vercel.json           # Vercel configuration
└── api/requirements.txt  # Python dependencies
```

## 🔧 API Endpoints
- `GET /api/health` - Health check
- `GET /api/series/{seriesName}` - Get economic data
- `GET /api/cache/stats` - Cache statistics
- `GET /api/insights/overall` - Overall economic insights

## ⚡ Benefits of Vercel Migration
- ✅ No spin-down issues (serverless functions)
- ✅ Global CDN for fast loading
- ✅ Automatic scaling
- ✅ Same platform as frontend
- ✅ No CORS issues
- ✅ Free tier with generous limits

## 🐛 Troubleshooting
- **Cold starts**: First request may take 2-3 seconds
- **Function timeout**: 10s on free tier, 60s on pro
- **Memory limits**: 1024MB on free tier
- **Environment variables**: Make sure to set them in Vercel dashboard
