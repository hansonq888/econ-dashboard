from backend.series.base_series import Series


class PCESeries(Series):
    def __init__(self, start_date, end_date):
        # FRED series_id "PCE" = Personal Consumption Expenditures, Billions USD, Monthly, Not Seasonally Adjusted by default
        # Keep frequency monthly and linear units to match other series
        super().__init__(series_id="PCE", start_date=start_date, end_date=end_date, frequency="m", units="lin")
    

