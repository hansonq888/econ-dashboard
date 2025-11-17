import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StoryHeader from "../../components/story/StoryHeader";
import StoryChart from "../../components/story/StoryChart";
import Timeline from "../../components/story/Timeline";
import { loadStoryData, formatChartData } from "../../utils/storyUtils";

// Chart configuration
const CHART_CONFIG = {
  unemployment: {
    title: "Unemployment Rate",
    yAxisLabel: "Rate (%)",
    description: "Unemployment rose significantly during the oil shock period, reaching 9% in May 1975. The combination of high inflation and rising unemployment created 'stagflation' - a phenomenon that challenged traditional economic thinking."
  },
  gdp: {
    title: "GDP Growth",
    yAxisLabel: "GDP (Billions)",
    description: "The economy entered a severe recession in 1973-1975. GDP contracted as the oil embargo and price shocks disrupted economic activity. The recovery was slow and uneven, with the economy struggling to regain momentum."
  },
  fedfunds: {
    title: "Federal Funds Rate",
    yAxisLabel: "Rate (%)",
    description: "The Fed initially tried to combat inflation by raising rates, but faced a difficult trade-off between fighting inflation and supporting employment. Rates rose but inflation persisted, leading to the 'stagflation' dilemma."
  },
  cpi: {
    title: "Inflation Rate (CPI % Change YoY)",
    yAxisLabel: "Percent (%)",
    description: "Inflation surged to double digits following the oil shock, reaching 12.3% in 1974. The oil embargo caused energy prices to quadruple, driving up costs throughout the economy. This marked the end of the post-war era of stable, low inflation."
  }
};

export default function OilShock1973() {
  const [darkMode, setDarkMode] = useState(true);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState(0);

  const timeFrames = [
    {
      id: "pre-shock",
      title: "Pre-Shock",
      subtitle: "1973",
      date: "1973",
      description: "The economy is still growing, but inflation is already rising. The Bretton Woods system has collapsed, and the dollar is floating. Energy prices begin to increase as tensions mount in the Middle East.",
      highlight: "The calm before the storm",
      events: [
        "Inflation already at 6.2% in 1973",
        "Bretton Woods system collapses in 1971-1973",
        "Yom Kippur War begins in October 1973",
        "OPEC announces oil embargo in October 1973",
        "Unemployment relatively low at 4.9%"
      ],
      primaryChart: "cpi",
      secondaryChart: "fedfunds",
      startDate: "1973-01-01",
      endDate: "1973-12-31"
    },
    {
      id: "oil-shock",
      title: "The Oil Shock",
      subtitle: "1973-1974",
      date: "1973-1974",
      description: "OPEC's oil embargo causes oil prices to quadruple. Inflation explodes to double digits. The economy enters a severe recession. Gas lines form across America. The Fed raises rates but struggles to control inflation without deepening the recession.",
      highlight: "The economy is hit by a perfect storm",
      events: [
        "Oil prices quadruple from $3 to $12 per barrel",
        "Inflation surges to 12.3% in 1974",
        "Severe recession begins in November 1973",
        "Unemployment rises from 4.9% to 9%",
        "Gas lines and energy rationing across the country",
        "Federal funds rate rises to 13%"
      ],
      primaryChart: "cpi",
      secondaryChart: "unemployment",
      startDate: "1973-10-01",
      endDate: "1974-12-31"
    },
    {
      id: "stagflation",
      title: "Stagflation Deepens",
      subtitle: "1975-1977",
      date: "1975-1977",
      description: "The economy recovers slowly from the recession, but inflation remains stubbornly high. Unemployment stays elevated. The combination of stagnation and inflation - 'stagflation' - challenges policymakers. Traditional Keynesian economics seems unable to solve the problem.",
      highlight: "The impossible combination",
      events: [
        "Recession ends in March 1975, but recovery is weak",
        "Inflation remains above 5% despite recession",
        "Unemployment peaks at 9% in May 1975",
        "GDP growth is slow and uneven",
        "Fed faces impossible choice: fight inflation or support jobs",
        "Public loses confidence in economic policy"
      ],
      primaryChart: "unemployment",
      secondaryChart: "cpi",
      startDate: "1975-01-01",
      endDate: "1977-12-31"
    },
    {
      id: "second-shock",
      title: "Second Oil Shock Begins",
      subtitle: "1978-1979",
      date: "1978-1979",
      description: "Inflation accelerates again as the Iranian Revolution causes another oil price spike. The economy shows signs of weakness. The Fed continues to raise rates, but inflation reaches new highs. The stage is set for Paul Volcker's appointment and the dramatic policy shift that would follow.",
      highlight: "The crisis deepens",
      events: [
        "Iranian Revolution in 1979 causes oil prices to double again",
        "Inflation accelerates to 13.3% in 1979",
        "Federal funds rate rises above 10%",
        "Unemployment begins rising again",
        "Jimmy Carter appoints Paul Volcker as Fed Chair in August 1979",
        "The era of 'stagflation' reaches its peak"
      ],
      primaryChart: "cpi",
      secondaryChart: "fedfunds",
      startDate: "1978-01-01",
      endDate: "1979-12-31"
    }
  ];

  useEffect(() => {
    async function loadOilShockData() {
      try {
        const storyData = await loadStoryData('oil_shock');
        setData(storyData.data);
        setLoading(false);
      } catch (error) {
        console.error("Error loading 1973 Oil Shock data:", error);
        setLoading(false);
      }
    }
    loadOilShockData();
  }, []);

  const currentTimeFrame = timeFrames[selectedTimeFrame];

  // Helper function to render text with Volcker link
  const renderTextWithVolckerLink = (text) => {
    const parts = text.split(/(Paul Volcker)/g);
    return parts.map((part, idx) => {
      if (part === "Paul Volcker") {
        return (
          <Link
            key={idx}
            to="/story/volcker-disinflation"
            className={`underline font-semibold transition-colors ${
              darkMode 
                ? 'text-orange-400 hover:text-orange-300' 
                : 'text-orange-600 hover:text-orange-700'
            }`}
          >
            {part}
          </Link>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  // Get charts to display for current time frame
  const getChartsToDisplay = () => {
    const charts = [];
    if (currentTimeFrame.primaryChart && data?.[currentTimeFrame.primaryChart]) {
      charts.push({ key: currentTimeFrame.primaryChart, isPrimary: true });
    }
    if (currentTimeFrame.secondaryChart && data?.[currentTimeFrame.secondaryChart]) {
      charts.push({ key: currentTimeFrame.secondaryChart, isPrimary: false });
    }
    return charts;
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      darkMode ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-b from-slate-50 to-white'
    }`}>
      <StoryHeader
        title="1973 Oil Shock & Stagflation"
        subtitle="The End of the Post-War Boom: 1973-1979"
        borderColor="border-red-500"
        darkMode={darkMode}
        onDarkModeToggle={() => setDarkMode(!darkMode)}
      />

      {/* Hero Section - Introduction */}
      <div className="relative overflow-hidden">
        <div className={`absolute inset-0 ${
          darkMode ? 'bg-gradient-to-r from-red-900/20 to-transparent' : 'bg-gradient-to-r from-red-100/30 to-transparent'
        }`} />
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12 relative">
          <div className="max-w-4xl">
            <h1 className={`text-5xl sm:text-6xl font-bold mb-6 leading-tight ${
              darkMode 
                ? 'bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent' 
                : 'bg-gradient-to-r from-red-600 via-red-700 to-red-800 bg-clip-text text-transparent'
            }`}>
              1973 Oil Shock & Stagflation
            </h1>
            <p className={`text-xl sm:text-2xl leading-relaxed mb-4 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              In October 1973, OPEC's oil embargo sent shockwaves through the global economy. Oil prices quadrupled, 
              inflation exploded to double digits, and the U.S. entered a severe recession. The combination of high 
              inflation and high unemployment - 'stagflation' - challenged economic orthodoxy and marked the end of 
              the post-war economic boom.
            </p>
            <p className={`text-lg ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Explore how key economic indicators changed during this transformative period that reshaped monetary 
              policy and economic thinking.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Cinematic Layout */}
      {loading ? (
        <div className="text-center py-24">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading data...</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-16 pb-24">
          <div 
            key={selectedTimeFrame}
            className="transition-all duration-700 ease-out"
          >
            {/* Time Frame Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`h-1.5 w-16 rounded-full ${
                      darkMode ? 'bg-red-500' : 'bg-red-600'
                    }`} />
                    <span className={`text-sm font-semibold uppercase tracking-wider ${
                      darkMode ? 'text-red-400' : 'text-red-600'
                    }`}>
                      {currentTimeFrame.subtitle}
                    </span>
                  </div>
                  <h2 className={`text-5xl sm:text-6xl font-bold mb-3 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {currentTimeFrame.title}
                  </h2>
                  <p className={`text-2xl sm:text-3xl font-light italic ${
                    darkMode ? 'text-red-300' : 'text-red-700'
                  }`}>
                    {currentTimeFrame.highlight}
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content Grid - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Left Column - Description and Events */}
              <div className="lg:col-span-1 space-y-6">
                <div className={`p-6 rounded-2xl backdrop-blur-sm ${
                  darkMode 
                    ? 'bg-slate-800/60 border border-slate-700/50' 
                    : 'bg-white/80 border border-slate-200/50'
                }`}>
                  <p className={`text-lg leading-relaxed ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {renderTextWithVolckerLink(currentTimeFrame.description)}
                  </p>
                </div>

                {/* Key Events */}
                <div className={`p-6 rounded-2xl backdrop-blur-sm ${
                  darkMode 
                    ? 'bg-slate-800/60 border border-slate-700/50' 
                    : 'bg-white/80 border border-slate-200/50'
                }`}>
                  <h3 className={`text-lg font-bold mb-4 ${
                    darkMode ? 'text-red-400' : 'text-red-600'
                  }`}>
                    Key Events
                  </h3>
                  <ul className={`space-y-3 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {currentTimeFrame.events.map((event, idx) => (
                      <li 
                        key={idx}
                        className="flex items-start gap-3 text-sm"
                      >
                        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          darkMode ? 'bg-red-500' : 'bg-red-600'
                        }`} />
                        <span className="flex-1">{renderTextWithVolckerLink(event)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column - Charts */}
              <div className="lg:col-span-2 space-y-6">
                {getChartsToDisplay().map(({ key, isPrimary }) => {
                  const config = CHART_CONFIG[key];
                  const seriesData = data?.[key];
                  if (!seriesData) return null;
                  
                  const chartData = formatChartData(seriesData);
                  if (chartData.length === 0) return null;

                  return (
                    <div
                      key={key}
                      className={`rounded-2xl backdrop-blur-sm transition-all duration-500 ${
                        darkMode 
                          ? 'bg-slate-800/60 border border-slate-700/50' 
                          : 'bg-white/80 border border-slate-200/50'
                      } ${isPrimary ? 'p-6' : 'p-4'}`}
                    >
                      <StoryChart
                        title={config.title}
                        description={isPrimary ? config.description : undefined}
                        data={chartData}
                        yAxisLabel={config.yAxisLabel}
                        darkMode={darkMode}
                        selectedTimeFrame={{
                          startDate: currentTimeFrame.startDate,
                          endDate: currentTimeFrame.endDate
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className={`fixed bottom-0 left-0 right-0 backdrop-blur-md transition-all duration-500 z-50 ${
        darkMode 
          ? 'bg-slate-900/95 border-t border-slate-700/50 shadow-2xl' 
          : 'bg-white/95 border-t border-slate-200/50 shadow-2xl'
      }`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-6 pb-0">
          <Timeline
            timeFrames={timeFrames}
            selectedIndex={selectedTimeFrame}
            onSelect={setSelectedTimeFrame}
            darkMode={darkMode}
          />
        </div>
      </div>
    </div>
  );
}

