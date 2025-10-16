from backend.series.base_series import Series

class GDPSeries(Series):
    def __init__(self, start_date, end_date):
        super().__init__(series_id="GDP", start_date=start_date, end_date=end_date, frequency="q", units="lin")
    