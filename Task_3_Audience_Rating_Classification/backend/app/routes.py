import os
from flask import Blueprint, jsonify, request, send_from_directory

from app.services.data_utils import (
    get_analytics_data,
    get_dashboard_stats,
    get_feature_importance,
    get_form_options,
    get_model_comparison_data,
)
from app.services.model_loader import model_loader

api_blueprint = Blueprint('api', __name__)


@api_blueprint.route('/api/predict', methods=['POST'])
def api_predict():
    user_payload = request.get_json(silent=True) or {}
    if not user_payload:
        return jsonify({'success': False, 'error': 'Missing input payload'}), 400

    pred_res = model_loader.predict(user_payload)
    if 'error' in pred_res:
        return jsonify({'success': False, 'error': pred_res['error']}), 400

    return jsonify({'success': True, 'data': pred_res})


@api_blueprint.route('/api/dashboard_stats')
def api_dashboard_stats():
    return jsonify(get_dashboard_stats())


@api_blueprint.route('/api/analytics_data')
def api_analytics_data():
    return jsonify(get_analytics_data())


@api_blueprint.route('/api/model_comparison')
def api_model_comparison():
    return jsonify(get_model_comparison_data())


@api_blueprint.route('/api/feature_importance')
def api_feature_importance():
    return jsonify(get_feature_importance())


@api_blueprint.route('/api/form_options')
def api_form_options():
    return jsonify(get_form_options())


@api_blueprint.route('/outputs/plots/<path:filename>')
def serve_plots(filename):
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    chart_folder = os.path.join(root_dir, 'outputs', 'plots')
    return send_from_directory(chart_folder, filename)
