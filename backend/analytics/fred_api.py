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

with open("secrets.json") as f:
    secrets = json.load(f)

fred_key = secrets["FRED_KEY"]

base_url = "https://api.stlouis ed.org/fred/"

# first endpoint --> series
obs_endpoint = 'series/observations'

series_id = 'UNRATE'
start_date = "2000-01-01"
end_date = "2025-08-01"
ts_frequency = "m" # be careful what series you're using. Not all series accept all frequencies

ts_units = "pc1"
# One of the following values: 'lin', 'chg', 'ch1', 'pch', 'pc1', 'pca', 'cch', 'cca', 'log'
# lin = Levels (No transformation)
# chg = Change
# ch1 = Change from Year Ago
# pch = Percent Change
# pc1 = Percent Change from Year Ago
# pca = Compounded Annual Rate of Change
# cch = Continuously Compounded Rate of Change
# cca = Continuously Compounded Annual Rate of Change
# log = Natural Log

obs_params = {
    'series_id': series_id,
    'api_key': fred_key,
    'file_type': 'json',
    'observation_start': start_date,
    'observation_end': end_date,
    'frequency': ts_frequency,
    'units': ts_units
}

#make get request to FRED api
response = requests.get(base_url + obs_endpoint, params=obs_params)
# print(base_url + obs_endpoint)


#status code 200 means success
if response.status_code == 200:
    res_data = response.json() # parse json data out
    # print(res_data.keys())
    obs_data = pd.DataFrame(res_data['observations']) # gets data into obs_data
    # print(res_data['observations'])
    obs_data['date'] = pd.to_datetime(obs_data['date'])
    obs_data.set_index('date', inplace=True) 
    obs_data['value'] = obs_data['value'].astype(float)
else:
    print("Failed to retrieve data. Status code: ", response.status_code)
    print("Response text:", response.text)


#automatically sets index at x and 'value' as y
obs_data.plot(title="Unemployment Rate (UNRATE)", figsize=(10, 5))

plt.xlabel("Date") # just labels
plt.ylabel("Percent") # just labels
plt.grid(True) # makes grid
plt.show() # displays plot

# Now, get a category
# FRED database has HELLA categories, each with HELLA sub categories and datasets
# ex. [Money, Banking & Finanace], [Population, Employment, & Labour], etc.

cat_endpoint = 'category'
cat_id = 0

cat_params = {
    'fred_key': fred_key,
    'file_type': 'json',
    'category_id': cat_id
}

response = requests.get(base_url + cat_endpoint, params=cat_params)

if response.status_code == 200:
    res_data = response.json()
    print(res_data)
else:
    print("Failed to retrieve data. Status code:", response.status_code)


# Now getting children:

child_endpoint = 'category/children'
parent_id = 32991 # id of parent,

child_params = {
    'fred_key': fred_key,
    'file_type': 'json',
    'category_id': parent_id
}

response = requests.get(base_url + child_endpoint, params=child_params)

if response.status_code == 200:
    res_data = response.json() # will give you a dictionary of children categories
    print(res_data)
else:
    print("Failed to retrieve data. Status code:", response.status_code)


# category series --> get series from a category

