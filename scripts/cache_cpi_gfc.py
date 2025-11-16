#!/usr/bin/env python3
"""
Cache CPI data for 2008 Financial Crisis story (2006-2012)
"""
import sys
from pathlib import Path

backend_dir = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_dir.parent))

from backend.series.cpi import CPISeries
from backend.cache import backend_cache
from backend.analytics.trend_analysis import Trendanalyzer
from backend.analytics.insights import generate_insight

def cache_cpi_gfc():
    start_date = "2006-01-01"
    end_date = "2012-12-31"
    print(f"Fetching CPI data from {start_date} to {end_date}...")
    
    cpi_series = CPISeries(start_date, end_date)
    print("Fetching data from FRED API...")
    data = cpi_series.fetch_data()
    
    if data is None or len(data) == 0:
        print("ERROR: Failed to fetch data from FRED API")
        return False
    
    print(f"Successfully fetched {len(data)} data points")
    
    # Convert DataFrame to dict for caching
    data_dict = data.to_dict()
    for col in data_dict:
        if isinstance(data_dict[col], dict):
            data_dict[col] = {str(k): v for k, v in data_dict[col].items()}
    
    print("Computing trend analysis...")
    trend_data = Trendanalyzer(data).compute_trend()
    
    print("Generating insights...")
    insight = generate_insight(trend_data, "cpi")
    
    result = {
        "data": data_dict,
        "trend": trend_data,
        "insight": insight,
        "ai_insight": None,
        "frequency": cpi_series.frequency
    }
    
    print("Caching data...")
    backend_cache.set(
        "cpi",
        start_date,
        end_date,
        result,
        cpi_series.frequency
    )
    
    cache_path = backend_cache._get_cache_path("cpi", start_date, end_date, cpi_series.frequency)
    print(f"Successfully cached CPI data to: {cache_path}")
    print(f"  - Data points: {len(data)}")
    print(f"  - Date range: {data.index.min()} to {data.index.max()}")
    return True

if __name__ == "__main__":
    try:
        success = cache_cpi_gfc()
        if success:
            print("\nCPI data cached successfully!")
            sys.exit(0)
        else:
            print("\nFailed to cache CPI data")
            sys.exit(1)
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

