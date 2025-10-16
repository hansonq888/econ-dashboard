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
from analytics.insights import generate_overall_ai_insight

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
            import urllib.parse
            query_params = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            
            start = query_params.get('start', [''])[0]
            end = query_params.get('end', [''])[0]
            
            if not start or not end:
                self.send_error(400, "Missing start or end parameter")
                return
            
            # Pull series data
            needed = ["gdp", "cpi", "unemployment", "fedfunds", "pce", "t10y3m"]
            results = {}
            for s in needed:
                if s not in series_map:
                    continue
                series_instance = series_map[s](start, end)
                df = series_instance.fetch_data()
                if df is None or df.empty:
                    continue
                results[s] = df

            def latest_num(df):
                try:
                    v = df['value'].dropna()
                    if v.empty:
                        return None
                    return float(v.iloc[-1])
                except Exception:
                    return None

            def pct_change(df, periods):
                try:
                    v = df['value'].dropna()
                    if len(v) <= periods:
                        return None
                    curr = float(v.iloc[-1])
                    prev = float(v.iloc[-1 - periods])
                    if prev == 0:
                        return None
                    return ((curr - prev) / prev) * 100.0
                except Exception:
                    return None

            metrics = {
                'gdp_yoy': pct_change(results.get('gdp'), 4),
                'cpi_yoy': pct_change(results.get('cpi'), 12),
                'unemployment': latest_num(results.get('unemployment')),
                'fedfunds': latest_num(results.get('fedfunds')),
                'pce_yoy': pct_change(results.get('pce'), 12),
                't10y3m': latest_num(results.get('t10y3m')),
            }

            # Simple reimplementation of frontend scoring for consistency
            def clamp01(x):
                return max(0.0, min(1.0, x)) if x is not None and not math.isnan(x) and not math.isinf(x) else None

            def score_unemp(x):
                if x is None: return None
                return clamp01(1 - min(1, abs(x - 4) / 4))
            def score_gdp(x):
                if x is None: return None
                return clamp01((x - (-2)) / 8)
            def score_cpi(x):
                if x is None: return None
                return clamp01(1 - min(1, abs(x - 2) / 4))
            def score_fed(x):
                if x is None: return None
                d = 2 - x if x < 2 else x - 4 if x > 4 else 0
                return clamp01(1 - min(1, d / 4))
            def score_pce(x):
                if x is None: return None
                return clamp01((x - 0) / 6)
            def score_spread(x):
                if x is None: return None
                return clamp01((x - (-1)) / 3)

            scores = [
                score_gdp(metrics['gdp_yoy']),
                score_unemp(metrics['unemployment']),
                score_cpi(metrics['cpi_yoy']),
                score_fed(metrics['fedfunds']),
                score_pce(metrics['pce_yoy']),
                score_spread(metrics['t10y3m'])
            ]
            scores = [s for s in scores if s is not None]
            health_percent = round((sum(scores) / len(scores)) * 100) if scores else None

            context = _sanitize_for_json({
                'health_percent': health_percent,
                'metrics': metrics
            })

            narrative = generate_overall_ai_insight(context)
            result = _sanitize_for_json({ 'health_percent': health_percent, 'metrics': metrics, 'ai_insight': narrative })
            
            # Send response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            self.wfile.write(json.dumps(result).encode())
            
        except Exception as e:
            print("Overall insight error:", e)
            result = _sanitize_for_json({ 'health_percent': None, 'metrics': {}, 'ai_insight': 'Overall AI insight temporarily unavailable.' })
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            self.wfile.write(json.dumps(result).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
