import React from "react";

export default function HistoricalInsights({ darkMode, events = [] }) {
  if (!events.length) return null;

  return (
    <section className="px-8 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
              Historical Context
            </h2>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Explore key economic events and how they shaped the indicators.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {events.map((event) => (
            <article
              key={event.id}
              className={`rounded-2xl p-6 border bold-shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{event.title}</h3>
                  <p className={`text-xs uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {event.period.start} – {event.period.end}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${darkMode ? "bg-orange-500/10 text-orange-300" : "bg-orange-500/10 text-orange-600"}`}>
                  Crisis Spotlight
                </div>
              </div>
              <p className={`text-sm leading-relaxed mb-6 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                {event.headline}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className={`rounded-xl p-4 ${darkMode ? "bg-slate-700/40" : "bg-slate-100"}`}>
                  <div className={`text-xs font-semibold uppercase tracking-wide mb-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Key Metrics</div>
                  <ul className="space-y-1 text-xs">
                    <li>GDP YoY: {event.metrics.gdp_yoy.pre_crisis.value}% → {event.metrics.gdp_yoy.trough.value}%</li>
                    <li>Unemployment: {event.metrics.unemployment.pre_crisis.value}% → {event.metrics.unemployment.peak.value}%</li>
                    <li>CPI YoY: {event.metrics.cpi_yoy.pre_crisis.value}% → {event.metrics.cpi_yoy.trough.value}%</li>
                  </ul>
                </div>
                <div className={`rounded-xl p-4 ${darkMode ? "bg-slate-700/40" : "bg-slate-100"}`}>
                  <div className={`text-xs font-semibold uppercase tracking-wide mb-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Policy Response</div>
                  <ul className="space-y-1 text-xs">
                    {event.narrative.policy.points.slice(0, 2).map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {[event.narrative.spark, event.narrative.impact, event.narrative.recovery].map((section) => (
                  <div key={section.title}>
                    <h4 className={`text-sm font-semibold mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>{section.title}</h4>
                    <ul className={`list-disc list-inside text-xs space-y-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                      {section.points.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                {event.annotations.map((annotation) => (
                  <span
                    key={annotation.date}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${darkMode ? "bg-slate-700 text-gray-200" : "bg-slate-100 text-gray-700"}`}
                  >
                    {annotation.date}: {annotation.label}
                  </span>
                ))}
              </div>

              <div>
                <h5 className={`text-xs font-semibold uppercase tracking-wide mb-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  Want to dive deeper?
                </h5>
                <ul className="space-y-2 text-xs">
                  {event.links.map((link) => (
                    <li key={link.url}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 hover:underline ${darkMode ? "text-blue-300" : "text-blue-600"}`}
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3z" />
                        </svg>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

