from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import re
from backend.series.unemployment import UnemploymentSeries
from backend.series.cpi import CPISeries
from backend.series.fed_funds import FedFundsSeries
from backend.series.gdp import GDPSeries
from backend.series.pce import PCESeries
from backend.series.t10y3m import T10Y3MSeries
from backend.analytics.trend_analysis import Trendanalyzer
from backend.analytics.insights import generate_insight, generate_ai_insight, generate_overall_ai_insight
from backend.cache import backend_cache

import json
import math

def _sanitize_for_json(obj):
    """Recursively replace NaN/Inf with None so JSON serialization succeeds."""
    if isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return None
        return obj
    if isinstance(obj, dict):
        return {k: _sanitize_for_json(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_sanitize_for_json(v) for v in obj]
    return obj

app = FastAPI(title="Economic Trends Dashboard API")
# python -m uvicorn backend.app:app --reload --host 0.0.0.0 --port 8000
# Add CORS middleware
# Custom CORS function to handle wildcards
def is_origin_allowed(origin: str) -> bool:
    allowed_patterns = [
        r"http://localhost:\d+",
        r"http://127\.0\.0\.1:\d+",
        r"https://.*\.vercel\.app$",
        # Add your custom domain here: r"https://your-dashboard\.com$"
    ]
    return any(re.match(pattern, origin) for pattern in allowed_patterns)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.vercel\.app|http://localhost:\d+|http://127\.0\.0\.1:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
series_map = {
    "unemployment": UnemploymentSeries,
    "cpi": CPISeries,
    "fedfunds": FedFundsSeries,
    "gdp": GDPSeries,
    "pce": PCESeries,
    "t10y3m": T10Y3MSeries
}
# uvicorn app:app --reload to run application
# 
@app.get("/series/{series_name}")
def get_series(series_name: str, start: str, end: str, include_ai: bool = True, use_cache: bool = True):
    try:
        if series_name.lower() not in series_map:
            raise HTTPException(status_code=404, detail="Series not found")
        
        # Check cache first
        if use_cache:
            # Try to use frequency-aware cache key by peeking frequency from class
            series_class = series_map[series_name.lower()]
            series_instance_for_freq = series_class(start, end)
            freq = getattr(series_instance_for_freq, 'frequency', '')
            cached_data = backend_cache.get(series_name.lower(), start, end, freq)
            if cached_data:
                print(f"Returning cached data for {series_name}")
                return _sanitize_for_json(cached_data)
            else:
                print(f"No cache found for {series_name}, fetching fresh data")
        
        # Fetch fresh data
        series_class = series_map[series_name.lower()]
        series_instance = series_class(start, end)
        
        data = series_instance.fetch_data() # raw time value data
         # Convert DataFrame to dict for JSON response
        data_dict = data.to_dict()  # this works because data is a DataFrame
        
        # Convert Timestamp objects to strings for JSON serialization
        for col in data_dict:
            if isinstance(data_dict[col], dict):
                data_dict[col] = {str(k): v for k, v in data_dict[col].items()}

        # Compute trend
        trend_data = Trendanalyzer(data).compute_trend() # returns a dict of trends, cause FASTAPI must return a dict

        # Basic insights (always fast)
        insight = generate_insight(trend_data, series_name)
        
        # AI insights (optional and slow)
        ai_insight = None
        if include_ai:
            try:
                ai_insight = generate_ai_insight(data, series_name)
            except Exception as e:
                print(f"AI insight failed for {series_name}: {e}")
                ai_insight = f"AI insights temporarily unavailable for {series_name}."

        # Include basic frequency metadata for frontend caching
        result = {
            "data": data_dict,
            "trend": trend_data, # already a dict
            "insight": insight,
            "ai_insight": ai_insight,
            "frequency": getattr(series_instance, 'frequency', None)
        }
        result = _sanitize_for_json(result)
        
        # Cache the result
        if use_cache:
            print(f"Caching fresh data for {series_name}")
            backend_cache.set(series_name.lower(), start, end, result, getattr(series_instance, 'frequency', ''))
        
        return result

    except Exception as e:
        import traceback
        print("ERROR:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/cache/clear")
def clear_cache():
    """Clear all cached data"""
    backend_cache.clear()
    return {"message": "Cache cleared successfully"}

@app.get("/cache/stats")
def cache_stats():
    """Get cache statistics"""
    import time
    import json
    
    cache_files = list(backend_cache.cache_dir.glob("*.json"))
    current_time = time.time()
    
    valid_files = 0
    expired_files = 0
    total_size = 0
    oldest_time = None
    newest_time = None
    
    for cache_file in cache_files:
        try:
            with open(cache_file, 'r') as f:
                cached_data = json.load(f)
            
            file_size = cache_file.stat().st_size
            total_size += file_size
            
            timestamp = cached_data.get('timestamp', 0)
            if oldest_time is None or timestamp < oldest_time:
                oldest_time = timestamp
            if newest_time is None or timestamp > newest_time:
                newest_time = timestamp
            
            if current_time - timestamp <= backend_cache.cache_duration:
                valid_files += 1
            else:
                expired_files += 1
                
        except (json.JSONDecodeError, KeyError, OSError):
            expired_files += 1
    
    return {
        "total": len(cache_files),
        "valid": valid_files,
        "expired": expired_files,
        "size": total_size,
        "oldestCache": time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(oldest_time)) if oldest_time else 'None',
        "newestCache": time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(newest_time)) if newest_time else 'None',
        "cacheDuration": f"{backend_cache.cache_duration // 3600} hours"
    }


@app.get("/insights/overall")
def overall_insight(start: str, end: str):
    """Compute combined metrics and return an overall AI-generated assessment."""
    try:
        # Pull series (use cache to be fast)
        needed = ["gdp", "cpi", "unemployment", "fedfunds", "pce", "t10y3m"]
        results = {}
        for s in needed:
            if s not in series_map:
                continue
            series_instance = series_map[s](start, end)
            df = series_instance.fetch_data()
            if df is None or df.empty:
                continue
            results[s] = df

        def latest_num(df):
            try:
                v = df['value'].dropna()
                if v.empty:
                    return None
                return float(v.iloc[-1])
            except Exception:
                return None

        def pct_change(df, periods):
            try:
                v = df['value'].dropna()
                if len(v) <= periods:
                    return None
                curr = float(v.iloc[-1])
                prev = float(v.iloc[-1 - periods])
                if prev == 0:
                    return None
                return ((curr - prev) / prev) * 100.0
            except Exception:
                return None

        metrics = {
            'gdp_yoy': pct_change(results.get('gdp'), 4),
            'cpi_yoy': pct_change(results.get('cpi'), 12),
            'unemployment': latest_num(results.get('unemployment')),
            'fedfunds': latest_num(results.get('fedfunds')),
            'pce_yoy': pct_change(results.get('pce'), 12),
            't10y3m': latest_num(results.get('t10y3m')),
        }

        # Simple reimplementation of frontend scoring for consistency
        import math
        def clamp01(x):
            return max(0.0, min(1.0, x)) if x is not None and not math.isnan(x) and not math.isinf(x) else None

        def score_unemp(x):
            if x is None: return None
            return clamp01(1 - min(1, abs(x - 4) / 4))
        def score_gdp(x):
            if x is None: return None
            return clamp01((x - (-2)) / 8)
        def score_cpi(x):
            if x is None: return None
            return clamp01(1 - min(1, abs(x - 2) / 4))
        def score_fed(x):
            if x is None: return None
            d = 2 - x if x < 2 else x - 4 if x > 4 else 0
            return clamp01(1 - min(1, d / 4))
        def score_pce(x):
            if x is None: return None
            return clamp01((x - 0) / 6)
        def score_spread(x):
            if x is None: return None
            return clamp01((x - (-1)) / 3)

        scores = [
            score_gdp(metrics['gdp_yoy']),
            score_unemp(metrics['unemployment']),
            score_cpi(metrics['cpi_yoy']),
            score_fed(metrics['fedfunds']),
            score_pce(metrics['pce_yoy']),
            score_spread(metrics['t10y3m'])
        ]
        scores = [s for s in scores if s is not None]
        health_percent = round((sum(scores) / len(scores)) * 100) if scores else None

        context = _sanitize_for_json({
            'health_percent': health_percent,
            'metrics': metrics
        })

        narrative = generate_overall_ai_insight(context)
        return _sanitize_for_json({ 'health_percent': health_percent, 'metrics': metrics, 'ai_insight': narrative })
    except Exception as e:
        print("Overall insight error:", e)
        return _sanitize_for_json({ 'health_percent': None, 'metrics': {}, 'ai_insight': 'Overall AI insight temporarily unavailable.' })
