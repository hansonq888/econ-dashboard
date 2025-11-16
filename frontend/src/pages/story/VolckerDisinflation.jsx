import React, { useState, useEffect } from "react";
import StoryHeader from "../../components/story/StoryHeader";
import StoryChart from "../../components/story/StoryChart";
import Timeline from "../../components/story/Timeline";
import { loadStoryData, formatChartData } from "../../utils/storyUtils";

// Chart configuration
const CHART_CONFIG = {
  unemployment: {
    title: "Unemployment Rate",
    yAxisLabel: "Rate (%)",
    description: "Unemployment rose dramatically during the Volcker disinflation, peaking at 10.8% in December 1982. This was the painful cost of breaking inflation's back."
  },
  gdp: {
    title: "GDP Growth",
    yAxisLabel: "GDP (Billions)",
    description: "The economy entered two recessions during this period. GDP contracted as the Fed's tight monetary policy slowed economic activity to combat inflation."
  },
  fedfunds: {
    title: "Federal Funds Rate",
    yAxisLabel: "Rate (%)",
    description: "Under Volcker's leadership, the Fed raised the federal funds rate to unprecedented levels, peaking at over 20% in 1981. This aggressive tightening was necessary to break the inflation spiral."
  },
  cpi: {
    title: "Inflation Rate (CPI % Change YoY)",
    yAxisLabel: "Percent (%)",
    description: "Inflation had reached double digits by the late 1970s. Through Volcker's determined policy, inflation fell from over 13% in 1980 to under 4% by 1983, establishing the Fed's credibility in fighting inflation."
  }
};

export default function VolckerDisinflation() {
  const [darkMode, setDarkMode] = useState(true);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState(0);

  const timeFrames = [
    {
      id: "pre-volcker",
      title: "Pre-Volcker",
      subtitle: "1977-1979",
      date: "1977-1979",
      description: "The era of 'stagflation' - high inflation combined with economic stagnation. Inflation reaches double digits as the Fed struggles to control it. The economy faces energy crises and declining confidence in monetary policy.",
      highlight: "The inflation spiral tightens",
      events: [
        "Inflation reaches 13.3% in 1979",
        "Second oil shock in 1979 drives prices higher",
        "Federal funds rate rises but inflation persists",
        "Public loses confidence in the Fed's ability to control inflation",
        "Unemployment remains elevated around 6-7%"
      ],
      primaryChart: "cpi",
      secondaryChart: "fedfunds",
      startDate: "1977-01-01",
      endDate: "1979-08-31"
    },
    {
      id: "volcker-takes-over",
      title: "Volcker Takes Over",
      subtitle: "1979-1980",
      date: "1979-1980",
      description: "Paul Volcker becomes Fed Chair in August 1979. He immediately shifts policy focus from managing unemployment to fighting inflation. The Fed abandons interest rate targeting in favor of controlling money supply growth.",
      highlight: "A new era begins",
      events: [
        "Paul Volcker appointed Fed Chair in August 1979",
        "Fed announces shift to monetary targeting",
        "Federal funds rate rises above 15%",
        "Inflation peaks at 14.8% in March 1980",
        "First recession begins in 1980"
      ],
      primaryChart: "fedfunds",
      secondaryChart: "cpi",
      startDate: "1979-08-01",
      endDate: "1980-12-31"
    },
    {
      id: "peak-tightening",
      title: "Peak Tightening",
      subtitle: "1981-1982",
      date: "1981-1982",
      description: "The Fed maintains extremely high interest rates despite political pressure. The economy enters a deep recession. Unemployment soars to over 10%, but Volcker remains committed to breaking inflation.",
      highlight: "The painful medicine",
      events: [
        "Federal funds rate peaks above 20% in 1981",
        "Deep recession begins in July 1981",
        "Unemployment reaches 10.8% in December 1982",
        "GDP contracts significantly",
        "Volcker faces intense political pressure but holds firm"
      ],
      primaryChart: "unemployment",
      secondaryChart: "fedfunds",
      startDate: "1981-01-01",
      endDate: "1982-12-31"
    },
    {
      id: "disinflation-success",
      title: "Disinflation Success",
      subtitle: "1982-1983",
      date: "1982-1983",
      description: "The strategy works. Inflation falls dramatically from double digits to under 4%. The Fed begins to ease policy. The economy begins to recover, setting the stage for a long period of economic growth with low inflation.",
      highlight: "Inflation is broken",
      events: [
        "Inflation falls to 3.2% by 1983",
        "Fed begins to lower interest rates",
        "Unemployment starts declining",
        "GDP growth returns to positive territory",
        "Volcker's credibility established - 'inflation fighter'"
      ],
      primaryChart: "cpi",
      secondaryChart: "unemployment",
      startDate: "1982-07-01",
      endDate: "1983-12-31"
    }
  ];

  useEffect(() => {
    async function loadVolckerData() {
      try {
        const storyData = await loadStoryData('volcker');
        setData(storyData.data);
        setLoading(false);
      } catch (error) {
        console.error("Error loading Volcker disinflation data:", error);
        setLoading(false);
      }
    }
    loadVolckerData();
  }, []);

  const currentTimeFrame = timeFrames[selectedTimeFrame];

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
        title="The Volcker Disinflation"
        subtitle="Breaking the Back of Inflation: 1979-1983"
        borderColor="border-orange-500"
        darkMode={darkMode}
        onDarkModeToggle={() => setDarkMode(!darkMode)}
      />

      {/* Hero Section - Introduction */}
      <div className="relative overflow-hidden">
        <div className={`absolute inset-0 ${
          darkMode ? 'bg-gradient-to-r from-orange-900/20 to-transparent' : 'bg-gradient-to-r from-orange-100/30 to-transparent'
        }`} />
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12 relative">
          <div className="max-w-4xl">
            <h1 className={`text-5xl sm:text-6xl font-bold mb-6 leading-tight ${
              darkMode 
                ? 'bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent' 
                : 'bg-gradient-to-r from-orange-600 via-orange-700 to-orange-800 bg-clip-text text-transparent'
            }`}>
              The Volcker Disinflation
            </h1>
            <p className={`text-xl sm:text-2xl leading-relaxed mb-4 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              When Paul Volcker became Federal Reserve Chair in 1979, inflation had reached double digits. 
              Through aggressive monetary tightening, he broke the back of inflation, even at the cost of deep recession 
              and high unemployment. His success established the Fed's credibility and set the foundation for decades of 
              low inflation and economic growth.
            </p>
            <p className={`text-lg ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Explore how key economic indicators changed during this pivotal period in monetary policy history.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Cinematic Layout */}
      {loading ? (
        <div className="text-center py-24">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
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
                      darkMode ? 'bg-orange-500' : 'bg-orange-600'
                    }`} />
                    <span className={`text-sm font-semibold uppercase tracking-wider ${
                      darkMode ? 'text-orange-400' : 'text-orange-600'
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
                    darkMode ? 'text-orange-300' : 'text-orange-700'
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
                    {currentTimeFrame.description}
                  </p>
                </div>

                {/* Key Events */}
                <div className={`p-6 rounded-2xl backdrop-blur-sm ${
                  darkMode 
                    ? 'bg-slate-800/60 border border-slate-700/50' 
                    : 'bg-white/80 border border-slate-200/50'
                }`}>
                  <h3 className={`text-lg font-bold mb-4 ${
                    darkMode ? 'text-orange-400' : 'text-orange-600'
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
                          darkMode ? 'bg-orange-500' : 'bg-orange-600'
                        }`} />
                        <span className="flex-1">{event}</span>
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

