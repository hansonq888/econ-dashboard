#!/usr/bin/env python3
"""Verify story data files are correct"""
import json
from pathlib import Path

def verify_gfc():
    print("\n=== Verifying GFC Data ===")
    gfc_path = Path("frontend/public/story-data/gfc.json")
    with open(gfc_path) as f:
        data = json.load(f)
    
    print(f"Title: {data.get('title')}")
    print(f"Date range: {data.get('startDate')} to {data.get('endDate')}")
    
    for series_name in ["unemployment", "fedfunds", "cpi", "gdp"]:
        series_data = data.get("data", {}).get(series_name, {}).get("value", {})
        if series_data:
            dates = sorted(series_data.keys())
            print(f"\n{series_name}:")
            print(f"  Entries: {len(series_data)}")
            print(f"  First date: {dates[0]}")
            print(f"  Last date: {dates[-1]}")
            print(f"  Sample values: {list(series_data.items())[:3]}")
        else:
            print(f"\n{series_name}: MISSING")

def verify_dotcom():
    print("\n=== Verifying Dot-Com Bubble Data ===")
    dotcom_path = Path("frontend/public/story-data/dotcom.json")
    with open(dotcom_path) as f:
        data = json.load(f)
    
    print(f"Time frames: {len(data.get('timeFrames', []))}")
    
    for frame in data.get("timeFrames", []):
        print(f"\n{frame['id']} ({frame['startDate']} to {frame['endDate']}):")
        for series_name in ["unemployment", "gdp", "fedfunds", "nasdaq"]:
            series_data = frame.get("data", {}).get(series_name, {}).get("value", {})
            if series_data:
                dates = sorted(series_data.keys())
                print(f"  {series_name}: {len(series_data)} entries ({dates[0][:10]} to {dates[-1][:10]})")
            else:
                print(f"  {series_name}: MISSING")

if __name__ == "__main__":
    verify_gfc()
    verify_dotcom()
    print("\n=== Verification complete ===")

