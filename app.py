from fastapi import FastAPI, HTTPException
from series.unemployment import UnemploymentSeries
from series.cpi import CPISeries
from series.fed_funds import FedFundsSeries
from analytics.trend_analysis import Trendanalyzer
from analytics.insights import generate_insight, generate_ai_insight

import json

app = FastAPI(title="Economic Trends Dashboard API")
series_map = {
    "unemployment": UnemploymentSeries,
    "cpi": CPISeries,
    "fedfunds": FedFundsSeries
}
# uvicorn app:app --reload to run application
# 
@app.get("/series/{series_name}")
def get_series(series_name: str, start: str, end: str):
    try:
        if series_name.lower() not in series_map:
            raise HTTPException(status_code=404, detail="Series not found")
        
        series_class = series_map[series_name.lower()]
        series_instance = series_class(start, end)
        
        data = series_instance.fetch_data() # raw time value data
         # Convert DataFrame to dict for JSON response
        data_dict = data.to_dict()  # this works because data is a DataFrame

        # Compute trend
        trend_data = Trendanalyzer(data).compute_trend() # returns a dict of trends, cause FASTAPI must return a dict


        # Insights
        insight = generate_insight(trend_data, series_name)
        ai_insight = generate_ai_insight(data, series_name)

        return {
            "data": data_dict,
            "trend": trend_data, # already a dict
            "insight": insight,
            "ai_insight": ai_insight
        }

    except Exception as e:
        import traceback
        print("ERROR:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
