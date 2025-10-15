import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts"
import { useState } from "react"

export default function ChartCard({ title, subtitle, data, color, darkMode = false, trend, extra }) {
  const [isExpanded, setIsExpanded] = useState(false)
  if (!data) return (
    <div className={`text-center p-12 rounded-2xl ${
      darkMode ? 'bg-gray-800/50 text-gray-400' : 'bg-gray-50 text-gray-500'
    }`}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p>Loading {title}...</p>
    </div>
  );

  const chartData = Object.keys(data.value).map((date) => ({
    date: new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      year: '2-digit',
      day: new Date(date).getFullYear() !== new Date().getFullYear() ? undefined : 'numeric'
    }),
    value: data.value[date],
    fullDate: date
  }));

  // Get trend information
  const trendDirection = trend?.direction || 'stable';
  const trendChange = trend?.pct_change || 0;
  const trendVolatility = trend?.volatility || 0;

  const getTrendIcon = () => {
    if (trendDirection === 'upward') return '📈';
    if (trendDirection === 'downward') return '📉';
    return '➡️';
  };

  const getTrendColor = () => {
    if (trendDirection === 'upward') return darkMode ? 'text-green-400' : 'text-green-600';
    if (trendDirection === 'downward') return darkMode ? 'text-red-400' : 'text-red-600';
    return darkMode ? 'text-gray-400' : 'text-gray-600';
  };

  return (
    <div className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-2xl ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50' 
        : 'bg-gradient-to-br from-white/90 to-gray-50/90 border-gray-200/50'
    } backdrop-blur-sm`}>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className={`text-xl font-bold mb-1 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                {title}
              </h3>
              <p className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {subtitle}
              </p>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              darkMode ? 'bg-gray-700/50' : 'bg-gray-100/50'
            }`}>
              <span className="text-lg">{getTrendIcon()}</span>
              <span className={getTrendColor()}>
                {trendChange > 0 ? '+' : ''}{trendChange.toFixed(1)}%
              </span>
            </div>
          </div>
          {/* Extra metric panel */}
          {extra && (
            <div className={`text-sm p-4 rounded-xl ${
              darkMode ? 'bg-gradient-to-r from-gray-800/30 to-gray-900/30 border border-gray-700/40' : 'bg-gradient-to-r from-gray-50 to-white border border-gray-200'
            }`}>
              {extra}
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.8}/>
                  <stop offset="100%" stopColor={color} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={darkMode ? "#374151" : "#e5e7eb"} 
                opacity={0.6}
              />
              <XAxis 
                dataKey="date" 
                stroke={darkMode ? "#9ca3af" : "#6b7280"}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke={darkMode ? "#9ca3af" : "#6b7280"}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                  return value.toFixed(1);
                }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                  border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                  borderRadius: '12px',
                  color: darkMode ? '#f9fafb' : '#1f2937',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                }}
                labelStyle={{
                  color: darkMode ? '#9ca3af' : '#6b7280',
                  fontSize: '12px'
                }}
                formatter={(value, name) => [
                  typeof value === 'number' ? value.toLocaleString() : value,
                  'Value'
                ]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={color || "#8884d8"} 
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: color, strokeWidth: 2 }}
                fill={`url(#gradient-${color})`}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Footer with axis labels */}
        <div className={`flex justify-between items-center mt-4 pt-4 border-t ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className={`text-xs ${
            darkMode ? 'text-gray-500' : 'text-gray-400'
          }`}>
            X: 5-Year Rolling Window | Y: {title.includes('Rate') ? 'Percentage' : title.includes('GDP') ? 'Billions USD' : 'Index Value'}
          </div>
          <div className={`text-xs ${
            darkMode ? 'text-gray-500' : 'text-gray-400'
          }`}>
            Volatility: {trendVolatility.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
