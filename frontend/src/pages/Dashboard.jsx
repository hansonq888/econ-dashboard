import React, { useEffect, useState } from "react";
import ChartCard from "../components/ChartCard";

export default function Dashboard() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState({});
  const [darkMode, setDarkMode] = useState(true);
  const [showCacheInfo, setShowCacheInfo] = useState(false);
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

      // Fetch overall AI insight (optional)
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE || 'https://fred-watch-api.onrender.com'}/insights/overall?start=${start}&end=${end}`);
        const payload = await res.json();
        setOverallInsight(payload);
      } catch (e) {
        console.warn('Overall AI insight fetch failed:', e);
        setOverallInsight(null);
      }
    }

    loadData();
  }, []);

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

    // Refresh overall AI insight
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE || 'https://fred-watch-api.onrender.com'}/insights/overall?start=${start}&end=${end}`);
      const payload = await res.json();
      setOverallInsight(payload);
    } catch (e) {
      console.warn('Overall AI insight fetch failed:', e);
      // keep prior overall insight if available
    }
  };

  // Cache management not needed with Render backend

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
          ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900' 
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100'
      }`}>
        <div className="text-center max-w-lg mx-auto px-8">
          {/* Animated logo/icon */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-20 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
              <span className="text-white text-3xl font-bold">📊</span>
            </div>
          </div>
          
          <h2 className={`text-3xl font-bold mb-3 bg-gradient-to-r ${
            darkMode 
              ? 'from-blue-400 to-purple-400' 
              : 'from-blue-600 to-purple-600'
          } bg-clip-text text-transparent`}>
            Loading Economic Data
          </h2>
          <p className={`text-lg mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Fetching rolling 5-year economic data from FRED API
          </p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Data is cached for 24 hours for faster loading
          </p>
          <p className={`text-xs mt-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            ⚡ Using Render backend – first load may take a few seconds
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
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100'
    }`}>
      {/* Header with gradient background */}
      <div className={`relative overflow-hidden ${
        darkMode 
          ? 'bg-gradient-to-r from-gray-800/90 to-blue-800/90 backdrop-blur-sm' 
          : 'bg-gradient-to-r from-white/90 to-blue-50/90 backdrop-blur-sm'
      } border-b border-white/20 shadow-xl`}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-4xl font-bold bg-gradient-to-r ${
                darkMode 
                  ? 'from-blue-400 to-purple-400' 
                  : 'from-blue-600 to-purple-600'
              } bg-clip-text text-transparent`}>
                U.S. Economic Dashboard
              </h1>
              <p className={`text-sm mt-1 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Rolling 5-year economic indicators and market analysis
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
                  </div>
                );
              })()}

              {/* Overall Economic Insight removed here; shown in right sidebar only */}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCacheInfo(!showCacheInfo)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 text-sm shadow-lg hover:shadow-xl ${
                  darkMode 
                    ? 'bg-gray-700/80 text-white hover:bg-gray-600/80 backdrop-blur-sm' 
                    : 'bg-white/80 text-gray-800 hover:bg-gray-100/80 backdrop-blur-sm'
                }`}
              >
                📊 Cache
              </button>
              <button
                onClick={() => setEnableAI(!enableAI)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 text-sm shadow-lg hover:shadow-xl ${
                  enableAI
                    ? (darkMode ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white')
                    : (darkMode ? 'bg-gray-700/80 text-white hover:bg-gray-600/80 backdrop-blur-sm' : 'bg-white/80 text-gray-800 hover:bg-gray-100/80 backdrop-blur-sm')
                }`}
              >
                {enableAI ? '🤖 AI On' : '🤖 AI Off'}
              </button>
              <button
                onClick={refreshData}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 text-sm shadow-lg hover:shadow-xl ${
                  darkMode 
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white' 
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                }`}
              >
                🔄 Refresh
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl ${
                  darkMode 
                    ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white' 
                    : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white'
                }`}
              >
                {darkMode ? '☀️ Light' : '🌙 Dark'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cache Info Panel */}
      {showCacheInfo && (
        <div className="px-8 py-6">
          <div className={`max-w-4xl mx-auto p-6 rounded-2xl border transition-all duration-300 ${
            darkMode 
              ? 'bg-gradient-to-br from-gray-800/90 to-blue-900/90 border-gray-700/50' 
              : 'bg-gradient-to-br from-white/90 to-blue-50/90 border-gray-200/50'
          } backdrop-blur-sm shadow-2xl`}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className={`text-2xl font-bold mb-2 ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  📊 Cache Information
                </h3>
                <p className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Performance and storage statistics
                </p>
              </div>
            </div>
            <div className={`p-6 text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <p className="text-lg mb-2">🚀 Powered by Render Backend</p>
              <p className="text-sm">Data is fetched directly from the Render API with built-in caching</p>
              <p className="text-xs mt-2">AI Insights: {enableAI ? 'Enabled' : 'Disabled'}</p>
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
                  const latest = Number(v[d[d.length - 1]]);
                  if (!isFinite(latest)) return null;
                  return (
                    <div className="flex items-center justify-between">
                      <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Latest spread</div>
                      <div className={`font-semibold ${latest >= 0 ? 'text-green-600' : 'text-red-500'}`}>{latest.toFixed(2)}%</div>
                    </div>
                  );
                })()}
              />
            </div>
          </div>

          {/* Overall Economic Health AI Sidebar */}
          <div className="xl:col-span-1">
            <div className={`sticky top-8 rounded-2xl p-6 shadow-2xl backdrop-blur-sm border ${
              darkMode 
                ? 'bg-gradient-to-br from-gray-800/90 to-blue-900/90 border-gray-700/50' 
                : 'bg-gradient-to-br from-white/90 to-blue-50/90 border-gray-200/50'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-xl ${
                  enableAI 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                    : 'bg-gradient-to-r from-gray-400 to-gray-500'
                }`}>
                  <span className="text-white text-xl">🤖</span>
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
                  {overallInsight?.ai_insight ? (
                    <p>{overallInsight.ai_insight}</p>
                  ) : (
                    <p>Overall AI insight will appear here when available.</p>
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
    </div>
  );
}
