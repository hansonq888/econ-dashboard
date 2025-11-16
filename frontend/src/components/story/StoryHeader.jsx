import React from "react";
import { Link } from "react-router-dom";

export default function StoryHeader({ title, subtitle, borderColor, darkMode, onDarkModeToggle }) {
  return (
    <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border-b-4 ${borderColor} shadow-xl`}>
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              to="/story"
              className={`text-sm mb-2 inline-block ${
                darkMode ? 'text-gray-400 hover:text-orange-400' : 'text-gray-600 hover:text-orange-600'
              }`}
            >
              ← Back to Story Mode
            </Link>
            <h1 className={`text-4xl font-bold classic-font ${
              darkMode ? 'text-orange-400' : 'text-orange-600'
            }`}>
              {title}
            </h1>
            {subtitle && (
              <p className={`text-sm mt-1 bold-font ${
                darkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Link
              to="/"
              className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 text-sm bold-shadow hover-lift ${
                darkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-white text-slate-800 hover:bg-slate-100'
              }`}
            >
              Dashboard
            </Link>
            <button
              onClick={onDarkModeToggle}
              className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 text-sm bold-shadow hover-lift ${
                darkMode ? 'bg-yellow-600 text-white' : 'bg-slate-800 text-white'
              }`}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

