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
    description: "The percentage of the labor force that is unemployed."
  },
  gdp: {
    title: "GDP Growth",
    yAxisLabel: "GDP (Billions)",
    description: "Gross Domestic Product measures the total value of goods and services produced."
  },
  fedfunds: {
    title: "Federal Funds Rate",
    yAxisLabel: "Rate (%)",
    description: "The interest rate at which banks lend to each other overnight."
  },
  nasdaq: {
    title: "NASDAQ Composite Index",
    yAxisLabel: "Index Value",
    description: "The NASDAQ Composite Index tracks the performance of all stocks listed on the NASDAQ stock exchange. It peaked at 5,048.62 on March 10, 2000, before crashing during the dot-com bubble burst."
  }
};

export default function DotComBubble() {
  const [darkMode, setDarkMode] = useState(true);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState(0);

  const timeFrames = [
    {
      id: "pre-bubble",
      title: "Pre-Bubble",
      subtitle: "1995-1997",
      date: "1995-1997",
      description: "The foundation of the internet boom. Early internet companies emerge, and investors begin to see the potential of the World Wide Web.",
      highlight: "The internet goes mainstream",
      events: [
        "Netscape IPO in 1995 - first major internet company to go public",
        "Amazon and eBay launch, showing e-commerce potential",
        "Internet usage grows from 16 million to 70 million users"
      ],
      primaryChart: "nasdaq",
      startDate: "1995-01-01",
      endDate: "1997-12-31"
    },
    {
      id: "bubble-growth",
      title: "Bubble Growth",
      subtitle: "1998-1999",
      date: "1998-1999",
      description: "The dot-com bubble reaches its peak. Massive investments pour into internet companies, many with no profits or even revenue. Stock prices soar to unsustainable levels.",
      highlight: "Irrational exuberance takes hold",
      events: [
        "Google founded in 1998",
        "Yahoo! stock price increases 1,000%",
        "NASDAQ Composite Index rises from 1,500 to over 5,000",
        "Venture capital investments triple"
      ],
      primaryChart: "nasdaq",
      secondaryChart: "fedfunds",
      startDate: "1998-01-01",
      endDate: "1999-12-31"
    },
    {
      id: "peak",
      title: "The Peak",
      subtitle: "2000",
      date: "2000",
      description: "The bubble reaches its absolute peak in March 2000. NASDAQ hits an all-time high of 5,048.62. Warning signs begin to appear as some companies fail to meet expectations.",
      highlight: "NASDAQ peaks at 5,048.62",
      events: [
        "NASDAQ peaks at 5,048.62 on March 10, 2000",
        "Federal Reserve raises interest rates to cool economy",
        "First major dot-com failures begin (Pets.com, Webvan)",
        "GDP growth remains strong but concerns mount"
      ],
      primaryChart: "nasdaq",
      secondaryChart: "fedfunds",
      startDate: "2000-01-01",
      endDate: "2000-12-31"
    },
    {
      id: "burst",
      title: "The Burst",
      subtitle: "2001-2002",
      date: "2001-2002",
      description: "The bubble bursts. Stock prices collapse, hundreds of internet companies go bankrupt, and the economy enters a recession. Unemployment rises as the tech sector sheds jobs.",
      highlight: "The crash begins",
      events: [
        "NASDAQ crashes, losing 78% of its value by October 2002",
        "9/11 attacks further damage investor confidence",
        "Enron scandal exposes corporate fraud",
        "Unemployment rises from 4% to 6%",
        "GDP growth turns negative"
      ],
      primaryChart: "nasdaq",
      secondaryChart: "unemployment",
      startDate: "2001-01-01",
      endDate: "2002-12-31"
    },
    {
      id: "recovery",
      title: "Recovery",
      subtitle: "2003-2004",
      date: "2003-2004",
      description: "The economy begins to recover. Surviving tech companies prove their business models. The Federal Reserve cuts rates to stimulate growth. The foundation is laid for the next tech boom.",
      highlight: "The phoenix rises",
      events: [
        "Federal Reserve cuts rates to 1%",
        "Surviving companies like Amazon and eBay prove profitable",
        "GDP growth returns to positive territory",
        "Unemployment begins to decline",
        "Tech sector consolidation creates stronger companies"
      ],
      primaryChart: "nasdaq",
      secondaryChart: "unemployment",
      startDate: "2003-01-01",
      endDate: "2004-12-31"
    }
  ];

  useEffect(() => {
    async function loadAllData() {
      try {
        const storyData = await loadStoryData('dotcom');
        
        // Combine all time frame data to create full period data (1995-2004)
        const fullPeriodData = {};
        
        // Start with fullPeriodData if available (for NASDAQ)
        if (storyData.fullPeriodData) {
          Object.assign(fullPeriodData, storyData.fullPeriodData);
        }
        
        // Combine all time frames for each series
        storyData.timeFrames.forEach((frame) => {
          Object.keys(frame.data).forEach((seriesName) => {
            if (!fullPeriodData[seriesName]) {
              fullPeriodData[seriesName] = { value: {} };
            }
            
            const frameData = frame.data[seriesName];
            if (frameData && frameData.value) {
              // Merge all values, keeping the latest if there are duplicates
              Object.assign(fullPeriodData[seriesName].value, frameData.value);
            }
          });
        });
        
        setData(fullPeriodData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading dot-com bubble data:", error);
        setLoading(false);
      }
    }
    loadAllData();
  }, []);

  const currentTimeFrame = timeFrames[selectedTimeFrame];

  // Get charts to display for current time frame
  const getChartsToDisplay = () => {
    const charts = [];
    if (currentTimeFrame.primaryChart && data[currentTimeFrame.primaryChart]) {
      charts.push({ key: currentTimeFrame.primaryChart, isPrimary: true });
    }
    if (currentTimeFrame.secondaryChart && data[currentTimeFrame.secondaryChart]) {
      charts.push({ key: currentTimeFrame.secondaryChart, isPrimary: false });
    }
    return charts;
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      darkMode ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-b from-slate-50 to-white'
    }`}>
      <StoryHeader
        title="Dot-Com Bubble"
        subtitle="The Rise and Fall of the Internet Economy: 1995-2004"
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
              The Dot-Com Bubble
            </h1>
            <p className={`text-xl sm:text-2xl leading-relaxed mb-4 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              A period of extreme speculation in internet-related companies from 1995 to 2000. 
              Stock prices soared to unsustainable levels before crashing in 2001-2002.
            </p>
            <p className={`text-lg ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Explore how key economic indicators changed throughout the bubble's lifecycle.
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
                  const seriesData = data[key];
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
