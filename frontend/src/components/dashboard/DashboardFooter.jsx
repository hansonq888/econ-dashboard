import React from "react";

export default function DashboardFooter({ darkMode }) {
  return (
    <footer className={`mt-16 py-8 border-t ${darkMode ? "border-gray-700 bg-slate-800" : "border-gray-200 bg-white"}`}>
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>MacroBoard</h3>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              A real-time economic dashboard tracking key U.S. economic indicators with AI-powered insights.
            </p>
          </div>
          <div>
            <h4 className={`text-sm font-semibold mb-3 ${darkMode ? "text-white" : "text-gray-800"}`}>Data Sources</h4>
            <ul className={`space-y-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
                </svg>
                Federal Reserve Economic Data (FRED)
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                OpenAI GPT-4o-mini for insights
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.75-.48 2.54l2.6 1.53c.56-1.24.88-2.62.88-4.07 0-5.18-3.95-9.45-9-9.95zM12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05c-5.06.5-9 4.76-9 9.95 0 5.52 4.47 10 9.99 10 3.31 0 6.24-1.61 8.06-4.09l-2.6-1.53C16.17 17.98 14.21 19 12 19z" />
                </svg>
                Cached for 24 hours
              </li>
            </ul>
          </div>
          <div>
            <h4 className={`text-sm font-semibold mb-3 ${darkMode ? "text-white" : "text-gray-800"}`}>Technical Details</h4>
            <ul className={`space-y-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              <li>Frontend: React + Vite on Vercel</li>
              <li>Backend: FastAPI on Render (free tier)</li>
              <li>Charts: Recharts + Tailwind CSS</li>
            </ul>
          </div>
        </div>

        <div className={`mt-8 pt-6 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              Built with passion for economic data enthusiasts
            </p>
            <p className={`text-xs mt-2 md:mt-0 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              Last updated: {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

