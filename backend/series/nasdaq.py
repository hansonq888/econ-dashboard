from backend.series.base_series import Series

class NASDAQSeries(Series):
    def __init__(self, start_date, end_date):
        # NASDAQ Composite Index (NASDAQCOM) - daily frequency to match existing cache
        super().__init__(series_id="NASDAQCOM", start_date=start_date, end_date=end_date, frequency="d", units="lin")

