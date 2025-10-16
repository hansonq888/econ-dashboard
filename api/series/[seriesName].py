from http.server import BaseHTTPRequestHandler
import json
import math
import sys
import os

# Add the api directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from series.unemployment import UnemploymentSeries
from series.cpi import CPISeries
from series.fed_funds import FedFundsSeries
from series.gdp import GDPSeries
from series.pce import PCESeries
from series.t10y3m import T10Y3MSeries
from analytics.trend_analysis import Trendanalyzer
from analytics.insights import generate_insight, generate_ai_insight

def _sanitize_for_json(obj):
    """Recursively replace NaN/Inf with None so JSON serialization succeeds."""
    if isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return None
        return obj
    if isinstance(obj, dict):
        return {k: _sanitize_for_json(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_sanitize_for_json(v) for v in obj]
    return obj

series_map = {
    "unemployment": UnemploymentSeries,
    "cpi": CPISeries,
    "fedfunds": FedFundsSeries,
    "gdp": GDPSeries,
    "pce": PCESeries,
    "t10y3m": T10Y3MSeries
}

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Parse query parameters
            path_parts = self.path.split('/')
            series_name = path_parts[-1] if path_parts else ''
            
            # Get query parameters
            import urllib.parse
            query_params = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            
            start = query_params.get('start', [''])[0]
            end = query_params.get('end', [''])[0]
            include_ai = query_params.get('include_ai', ['true'])[0].lower() == 'true'
            use_cache = query_params.get('use_cache', ['true'])[0].lower() == 'true'
            
            if not start or not end:
                self.send_error(400, "Missing start or end parameter")
                return
                
            if series_name.lower() not in series_map:
                self.send_error(404, "Series not found")
                return
            
            # Fetch data
            series_class = series_map[series_name.lower()]
            series_instance = series_class(start, end)
            data = series_instance.fetch_data()
            
            if data is None or data.empty:
                self.send_error(500, "Failed to fetch data")
                return
                
            # Convert DataFrame to dict for JSON response
            data_dict = data.to_dict()
            
            # Convert Timestamp objects to strings for JSON serialization
            for col in data_dict:
                if isinstance(data_dict[col], dict):
                    data_dict[col] = {str(k): v for k, v in data_dict[col].items()}

            # Compute trend
            trend_data = Trendanalyzer(data).compute_trend()

            # Basic insights (always fast)
            insight = generate_insight(trend_data, series_name)
            
            # AI insights (optional and slow)
            ai_insight = None
            if include_ai:
                try:
                    ai_insight = generate_ai_insight(data, series_name)
                except Exception as e:
                    print(f"AI insight failed for {series_name}: {e}")
                    ai_insight = f"AI insights temporarily unavailable for {series_name}."

            # Include basic frequency metadata for frontend caching
            result = {
                "data": data_dict,
                "trend": trend_data,
                "insight": insight,
                "ai_insight": ai_insight,
                "frequency": getattr(series_instance, 'frequency', None)
            }
            result = _sanitize_for_json(result)
            
            # Send response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            self.wfile.write(json.dumps(result).encode())
            
        except Exception as e:
            import traceback
            print("ERROR:", e)
            traceback.print_exc()
            self.send_error(500, str(e))
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
