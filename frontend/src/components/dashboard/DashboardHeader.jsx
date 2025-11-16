import React from "react";
import { Link } from "react-router-dom";

function EconomicHealthCard({ darkMode, economicHealth }) {
  if (!economicHealth) return null;

  const { pct, metrics, note } = economicHealth;

  const barClass = pct >= 66
    ? "bg-gradient-to-r from-green-500 to-emerald-500"
    : pct >= 33
      ? "bg-gradient-to-r from-yellow-400 to-amber-500"
      : "bg-gradient-to-r from-red-500 to-rose-500";

  const pctColor = pct >= 66 ? "text-green-600" : pct >= 33 ? "text-yellow-600" : "text-red-600";

  return (
    <div className={`mt-4 p-3 rounded-xl ${darkMode ? "bg-gray-800/60 border border-gray-700/60" : "bg-white/70 border border-gray-200/60"}`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>Economic Health</div>
        <div className={`text-sm font-medium ${pctColor}`}>{pct}%</div>
      </div>
      <div className={`h-3 w-full rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
        <div className={`h-3 rounded-full transition-all duration-500 ${barClass}`} style={{ width: `${pct}%` }} />
      </div>
      <div className={`mt-2 grid grid-cols-6 gap-2 text-xs ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
        {metrics.map(({ label, value }) => (
          <div key={label} className="truncate">{label}: {value}</div>
        ))}
      </div>
      {note && (
        <div className={`mt-2 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          {note}
        </div>
      )}
    </div>
  );
}

export default function DashboardHeader({
  darkMode,
  dateRange,
  showCacheInfo,
  onToggleCacheInfo,
  enableAI,
  onToggleAI,
  onRefresh,
  onToggleDarkMode,
  economicHealth
}) {
  return (
    <div className={`relative overflow-hidden ${darkMode ? "bg-slate-800" : "bg-white"} border-b-4 border-orange-500 shadow-xl`}>
      <div className="relative px-8 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className={`text-4xl font-bold classic-font ${darkMode ? "text-orange-400" : "text-orange-600"}`}>
              U.S. ECONOMIC DASHBOARD
            </h1>
            <p className={`text-sm mt-1 bold-font ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
              REAL-TIME ECONOMIC DATA
            </p>
            <p className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
              </svg>
              Data sourced from Federal Reserve Economic Data (FRED)
            </p>
            {dateRange && (
              <p className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Data range: {dateRange}
              </p>
            )}

            <EconomicHealthCard darkMode={darkMode} economicHealth={economicHealth} />
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/story"
              className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 text-sm bold-shadow hover-lift ${
                darkMode ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-purple-600 text-white hover:bg-purple-700"
              }`}
            >
              <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              STORY MODE
            </Link>
            <button
              onClick={onToggleCacheInfo}
              className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 text-sm bold-shadow hover-lift ${
                darkMode ? "bg-slate-700 text-white hover:bg-slate-600" : "bg-white text-slate-800 hover:bg-slate-100"
              } ${showCacheInfo ? "ring-2 ring-orange-500" : ""}`}
            >
              <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
              CACHE
            </button>
            <button
              onClick={onToggleAI}
              className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 text-sm bold-shadow hover-lift ${
                enableAI ? "bg-green-600 text-white" : darkMode ? "bg-slate-700 text-white hover:bg-slate-600" : "bg-white text-slate-800 hover:bg-slate-100"
              }`}
            >
              <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              {enableAI ? "AI ON" : "AI OFF"}
            </button>
            <button
              onClick={onRefresh}
              className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 text-sm bold-shadow hover-lift bg-blue-600 text-white`}
            >
              <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
              </svg>
              REFRESH
            </button>
            <button
              onClick={onToggleDarkMode}
              className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 text-sm bold-shadow hover-lift ${
                darkMode ? "bg-yellow-600 text-white" : "bg-slate-800 text-white"
              }`}
            >
              {darkMode ? (
                <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />
                </svg>
              )}
              {darkMode ? "LIGHT" : "DARK"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

