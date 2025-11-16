import React from "react";

export default function Timeline({ timeFrames, selectedIndex, onSelect, darkMode }) {
  // Calculate progress percentage - extend to center of selected dot
  const totalDots = timeFrames.length;
  // Extend fill to the center of the selected dot (or 100% if it's the last one)
  const progress = totalDots > 1 
    ? (selectedIndex / (totalDots - 1)) * 100 
    : 100;
  
  return (
    <div className="mb-0">
      <div className="relative" style={{ minHeight: '80px' }}>
        {/* Background timeline line */}
        <div className={`absolute left-0 right-0 top-0 h-1.5 rounded-full ${
          darkMode ? 'bg-slate-700' : 'bg-gray-300'
        }`} />
        
        {/* Progress fill - animated, extends fully behind dots */}
        <div 
          className={`absolute left-0 top-0 h-1.5 rounded-full transition-all duration-500 ease-out ${
            darkMode ? 'bg-orange-500' : 'bg-orange-600'
          }`}
          style={{ width: `${progress}%` }}
        />
        
        {/* Timeline dots and labels */}
        <div className="relative" style={{ minHeight: '80px' }}>
          {timeFrames.map((frame, index) => {
            // Remove year from title (e.g., "The Peak (2000)" -> "The Peak")
            const titleWithoutYear = frame.title.replace(/\s*\([^)]*\)\s*$/, '');
            const isSelected = index === selectedIndex;
            const isPast = index <= selectedIndex;
            
            // Calculate position percentage for this dot (0% to 100%)
            const dotPosition = totalDots > 1 
              ? (index / (totalDots - 1)) * 100 
              : 50;
            
            return (
              <div
                key={frame.id}
                className="flex flex-col items-center cursor-pointer group transition-all duration-300"
                style={{ 
                  position: 'absolute', 
                  left: `${dotPosition}%`, 
                  transform: 'translateX(-50%)',
                  top: 0
                }}
                onClick={() => onSelect(index)}
              >
                {/* Dot - positioned on the line */}
                <div className={`relative z-10 rounded-full transition-all duration-300 -mt-2 ${
                  isSelected
                    ? 'w-5 h-5 ring-4 ring-orange-500/40'
                    : 'w-4 h-4'
                } ${
                  isSelected
                    ? darkMode
                      ? 'bg-orange-500 shadow-lg shadow-orange-500/50'
                      : 'bg-orange-600 shadow-lg shadow-orange-600/50'
                    : isPast
                      ? darkMode
                        ? 'bg-orange-400/60 group-hover:bg-orange-400'
                        : 'bg-orange-500/60 group-hover:bg-orange-500'
                      : darkMode
                        ? 'bg-slate-600 group-hover:bg-slate-500'
                        : 'bg-gray-400 group-hover:bg-gray-500'
                }`} />
                
                {/* Label - below the dots */}
                <div className={`mt-2 text-center transition-all duration-300 whitespace-nowrap ${
                  isSelected
                    ? darkMode ? 'text-orange-400 font-bold scale-105' : 'text-orange-600 font-bold scale-105'
                    : isPast
                      ? darkMode ? 'text-orange-300/80 group-hover:text-orange-300' : 'text-orange-500/80 group-hover:text-orange-600'
                      : darkMode ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-600 group-hover:text-gray-700'
                }`}>
                  <div className={`text-xs font-semibold transition-all duration-300 whitespace-nowrap ${
                    isSelected ? 'text-base' : ''
                  }`}>
                    {frame.date}
                  </div>
                  <div className={`text-xs mt-0.5 max-w-[100px] transition-all duration-300 ${
                    isSelected ? 'font-semibold' : ''
                  }`}>
                    {titleWithoutYear}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

