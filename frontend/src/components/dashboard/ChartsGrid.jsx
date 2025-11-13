import React from "react";
import ChartCard from "../ChartCard";

export default function ChartsGrid({ data, darkMode, computeChange, formatPct }) {
  return (
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
                <div className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>Latest: {latestDate}</div>
                <div className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{latest.toFixed(2)}%</div>
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
                  <div className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>m/m</div>
                  <div className={`${(mom?.changePct ?? 0) >= 0 ? "text-red-500" : "text-green-600"} font-semibold`}>{mom ? formatPct(mom.changePct) : "—"}</div>
                </div>
                <div>
                  <div className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>y/y</div>
                  <div className={`${(yoy?.changePct ?? 0) >= 0 ? "text-red-500" : "text-green-600"} font-semibold`}>{yoy ? formatPct(yoy.changePct) : "—"}</div>
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
                <div className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>Latest: {latestDate}</div>
                <div className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{latest.toFixed(2)}%</div>
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
                  <div className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>q/q</div>
                  <div className={`${(qoq?.changePct ?? 0) >= 0 ? "text-green-600" : "text-red-500"} font-semibold`}>{qoq ? formatPct(qoq.changePct) : "—"}</div>
                </div>
                <div>
                  <div className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>y/y</div>
                  <div className={`${(yoy?.changePct ?? 0) >= 0 ? "text-green-600" : "text-red-500"} font-semibold`}>{yoy ? formatPct(yoy.changePct) : "—"}</div>
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
                <div className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>y/y growth</div>
                <div className={`font-semibold ${((yoy?.changePct ?? 0) >= 0) ? "text-green-600" : "text-red-500"}`}>{yoy ? formatPct(yoy.changePct) : "—"}</div>
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
                  <div className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>Latest spread</div>
                  <div className={`font-semibold ${latest >= 0 ? "text-green-600" : "text-red-500"}`}>{latest.toFixed(2)}%</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>Date: {latestDate}</div>
                </div>
              </div>
            );
          })()}
        />
      </div>
    </div>
  );
}

