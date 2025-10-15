# insight_ai.py
from openai import OpenAI
import os, json

base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))  # go up two levels to root

def _load_openai_client():
    # Prefer environment variable in deployment
    api_key = os.getenv("OPENAI_KEY")
    if not api_key:
        # Fallback to optional secrets.json for local dev if present
        secrets_path = os.path.join(base_dir, "backend", "secrets.json")
        if os.path.exists(secrets_path):
            try:
                with open(secrets_path, "r") as f:
                    secrets = json.load(f)
                    api_key = secrets.get("OPENAI_KEY")
            except Exception:
                api_key = None
    return OpenAI(api_key=api_key) if api_key else None

client = _load_openai_client()


def generate_insight(trend_data, series_name):
    direction = trend_data['direction']
    pct_change = trend_data['pct_change']
    volatility = trend_data['volatility']

    if direction == 'upward':
        direction_phrase = f"{series_name} has been rising"
    elif direction == 'downward':
        direction_phrase = f"{series_name} has been declining"
    else:
        direction_phrase = f"{series_name} has remained relatively stable"

    volatility_comment = "and has shown high volatility." if volatility > 3 else "with steady behavior."
    
    if pct_change > 0:
        change_comment = f"Overall, it increased by {pct_change}% since the start of the selected period."
    else:
        change_comment = f"Overall, it decreased by {abs(pct_change)}% since the start of the selected period."

    return f"{direction_phrase} {change_comment} The data appears {volatility_comment}\n"



def generate_ai_insight(trend_data, series_name):
    """Generate a natural language summary of the economic trend"""
    try:
        if client is None:
            return f"AI insights temporarily unavailable for {series_name}."
        prompt = f"""
        Provide a concise, professional summary of the following trend data:
        {trend_data}
        Series: {series_name}
        """

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
        )

        return response.choices[0].message.content
    except Exception as e:
        print(f"OpenAI API error: {e}")
        return f"AI insights temporarily unavailable for {series_name}. Please try again later."


def generate_overall_ai_insight(context: dict):
    """Generate an overall economic health narrative based on combined metrics.

    Expected context keys include (but are not limited to):
    - health_percent (0..100)
    - metrics: {
        gdp_yoy, cpi_yoy, unemployment, fedfunds, pce_yoy, t10y3m
      }
    """
    try:
        if client is None:
            return "Overall AI insight temporarily unavailable."
        prompt = f"""
        You are an economist. Provide a concise, professional assessment of the U.S. economic health.
        Use the following metrics and the provided composite health score as context. Avoid hedging; be crisp and actionable in 4-6 sentences.

        Composite Health: {context.get('health_percent')}%
        Metrics (latest): {context.get('metrics')}

        Guidelines:
        - Interpret whether conditions are expanding, stable, or contracting.
        - Weigh GDP growth, unemployment, inflation vs the 2% target, Fed Funds stance, consumer spending (PCE), and yield curve (10Y-3M) inversions.
        - Mention notable risks (e.g., persistent inflation, tight policy, inverted curve) or strengths (e.g., solid labor market, robust demand).
        - Keep the tone neutral and informative; no predictions, just assessment.
        """

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
        )

        return response.choices[0].message.content
    except Exception as e:
        print(f"OpenAI API error (overall): {e}")
        return "Overall AI insight temporarily unavailable."