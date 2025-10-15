// Cache utility for storing API responses locally
const CACHE_PREFIX = 'fred_visualizer_';
const DEFAULT_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours (1 day) in milliseconds

function durationForFrequency(freq) {
  const f = (freq || '').toLowerCase();
  if (f === 'd') return 6 * 60 * 60 * 1000; // 6 hours
  if (f === 'w') return 12 * 60 * 60 * 1000; // 12 hours
  if (f === 'm') return 24 * 60 * 60 * 1000; // 1 day
  if (f === 'q') return 7 * 24 * 60 * 60 * 1000; // 7 days
  if (f === 'a' || f === 'y') return 30 * 24 * 60 * 60 * 1000; // 30 days
  return DEFAULT_CACHE_DURATION;
}

export class DataCache {
  constructor() {
    this.cache = new Map();
    this.loadFromStorage();
  }

  // Load cache from localStorage on initialization
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(CACHE_PREFIX + 'data');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.cache = new Map(parsed);
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error);
      this.cache = new Map();
    }
  }

  // Save cache to localStorage
  saveToStorage() {
    try {
      const serialized = JSON.stringify(Array.from(this.cache.entries()));
      localStorage.setItem(CACHE_PREFIX + 'data', serialized);
    } catch (error) {
      console.warn('Failed to save cache to storage:', error);
    }
  }

  // Generate cache key
  getCacheKey(seriesName, start, end, frequency) {
    const freq = frequency ? `_${frequency}` : '';
    return `${seriesName}${freq}_${start}_${end}`;
  }

  // Check if data is cached and not expired
  get(seriesName, start, end, frequency) {
    const key = this.getCacheKey(seriesName, start, end, frequency);
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    const now = Date.now();
    const duration = durationForFrequency(cached.frequency || frequency);
    if (now - cached.timestamp > duration) {
      // Cache expired, remove it
      this.cache.delete(key);
      this.saveToStorage();
      return null;
    }

    console.log(`Cache hit for ${seriesName}`);
    return cached.data;
  }

  // Store data in cache
  set(seriesName, start, end, data, frequency) {
    const key = this.getCacheKey(seriesName, start, end, frequency);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      frequency
    });
    this.saveToStorage();
    console.log(`Cached data for ${seriesName}`);
  }

  // Clear all cache
  clear() {
    this.cache.clear();
    localStorage.removeItem(CACHE_PREFIX + 'data');
    console.log('Cache cleared');
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    const valid = entries.filter(([key, value]) => now - value.timestamp <= durationForFrequency(value.frequency));
    const expired = entries.filter(([key, value]) => now - value.timestamp > durationForFrequency(value.frequency));
    
    // Get the oldest and newest cache entries
    const timestamps = entries.map(([key, value]) => value.timestamp);
    const oldestTime = timestamps.length > 0 ? Math.min(...timestamps) : null;
    const newestTime = timestamps.length > 0 ? Math.max(...timestamps) : null;
    
    return {
      total: entries.length,
      valid: valid.length,
      expired: expired.length,
      size: JSON.stringify(Array.from(this.cache.entries())).length,
      oldestCache: oldestTime ? new Date(oldestTime).toLocaleString() : 'None',
      newestCache: newestTime ? new Date(newestTime).toLocaleString() : 'None',
      cacheDuration: 'variable (by frequency)'
    };
  }

  // Clean up expired entries
  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > durationForFrequency(value.frequency)) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      this.saveToStorage();
      console.log(`Cleaned up ${cleaned} expired cache entries`);
    }
  }
}

// Create a singleton instance
export const dataCache = new DataCache();
