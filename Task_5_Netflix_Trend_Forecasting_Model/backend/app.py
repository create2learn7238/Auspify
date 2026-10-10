import os
import traceback
from flask import Flask, jsonify, request
from flask_cors import CORS
from advanced_model import run_advanced_pipeline

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# default dataset sits one level up in task root
DEFAULT_CSV = os.path.join(BASE_DIR, '..', 'Dataset.csv')

@app.route('/api/forecast', methods=['GET'])
def get_forecast():
    try:
        horizon_months = request.args.get('horizon', default=3, type=int)
        payload = run_advanced_pipeline(DEFAULT_CSV, horizon=horizon_months)
        return jsonify(payload)
    except Exception as err:
        return jsonify({"error": str(err), "trace": traceback.format_exc()}), 500

@app.route('/api/upload', methods=['POST'])
def handle_csv_upload():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    uploaded = request.files['file']
    if not uploaded.filename:
        return jsonify({"error": "Empty filename"}), 400
        
    dest_path = os.path.join(BASE_DIR, '..', 'uploaded_dataset.csv')
    uploaded.save(dest_path)
    
    try:
        horizon_months = request.form.get('horizon', default=3, type=int)
        payload = run_advanced_pipeline(dest_path, horizon=horizon_months)
        return jsonify(payload)
    except Exception as err:
        return jsonify({"error": str(err), "trace": traceback.format_exc()}), 500

if __name__ == '__main__':
    listen_port = int(os.environ.get('PORT', 5005))
    app.run(host='0.0.0.0', port=listen_port, debug=True)
