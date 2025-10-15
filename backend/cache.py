import json
import os
import time
from pathlib import Path

class BackendCache:
    def __init__(self, cache_dir="cache"):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(exist_ok=True)
        # Default cache duration (fallback)
        self.cache_duration = 24 * 60 * 60  # 24 hours (1 day) in seconds

    def _duration_for_frequency(self, freq: str) -> int:
        """Return cache duration in seconds based on series frequency."""
        freq = (freq or '').lower()
        if freq == 'd':
            return 6 * 60 * 60   # 6 hours
        if freq == 'w':
            return 12 * 60 * 60  # 12 hours
        if freq == 'm':
            return 24 * 60 * 60  # 1 day
        if freq == 'q':
            return 7 * 24 * 60 * 60  # 7 days
        if freq == 'a' or freq == 'y':
            return 30 * 24 * 60 * 60  # 30 days
        return self.cache_duration
    
    def _get_cache_path(self, series_name, start_date, end_date, frequency: str = ""):
        """Generate cache file path for given parameters (include frequency)."""
        freq_suffix = f"_{frequency.lower()}" if frequency else ""
        cache_key = f"{series_name}{freq_suffix}_{start_date}_{end_date}.json"
        return self.cache_dir / cache_key
    
    def get(self, series_name, start_date, end_date, frequency: str = ""):
        """Get cached data if it exists and is not expired"""
        cache_path = self._get_cache_path(series_name, start_date, end_date, frequency)
        
        if not cache_path.exists():
            return None
        
        try:
            with open(cache_path, 'r') as f:
                cached_data = json.load(f)
            
            # Check if cache is expired (use per-entry frequency if available)
            entry_freq = cached_data.get('frequency', frequency)
            duration = self._duration_for_frequency(entry_freq)
            if time.time() - cached_data['timestamp'] > duration:
                cache_path.unlink()  # Delete expired cache
                return None
            
            print(f"Cache hit for {series_name}")
            return cached_data['data']
        
        except (json.JSONDecodeError, KeyError, OSError) as e:
            print(f"Cache error for {series_name}: {e}")
            cache_path.unlink()  # Delete corrupted cache
            return None
    
    def set(self, series_name, start_date, end_date, data, frequency: str = ""):
        """Cache the data"""
        cache_path = self._get_cache_path(series_name, start_date, end_date, frequency)
        
        try:
            cache_data = {
                'data': data,
                'timestamp': time.time(),
                'series_name': series_name,
                'start_date': start_date,
                'end_date': end_date,
                'frequency': frequency
            }
            
            with open(cache_path, 'w') as f:
                json.dump(cache_data, f, indent=2)
            
            print(f"Cached data for {series_name}")
        
        except OSError as e:
            print(f"Failed to cache {series_name}: {e}")
    
    def clear(self):
        """Clear all cache files"""
        try:
            for cache_file in self.cache_dir.glob("*.json"):
                cache_file.unlink()
            print("Backend cache cleared")
        except OSError as e:
            print(f"Failed to clear cache: {e}")
    
    def cleanup(self):
        """Remove expired cache files"""
        cleaned = 0
        current_time = time.time()
        
        try:
            for cache_file in self.cache_dir.glob("*.json"):
                try:
                    with open(cache_file, 'r') as f:
                        cached_data = json.load(f)
                    
                    if current_time - cached_data.get('timestamp', 0) > self.cache_duration:
                        cache_file.unlink()
                        cleaned += 1
                
                except (json.JSONDecodeError, KeyError):
                    cache_file.unlink()  # Delete corrupted files
                    cleaned += 1
            
            if cleaned > 0:
                print(f"Cleaned up {cleaned} expired cache files")
        
        except OSError as e:
            print(f"Cache cleanup error: {e}")

# Create a singleton instance
backend_cache = BackendCache()
