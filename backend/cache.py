import json
import os
import time
from pathlib import Path

class BackendCache:
    def __init__(self, cache_dir="cache"):
        # Use absolute path relative to project root (parent of backend directory)
        if Path(cache_dir).is_absolute():
            self.cache_dir = Path(cache_dir)
        else:
            # If relative, resolve from project root (parent of backend directory)
            backend_dir = Path(__file__).parent
            project_root = backend_dir.parent
            self.cache_dir = project_root / cache_dir
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
        
        print(f"[CACHE] Looking for cache: {cache_path}")
        print(f"[CACHE] Cache exists: {cache_path.exists()}")
        
        if not cache_path.exists():
            # Try without frequency suffix as fallback
            if frequency:
                fallback_path = self._get_cache_path(series_name, start_date, end_date, "")
                print(f"[CACHE] Trying fallback cache: {fallback_path}")
                if fallback_path.exists():
                    cache_path = fallback_path
                else:
                    # Try to find any cache file for this series that might overlap
                    print(f"[CACHE] Trying to find any cache file for {series_name} with frequency {frequency}")
                    cache_pattern = f"{series_name}_{frequency.lower()}_*.json" if frequency else f"{series_name}_*.json"
                    matching_files = list(self.cache_dir.glob(cache_pattern))
                    if matching_files:
                        # Sort by filename (which includes date range) to prefer larger date ranges
                        matching_files.sort(key=lambda p: p.name)
                        # Only use files that actually contain the requested date range
                        requested_start = start_date
                        requested_end = end_date
                        best_match = None
                        for cache_file in matching_files:
                            # Parse date range from filename: nasdaq_d_1995-01-01_2004-12-31.json
                            parts = cache_file.stem.split('_')
                            if len(parts) >= 4:
                                try:
                                    file_start = parts[-2]
                                    file_end = parts[-1]
                                    # Only use if file's range contains the requested range
                                    if file_start <= requested_start and file_end >= requested_end:
                                        best_match = cache_file
                                        break
                                except:
                                    pass
                        
                        # Only use if we found a file that contains the full range
                        if best_match:
                            cache_path = best_match
                            print(f"[CACHE] Found cache file containing requested range: {cache_path}")
                        else:
                            # Don't use overlapping files that don't contain the full range
                            print(f"[CACHE] No cache file found containing full date range {start_date} to {end_date}")
                            return None
                    else:
                        return None
            else:
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
            cached_result = cached_data['data']
            
            # Debug: Log cache structure for NASDAQ
            if series_name.lower() == 'nasdaq':
                print(f"[CACHE DEBUG] NASDAQ cache structure:")
                print(f"  - Has 'data' key: {'data' in cached_result}")
                print(f"  - Has 'data.data' key: {'data' in cached_result.get('data', {})}")
                print(f"  - Has 'data.value' key: {'value' in cached_result.get('data', {})}")
                print(f"  - Top level keys: {list(cached_result.keys()) if isinstance(cached_result, dict) else 'not a dict'}")
            
            return cached_result
        
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
