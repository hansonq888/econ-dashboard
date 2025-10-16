import pandas as pd
import numpy as np
from scipy.signal import argrelextrema #this is to find local maxima and minima

class Trendanalyzer:
    def __init__(self, df: pd.DataFrame, column='value'):
        self.df = df # THE DATA FRAM --> ALL THE DATA
        self.column = column
        self.series = df[column] # list of numeric values 

    def compute_trend(self):
        # .iloc[0] --> first data point the series
        # .iloc[-1] --> last data point in the series
        slope = (self.series.iloc[-1] - self.series.iloc[0]) / len(self.series) #iloc is kinda like a way you would access individual elements in the list
        direction = 'upward' if slope > 0 else 'downward' if slope < 0 else ' flat'

        pct_change = ((self.series.iloc[-1] - self.series.iloc[0])/self.series.iloc[0]) * 100
        print(f"percent change: {pct_change}")
        volatility = self.series.pct_change().std()*100 #std is standard deviation
        print(f"Volatility: {volatility}")

        local_max = self.df.iloc[argrelextrema(self.series.values, np.greater)[0]]
        local_min = self.df.iloc[argrelextrema(self.series.values, np.less)[0]]

        return {
            'direction': direction,
            'pct_change': round(pct_change, 2),
            'volatility': round(volatility, 2),
            'num_peaks': len(local_max),
            'num_troughs': len(local_min),
            'latest_value': self.series.iloc[-1],
            'earliest_value': self.series.iloc[0]
        }
    
