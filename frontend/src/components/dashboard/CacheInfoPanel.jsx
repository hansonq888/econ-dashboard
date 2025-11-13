import React from "react";

export default function CacheInfoPanel({ darkMode, cacheStats, onRefresh, enableAI }) {
  return (
    <div className="px-8 py-6">
      <div className={`max-w-4xl mx-auto p-6 rounded-2xl border-2 transition-all duration-200 bold-shadow-lg ${darkMode ? "bg-slate-800 border-orange-500" : "bg-white border-orange-500"}`}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className={`text-2xl font-bold mb-2 flex items-center ${darkMode ? "text-white" : "text-gray-800"}`}>
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
              Cache Information
            </h3>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Performance and storage statistics
            </p>
          </div>
        </div>
        <div className={`p-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          {cacheStats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border-2 ${darkMode ? "bg-slate-700 border-orange-500" : "bg-slate-100 border-orange-500"}`}>
                  <div className="text-2xl font-bold text-blue-500">{cacheStats.total}</div>
                  <div className="text-sm">Total Cache Files</div>
                </div>
                <div className={`p-4 rounded-xl border-2 ${darkMode ? "bg-slate-700 border-orange-500" : "bg-slate-100 border-orange-500"}`}>
                  <div className="text-2xl font-bold text-green-500">{cacheStats.valid}</div>
                  <div className="text-sm">Valid Files</div>
                </div>
                <div className={`p-4 rounded-xl border-2 ${darkMode ? "bg-slate-700 border-orange-500" : "bg-slate-100 border-orange-500"}`}>
                  <div className="text-2xl font-bold text-red-500">{cacheStats.expired}</div>
                  <div className="text-sm">Expired Files</div>
                </div>
                <div className={`p-4 rounded-xl border-2 ${darkMode ? "bg-slate-700 border-orange-500" : "bg-slate-100 border-orange-500"}`}>
                  <div className="text-2xl font-bold text-purple-500">{(cacheStats.size / 1024).toFixed(1)}KB</div>
                  <div className="text-sm">Cache Size</div>
                </div>
              </div>
              <div className={`p-4 rounded-xl ${darkMode ? "bg-gray-700/30" : "bg-gray-100/30"}`}>
                <div className="text-sm font-semibold mb-2">Cache Details</div>
                <div className="space-y-1 text-xs">
                  <div>Oldest Cache: {cacheStats.oldestCache}</div>
                  <div>Newest Cache: {cacheStats.newestCache}</div>
                  <div>Cache Duration: {cacheStats.cacheDuration}</div>
                </div>
              </div>
              <div className="text-center">
                <button
                  onClick={onRefresh}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center mx-auto ${darkMode ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"}`}
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                  </svg>
                  Refresh Stats
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
              <p>Loading cache statistics...</p>
            </div>
          )}
          <div className={`mt-4 pt-4 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
            <p className="text-xs text-center">AI Insights: {enableAI ? "Enabled" : "Disabled"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

