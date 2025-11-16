#!/usr/bin/env python3
"""
Script to fetch and cache NASDAQ data for the full dot-com bubble period (1995-2004)
"""
import sys
import os
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_dir.parent))

from backend.series.nasdaq import NASDAQSeries
from backend.cache import backend_cache
from backend.analytics.trend_analysis import Trendanalyzer
from backend.analytics.insights import generate_insight

def fetch_and_cache_nasdaq():
    """Fetch NASDAQ data for 1995-2004 and cache it"""
    start_date = "1995-01-01"
    end_date = "2004-12-31"
    
    print(f"Fetching NASDAQ data from {start_date} to {end_date}...")
    
    # Create NASDAQ series instance
    nasdaq_series = NASDAQSeries(start_date, end_date)
    
    # Fetch data from FRED
    print("Fetching data from FRED API...")
    data = nasdaq_series.fetch_data()
    
    if data is None or len(data) == 0:
        print("ERROR: Failed to fetch data from FRED API")
        return False
    
    print(f"Successfully fetched {len(data)} data points")
    
    # Convert DataFrame to dict for caching
    data_dict = data.to_dict()
    
    # Convert Timestamp objects to strings for JSON serialization
    for col in data_dict:
        if isinstance(data_dict[col], dict):
            data_dict[col] = {str(k): v for k, v in data_dict[col].items()}
    
    # Compute trend
    print("Computing trend analysis...")
    trend_data = Trendanalyzer(data).compute_trend()
    
    # Generate insight
    print("Generating insights...")
    insight = generate_insight(trend_data, "nasdaq")
    
    # Prepare result for caching
    result = {
        "data": data_dict,
        "trend": trend_data,
        "insight": insight,
        "ai_insight": None,
        "frequency": nasdaq_series.frequency
    }
    
    # Cache the result
    print(f"Caching data...")
    backend_cache.set(
        "nasdaq",
        start_date,
        end_date,
        result,
        nasdaq_series.frequency
    )
    
    cache_path = backend_cache._get_cache_path("nasdaq", start_date, end_date, nasdaq_series.frequency)
    print(f"Successfully cached NASDAQ data to: {cache_path}")
    print(f"  - Data points: {len(data)}")
    print(f"  - Date range: {data.index.min()} to {data.index.max()}")
    
    return True

if __name__ == "__main__":
    try:
        success = fetch_and_cache_nasdaq()
        if success:
            print("\nNASDAQ data cached successfully!")
            sys.exit(0)
        else:
            print("\nFailed to cache NASDAQ data")
            sys.exit(1)
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

