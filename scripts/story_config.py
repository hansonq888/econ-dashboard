"""
Story configuration - defines metadata and data requirements for each story
"""
from backend.series.unemployment import UnemploymentSeries
from backend.series.gdp import GDPSeries
from backend.series.fed_funds import FedFundsSeries
from backend.series.cpi import CPISeries
from backend.series.nasdaq import NASDAQSeries

# Story configurations
STORIES = {
    "dotcom": {
        "title": "Dot-Com Bubble",
        "subtitle": "The Rise and Fall of the Internet Economy: 1995-2004",
        "timeFrames": [
            {
                "id": "pre-bubble",
                "title": "Pre-Bubble (1995-1997)",
                "date": "1995-1997",
                "description": "The foundation of the internet boom. Early internet companies emerge, and investors begin to see the potential of the World Wide Web.",
                "events": [
                    "Netscape IPO in 1995 - first major internet company to go public",
                    "Amazon and eBay launch, showing e-commerce potential",
                    "Internet usage grows from 16 million to 70 million users"
                ],
                "startDate": "1995-01-01",
                "endDate": "1997-12-31",
                "series": {
                    "unemployment": {"class": UnemploymentSeries, "frequency": "m"},
                    "gdp": {"class": GDPSeries, "frequency": "q"},
                    "fedfunds": {"class": FedFundsSeries, "frequency": "m"}
                }
            },
            {
                "id": "bubble-growth",
                "title": "Bubble Growth (1998-1999)",
                "date": "1998-1999",
                "description": "The dot-com bubble reaches its peak. Massive investments pour into internet companies, many with no profits or even revenue. Stock prices soar to unsustainable levels.",
                "events": [
                    "Google founded in 1998",
                    "Yahoo! stock price increases 1,000%",
                    "NASDAQ Composite Index rises from 1,500 to over 5,000",
                    "Venture capital investments triple"
                ],
                "startDate": "1998-01-01",
                "endDate": "1999-12-31",
                "series": {
                    "unemployment": {"class": UnemploymentSeries, "frequency": "m"},
                    "gdp": {"class": GDPSeries, "frequency": "q"},
                    "fedfunds": {"class": FedFundsSeries, "frequency": "m"}
                }
            },
            {
                "id": "peak",
                "title": "The Peak (2000)",
                "date": "2000",
                "description": "The bubble reaches its absolute peak in March 2000. NASDAQ hits an all-time high of 5,048.62. Warning signs begin to appear as some companies fail to meet expectations.",
                "events": [
                    "NASDAQ peaks at 5,048.62 on March 10, 2000",
                    "Federal Reserve raises interest rates to cool economy",
                    "First major dot-com failures begin (Pets.com, Webvan)",
                    "GDP growth remains strong but concerns mount"
                ],
                "startDate": "2000-01-01",
                "endDate": "2000-12-31",
                "series": {
                    "unemployment": {"class": UnemploymentSeries, "frequency": "m"},
                    "gdp": {"class": GDPSeries, "frequency": "q"},
                    "fedfunds": {"class": FedFundsSeries, "frequency": "m"}
                }
            },
            {
                "id": "burst",
                "title": "The Burst (2001-2002)",
                "date": "2001-2002",
                "description": "The bubble bursts. Stock prices collapse, hundreds of internet companies go bankrupt, and the economy enters a recession. Unemployment rises as the tech sector sheds jobs.",
                "events": [
                    "NASDAQ crashes, losing 78% of its value by October 2002",
                    "9/11 attacks further damage investor confidence",
                    "Enron scandal exposes corporate fraud",
                    "Unemployment rises from 4% to 6%",
                    "GDP growth turns negative"
                ],
                "startDate": "2001-01-01",
                "endDate": "2002-12-31",
                "series": {
                    "unemployment": {"class": UnemploymentSeries, "frequency": "m"},
                    "gdp": {"class": GDPSeries, "frequency": "q"},
                    "fedfunds": {"class": FedFundsSeries, "frequency": "m"}
                }
            },
            {
                "id": "recovery",
                "title": "Recovery (2003-2004)",
                "date": "2003-2004",
                "description": "The economy begins to recover. Surviving tech companies prove their business models. The Federal Reserve cuts rates to stimulate growth. The foundation is laid for the next tech boom.",
                "events": [
                    "Federal Reserve cuts rates to 1%",
                    "Surviving companies like Amazon and eBay prove profitable",
                    "GDP growth returns to positive territory",
                    "Unemployment begins to decline",
                    "Tech sector consolidation creates stronger companies"
                ],
                "startDate": "2003-01-01",
                "endDate": "2004-12-31",
                "series": {
                    "unemployment": {"class": UnemploymentSeries, "frequency": "m"},
                    "gdp": {"class": GDPSeries, "frequency": "q"},
                    "fedfunds": {"class": FedFundsSeries, "frequency": "m"}
                }
            }
        ],
        "fullPeriodSeries": {
            "nasdaq": {"class": NASDAQSeries, "frequency": "d", "startDate": "1995-01-01", "endDate": "2004-12-31"}
        }
    },
    "gfc": {
        "title": "2008 Financial Crisis",
        "subtitle": "The Great Recession: 2007-2009",
        "startDate": "2006-01-01",
        "endDate": "2012-12-31",
        "series": {
            "unemployment": {"class": UnemploymentSeries, "frequency": "m"},
            "cpi": {"class": CPISeries, "frequency": "m"},
            "fedfunds": {"class": FedFundsSeries, "frequency": "m"},
            "gdp": {"class": GDPSeries, "frequency": "q"}
        }
    },
    "volcker": {
        "title": "The Volcker Disinflation",
        "subtitle": "Breaking the Back of Inflation: 1979-1983",
        "startDate": "1977-01-01",
        "endDate": "1983-12-31",
        "series": {
            "unemployment": {"class": UnemploymentSeries, "frequency": "m"},
            "cpi": {"class": CPISeries, "frequency": "m"},
            "fedfunds": {"class": FedFundsSeries, "frequency": "m"},
            "gdp": {"class": GDPSeries, "frequency": "q"}
        }
    },
    "oil_shock": {
        "title": "1973 Oil Shock & Stagflation",
        "subtitle": "The End of the Post-War Boom: 1973-1979",
        "startDate": "1973-01-01",
        "endDate": "1979-12-31",
        "series": {
            "unemployment": {"class": UnemploymentSeries, "frequency": "m"},
            "cpi": {"class": CPISeries, "frequency": "m"},
            "fedfunds": {"class": FedFundsSeries, "frequency": "m"},
            "gdp": {"class": GDPSeries, "frequency": "q"}
        }
    }
}

