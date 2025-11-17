#!/usr/bin/env python3
"""
Cache all required data for 1973 Oil Shock & Stagflation story (1973-1979)
"""
import sys
from pathlib import Path

backend_dir = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_dir.parent))

from backend.series.unemployment import UnemploymentSeries
from backend.series.fed_funds import FedFundsSeries
from backend.series.gdp import GDPSeries
from backend.series.cpi import CPISeries
from backend.series.base_series import Series
from backend.cache import backend_cache
from backend.analytics.trend_analysis import Trendanalyzer
from backend.analytics.insights import generate_insight

def cache_series(series_class, series_name, start_date, end_date):
    print(f"\nFetching {series_name} from {start_date} to {end_date}...")
    
    series = series_class(start_date, end_date)
    print("Fetching data from FRED API...")
    data = series.fetch_data()
    
    if data is None or len(data) == 0:
        print(f"ERROR: Failed to fetch data for {series_name}")
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
    insight = generate_insight(trend_data, series_name)
    
    result = {
        "data": data_dict,
        "trend": trend_data,
        "insight": insight,
        "ai_insight": None,
        "frequency": series.frequency
    }
    
    print("Caching data...")
    backend_cache.set(
        series_name,
        start_date,
        end_date,
        result,
        series.frequency
    )
    
    cache_path = backend_cache._get_cache_path(series_name, start_date, end_date, series.frequency)
    print(f"Successfully cached {series_name} data to: {cache_path}")
    print(f"  - Data points: {len(data)}")
    print(f"  - Date range: {data.index.min()} to {data.index.max()}")
    return True

def main():
    start_date = "1973-01-01"
    end_date = "1979-12-31"
    
    print("Caching data for 1973 Oil Shock & Stagflation story...")
    print(f"Date range: {start_date} to {end_date}")
    
    results = []
    results.append(cache_series(UnemploymentSeries, "unemployment", start_date, end_date))
    
    # Cache CPI with percent change from year ago (pc1) for inflation rate
    print(f"\nFetching cpi (percent change from year ago) from {start_date} to {end_date}...")
    cpi_series = Series(series_id="CPIAUCSL", start_date=start_date, end_date=end_date, frequency="m", units="pc1")
    print("Fetching data from FRED API...")
    cpi_data = cpi_series.fetch_data()
    
    if cpi_data is None or len(cpi_data) == 0:
        print("ERROR: Failed to fetch CPI data")
        results.append(False)
    else:
        print(f"Successfully fetched {len(cpi_data)} data points")
        
        # Convert DataFrame to dict for caching
        data_dict = cpi_data.to_dict()
        for col in data_dict:
            if isinstance(data_dict[col], dict):
                data_dict[col] = {str(k): v for k, v in data_dict[col].items()}
        
        print("Computing trend analysis...")
        trend_data = Trendanalyzer(cpi_data).compute_trend()
        
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
        print(f"Successfully cached cpi data to: {cache_path}")
        print(f"  - Data points: {len(cpi_data)}")
        print(f"  - Date range: {cpi_data.index.min()} to {cpi_data.index.max()}")
        results.append(True)
    
    results.append(cache_series(FedFundsSeries, "fedfunds", start_date, end_date))
    results.append(cache_series(GDPSeries, "gdp", start_date, end_date))
    
    if all(results):
        print("\n[SUCCESS] All data cached successfully!")
        return 0
    else:
        print("\n[ERROR] Some data failed to cache")
        return 1

if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

