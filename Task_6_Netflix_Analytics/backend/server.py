import os
import warnings
import json
import numpy as np
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS

warnings.filterwarnings('ignore')

from ml_pipeline import NetflixMLPipeline

app = Flask(__name__)
CORS(app)

# load the raw catalog on server boot
curr_dir = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(os.path.dirname(curr_dir), 'Dataset.csv')

pipeline = NetflixMLPipeline(csv_path)
pipeline.load_and_engineer()


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'records': len(pipeline.df)})


@app.route('/api/overview', methods=['GET'])
def overview():
    catalog = pipeline.df
    total_titles = len(catalog)

    # quick breakdown of catalog splits
    film_count = int((catalog['type'] == 'Movie').sum())
    show_count = int((catalog['type'] == 'TV Show').sum())
    uniq_countries = int(catalog['country'].nunique())
    uniq_directors = int(catalog['director'].dropna().nunique())
    uniq_genres = int(catalog['listed_in'].nunique())

    # min/max release year for filters
    yr_min = int(catalog['release_year'].min())
    yr_max = int(catalog['release_year'].max())

    return jsonify({
        'total': total_titles,
        'movies': film_count,
        'shows': show_count,
        'countries': uniq_countries,
        'directors': uniq_directors,
        'genres': uniq_genres,
        'year_range': [yr_min, yr_max]
    })


@app.route('/api/content-distribution', methods=['GET'])
def content_distribution():
    catalog = pipeline.df
    type_counts = catalog['type'].value_counts().to_dict()
    return jsonify({'data': type_counts})


@app.route('/api/yearly-trend', methods=['GET'])
def yearly_trend():
    catalog = pipeline.df

    # filter down to modern era (2000+) so charts don't look sparse
    grouped = catalog[catalog['release_year'] >= 2000].groupby(['release_year', 'type']).size().reset_index(name='total')
    
    trend_map = {}
    for media_type in ['Movie', 'TV Show']:
        slice_df = grouped[grouped['type'] == media_type]
        trend_map[media_type] = {
            'years': slice_df['release_year'].tolist(),
            'counts': slice_df['total'].tolist()
        }

    return jsonify({'data': trend_map})


@app.route('/api/top-countries', methods=['GET'])
def top_countries():
    catalog = pipeline.df
    top_origin = catalog['country'].value_counts().head(15)
    return jsonify({
        'countries': top_origin.index.tolist(),
        'counts': top_origin.values.tolist()
    })


@app.route('/api/ratings-distribution', methods=['GET'])
def ratings_distribution():
    catalog = pipeline.df
    ratings_tally = catalog['rating'].value_counts().head(12)
    return jsonify({
        'ratings': ratings_tally.index.tolist(),
        'counts': ratings_tally.values.tolist()
    })


@app.route('/api/genre-analysis', methods=['GET'])
def genre_analysis():
    catalog = pipeline.df
    # split comma-separated genres and flatten
    exploded = catalog['listed_in'].dropna().str.split(',').explode().str.strip()
    top_tags = exploded.value_counts().head(15)
    return jsonify({
        'genres': top_tags.index.tolist(),
        'counts': top_tags.values.tolist()
    })


@app.route('/api/duration-analysis', methods=['GET'])
def duration_analysis():
    catalog = pipeline.df
    movie_lens = catalog[catalog['type'] == 'Movie']['duration_minutes'].dropna()
    show_seasons = catalog[catalog['type'] == 'TV Show']['duration_seasons'].dropna()

    m_hist, m_edges = np.histogram(movie_lens, bins=20)
    
    # integer bins for tv show seasons
    max_s = int(show_seasons.max()) if len(show_seasons) else 10
    s_hist, s_edges = np.histogram(show_seasons, bins=range(1, max_s + 2))

    return jsonify({
        'movie_bins': m_edges[:-1].tolist(),
        'movie_counts': m_hist.tolist(),
        'movie_avg': round(float(movie_lens.mean()), 1),
        'show_bins': s_edges[:-1].tolist(),
        'show_counts': s_hist.tolist(),
        'show_avg': round(float(show_seasons.mean()), 2)
    })


@app.route('/api/monthly-additions', methods=['GET'])
def monthly_additions():
    catalog = pipeline.df
    valid_dates = catalog.dropna(subset=['date_added']).copy()

    # convert to monthly buckets
    valid_dates['month_str'] = pd.to_datetime(valid_dates['date_added'], errors='coerce').dt.to_period('M')
    valid_dates = valid_dates.dropna(subset=['month_str'])

    tally = valid_dates.groupby('month_str').size().reset_index(name='count')
    tally['month_str'] = tally['month_str'].astype(str)

    # slice down to last 3 years
    recent_36 = tally.tail(36)
    return jsonify({
        'months': recent_36['month_str'].tolist(),
        'counts': recent_36['count'].tolist()
    })


@app.route('/api/ml/train', methods=['POST'])
def train_models():
    # triggers full benchmark run across algorithms
    benchmark_res = pipeline.train_models()
    return jsonify(benchmark_res)


@app.route('/api/ml/feature-importance', methods=['GET'])
def feature_importance():
    if not pipeline.trained:
        pipeline.train_models()
    imp_scores = pipeline.get_feature_importance()
    return jsonify(imp_scores)


@app.route('/api/ml/confusion-matrix', methods=['GET'])
def confusion_matrix_data():
    if not pipeline.trained:
        pipeline.train_models()
    target_algo = request.args.get('model', 'Random Forest')
    cm_payload = pipeline.get_confusion_matrix(target_algo)
    return jsonify(cm_payload)


@app.route('/api/ml/predict', methods=['POST'])
def predict():
    body = request.get_json()
    if not body:
        return jsonify({'error': 'no payload provided'}), 400

    out = pipeline.predict_single(body)
    return jsonify(out)


@app.route('/api/insights', methods=['GET'])
def get_insights():
    findings = pipeline.generate_insights()
    return jsonify({'insights': findings})


@app.route('/api/top-directors', methods=['GET'])
def top_directors():
    catalog = pipeline.df
    lead_directors = catalog['director'].dropna().value_counts().head(10)
    return jsonify({
        'directors': lead_directors.index.tolist(),
        'counts': lead_directors.values.tolist()
    })


@app.route('/api/heatmap', methods=['GET'])
def heatmap():
    catalog = pipeline.df
    clean_sub = catalog[['country', 'listed_in']].dropna().copy()
    
    # explode genres to calculate country x genre co-occurrence
    clean_sub['genre'] = clean_sub['listed_in'].str.split(',')
    clean_sub = clean_sub.explode('genre')
    clean_sub['genre'] = clean_sub['genre'].str.strip()

    top_8_countries = catalog['country'].value_counts().head(8).index
    top_8_genres = clean_sub['genre'].value_counts().head(8).index

    filtered = clean_sub[
        clean_sub['country'].isin(top_8_countries) & clean_sub['genre'].isin(top_8_genres)
    ]
    grid_pivot = filtered.groupby(['country', 'genre']).size().unstack(fill_value=0)

    return jsonify({
        'countries': grid_pivot.index.tolist(),
        'genres': grid_pivot.columns.tolist(),
        'values': grid_pivot.values.tolist()
    })


if __name__ == '__main__':
    # run backend on dedicated port
    app.run(debug=True, port=5006)
