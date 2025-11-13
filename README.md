# MacroBoard

A real-time economic dashboard that tracks key U.S. economic indicators with interactive charts and AI-powered insights. Built to make economic data more accessible and easier to understand.

## What It Does

MacroBoard pulls data from the Federal Reserve Economic Data (FRED) API and visualizes six major economic indicators:

- **CPI** (Consumer Price Index) - Inflation tracking
- **Unemployment Rate** - Labor market health
- **Federal Funds Rate** - Monetary policy indicator
- **GDP** (Gross Domestic Product) - Economic growth
- **PCE** (Personal Consumption Expenditures) - Consumer spending
- **10Y-3M Yield Spread** - Yield curve indicator

Each indicator gets its own interactive chart with trend analysis, percentage changes, and contextual insights. There's also an overall economic health score that combines all indicators into a single metric.

## Features

- **Interactive Charts** - Built with Recharts, showing 5 years of historical data
- **AI Insights** - Optional AI-generated analysis for each indicator and an overall economic assessment (requires OpenAI API key)
- **Trend Analysis** - Automatic trend detection and percentage change calculations
- **Smart Caching** - Data is cached based on update frequency (daily data cached for 6 hours, quarterly for 7 days, etc.)
- **Dark Mode** - Toggle between light and dark themes
- **Real-time Updates** - Refresh button to pull the latest data
- **Cache Stats** - View cache information and statistics

## Tech Stack

**Frontend:**
- React 19 with Vite
- Tailwind CSS for styling
- Recharts for data visualization
- Framer Motion for animations

**Backend:**
- FastAPI (Python)
- Pandas for data processing
- NumPy and SciPy for calculations
- OpenAI API for AI insights (optional)

**Data Source:**
- Federal Reserve Economic Data (FRED) API

## Setup

### Prerequisites

- Python 3.8+
- Node.js 18+
- FRED API key ([get one here](https://fred.stlouisfed.org/docs/api/api_key.html))
- OpenAI API key (optional, for AI insights)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd fred-visualizer
```

2. Set up the backend:

```bash
# Install Python dependencies
pip install -r requirements.txt

# Or if using a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Set up the frontend:

```bash
cd frontend
npm install
```

4. Configure environment variables:

Create a `.env` file in the backend directory (or set environment variables):
```
FRED_KEY=your_fred_api_key_here
OPENAI_KEY=your_openai_api_key_here  # Optional
```

For the frontend, create a `.env` file in the `frontend` directory:
```
VITE_API_BASE=http://localhost:8000  # Or your backend URL
```

## Running Locally

1. Start the backend server:

```bash
# From the project root
python -m uvicorn backend.app:app --reload --host 0.0.0.0 --port 8000
```

Or if you're in the backend directory:
```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

2. Start the frontend dev server:

```bash
cd frontend
npm run dev
```

The dashboard should be available at `http://localhost:5173` (or whatever port Vite assigns).

## Project Structure

```
fred-visualizer/
├── backend/
│   ├── app.py              # FastAPI application
│   ├── cache.py            # File-based caching system
│   ├── analytics/          # Data analysis and insights
│   │   ├── fred_api.py     # FRED API client
│   │   ├── insights.py      # AI and basic insights
│   │   └── trend_analysis.py
│   └── series/             # Economic indicator classes
│       ├── base_series.py
│       ├── cpi.py
│       ├── unemployment.py
│       └── ...
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── Dashboard.jsx
│   │   └── components/
│   │       ├── ChartCard.jsx
│   │       └── dashboard/
│   └── package.json
└── cache/                   # Cache files (auto-generated)
```

## API Endpoints

- `GET /series/{series_name}` - Get economic data for a specific series
- `GET /insights/overall` - Get overall economic assessment
- `GET /cache/stats` - Get cache statistics
- `POST /cache/clear` - Clear all cached data
- `GET /health` - Health check endpoint

## Caching

The app uses a file-based caching system stored in the `backend/cache/` directory. Cache duration varies by data frequency:

- Daily data: 6 hours
- Weekly data: 12 hours
- Monthly data: 24 hours
- Quarterly data: 7 days
- Annual data: 30 days

Cache files are JSON files named with the pattern: `{series_name}_{frequency}_{start_date}_{end_date}.json`

## Deployment

The project can be deployed to various platforms. See `VERCEL_DEPLOYMENT.md` for Vercel-specific deployment instructions.

## Notes

- The backend is currently configured to work with Render's free tier, which spins down with inactivity. First load may take a few seconds.
- AI insights are optional and require an OpenAI API key. Without it, you'll still get basic trend analysis.
- The cache directory is created automatically on first run.

## License

MIT

