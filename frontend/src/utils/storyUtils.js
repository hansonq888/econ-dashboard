/**
 * Format series data for chart display
 * @param {Object} seriesData - Data in format { value: { "date": value, ... } }
 * @returns {Array} Formatted data array for Recharts
 */
export function formatChartData(seriesData) {
  if (!seriesData || !seriesData.value) {
    return [];
  }
  
  const valueData = seriesData.value;
  if (Object.keys(valueData).length === 0) {
    return [];
  }
  
  const sortedDates = Object.keys(valueData).sort();
  const filtered = sortedDates.filter((dateStr) => {
    // Filter out invalid values (non-numeric)
    const val = valueData[dateStr];
    return typeof val === 'number' && !isNaN(val) && isFinite(val);
  });
  
  if (filtered.length === 0) {
    return [];
  }
  
  // Check if this is daily data (more than 500 points suggests daily frequency)
  const isDailyData = filtered.length > 500;
  
  return filtered.map((date) => {
    // Handle date strings with timestamps (e.g., "2000-01-01 00:00:00")
    const dateStr = date.split(' ')[0]; // Take only the date part
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) {
      return null;
    }
    
    // For daily data, use timestamp to ensure proper rendering
    // For monthly/quarterly data, use formatted date string
    if (isDailyData) {
      return {
        date: dateObj.getTime(), // Timestamp for daily data
        value: valueData[date],
        fullDate: dateStr
      };
    } else {
      return {
        date: dateObj.toLocaleDateString('en-US', {
          month: 'short',
          year: '2-digit'
        }),
        value: valueData[date],
        fullDate: dateStr
      };
    }
  }).filter(Boolean); // Remove any null entries
}

/**
 * Load story data from static JSON file
 * @param {string} storyId - Story identifier (e.g., 'dotcom', 'gfc')
 * @returns {Promise<Object>} Story data
 */
export async function loadStoryData(storyId) {
  try {
    const response = await fetch(`/story-data/${storyId}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load story data: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading story data for ${storyId}:`, error);
    throw error;
  }
}
