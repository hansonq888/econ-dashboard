import requests
import pandas as pd
import json

class Series:
    def __init__(self, series_id, start_date, end_date, frequency="m", units="lin" ):
        self.series_id = series_id
        self.start_date = start_date
        self.end_date = end_date
        self.frequency = frequency
        self.units = units
        self.data = None
        with open("secrets.json") as f:
            secrets = json.load(f)
        self.fred_key = secrets["FRED_KEY"]
        self.base_url = "https://api.stlouisfed.org/fred/"
        # first endpoint --> series
        self.obs_endpoint = 'series/observations'

    def fetch_data(self):
        obs_params = {
            'series_id': self.series_id,
            'api_key': self.fred_key,
            'file_type': 'json',
            'observation_start': self.start_date,
            'observation_end': self.end_date,
            'frequency': self.frequency,
            'units': self.units
        }

        #make get request to FRED api
        response = requests.get(self.base_url + self.obs_endpoint, params=obs_params)
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

        self.data = obs_data
        return self.data