from backend.series.base_series import Series


class T10Y3MSeries(Series):
    def __init__(self, start_date, end_date):
        # FRED series_id "T10Y3M" = 10-Year Treasury minus 3-Month Treasury spread (daily)
        # Use daily frequency to capture yield curve inversions precisely
        super().__init__(series_id="T10Y3M", start_date=start_date, end_date=end_date, frequency="d", units="lin")


