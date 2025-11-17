import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ChartCard from "../components/ChartCard";

export default function Dashboard() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState({});
  const [darkMode, setDarkMode] = useState(true);
  const [showCacheInfo, setShowCacheInfo] = useState(false);
  const [cacheStats, setCacheStats] = useState(null);
  const [enableAI, setEnableAI] = useState(true);
  const [dateRange, setDateRange] = useState('');
  const [overallInsight, setOverallInsight] = useState(null);

  // Compute percentage change helpers for indicators
  const computeChange = (valueDict, lag) => {
    try {
      if (!valueDict) return null;
      const dates = Object.keys(valueDict).sort();
      if (dates.length <= lag) return null;
      const latestDate = dates[dates.length - 1];
      const prevDate = dates[dates.length - 1 - lag];
      const latest = Number(valueDict[latestDate]);
      const prev = Number(valueDict[prevDate]);
      if (!isFinite(latest) || !isFinite(prev) || prev === 0) return null;
      const changePct = ((latest - prev) / prev) * 100;
      return { latestDate, latest, prevDate, prev, changePct };
    } catch {
      return null;
    }
  };

  const formatPct = (num) =>
    `${(num >= 0 ? '+' : '')}${num.toFixed(2)}%`;

  // Scoring helpers for the Economic Health index (0..1)
  const scoreUnemployment = (ratePct) => {
    if (!isFinite(ratePct)) return null;
    // Peak at ~4%, declines as it moves away; 0 at >=8% or <=0%
    const score = 1 - Math.min(1, Math.abs(ratePct - 4) / 4);
    return Math.max(0, Math.min(1, score));
  };

  const scoreGDPGrowth = (growthPctYoY) => {
    if (!isFinite(growthPctYoY)) return null;
    // Map -2% -> 0, 6% -> 1 linearly
    const normalized = (growthPctYoY - (-2)) / (6 - (-2));
    return Math.max(0, Math.min(1, normalized));
  };

  const scoreInflation = (inflPctYoY) => {
    if (!isFinite(inflPctYoY)) return null;
    // Peak at 2%, declines with distance; 0 at >=6% away
    const score = 1 - Math.min(1, Math.abs(inflPctYoY - 2) / 4);
    return Math.max(0, Math.min(1, score));
  };

  const scoreFedFunds = (ratePct) => {
    if (!isFinite(ratePct)) return null;
    // Ideal 2-4% = 1; fall off linearly outside, 0 by 8% away
    const distance = ratePct < 2 ? (2 - ratePct) : ratePct > 4 ? (ratePct - 4) : 0;
    const score = 1 - Math.min(1, distance / 4);
    return Math.max(0, Math.min(1, score));
  };

  const scorePCEGrowth = (growthPctYoY) => {
    if (!isFinite(growthPctYoY)) return null;
    // Map 0% -> 0, 6% -> 1 (healthy consumer spending growth ~2-6%)
    const normalized = (growthPctYoY - 0) / (6 - 0);
    return Math.max(0, Math.min(1, normalized));
  };

  const scoreYieldSpread = (spreadPctPts) => {
    if (!isFinite(spreadPctPts)) return null;
    // Map -1 -> 0 (inverted), 2 -> 1 (healthy positive spread)
    const normalized = (spreadPctPts - (-1)) / (2 - (-1));
    return Math.max(0, Math.min(1, normalized));
  };

  useEffect(() => {
    async function loadData() {
      console.log("Starting to load data...");
      
      // Pre-wake the backend to reduce cold start time
      try {
        console.log("Pre-waking backend...");
        await fetch(`${import.meta.env.VITE_API_BASE || 'https://fred-watch-api.onrender.com'}/health`, {
          method: 'GET',
          timeout: 10000
        });
        console.log("Backend pre-wake completed");
      } catch (error) {
        console.log("Backend pre-wake failed (expected on cold start):", error.message);
      }
      
      // Always show 5 years ago to present
      const today = new Date();
      const fiveYearsAgo = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate());
      const start = fiveYearsAgo.toISOString().split('T')[0];
      const end = today.toISOString().split('T')[0];
      const series = ["cpi", "unemployment", "fedfunds", "gdp", "pce", "t10y3m"];
      
      // Set date range for display
      setDateRange(`${fiveYearsAgo.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - ${today.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}`);

      // Create parallel requests instead of sequential
      const promises = series.map(async (s) => {
        try {
          console.log(`Fetching ${s}...`);
          setLoadingProgress(prev => ({ ...prev, [s]: 'loading' }));
          const response = await fetch(`${import.meta.env.VITE_API_BASE || 'https://fred-watch-api.onrender.com'}/series/${s}?start=${start}&end=${end}&use_cache=true&include_ai=${enableAI}`);
          const result = await response.json();
          console.log(`${s} loaded successfully:`, result);
          setLoadingProgress(prev => ({ ...prev, [s]: 'loaded' }));
          return { series: s, data: result };
        } catch (error) {
          console.error(`Error fetching ${s}:`, error);
          setLoadingProgress(prev => ({ ...prev, [s]: 'error' }));
          return { series: s, data: null };
        }
      });

      // Wait for all requests to complete
      const results = await Promise.all(promises);
      
      // Convert array to object
      const dataObject = {};
      results.forEach(({ series, data }) => {
        dataObject[series] = data;
      });

      console.log("All data loaded:", dataObject);
      setData(dataObject);
      setLoading(false);
      
      // Cache stats not needed with Render backend

      // Fetch overall AI insight (only if AI is enabled)
      if (enableAI) {
        try {
          console.log('Fetching overall AI insight...');
          const res = await fetch(`${import.meta.env.VITE_API_BASE || 'https://fred-watch-api.onrender.com'}/insights/overall?start=${start}&end=${end}&use_cache=true`);
          console.log('Overall AI insight response status:', res.status);
          const payload = await res.json();
          console.log('Overall AI insight payload:', payload);
          setOverallInsight(payload);
        } catch (e) {
          console.warn('Overall AI insight fetch failed:', e);
          setOverallInsight(null);
        }
      } else {
        setOverallInsight(null);
      }
    }

    loadData();
  }, [enableAI]);

  // Function to refresh data (stale-while-revalidate)
  const refreshData = async () => {
    setLoadingProgress({});

    // Always show 5 years ago to present
    const today = new Date();
    const fiveYearsAgo = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate());
    const start = fiveYearsAgo.toISOString().split('T')[0];
    const end = today.toISOString().split('T')[0];
    const series = ["cpi", "unemployment", "fedfunds", "gdp", "pce", "t10y3m"];

    // Set date range for display
    setDateRange(`${fiveYearsAgo.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - ${today.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}`);

    // Refresh all data from backend

    // 2) Revalidate in background (fetch fresh from backend)
    const promises = series.map(async (s) => {
      try {
        console.log(`Refreshing ${s}...`);
        setLoadingProgress(prev => ({ ...prev, [s]: 'loading' }));
        const response = await fetch(`${import.meta.env.VITE_API_BASE || 'https://fred-watch-api.onrender.com'}/series/${s}?start=${start}&end=${end}&use_cache=false&include_ai=${enableAI}`);
        const result = await response.json();
        setLoadingProgress(prev => ({ ...prev, [s]: 'loaded' }));
        return { series: s, data: result };
      } catch (error) {
        console.error(`Error refreshing ${s}:`, error);
        setLoadingProgress(prev => ({ ...prev, [s]: 'error' }));
        return { series: s, data: null };
      }
    });

    const results = await Promise.all(promises);
    const freshObject = {};
    results.forEach(({ series, data }) => {
      if (data) freshObject[series] = data;
    });
    if (Object.keys(freshObject).length > 0) {
      setData((prev) => ({ ...prev, ...freshObject }));
    }

    // Cache stats not needed with Render backend

    // Refresh overall AI insight (only if AI is enabled)
    if (enableAI) {
      try {
        console.log('Refreshing overall AI insight...');
        const res = await fetch(`${import.meta.env.VITE_API_BASE || 'https://fred-watch-api.onrender.com'}/insights/overall?start=${start}&end=${end}&use_cache=false`);
        console.log('Overall AI insight refresh response status:', res.status);
        const payload = await res.json();
        console.log('Overall AI insight refresh payload:', payload);
        setOverallInsight(payload);
      } catch (e) {
        console.warn('Overall AI insight fetch failed:', e);
        // keep prior overall insight if available
      }
    } else {
      setOverallInsight(null);
    }
  };

  // Function to fetch cache statistics
  const fetchCacheStats = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE || 'https://fred-watch-api.onrender.com'}/cache/stats`);
      const stats = await response.json();
      setCacheStats(stats);
    } catch (error) {
      console.error('Failed to fetch cache stats:', error);
      setCacheStats(null);
    }
  };

  // Fetch cache stats when cache info is shown
  useEffect(() => {
    if (showCacheInfo) {
      fetchCacheStats();
    }
  }, [showCacheInfo]);


  if (loading) {
    const series = ["cpi", "unemployment", "fedfunds", "gdp", "pce", "t10y3m"];
    const seriesNames = {
      cpi: "Consumer Price Index",
      unemployment: "Unemployment Rate", 
      fedfunds: "Federal Funds Rate",
      gdp: "Gross Domestic Product",
      pce: "Personal Consumption Expenditures",
      t10y3m: "Yield Curve: 10Y - 3M"
    };
    
    return (
      <div className={`min-h-screen flex items-center justify-center transition-all duration-300 ${
        darkMode 
          ? 'bg-slate-900' 
          : 'bg-slate-100'
      }`}>
        <div className="text-center max-w-lg mx-auto px-8">
          {/* Animated logo/icon */}
          <div className="relative mb-8">
            <div className="relative bg-orange-500 rounded-full w-20 h-20 mx-auto flex items-center justify-center bold-shadow-lg">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
              </svg>
            </div>
          </div>
          
          <h2 className={`text-3xl font-bold mb-3 classic-font ${
            darkMode 
              ? 'text-orange-400' 
              : 'text-orange-600'
          }`}>
            MacroBoard
          </h2>
          <p className={`text-lg mb-2 bold-font ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            ECONOMIC INTELLIGENCE
          </p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Data is cached for 24 hours for faster loading
          </p>
          <p className={`text-xs mt-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            ⚡ My backend is on Render (free plan) so it spins down with inactivity – first load may take a few seconds haha
          </p>
          
          {/* Loading Progress */}
          <div className="mt-8 space-y-3">
            {series.map(s => (
              <div key={s} className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${
                darkMode ? 'bg-gray-800/50' : 'bg-white/50'
              } backdrop-blur-sm border ${
                darkMode ? 'border-gray-700/50' : 'border-gray-200/50'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  loadingProgress[s] === 'loaded' ? 'bg-green-500' : 
                  loadingProgress[s] === 'error' ? 'bg-red-500' : 
                  'bg-blue-500 animate-pulse'
                }`}>
                  {loadingProgress[s] === 'loaded' ? '✓' : loadingProgress[s] === 'error' ? '✗' : ''}
                </div>
                <span className={`text-sm font-medium capitalize ${
                  darkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  {seriesNames[s]}
                </span>
                <div className="ml-auto">
                  {loadingProgress[s] === 'loading' && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      darkMode 
        ? 'bg-slate-900' 
        : 'bg-slate-100'
    }`}>
      {/* Header with solid sporty colors */}
      <div className={`relative overflow-hidden ${
        darkMode 
          ? 'bg-slate-800' 
          : 'bg-white'
      } border-b-4 border-orange-500 shadow-xl`}>
        <div className="relative px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-4xl font-bold classic-font ${
                darkMode 
                  ? 'text-orange-400' 
                  : 'text-orange-600'
              }`}>
                U.S. ECONOMIC DASHBOARD
              </h1>
              <p className={`text-sm mt-1 bold-font ${
                darkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                REAL-TIME ECONOMIC DATA
              </p>
              <p className={`text-xs mt-1 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                </svg>
                Data sourced from Federal Reserve Economic Data (FRED)
              </p>
              {dateRange && (
                <p className={`text-xs mt-1 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Data range: {dateRange}
                </p>
              )}

              {/* Economic Health Bar */}
              {(() => {
                // Pull latest values and compute scores
                const cpiYoY = computeChange(data.cpi?.data?.value, 12)?.changePct ?? null;
                const gdpYoY = computeChange(data.gdp?.data?.value, 4)?.changePct ?? null;
                const pceYoY = computeChange(data.pce?.data?.value, 12)?.changePct ?? null;
                const unemp = (() => {
                  const v = data.unemployment?.data?.value; if (!v) return null;
                  const d = Object.keys(v).sort(); if (!d.length) return null;
                  const latest = Number(v[d[d.length - 1]]);
                  return isFinite(latest) ? latest : null;
                })();
                const fed = (() => {
                  const v = data.fedfunds?.data?.value; if (!v) return null;
                  const d = Object.keys(v).sort(); if (!d.length) return null;
                  const latest = Number(v[d[d.length - 1]]);
                  return isFinite(latest) ? latest : null;
                })();
                const t10y3m = (() => {
                  const v = data.t10y3m?.data?.value; if (!v) return null;
                  const d = Object.keys(v).sort(); if (!d.length) return null;
                  const latest = Number(v[d[d.length - 1]]);
                  return isFinite(latest) ? latest : null;
                })();

                const scores = [
                  scoreGDPGrowth(gdpYoY),
                  scoreUnemployment(unemp),
                  scoreInflation(cpiYoY),
                  scoreFedFunds(fed),
                  scorePCEGrowth(pceYoY),
                  scoreYieldSpread(t10y3m)
                ].filter(s => s !== null);

                if (!scores.length) return null;
                const avg = scores.reduce((a,b)=>a+b,0) / scores.length;
                const pct = Math.round(avg * 100);

                return (
                  <div className={`mt-4 p-3 rounded-xl ${darkMode ? 'bg-gray-800/60' : 'bg-white/70'} border ${darkMode ? 'border-gray-700/60' : 'border-gray-200/60'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Economic Health</div>
                      <div className={`text-sm font-medium ${pct >= 66 ? 'text-green-600' : pct >= 33 ? 'text-yellow-600' : 'text-red-600'}`}>{pct}%</div>
                    </div>
                    <div className={`h-3 w-full rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          pct >= 66 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : pct >= 33 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 'bg-gradient-to-r from-red-500 to-rose-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className={`mt-2 grid grid-cols-6 gap-2 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <div className="truncate">GDP y/y: {gdpYoY === null ? '—' : formatPct(gdpYoY)}</div>
                      <div className="truncate">Unemp: {unemp === null ? '—' : `${unemp.toFixed(2)}%`}</div>
                      <div className="truncate">CPI y/y: {cpiYoY === null ? '—' : formatPct(cpiYoY)}</div>
                      <div className="truncate">Fed: {fed === null ? '—' : `${fed.toFixed(2)}%`}</div>
                      <div className="truncate">PCE y/y: {pceYoY === null ? '—' : formatPct(pceYoY)}</div>
                      <div className="truncate">10Y-3M: {t10y3m === null ? '—' : `${t10y3m.toFixed(2)}%`}</div>
                    </div>
                    <div className={`mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      Health score combines GDP growth, unemployment, inflation vs 2% target, Fed funds rate, consumer spending, and yield curve spread
                    </div>
                  </div>
                );
              })()}

              {/* Overall Economic Insight removed here; shown in right sidebar only */}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCacheInfo(!showCacheInfo)}
                className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 text-sm bold-shadow hover-lift ${
                  darkMode 
                    ? 'bg-slate-700 text-white hover:bg-slate-600' 
                    : 'bg-white text-slate-800 hover:bg-slate-100'
                }`}
              >
                <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
                CACHE
              </button>
              <button
                onClick={() => setEnableAI(!enableAI)}
                className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 text-sm bold-shadow hover-lift ${
                  enableAI
                    ? (darkMode ? 'bg-green-600 text-white' : 'bg-green-600 text-white')
                    : (darkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-white text-slate-800 hover:bg-slate-100')
                }`}
              >
                <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                {enableAI ? 'AI ON' : 'AI OFF'}
              </button>
              <button
                onClick={refreshData}
                className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 text-sm bold-shadow hover-lift ${
                  darkMode 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-blue-600 text-white'
                }`}
              >
                <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                </svg>
                REFRESH
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 text-sm bold-shadow hover-lift ${
                  darkMode 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-slate-800 text-white'
                }`}
              >
                {darkMode ? (
                  <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
                  </svg>
                )}
                {darkMode ? 'LIGHT' : 'DARK'}
              </button>
            </div>
          </div>
          
          {/* Story Mode Button - Cinematic Style */}
          <div className="mt-6">
            <Link
              to="/story"
              className={`group relative block w-full overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.02] ${
                darkMode 
                  ? 'bg-gradient-to-r from-orange-900/30 via-orange-800/20 to-orange-900/30 backdrop-blur-sm border border-orange-500/30' 
                  : 'bg-gradient-to-r from-orange-100/50 via-orange-50/30 to-orange-100/50 backdrop-blur-sm border border-orange-300/50'
              }`}
              style={{
                boxShadow: darkMode
                  ? '0 10px 40px rgba(251, 146, 60, 0.2), 0 0 20px rgba(251, 146, 60, 0.1), inset 0 0 40px rgba(0, 0, 0, 0.1)'
                  : '0 10px 40px rgba(251, 146, 60, 0.15), 0 0 20px rgba(251, 146, 60, 0.1), inset 0 0 40px rgba(255, 255, 255, 0.1)'
              }}
            >
              {/* Animated gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-r from-orange-600/0 via-orange-500/20 to-orange-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              
              <div className="relative px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      darkMode ? 'bg-orange-500/20' : 'bg-orange-500/10'
                    }`}>
                      <svg className="w-6 h-6 text-orange-400 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className={`text-2xl font-bold mb-1 ${
                        darkMode 
                          ? 'bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent' 
                          : 'bg-gradient-to-r from-orange-600 via-orange-700 to-orange-800 bg-clip-text text-transparent'
                      }`}>
                        STORY MODE
                      </h3>
                      <p className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Explore major economic events through interactive stories
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${
                      darkMode ? 'text-orange-300' : 'text-orange-700'
                    }`}>
                      Explore Stories
                    </span>
                    <svg className={`w-5 h-5 group-hover:translate-x-1 transition-transform duration-300 ${
                      darkMode ? 'text-orange-400' : 'text-orange-600'
                    }`} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Cache Info Panel */}
      {showCacheInfo && (
        <div className="px-8 py-6">
          <div className={`max-w-4xl mx-auto p-6 rounded-2xl border-2 transition-all duration-200 ${
            darkMode 
              ? 'bg-slate-800 border-orange-500' 
              : 'bg-white border-orange-500'
          } bold-shadow-lg`}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className={`text-2xl font-bold mb-2 flex items-center ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                  </svg>
                  Cache Information
                </h3>
                <p className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Performance and storage statistics
                </p>
              </div>
            </div>
            <div className={`p-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {cacheStats ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-xl border-2 ${darkMode ? 'bg-slate-700 border-orange-500' : 'bg-slate-100 border-orange-500'}`}>
                      <div className="text-2xl font-bold text-blue-500">{cacheStats.total}</div>
                      <div className="text-sm">Total Cache Files</div>
                    </div>
                    <div className={`p-4 rounded-xl border-2 ${darkMode ? 'bg-slate-700 border-orange-500' : 'bg-slate-100 border-orange-500'}`}>
                      <div className="text-2xl font-bold text-green-500">{cacheStats.valid}</div>
                      <div className="text-sm">Valid Files</div>
                    </div>
                    <div className={`p-4 rounded-xl border-2 ${darkMode ? 'bg-slate-700 border-orange-500' : 'bg-slate-100 border-orange-500'}`}>
                      <div className="text-2xl font-bold text-red-500">{cacheStats.expired}</div>
                      <div className="text-sm">Expired Files</div>
                    </div>
                    <div className={`p-4 rounded-xl border-2 ${darkMode ? 'bg-slate-700 border-orange-500' : 'bg-slate-100 border-orange-500'}`}>
                      <div className="text-2xl font-bold text-purple-500">{(cacheStats.size / 1024).toFixed(1)}KB</div>
                      <div className="text-sm">Cache Size</div>
                    </div>
                  </div>
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700/30' : 'bg-gray-100/30'}`}>
                    <div className="text-sm font-semibold mb-2">Cache Details</div>
                    <div className="space-y-1 text-xs">
                      <div>Oldest Cache: {cacheStats.oldestCache}</div>
                      <div>Newest Cache: {cacheStats.newestCache}</div>
                      <div>Cache Duration: {cacheStats.cacheDuration}</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <button
                      onClick={fetchCacheStats}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center mx-auto ${
                        darkMode 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                      </svg>
                      Refresh Stats
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p>Loading cache statistics...</p>
                </div>
              )}
              <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <p className="text-xs text-center">AI Insights: {enableAI ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Charts Section */}
          <div className="xl:col-span-3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ChartCard 
                title="Unemployment Rate" 
                subtitle="Percentage of labor force unemployed"
                data={data.unemployment?.data} 
                color="#ef4444" 
                darkMode={darkMode}
                trend={data.unemployment?.trend}
                extra={(() => {
                  const v = data.unemployment?.data?.value; if (!v) return null;
                  const d = Object.keys(v).sort(); if (!d.length) return null;
                  const latestDate = d[d.length - 1];
                  const latest = Number(v[latestDate]);
                  if (!isFinite(latest)) return null;
                  return (
                    <div className="flex items-center justify-between">
                      <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Latest: {latestDate}</div>
                      <div className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{latest.toFixed(2)}%</div>
                    </div>
                  );
                })()}
              />
              <ChartCard 
                title="Consumer Price Index" 
                subtitle="Measure of inflation (1982-1984=100)"
                data={data.cpi?.data} 
                color="#3b82f6" 
                darkMode={darkMode}
                trend={data.cpi?.trend}
                extra={(() => {
                  const cpi = data.cpi?.data?.value; if (!cpi) return null;
                  const mom = computeChange(cpi, 1); const yoy = computeChange(cpi, 12);
                  if (!mom && !yoy) return null;
                  return (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>m/m</div>
                        <div className={`${(mom?.changePct ?? 0) >= 0 ? 'text-red-500' : 'text-green-600'} font-semibold`}>{mom ? formatPct(mom.changePct) : '—'}</div>
                      </div>
                      <div>
                        <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>y/y</div>
                        <div className={`${(yoy?.changePct ?? 0) >= 0 ? 'text-red-500' : 'text-green-600'} font-semibold`}>{yoy ? formatPct(yoy.changePct) : '—'}</div>
                      </div>
                    </div>
                  );
                })()}
              />
              <ChartCard 
                title="Federal Funds Rate" 
                subtitle="Interest rate banks charge each other"
                data={data.fedfunds?.data} 
                color="#22c55e" 
                darkMode={darkMode}
                trend={data.fedfunds?.trend}
                extra={(() => {
                  const v = data.fedfunds?.data?.value; if (!v) return null;
                  const d = Object.keys(v).sort(); if (!d.length) return null;
                  const latestDate = d[d.length - 1];
                  const latest = Number(v[latestDate]); if (!isFinite(latest)) return null;
                  return (
                    <div className="flex items-center justify-between">
                      <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Latest: {latestDate}</div>
                      <div className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{latest.toFixed(2)}%</div>
                    </div>
                  );
                })()}
              />
              <ChartCard 
                title="Gross Domestic Product" 
                subtitle="Total value of goods and services (Billions USD)"
                data={data.gdp?.data} 
                color="#f59e0b" 
                darkMode={darkMode}
                trend={data.gdp?.trend}
                extra={(() => {
                  const gdp = data.gdp?.data?.value; if (!gdp) return null;
                  const qoq = computeChange(gdp, 1); const yoy = computeChange(gdp, 4);
                  if (!qoq && !yoy) return null;
                  return (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>q/q</div>
                        <div className={`${(qoq?.changePct ?? 0) >= 0 ? 'text-green-600' : 'text-red-500'} font-semibold`}>{qoq ? formatPct(qoq.changePct) : '—'}</div>
                      </div>
                      <div>
                        <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>y/y</div>
                        <div className={`${(yoy?.changePct ?? 0) >= 0 ? 'text-green-600' : 'text-red-500'} font-semibold`}>{yoy ? formatPct(yoy.changePct) : '—'}</div>
                      </div>
                    </div>
                  );
                })()}
              />
              <ChartCard 
                title="Personal Consumption Expenditures (PCE)" 
                subtitle="Consumer spending (Billions USD)"
                data={data.pce?.data} 
                color="#8b5cf6" 
                darkMode={darkMode}
                trend={data.pce?.trend}
                extra={(() => {
                  const pce = data.pce?.data?.value; if (!pce) return null;
                  const yoy = computeChange(pce, 12);
                  return (
                    <div className="flex items-center justify-between">
                      <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>y/y growth</div>
                      <div className={`font-semibold ${((yoy?.changePct ?? 0) >= 0) ? 'text-green-600' : 'text-red-500'}`}>{yoy ? formatPct(yoy.changePct) : '—'}</div>
                    </div>
                  );
                })()}
              />
              <ChartCard 
                title="Yield Curve: 10Y - 3M (T10Y3M)" 
                subtitle="Spread between 10-Year and 3-Month Treasuries (percentage points)"
                data={data.t10y3m?.data} 
                color="#0ea5e9" 
                darkMode={darkMode}
                trend={data.t10y3m?.trend}
                extra={(() => {
                  const v = data.t10y3m?.data?.value; if (!v) return null;
                  const d = Object.keys(v).sort(); if (!d.length) return null;
                  const latestDate = d[d.length - 1];
                  const latest = Number(v[latestDate]);
                  if (!isFinite(latest)) return null;
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Latest spread</div>
                        <div className={`font-semibold ${latest >= 0 ? 'text-green-600' : 'text-red-500'}`}>{latest.toFixed(2)}%</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Date: {latestDate}</div>
                      </div>
                    </div>
                  );
                })()}
              />
            </div>
          </div>

          {/* Overall Economic Health AI Sidebar */}
          <div className="xl:col-span-1">
            <div className={`sticky top-8 rounded-2xl p-6 bold-shadow-lg border ${
              darkMode 
                ? 'bg-slate-800 border-slate-700' 
                : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-xl ${
                  enableAI 
                    ? 'bg-green-600' 
                    : 'bg-slate-500'
                }`}>
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    Overall Economic Insight
                  </h3>
                  <p className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {enableAI ? 'AI analysis enabled' : 'AI analysis disabled'}
                  </p>
                </div>
              </div>

              {enableAI ? (
                <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm`}>
                  {console.log('Rendering AI insights section. overallInsight:', overallInsight)}
                  {overallInsight?.ai_insight ? (
                    <p>{overallInsight.ai_insight}</p>
                  ) : (
                    <p>If there are no AI insights it's because I ran out of OpenAI tokens haha</p>
                  )}
                </div>
              ) : (
                <div className={`text-center py-8 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <div className="text-4xl mb-4">🤖</div>
                  <p className="text-sm">Enable AI to see overall economic assessment</p>
                  <button
                    onClick={() => setEnableAI(true)}
                    className="mt-4 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-200"
                  >
                    Enable AI Analysis
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={`mt-16 py-8 border-t ${
        darkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* About */}
            <div>
              <h3 className={`text-lg font-bold mb-4 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                MacroBoard
              </h3>
              <p className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                A real-time economic dashboard tracking key U.S. economic indicators with AI-powered insights.
              </p>
            </div>

            {/* Data Sources */}
            <div>
              <h4 className={`text-sm font-semibold mb-3 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Data Sources
              </h4>
              <ul className={`space-y-2 text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                  </svg>
                  Federal Reserve Economic Data (FRED)
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  OpenAI GPT-4o-mini for insights
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.75-.48 2.54l2.6 1.53c.56-1.24.88-2.62.88-4.07 0-5.18-3.95-9.45-9-9.95zM12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05c-5.06.5-9 4.76-9 9.95 0 5.52 4.47 10 9.99 10 3.31 0 6.24-1.61 8.06-4.09l-2.6-1.53C16.17 17.98 14.21 19 12 19z"/>
                  </svg>
                  Cached for 24 hours
                </li>
              </ul>
            </div>

            {/* Technical Info */}
            <div>
              <h4 className={`text-sm font-semibold mb-3 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Technical Details
              </h4>
              <ul className={`space-y-2 text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <li>Frontend: React + Vite on Vercel</li>
                <li>Backend: FastAPI on Render (free tier)</li>
                <li>Charts: Recharts + Tailwind CSS</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className={`mt-8 pt-6 border-t ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className={`text-xs ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                Built with passion for economic data enthusiasts
              </p>
              <p className={`text-xs mt-2 md:mt-0 ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                Last updated: {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
