import os
import pandas as pd
from flask import Blueprint, current_app, jsonify, request
from werkzeug.utils import secure_filename

from ml.clustering import clustering_service
from services.data_service import data_service

api_bp = Blueprint('api', __name__)


@api_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'Netflix Content Segmentation API'})


@api_bp.route('/dataset/info', methods=['GET'])
@api_bp.route('/dataset', methods=['GET'])
def get_dataset_info():
    catalog_meta = data_service.get_dataset_info()
    if 'error' in catalog_meta:
        return jsonify(catalog_meta), 400
    return jsonify(catalog_meta)


@api_bp.route('/dataset/features', methods=['GET'])
def get_dataset_features():
    feat_meta = data_service.get_features_info()
    if 'error' in feat_meta:
        return jsonify(feat_meta), 400
    return jsonify(feat_meta)


@api_bp.route('/dataset/data', methods=['GET'])
def get_dataset_data():
    page_num = int(request.args.get('page', 1))
    page_size = int(request.args.get('limit', 50))
    query_str = request.args.get('search', '')
    sort_column = request.args.get('sort_by', None)
    descending = request.args.get('sort_desc', 'false').lower() == 'true'

    paged_result = data_service.get_paginated_data(page_num, page_size, query_str, sort_column, descending)
    if 'error' in paged_result:
        return jsonify(paged_result), 400
    return jsonify(paged_result)


@api_bp.route('/dataset/upload', methods=['POST'])
def upload_dataset():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in request'}), 400

    uploaded_file = request.files['file']
    if not uploaded_file.filename or not uploaded_file.filename.endswith('.csv'):
        return jsonify({'error': 'Only .csv files are supported'}), 400

    safe_name = secure_filename(uploaded_file.filename)
    dest_dir = current_app.config['UPLOAD_FOLDER']
    os.makedirs(dest_dir, exist_ok=True)

    staged_path = os.path.join(dest_dir, f'tmp_{safe_name}')
    uploaded_file.save(staged_path)

    try:
        sample_head = pd.read_csv(staged_path, nrows=100)
        if sample_head.empty or len(sample_head) < 5:
            os.remove(staged_path)
            return jsonify({'error': 'Dataset has insufficient rows for clustering'}), 400

        # verify catalog contains recognizable netflix metadata columns
        expected_keys = {'title', 'type', 'director', 'cast', 'country', 'date_added', 'release_year', 'rating', 'duration', 'listed_in', 'description'}
        present_keys = set(sample_head.columns.str.lower())
        if len(expected_keys.intersection(present_keys)) < 2:
            os.remove(staged_path)
            return jsonify({'error': 'Uploaded file lacks recognizable Netflix content columns'}), 400

        line_count = sum(1 for _ in open(staged_path, 'r', encoding='utf-8', errors='ignore')) - 1

        return jsonify({
            'message': 'File validated',
            'preview': {
                'filename': safe_name,
                'tmp_path': staged_path,
                'rows': line_count,
                'columns': len(sample_head.columns),
                'missing_values': int(sample_head.isnull().sum().sum()),
                'duplicates': int(sample_head.duplicated().sum()),
                'data': sample_head.head(5).fillna('').to_dict(orient='records')
            }
        })
    except Exception as read_err:
        if os.path.exists(staged_path):
            os.remove(staged_path)
        return jsonify({'error': f'Failed to process file: {str(read_err)}'}), 400


@api_bp.route('/dataset/confirm', methods=['POST'])
def confirm_dataset():
    payload = request.get_json(silent=True) or {}
    staged_path = payload.get('tmp_path')

    if not staged_path or not os.path.exists(staged_path):
        return jsonify({'error': 'Staged file not found on disk'}), 400

    permanent_path = staged_path.replace('tmp_', '')
    os.rename(staged_path, permanent_path)

    loaded, status_msg = data_service.load_dataset(permanent_path)
    if not loaded:
        return jsonify({'error': status_msg}), 400

    clustering_service.last_results = None
    return jsonify({'message': 'Dataset activated', 'info': data_service.get_dataset_info()})


@api_bp.route('/dataset/reset', methods=['POST'])
def reset_dataset():
    reverted, status_msg = data_service.reset_to_default()
    if not reverted:
        return jsonify({'error': status_msg}), 500

    clustering_service.last_results = None
    return jsonify({'message': 'Restored default catalog'})


@api_bp.route('/cluster', methods=['POST'])
def run_cluster():
    body = request.get_json(silent=True) or {}
    k_clusters = int(body.get('n_clusters', 4))

    active_df = data_service.get_dataframe()
    if active_df is None:
        return jsonify({'error': 'No catalog loaded'}), 400

    cluster_output = clustering_service.perform_clustering(active_df, k_clusters)
    if 'error' in cluster_output:
        return jsonify(cluster_output), 400

    return jsonify(cluster_output)


@api_bp.route('/clusters', methods=['GET'])
def get_clusters():
    if clustering_service.last_results:
        return jsonify(clustering_service.last_results)

    active_df = data_service.get_dataframe()
    if active_df is not None:
        fallback_res = clustering_service.perform_clustering(active_df, 4)
        if 'error' not in fallback_res:
            return jsonify(fallback_res)

    return jsonify({'error': 'No active clustering results available'}), 404


@api_bp.route('/clusters/<int:cluster_id>', methods=['GET'])
def get_cluster_details(cluster_id):
    if not clustering_service.last_results:
        return jsonify({'error': 'Run clustering before inspecting details'}), 404

    profile_list = clustering_service.last_results.get('profiles', [])
    for p in profile_list:
        if p.get('cluster_id') == cluster_id:
            anchors = [
                t for t in clustering_service.last_results.get('representative_titles', [])
                if t.get('cluster_id') == cluster_id
            ]
            return jsonify({'profile': p, 'representative_titles': anchors})

    return jsonify({'error': f'Cluster {cluster_id} not found'}), 404


@api_bp.route('/k-analysis', methods=['GET'])
def get_k_analysis():
    if not clustering_service.last_results:
        return jsonify({'error': 'No clustering run found'}), 404

    return jsonify({'k_evaluations': clustering_service.last_results.get('k_evaluations', [])})


@api_bp.route('/statistics', methods=['GET'])
def get_statistics():
    meta = data_service.get_dataset_info()
    if 'error' in meta:
        return jsonify(meta), 400

    payload = {
        'dataset_info': meta,
        'features': data_service.get_features_info()
    }
    if clustering_service.last_results:
        payload['cleaning_stats'] = clustering_service.last_results.get('cleaning_stats', {})
        payload['metrics'] = clustering_service.last_results.get('metrics', {})

    return jsonify(payload)


@api_bp.route('/export/dataset', methods=['GET'])
def export_dataset():
    if not clustering_service.last_results or clustering_service.clustered_df is None:
        return jsonify({'error': 'No clustered dataset available'}), 404

    csv_payload = clustering_service.clustered_df.to_csv(index=False)
    return csv_payload, 200, {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=clustered_dataset.csv'
    }


@api_bp.route('/export/summary', methods=['GET'])
def export_summary():
    if not clustering_service.last_results:
        return jsonify({'error': 'No results available'}), 404

    profiles = clustering_service.last_results.get('profiles', [])
    if not profiles:
        return jsonify({'error': 'No profiles found'}), 404

    summary_rows = []
    for p in profiles:
        top_g = list(p.get('top_genres', {}).keys())[0] if p.get('top_genres') else 'Unknown'
        top_c = list(p.get('top_countries', {}).keys())[0] if p.get('top_countries') else 'Unknown'
        summary_rows.append({
            'Cluster ID': p['cluster_id'],
            'Size': p['size'],
            'Percentage': p['percentage'],
            'Movie %': p['movie_percentage'],
            'TV %': p['tv_percentage'],
            'Median Year': p['median_release_year'],
            'Top Genre': top_g,
            'Top Country': top_c
        })

    csv_data = pd.DataFrame(summary_rows).to_csv(index=False)
    return csv_data, 200, {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=cluster_summary.csv'
    }
