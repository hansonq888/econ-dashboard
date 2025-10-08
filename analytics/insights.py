# insight_ai.py
import json
from openai import OpenAI

# Load secrets from the JSON file
with open("secrets.json", "r") as f:
    secrets = json.load(f)

api_key = secrets["OPENAI_KEY"]
client = OpenAI(api_key=api_key)


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