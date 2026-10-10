import logging
import os
import random
from datetime import datetime, timedelta

import lightgbm as lgb
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.model_selection import TimeSeriesSplit

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def generate_mock_netflix_data(dest_path: str, sample_size: int = 2000) -> None:
    if os.path.exists(dest_path):
        return

    media_types = ['Movie', 'TV Show']
    genre_choices = ['Comedies', 'Dramas', 'Action & Adventure', 'Documentaries', 'International TV Shows']
    country_choices = ['United States', 'India', 'United Kingdom', 'Japan', 'South Korea']
    
    origin_dt = datetime(2018, 1, 1)
    mock_rows = []

    for idx in range(sample_size):
        offset_days = random.randint(0, 1800)
        date_str = (origin_dt + timedelta(days=offset_days)).strftime('%B %d, %Y')
        if random.random() < 0.02:
            date_str = np.nan

        g1 = random.choice(genre_choices)
        g2 = random.choice(genre_choices)
        tag_str = f'{g1}, {g2}' if g1 != g2 else g1

        mock_rows.append({
            'type': random.choice(media_types),
            'title': f'Title {idx}',
            'country': random.choice(country_choices),
            'date_added': date_str,
            'release_year': random.randint(2000, 2023),
            'rating': random.choice(['TV-MA', 'TV-14', 'R', 'PG-13']),
            'listed_in': tag_str
        })

    pd.DataFrame(mock_rows).to_csv(dest_path, index=False)


class NetflixTrendForecaster:
    def __init__(self, target_col: str = 'release_count'):
        self.target_col = target_col
        self.model = None
        self.features = []
        self.categorical_features = ['type', 'primary_genre']

    def _drop_missing_dates(self, raw_catalog: pd.DataFrame) -> pd.DataFrame:
        bad_dates = raw_catalog['date_added'].isna().sum()
        if bad_dates > 0:
            return raw_catalog.dropna(subset=['date_added']).copy()
        return raw_catalog

    def prep_time_features(self, catalog: pd.DataFrame) -> pd.DataFrame:
        # drop records where date_added is missing
        catalog = self._drop_missing_dates(catalog)

        catalog['date_added'] = pd.to_datetime(catalog['date_added'].str.strip(), errors='coerce')
        catalog = catalog.dropna(subset=['date_added']).copy()

        catalog['primary_genre'] = catalog['listed_in'].apply(lambda x: str(x).split(',')[0].strip())
        catalog['month_start'] = catalog['date_added'].dt.to_period('M').dt.to_timestamp()

        # group monthly additions by type and primary genre
        monthly_tally = catalog.groupby(['month_start', 'type', 'primary_genre']).size().reset_index(name=self.target_col)

        # build continuous grid so months with zero releases are explicitly captured
        date_span = pd.date_range(start=monthly_tally['month_start'].min(), end=monthly_tally['month_start'].max(), freq='MS')
        type_categories = monthly_tally['type'].unique()
        genre_categories = monthly_tally['primary_genre'].unique()

        grid_idx = pd.MultiIndex.from_product(
            [date_span, type_categories, genre_categories],
            names=['month_start', 'type', 'primary_genre']
        )
        full_grid = pd.DataFrame(index=grid_idx).reset_index()

        # left join and zero-fill gaps
        merged_timeline = pd.merge(full_grid, monthly_tally, on=['month_start', 'type', 'primary_genre'], how='left')
        merged_timeline[self.target_col] = merged_timeline[self.target_col].fillna(0).astype(int)

        merged_timeline['year'] = merged_timeline['month_start'].dt.year
        merged_timeline['month'] = merged_timeline['month_start'].dt.month
        merged_timeline['quarter'] = merged_timeline['month_start'].dt.quarter

        return merged_timeline.sort_values(by=['month_start', 'type', 'primary_genre']).reset_index(drop=True)

    def add_lag_features(self, timeline_df: pd.DataFrame) -> pd.DataFrame:
        work_df = timeline_df.copy()
        work_df = work_df.sort_values(by=['type', 'primary_genre', 'month_start'])

        # autoregressive lags: 1 month, 1 quarter, 1 year
        grouped_target = work_df.groupby(['type', 'primary_genre'])[self.target_col]
        work_df['lag_1'] = grouped_target.shift(1)
        work_df['lag_3'] = grouped_target.shift(3)
        work_df['lag_12'] = grouped_target.shift(12)

        # 3-month rolling mean to smooth volatility
        work_df['rolling_mean_3'] = work_df.groupby(['type', 'primary_genre'])['lag_1'].transform(
            lambda s: s.rolling(window=3, min_periods=1).mean()
        )

        for cat_col in self.categorical_features:
            work_df[cat_col] = work_df[cat_col].astype('category')

        # drop leading rows that have NaN from lag shifts
        clean_df = work_df.dropna().reset_index(drop=True)
        self.features = ['year', 'month', 'quarter', 'lag_1', 'lag_3', 'lag_12', 'rolling_mean_3'] + self.categorical_features
        return clean_df

    def fit_and_score(self, feature_df: pd.DataFrame):
        X = feature_df[self.features]
        y = feature_df[self.target_col]

        # time series split prevents future leakage
        tscv = TimeSeriesSplit(n_splits=3)
        mae_log, rmse_log = [], []

        lgb_params = {
            'objective': 'regression',
            'metric': 'rmse',
            'learning_rate': 0.05,
            'n_estimators': 100,
            'random_state': 42,
            'verbose': -1
        }

        for tr_idx, te_idx in tscv.split(X):
            X_tr, X_te = X.iloc[tr_idx], X.iloc[te_idx]
            y_tr, y_te = y.iloc[tr_idx], y.iloc[te_idx]

            fold_model = lgb.LGBMRegressor(**lgb_params)
            fold_model.fit(X_tr, y_tr, categorical_feature=self.categorical_features)

            preds = np.clip(fold_model.predict(X_te), 0, None)
            mae_log.append(mean_absolute_error(y_te, preds))
            rmse_log.append(np.sqrt(mean_squared_error(y_te, preds)))

        # train production estimator across complete timeline
        self.model = lgb.LGBMRegressor(**lgb_params)
        self.model.fit(X, y, categorical_feature=self.categorical_features)

        return {
            'cv_mae': round(float(np.mean(mae_log)), 4),
            'cv_rmse': round(float(np.mean(rmse_log)), 4)
        }

    def predict_horizon(self, history_df: pd.DataFrame, horizon_months: int = 3) -> pd.DataFrame:
        if self.model is None:
            raise ValueError("Model has not been fitted yet.")

        future_predictions = []
        unique_combos = history_df[['type', 'primary_genre']].drop_duplicates()

        for _, combo in unique_combos.iterrows():
            m_type = combo['type']
            m_genre = combo['primary_genre']

            sub_history = history_df[
                (history_df['type'] == m_type) & (history_df['primary_genre'] == m_genre)
            ].sort_values('month_start').copy()

            if sub_history.empty:
                continue

            last_timestamp = sub_history['month_start'].iloc[-1]
            rolling_buffer = sub_history.copy()

            # step-by-step autoregressive projection
            for step_idx in range(1, horizon_months + 1):
                target_month = last_timestamp + pd.DateOffset(months=step_idx)

                # calculate lags from rolling buffer
                lag1 = rolling_buffer[self.target_col].iloc[-1] if len(rolling_buffer) >= 1 else 0
                lag3 = rolling_buffer[self.target_col].iloc[-3] if len(rolling_buffer) >= 3 else 0
                lag12 = rolling_buffer[self.target_col].iloc[-12] if len(rolling_buffer) >= 12 else 0
                roll3 = rolling_buffer[self.target_col].iloc[-3:].mean() if len(rolling_buffer) >= 3 else lag1

                sample_dict = {
                    'year': target_month.year,
                    'month': target_month.month,
                    'quarter': target_month.quarter,
                    'lag_1': lag1,
                    'lag_3': lag3,
                    'lag_12': lag12,
                    'rolling_mean_3': roll3,
                    'type': m_type,
                    'primary_genre': m_genre
                }
                feat_row = pd.DataFrame([sample_dict])
                for col_name in self.categorical_features:
                    feat_row[col_name] = feat_row[col_name].astype('category')

                pred_val = max(0.0, float(self.model.predict(feat_row[self.features])[0]))

                step_record = feat_row.copy()
                step_record['month_start'] = target_month
                step_record[self.target_col] = pred_val

                rolling_buffer = pd.concat([rolling_buffer, step_record], ignore_index=True)
                future_predictions.append(step_record)

        if not future_predictions:
            return pd.DataFrame(columns=['month_start', 'type', 'primary_genre', self.target_col])

        out_df = pd.concat(future_predictions, ignore_index=True)
        return out_df[['month_start', 'type', 'primary_genre', self.target_col]]

    # backward-compatible method aliases for external scripts
    step_1_prepare_time_based_features = prep_time_features
    step_2_feature_engineering = add_lag_features
    step_3_build_and_evaluate_models = fit_and_score
    step_4_forecast_future = predict_horizon


def run_advanced_pipeline(data_path, horizon=3):
    catalog_df = pd.read_csv(data_path)
    forecaster = NetflixTrendForecaster(target_col='release_count')

    time_series_df = forecaster.prep_time_features(catalog_df)
    features_df = forecaster.add_lag_features(time_series_df)

    # aggregate monthly historicals for chart
    hist_tally = time_series_df.groupby('month_start')['release_count'].sum().reset_index()
    historical_points = [
        {'date': r['month_start'].strftime('%Y-%m'), 'count': int(r['release_count'])}
        for _, r in hist_tally.iterrows()
    ]

    metric_summary = forecaster.fit_and_score(features_df)
    forecast_df = forecaster.predict_horizon(features_df, horizon_months=horizon)

    # format table rows
    detailed_table = [
        {
            'date': r['month_start'].strftime('%Y-%m'),
            'type': r['type'],
            'genre': r['primary_genre'],
            'count': round(float(r['release_count']), 2)
        }
        for _, r in forecast_df.iterrows()
    ]

    # aggregate forecast points for main chart
    future_tally = forecast_df.groupby('month_start')['release_count'].sum().reset_index()
    forecast_points = [
        {'date': r['month_start'].strftime('%Y-%m'), 'count': int(r['release_count'])}
        for _, r in future_tally.iterrows()
    ]

    return {
        'historical': historical_points,
        'forecast': forecast_points,
        'metrics': metric_summary,
        'detailed_forecast': detailed_table
    }
