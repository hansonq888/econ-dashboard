import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function StoryMode() {
  const [darkMode, setDarkMode] = useState(true);

  const events = [
    {
      id: "2008-financial-crisis",
      title: "2008 Financial Crisis",
      description: "Explore the Great Recession and its impact on the U.S. economy through key economic indicators.",
      year: "2007-2009"
    },
    {
      id: "dot-com-bubble",
      title: "Dot-Com Bubble",
      description: "Experience the rise and fall of the internet economy through an interactive timeline with clickable events.",
      year: "1995-2004"
    },
    {
      id: "volcker-disinflation",
      title: "The Volcker Disinflation",
      description: "Discover how Paul Volcker broke the back of inflation through aggressive monetary policy, despite deep recession and high unemployment.",
      year: "1979-1983"
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      darkMode ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-b from-slate-50 to-white'
    }`}>
      {/* Header */}
      <div className={`relative backdrop-blur-md transition-all duration-500 ${
        darkMode 
          ? 'bg-slate-900/95 border-b border-slate-700/50 shadow-2xl' 
          : 'bg-white/95 border-b border-slate-200/50 shadow-2xl'
      }`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 text-sm ${
                darkMode 
                  ? 'bg-slate-800/60 text-white hover:bg-slate-700/60 border border-slate-700/50' 
                  : 'bg-white/80 text-slate-800 hover:bg-slate-100/80 border border-slate-200/50'
              }`}
            >
              ← Dashboard
            </Link>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 text-sm ${
                darkMode 
                  ? 'bg-slate-800/60 text-white hover:bg-slate-700/60 border border-slate-700/50' 
                  : 'bg-white/80 text-slate-800 hover:bg-slate-100/80 border border-slate-200/50'
              }`}
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className={`absolute inset-0 ${
          darkMode ? 'bg-gradient-to-r from-orange-900/20 to-transparent' : 'bg-gradient-to-r from-orange-100/30 to-transparent'
        }`} />
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16 sm:py-24 relative">
          <div className="max-w-4xl">
            <h1 className={`text-6xl sm:text-7xl font-bold mb-6 leading-tight ${
              darkMode 
                ? 'bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent' 
                : 'bg-gradient-to-r from-orange-600 via-orange-700 to-orange-800 bg-clip-text text-transparent'
            }`}>
              Story Mode
            </h1>
            <p className={`text-2xl sm:text-3xl leading-relaxed mb-4 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Explore major economic events and learn how they shaped the U.S. economy.
            </p>
            <p className={`text-lg sm:text-xl ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Each story walks you through key economic indicators, their changes during the event, 
              and what we can learn from the data.
            </p>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-16 pb-24">
        <div className="grid grid-cols-1 gap-8">
          {events.map((event) => (
            <Link
              key={event.id}
              to={`/story/${event.id}`}
              className={`group relative overflow-hidden rounded-3xl backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] ${
                darkMode 
                  ? 'bg-slate-800/60 border border-slate-700/50 shadow-2xl shadow-slate-900/50 hover:border-orange-500/50' 
                  : 'bg-white/80 border border-slate-200/50 shadow-xl hover:border-orange-500/50'
              }`}
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${
                darkMode 
                  ? 'from-orange-900/0 to-orange-900/0 group-hover:from-orange-900/10 group-hover:to-transparent' 
                  : 'from-orange-100/0 to-orange-100/0 group-hover:from-orange-100/20 group-hover:to-transparent'
              } transition-all duration-500`} />
              
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-2xl sm:text-3xl font-bold transition-colors duration-300 ${
                    darkMode 
                      ? 'text-white group-hover:text-orange-400' 
                      : 'text-gray-900 group-hover:text-orange-600'
                  }`}>
                    {event.title}
                  </h3>
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                    darkMode 
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                      : 'bg-orange-100 text-orange-700 border border-orange-200'
                  }`}>
                    {event.year}
                  </span>
                </div>
                
                <p className={`text-base leading-relaxed mb-4 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {event.description}
                </p>

                <div className={`flex items-center font-semibold text-sm transition-all duration-300 ${
                  darkMode 
                    ? 'text-orange-400 group-hover:text-orange-300' 
                    : 'text-orange-600 group-hover:text-orange-700'
                }`}>
                  <span>Explore Story</span>
                  <span className="ml-2 group-hover:translate-x-2 transition-transform duration-300">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Coming Soon Placeholder */}
        <div className={`mt-16 p-8 rounded-3xl backdrop-blur-sm text-center ${
          darkMode 
            ? 'bg-slate-800/60 border border-slate-700/50' 
            : 'bg-white/80 border border-slate-200/50'
        }`}>
          <p className={`text-lg ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            More economic events coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}

