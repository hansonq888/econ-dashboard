import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ReferenceArea } from "recharts";

export default function StoryChart({ 
  title, 
  description, 
  data, 
  yAxisLabel, 
  strokeColor = "#f97316",
  darkMode,
  selectedTimeFrame = null // { startDate, endDate } in YYYY-MM-DD format
}) {
  if (!data || data.length === 0) {
    return null;
  }

  // Ensure data is sorted by date
  const sortedData = [...data].sort((a, b) => {
    const dateA = typeof a.date === 'number' ? a.date : new Date(a.fullDate).getTime();
    const dateB = typeof b.date === 'number' ? b.date : new Date(b.fullDate).getTime();
    return dateA - dateB;
  });

  // Calculate highlight area for selected time frame
  let highlightStart = null;
  let highlightEnd = null;

  if (selectedTimeFrame && sortedData.length > 0) {
    const startDateStr = selectedTimeFrame.startDate;
    const endDateStr = selectedTimeFrame.endDate;
    
    // Parse dates
    const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number);
    const startDate = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);
    const startTime = startDate.getTime();
    
    const [endYear, endMonth, endDay] = endDateStr.split('-').map(Number);
    const endDate = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999);
    const endTime = endDate.getTime();

    // Find the x-axis values for start and end dates
    const isNumericDate = typeof sortedData[0]?.date === 'number';
    
    if (isNumericDate) {
      // For numeric dates (timestamps), find the actual data points
      let startX = null;
      let endX = null;
      let startDistance = Infinity;
      let endDistance = Infinity;

      sortedData.forEach((point) => {
        const pointTime = typeof point.date === 'number' ? point.date : new Date(point.fullDate).getTime();
        
        // Find closest point on or after start date
        if (pointTime >= startTime) {
          const distance = pointTime - startTime;
          if (distance < startDistance) {
            startDistance = distance;
            startX = point.date;
          }
        }
        
        // Find closest point on or before end date
        if (pointTime <= endTime) {
          const distance = endTime - pointTime;
          if (distance < endDistance) {
            endDistance = distance;
            endX = point.date;
          }
        }
      });

      // If we didn't find a point on or after start, use the closest before
      if (startX === null) {
        sortedData.forEach((point) => {
          const pointTime = typeof point.date === 'number' ? point.date : new Date(point.fullDate).getTime();
          const distance = Math.abs(pointTime - startTime);
          if (distance < startDistance) {
            startDistance = distance;
            startX = point.date;
          }
        });
      }

      // If we didn't find a point on or before end, use the closest after
      if (endX === null) {
        sortedData.forEach((point) => {
          const pointTime = typeof point.date === 'number' ? point.date : new Date(point.fullDate).getTime();
          const distance = Math.abs(pointTime - endTime);
          if (distance < endDistance) {
            endDistance = distance;
            endX = point.date;
          }
        });
      }

      highlightStart = startX;
      highlightEnd = endX;
    } else {
      // For formatted date strings, find the closest data points
      let startX = null;
      let endX = null;
      let startDistance = Infinity;
      let endDistance = Infinity;

      sortedData.forEach((point) => {
        const fullDateStr = point.fullDate || point.date;
        if (fullDateStr && fullDateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
          const [y, m, d] = fullDateStr.split('-').map(Number);
          const pointDate = new Date(y, m - 1, d, 0, 0, 0, 0);
          const pointTime = pointDate.getTime();
          
          // Find closest point to start date
          const distToStart = Math.abs(pointTime - startTime);
          if (distToStart < startDistance) {
            startDistance = distToStart;
            startX = point.date; // Use the formatted date string for x-axis
          }
          
          // Find closest point to end date
          const distToEnd = Math.abs(pointTime - endTime);
          if (distToEnd < endDistance) {
            endDistance = distToEnd;
            endX = point.date; // Use the formatted date string for x-axis
          }
        }
      });

      highlightStart = startX;
      highlightEnd = endX;
    }
  }

  return (
    <div>
      {title && (
        <h3 className={`text-xl font-bold mb-4 ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}>
          {title}
        </h3>
      )}
      {description && (
        <p className={`text-sm mb-4 ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {description}
        </p>
      )}
      <div className={`p-4 rounded-xl ${
        darkMode ? 'bg-slate-900' : 'bg-gray-50'
      }`}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={sortedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#475569' : '#e2e8f0'} />
            <XAxis
              dataKey="date"
              stroke={darkMode ? '#94a3b8' : '#64748b'}
              tick={{ fontSize: 12 }}
              type={typeof sortedData[0]?.date === 'number' ? 'number' : 'category'}
              domain={typeof sortedData[0]?.date === 'number' ? ['dataMin', 'dataMax'] : undefined}
              tickFormatter={(value) => {
                // Convert timestamp to formatted date
                if (typeof value === 'number') {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', {
                    month: 'short',
                    year: '2-digit'
                  });
                }
                return value;
              }}
            />
            <YAxis
              stroke={darkMode ? '#94a3b8' : '#64748b'}
              tick={{ fontSize: 12 }}
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
                borderRadius: '8px',
                color: darkMode ? '#f1f5f9' : '#1e293b'
              }}
            />
            {/* Highlight area for selected time frame */}
            {highlightStart !== null && highlightEnd !== null && (
              <ReferenceArea
                x1={highlightStart}
                x2={highlightEnd}
                fill={darkMode ? 'rgba(249, 115, 22, 0.25)' : 'rgba(249, 115, 22, 0.2)'}
                stroke={darkMode ? 'rgba(249, 115, 22, 0.4)' : 'rgba(249, 115, 22, 0.3)'}
                strokeWidth={1}
              />
            )}
            {/* Main data line - full period, always visible */}
            <Line
              type={typeof sortedData[0]?.date === 'number' ? 'linear' : 'monotone'}
              dataKey="value"
              stroke={strokeColor}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              connectNulls={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

