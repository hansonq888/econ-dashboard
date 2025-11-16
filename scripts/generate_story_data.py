#!/usr/bin/env python3
"""
Generate static JSON files for Story Mode.
Fetches historical data from cache or FRED API and saves to frontend/public/story-data/
"""
import sys
import json
import math
from pathlib import Path
from datetime import datetime

# Add backend to path
backend_dir = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_dir.parent))

from backend.cache import backend_cache
from scripts.story_config import STORIES

def format_data_for_frontend(series_obj):
    """Convert backend Series object to frontend-friendly format"""
    if not series_obj or not hasattr(series_obj, 'data') or series_obj.data is None:
        return None
    
    import pandas as pd
    
    data_dict = series_obj.data.to_dict()
    value_dict = {}
    
    if len(data_dict) > 0:
        first_col = list(data_dict.keys())[0]
        for date, value in data_dict[first_col].items():
            # Only include numeric values
            if pd.notna(value) and value != float('inf') and value != float('-inf'):
                try:
                    num_val = float(value)
                    if not (math.isnan(num_val) or math.isinf(num_val)):
                        # Convert date to string format (YYYY-MM-DD HH:MM:SS)
                        date_str = str(date)
                        value_dict[date_str] = num_val
                except (ValueError, TypeError):
                    # Skip non-numeric values
                    pass
    
    return {"value": value_dict} if value_dict else None

def fetch_series_data(series_class, start_date, end_date, series_name, frequency=""):
    """Fetch series data, preferring cache"""
    print(f"  Fetching {series_name} from {start_date} to {end_date}...")
    
    # Try cache first
    cached = backend_cache.get(series_name, start_date, end_date, frequency)
    if cached and cached.get("data"):
        print(f"    Using cached data")
        cache_data = cached.get("data", {})
        value_data = {}
        
        if isinstance(cache_data, dict):
            # Check for direct "value" key
            if "value" in cache_data and isinstance(cache_data["value"], dict):
                value_data = cache_data["value"]
            # Check for "data" key containing DataFrame dict
            elif "data" in cache_data and isinstance(cache_data["data"], dict):
                data_dict = cache_data["data"]
                if len(data_dict) > 0:
                    first_col = list(data_dict.keys())[0]
                    if isinstance(data_dict[first_col], dict):
                        value_data = data_dict[first_col]
            # If cache_data itself looks like a value dict
            elif all(isinstance(k, str) and (isinstance(v, (int, float)) or isinstance(v, str)) 
                     for k, v in list(cache_data.items())[:5] 
                     if k not in ["trend", "insight", "ai_insight", "frequency"]):
                value_data = {k: v for k, v in cache_data.items() 
                             if k not in ["trend", "insight", "ai_insight", "frequency"]}
        
        # Clean values - ensure we only keep numeric values
        if isinstance(value_data, dict):
            clean_value_data = {}
            for k, v in value_data.items():
                clean_key = str(k)
                # Only accept numeric values, reject strings that look like dates
                if isinstance(v, (int, float)):
                    if not (math.isnan(v) or math.isinf(v)):
                        clean_value_data[clean_key] = float(v)
                elif isinstance(v, str):
                    # Try to convert string to float if it's numeric
                    try:
                        num_val = float(v)
                        if not (math.isnan(num_val) or math.isinf(num_val)):
                            clean_value_data[clean_key] = num_val
                    except (ValueError, TypeError):
                        # Skip non-numeric strings (like date strings)
                        pass
            return {"value": clean_value_data} if clean_value_data else None
    
    # Fallback to fetching from FRED
    print(f"    Fetching from FRED API...")
    try:
        series = series_class(start_date, end_date)
        data = series.fetch_data()
        if data is None or len(data) == 0:
            print(f"    WARNING: No data returned")
            return None
        return format_data_for_frontend(series)
    except Exception as e:
        print(f"    ERROR: {e}")
        return None

def generate_dotcom_story():
    """Generate static JSON for dot-com bubble story"""
    print("\n=== Generating Dot-Com Bubble Story Data ===")
    
    story_config = STORIES["dotcom"]
    story_data = {
        "timeFrames": [],
        "fullPeriodData": {}
    }
    
    # Fetch full period series (e.g., NASDAQ)
    if "fullPeriodSeries" in story_config:
        for series_name, series_config in story_config["fullPeriodSeries"].items():
            series_class = series_config["class"]
            start_date = series_config.get("startDate", story_config["timeFrames"][0]["startDate"])
            end_date = series_config.get("endDate", story_config["timeFrames"][-1]["endDate"])
            frequency = series_config.get("frequency", "")
            
            data = fetch_series_data(series_class, start_date, end_date, series_name, frequency)
            if data:
                story_data["fullPeriodData"][series_name] = data
    
    # Fetch data for each time frame
    for tf_config in story_config["timeFrames"]:
        print(f"\nProcessing time frame: {tf_config['id']}")
        frame_data = {
            "id": tf_config["id"],
            "title": tf_config["title"],
            "date": tf_config["date"],
            "description": tf_config["description"],
            "events": tf_config["events"],
            "startDate": tf_config["startDate"],
            "endDate": tf_config["endDate"],
            "data": {}
        }
        
        # Fetch series data for this time frame
        for series_name, series_config in tf_config["series"].items():
            series_class = series_config["class"]
            frequency = series_config.get("frequency", "")
            data = fetch_series_data(
                series_class, tf_config["startDate"], tf_config["endDate"], series_name, frequency
            )
            if data:
                frame_data["data"][series_name] = data
        
        # Filter full period data for this time frame
        for series_name, full_data in story_data["fullPeriodData"].items():
            if full_data and full_data.get("value"):
                filtered_data = {}
                start = datetime.strptime(tf_config["startDate"], "%Y-%m-%d")
                end = datetime.strptime(tf_config["endDate"], "%Y-%m-%d")
                end = end.replace(hour=23, minute=59, second=59)  # Include end date
                
                for date_str, value in full_data["value"].items():
                    try:
                        # Try parsing with timestamp format first
                        if " " in date_str:
                            date = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")
                        else:
                            date = datetime.strptime(date_str, "%Y-%m-%d")
                        
                        if start <= date <= end:
                            filtered_data[date_str] = value
                    except:
                        try:
                            # Try ISO format
                            date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                            if start <= date <= end:
                                filtered_data[date_str] = value
                        except:
                            pass
                
                if filtered_data:
                    frame_data["data"][series_name] = {"value": filtered_data}
        
        story_data["timeFrames"].append(frame_data)
    
    return story_data

def generate_gfc_story():
    """Generate static JSON for 2008 Financial Crisis story"""
    print("\n=== Generating 2008 Financial Crisis Story Data ===")
    
    story_config = STORIES["gfc"]
    story_data = {
        "title": story_config["title"],
        "period": story_config["subtitle"],
        "startDate": story_config["startDate"],
        "endDate": story_config["endDate"],
        "data": {}
    }
    
    # Fetch all series data
    for series_name, series_config in story_config["series"].items():
        series_class = series_config["class"]
        frequency = series_config.get("frequency", "")
        data = fetch_series_data(
            series_class, story_config["startDate"], story_config["endDate"], series_name, frequency
        )
        if data:
            story_data["data"][series_name] = data
    
    return story_data

def generate_volcker_story():
    """Generate static JSON for Volcker Disinflation story"""
    print("\n=== Generating Volcker Disinflation Story Data ===")
    
    story_config = STORIES["volcker"]
    story_data = {
        "title": story_config["title"],
        "period": story_config["subtitle"],
        "startDate": story_config["startDate"],
        "endDate": story_config["endDate"],
        "data": {}
    }
    
    # Fetch all series data
    for series_name, series_config in story_config["series"].items():
        series_class = series_config["class"]
        frequency = series_config.get("frequency", "")
        data = fetch_series_data(
            series_class, story_config["startDate"], story_config["endDate"], series_name, frequency
        )
        if data:
            story_data["data"][series_name] = data
    
    return story_data

def main():
    """Generate all story data files"""
    project_root = Path(__file__).parent.parent
    output_dir = project_root / "frontend" / "public" / "story-data"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print("Generating static story data files...")
    print(f"Output directory: {output_dir}")
    
    # Generate dot-com bubble story
    try:
        dotcom_data = generate_dotcom_story()
        dotcom_path = output_dir / "dotcom.json"
        with open(dotcom_path, 'w') as f:
            json.dump(dotcom_data, f, indent=2)
        print(f"\n[SUCCESS] Saved dot-com bubble data to {dotcom_path}")
    except Exception as e:
        print(f"\n[ERROR] Error generating dot-com bubble data: {e}")
        import traceback
        traceback.print_exc()
    
    # Generate 2008 financial crisis story
    try:
        gfc_data = generate_gfc_story()
        gfc_path = output_dir / "gfc.json"
        with open(gfc_path, 'w') as f:
            json.dump(gfc_data, f, indent=2)
        print(f"\n[SUCCESS] Saved 2008 financial crisis data to {gfc_path}")
    except Exception as e:
        print(f"\n[ERROR] Error generating 2008 financial crisis data: {e}")
        import traceback
        traceback.print_exc()
    
    # Generate Volcker Disinflation story
    try:
        volcker_data = generate_volcker_story()
        volcker_path = output_dir / "volcker.json"
        with open(volcker_path, 'w') as f:
            json.dump(volcker_data, f, indent=2)
        print(f"\n[SUCCESS] Saved Volcker Disinflation data to {volcker_path}")
    except Exception as e:
        print(f"\n[ERROR] Error generating Volcker Disinflation data: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n=== Story data generation complete ===")

if __name__ == "__main__":
    main()
