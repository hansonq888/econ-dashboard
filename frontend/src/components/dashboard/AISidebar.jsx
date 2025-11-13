import React from "react";

export default function AISidebar({ darkMode, enableAI, overallInsight, onEnableAI }) {
  return (
    <div className="xl:col-span-1">
      <div className={`sticky top-8 rounded-2xl p-6 bold-shadow-lg border ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2 rounded-xl ${enableAI ? "bg-green-600" : "bg-slate-500"}`}>
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <div>
            <h3 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
              Overall Economic Insight
            </h3>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              {enableAI ? "AI analysis enabled" : "AI analysis disabled"}
            </p>
          </div>
        </div>

        {enableAI ? (
          <div className={`${darkMode ? "text-gray-300" : "text-gray-700"} text-sm`}>
            {overallInsight?.ai_insight ? (
              <p>{overallInsight.ai_insight}</p>
            ) : (
              <p>If there are no AI insights it's because I ran out of OpenAI tokens haha</p>
            )}
          </div>
        ) : (
          <div className={`text-center py-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            <svg className="w-10 h-10 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <p className="text-sm">Enable AI to see overall economic assessment</p>
            <button
              onClick={onEnableAI}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-200"
            >
              Enable AI Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

