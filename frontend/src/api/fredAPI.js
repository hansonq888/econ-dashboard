import axios from "axios";
import { dataCache } from "../utils/cache";

const API_BASE = import.meta.env.VITE_API_BASE || "https://fred-watch-api.onrender.com";
console.log("API_BASE:", API_BASE); // Debug log

export async function fetchSeries(seriesName, start, end, useCache = true, includeAI = true, retryCount = 0) {
  // Check frontend cache first
  if (useCache) {
    // Try to infer frequency from last-known cached meta or backend response; we pass undefined here for key match
    const cachedData = dataCache.get(seriesName, start, end);
    if (cachedData) {
      return cachedData;
    }
  }

  try {
    // Fetch from API with backend cache parameter
    const response = await axios.get(`${API_BASE}/series/${seriesName}`, {
      params: { start, end, use_cache: useCache, include_ai: includeAI },
      timeout: 30000, // 30 second timeout (Vercel functions are faster)
    });

    // Cache the response in frontend cache too (frequency-aware)
    if (useCache) {
      const frequency = response.data?.data?.value ? response.data?.data?.frequency || response.data?.data?.freq : response.data?.frequency || response.data?.freq;
      // Backend doesn't send freq separately today; try to infer from series metadata if returned in payload later.
      // For now, approximate via series name where known
      const inferred = (
        seriesName === 't10y3m' ? 'd' :
        seriesName === 'gdp' ? 'q' :
        seriesName === 'cpi' ? 'm' :
        seriesName === 'unemployment' ? 'm' :
        seriesName === 'fedfunds' ? 'm' :
        seriesName === 'pce' ? 'm' : undefined
      );
      dataCache.set(seriesName, start, end, response.data, frequency || inferred);
    }

    return response.data;
  } catch (error) {
    console.error(`API Error for ${seriesName}:`, error);
    
    // Retry logic for Vercel cold starts (max 1 retry)
    if (retryCount < 1 && (error.code === 'ECONNABORTED' || error.message.includes('timeout'))) {
      console.log(`Retrying ${seriesName} (attempt ${retryCount + 1}/1) - Vercel cold start`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
      return fetchSeries(seriesName, start, end, useCache, includeAI, retryCount + 1);
    }
    
    // Try to return cached data even if expired
    if (useCache) {
      const key = dataCache.getCacheKey(seriesName, start, end);
      const cached = dataCache.cache.get(key);
      if (cached) {
        console.log(`Using expired cache for ${seriesName} due to API error`);
        return cached.data;
      }
    }
    
    throw error;
  }
}

// Export cache utilities
export { dataCache };
