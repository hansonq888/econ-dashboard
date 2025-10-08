from series.base_series import Series

class FedFundsSeries(Series):
    def __init__(self, start_date, end_date):
        super().__init__(series_id="FEDFUNDS", start_date=start_date, end_date=end_date, frequency="m", units="lin")

    