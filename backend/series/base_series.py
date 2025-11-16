import requests
import pandas as pd
import json

import os
base_dir = os.path.dirname(os.path.dirname(__file__))  # go up one level


class Series:
    def __init__(self, series_id, start_date, end_date, frequency="m", units="lin" ):
        self.series_id = series_id
        self.start_date = start_date
        self.end_date = end_date
        self.frequency = frequency
        self.units = units
        self.data = None
        # Prefer environment variable in deployment; fallback to optional secrets.json locally
        fred_key = os.getenv("FRED_KEY")
        if not fred_key:
            secrets_path = os.path.join(base_dir, "secrets.json")
            if os.path.exists(secrets_path):
                try:
                    with open(secrets_path, "r") as f:
                        secrets = json.load(f)
                        fred_key = secrets.get("FRED_KEY")
                except Exception:
                    fred_key = None
        self.fred_key = fred_key
        self.base_url = "https://api.stlouisfed.org/fred/"
        # first endpoint --> series
        self.obs_endpoint = 'series/observations'

    def fetch_series_info(self):
        """Fetch series metadata including title, units, and frequency"""
        series_endpoint = 'series'
        series_params = {
            'series_id': self.series_id,
            'api_key': self.fred_key,
            'file_type': 'json'
        }
        
        response = requests.get(self.base_url + series_endpoint, params=series_params)
        if response.status_code == 200:
            series_data = response.json()
            if 'seriess' in series_data and len(series_data['seriess']) > 0:
                return series_data['seriess'][0]
        return None

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
            # Check if FRED returned an error in the response
            if 'error_code' in res_data:
                error_msg = res_data.get('error_message', f"FRED API error: {res_data.get('error_code')}")
                print(f"FRED API error for {self.series_id}: {error_msg}")
                raise ValueError(f"404: {error_msg}")
            
            # Check if observations exist
            if 'observations' not in res_data or len(res_data['observations']) == 0:
                raise ValueError(f"404: Series not found or no data available for {self.series_id} in date range {self.start_date} to {self.end_date}")
            
            obs_data = pd.DataFrame(res_data['observations']) # gets data into obs_data
            obs_data['date'] = pd.to_datetime(obs_data['date'])
            obs_data.set_index('date', inplace=True)
            # FRED uses '.' for missing values; coerce to NaN then drop
            obs_data['value'] = pd.to_numeric(obs_data['value'], errors='coerce')
            obs_data = obs_data.dropna(subset=['value'])
            
            if len(obs_data) == 0:
                raise ValueError(f"404: Series not found or no valid data for {self.series_id} in date range {self.start_date} to {self.end_date}")
            
            self.data = obs_data
        else:
            error_text = response.text
            print(f"Failed to retrieve data for {self.series_id}. Status code: {response.status_code}")
            print(f"Response text: {error_text}")
            # Try to parse error from FRED
            try:
                error_json = response.json()
                if 'error_message' in error_json:
                    raise ValueError(f"404: {error_json['error_message']}")
            except:
                pass
            raise ValueError(f"404: Series not found")

        return self.data

    def get_axis_labels(self):
        """Get appropriate axis labels based on series metadata"""
        series_info = self.fetch_series_info()
        if series_info:
            title = series_info.get('title', self.series_id)
            units = series_info.get('units', 'Value')
            return {
                'x_label': 'Date',
                'y_label': f"{title} ({units})",
                'title': f"{title} ({self.series_id})"
            }
        else:
            # Fallback labels
            return {
                'x_label': 'Date',
                'y_label': f'{self.series_id} Value',
                'title': f'{self.series_id} Data'
            }