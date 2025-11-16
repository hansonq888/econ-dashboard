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
    description: "The unemployment rate skyrocketed from around 4.5% in 2007 to a peak of 10% in October 2009. This represented the loss of millions of jobs as businesses closed or downsized."
  },
  gdp: {
    title: "GDP Growth",
    yAxisLabel: "GDP (Billions)",
    description: "The U.S. economy contracted sharply. Real GDP declined by 0.1% in 2008 and by 2.5% in 2009. This was the first time since the Great Depression that the economy shrank for two consecutive years."
  },
  fedfunds: {
    title: "Federal Funds Rate",
    yAxisLabel: "Rate (%)",
    description: "The Federal Reserve responded aggressively, cutting the federal funds rate from 5.25% in September 2007 to near zero (0-0.25%) by December 2008."
  },
  cpi: {
    title: "Consumer Price Index (Inflation)",
    yAxisLabel: "CPI Index",
    description: "Inflation dropped significantly during the crisis. With high unemployment and reduced consumer spending, prices fell. The CPI actually declined in 2009, raising concerns about deflation."
  }
};

export default function FinancialCrisis2008() {
  const [darkMode, setDarkMode] = useState(true);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState(0);

  const timeFrames = [
    {
      id: "pre-crisis",
      title: "Pre-Crisis",
      subtitle: "2006-2007",
      date: "2006-2007",
      description: "The housing bubble reaches its peak. Risky lending practices and complex financial instruments create a fragile foundation. Housing prices begin to show signs of weakness.",
      highlight: "The calm before the storm",
      events: [
        "Housing prices peak in 2006",
        "Subprime mortgage lending reaches unsustainable levels",
        "Financial institutions hold trillions in mortgage-backed securities",
        "Early warning signs emerge as default rates rise"
      ],
      primaryChart: "fedfunds",
      secondaryChart: "cpi",
      startDate: "2006-01-01",
      endDate: "2007-12-31"
    },
    {
      id: "crisis-begins",
      title: "Crisis Begins",
      subtitle: "2007-2008",
      date: "2007-2008",
      description: "The housing market collapses, triggering a chain reaction through the financial system. Major financial institutions face liquidity crises as the credit markets freeze.",
      highlight: "The house of cards falls",
      events: [
        "Housing prices decline sharply",
        "Bear Stearns collapses in March 2008, acquired by JPMorgan Chase",
        "Credit markets freeze as banks stop lending",
        "Federal Reserve begins emergency interventions"
      ],
      primaryChart: "fedfunds",
      secondaryChart: "gdp",
      startDate: "2007-01-01",
      endDate: "2008-09-30"
    },
    {
      id: "peak-crisis",
      title: "Peak Crisis",
      subtitle: "2008-2009",
      date: "2008-2009",
      description: "The crisis reaches its peak. Lehman Brothers files for bankruptcy, triggering a global financial panic. Massive government intervention becomes necessary to prevent total collapse.",
      highlight: "The system teeters on the brink",
      events: [
        "Lehman Brothers files for bankruptcy on September 15, 2008",
        "Congress passes TARP (Troubled Asset Relief Program) in October 2008",
        "Unemployment peaks at 10% in October 2009",
        "Federal Reserve cuts rates to near zero",
        "GDP contracts by 2.5% in 2009"
      ],
      primaryChart: "unemployment",
      secondaryChart: "gdp",
      startDate: "2008-09-01",
      endDate: "2009-12-31"
    },
    {
      id: "recovery",
      title: "Recovery",
      subtitle: "2010-2012",
      date: "2010-2012",
      description: "The economy begins a slow and painful recovery. Regulatory reforms are implemented to prevent future crises. Unemployment remains elevated, but economic growth gradually returns.",
      highlight: "A long road to recovery",
      events: [
        "Dodd-Frank Act passed in 2010 to reform financial regulation",
        "GDP growth returns to positive territory",
        "Unemployment remains above 7% until 2013",
        "Federal Reserve maintains near-zero interest rates",
        "Financial system stabilizes but scars remain"
      ],
      primaryChart: "unemployment",
      secondaryChart: "gdp",
      startDate: "2010-01-01",
      endDate: "2012-12-31"
    }
  ];

  useEffect(() => {
    async function loadCrisisData() {
      try {
        const storyData = await loadStoryData('gfc');
        setData(storyData.data);
        setLoading(false);
      } catch (error) {
        console.error("Error loading crisis data:", error);
        setLoading(false);
      }
    }
    loadCrisisData();
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
        title="2008 Financial Crisis"
        subtitle="The Great Recession: 2007-2009"
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
              The 2008 Financial Crisis
            </h1>
            <p className={`text-xl sm:text-2xl leading-relaxed mb-4 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              The most severe economic downturn since the Great Depression. Triggered by a housing bubble collapse, 
              it exposed weaknesses throughout the global financial system, leading to bank failures, massive job losses, 
              and years of recovery.
            </p>
            <p className={`text-lg ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Explore how key economic indicators changed throughout the crisis and recovery.
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
