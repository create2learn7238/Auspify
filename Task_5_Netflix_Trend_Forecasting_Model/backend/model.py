import pandas as pd
import numpy as np
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from sklearn.metrics import mean_absolute_error, mean_squared_error

def get_forecast_data(csv_file):
    raw_df = pd.read_csv(csv_file)
    
    # parse release dates and drop entries with missing dates
    parsed_dates = pd.to_datetime(raw_df['date_added'].astype(str).str.strip(), errors='coerce')
    valid_entries = raw_df.assign(cleaned_date=parsed_dates).dropna(subset=['cleaned_date'])
    
    # bucket by month
    monthly = (
        valid_entries
        .groupby(valid_entries['cleaned_date'].dt.to_period('M'))
        .size()
        .rename('releases')
    )
    
    monthly.index = monthly.index.to_timestamp()
    # fill gap months with 0
    timeline = monthly.asfreq('MS', fill_value=0)
    
    # netflix library ramped up around 2014, earlier years are mostly noise
    timeline = timeline[timeline.index >= '2014-01-01']
    if len(timeline) < 15:
        # not enough points for meaningful 12m holdout
        return {'historical': [], 'forecast': [], 'metrics': {'mae': 0.0, 'rmse': 0.0}}

    # reserve last 12 months for out-of-sample sanity check
    cutoff = len(timeline) - 12
    train_slice, test_slice = timeline.iloc[:cutoff], timeline.iloc[cutoff:]
    
    # baseline Holt's linear trend
    bench = ExponentialSmoothing(train_slice, trend='add', seasonal=None, initialization_method="estimated").fit()
    holdout_preds = bench.forecast(len(test_slice))
    
    val_mae = mean_absolute_error(test_slice, holdout_preds)
    val_rmse = np.sqrt(mean_squared_error(test_slice, holdout_preds))
    
    # refit on full series to project forward
    full_fit = ExponentialSmoothing(timeline, trend='add', seasonal=None, initialization_method="estimated").fit()
    projected = full_fit.forecast(12)
    
    history_records = [
        {'date': ts.strftime('%Y-%m'), 'count': int(val)}
        for ts, val in timeline.items()
    ]
    
    # floor negative projections at zero
    projected_records = [
        {'date': ts.strftime('%Y-%m'), 'count': max(0, int(round(val)))}
        for ts, val in projected.items()
    ]
    
    return {
        'historical': history_records,
        'forecast': projected_records,
        'metrics': {
            'mae': round(float(val_mae), 2),
            'rmse': round(float(val_rmse), 2)
        }
    }

if __name__ == "__main__":
    out = get_forecast_data("Dataset.csv")
    print(f"Historical months: {len(out['historical'])}, Projected: {len(out['forecast'])}")
    print(f"MAE: {out['metrics']['mae']} | RMSE: {out['metrics']['rmse']}")
