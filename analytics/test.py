#python -m venv venv --> setting up virtual environment
#pip freeze > requirements.txt --> to create dependencies file
# pip install ipython
# For future use: pip install -r requirements.txt

# Notes on Ipython:
# use %run [file name] to run a python file
# memory is then stored and can be accessed immediately

import requests
import pandas as pd
# print(pd.__version__)
import json
import matplotlib.pyplot as plt
from trend_analysis import Trendanalyzer
from insights import generate_insight, generate_ai_insight

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from series.unemployment import UnemploymentSeries
from series.cpi import CPISeries
from series.fed_funds import FedFundsSeries




# Unemployment Data -----------------------------------------------------------------------------------
print("\nUNRATE DATA -------------------\n")
unrate = UnemploymentSeries("2025-01-01", "2025-08-01")
unrate_data = unrate.fetch_data()
analyzer = Trendanalyzer(unrate_data)
unrate_trend_data = analyzer.compute_trend()


# generate_insight takes trend data
# generate_ai_insight takes raw data
unrate_insight_data = generate_insight(unrate_trend_data, "unemployment")
unrate_ai_insight_data = generate_ai_insight(unrate_data, "unemployment")

print(unrate_insight_data)
print(unrate_ai_insight_data)


unrate_data.plot(title="Unemployment Rate (UNRATE)", figsize=(10, 5))

plt.xlabel("Date") # just labels
plt.ylabel("Percent") # just labels
plt.grid(True) # makes grid
plt.show() # displays plot


# CPI Data -----------------------------------------------------------------------------------
print("\nCPI DATA -------------------\n")
cpi = CPISeries("2025-01-01", "2025-08-01")
cpi_data = cpi.fetch_data()
analyzer = Trendanalyzer(cpi_data)
cpi_trend_data = analyzer.compute_trend()


# generate_insight takes trend data
# generate_ai_insight takes raw data
cpi_insight_data = generate_insight(cpi_trend_data, "CPI")
cpi_ai_insight_data = generate_ai_insight(cpi_data, "CPI")

print(cpi_insight_data)
print(cpi_ai_insight_data)


cpi_data.plot(title="CPI (CPIAUCSL)", figsize=(10, 5))

plt.xlabel("Date") # just labels
plt.ylabel("Percent") # just labels
plt.grid(True) # makes grid
plt.show() # displays plot

# FED FUNDS Data -----------------------------------------------------------------------------------
print("\nFED FUNDS DATA -------------------\n")
fed_funds = FedFundsSeries("2025-01-01", "2025-08-01")
fed_funds_data = fed_funds.fetch_data()
analyzer = Trendanalyzer(fed_funds_data)
fed_funds_trend_data = analyzer.compute_trend()


# generate_insight takes trend data
# generate_ai_insight takes raw data
fed_funds_insight_data = generate_insight(fed_funds_trend_data, "FED FUNDS")
fed_funds_ai_insight_data = generate_ai_insight(fed_funds_data, "FED FUNDS")

print(fed_funds_insight_data)
print(fed_funds_ai_insight_data)


fed_funds_data.plot(title="FED FUNDS (FEDFUNDS)", figsize=(10, 5))

plt.xlabel("Date") # just labels
plt.ylabel("Percent") # just labels
plt.grid(True) # makes grid
plt.show() # displays plot



