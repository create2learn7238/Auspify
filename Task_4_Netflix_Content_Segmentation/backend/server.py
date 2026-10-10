import os
from flask import Flask, jsonify
from flask_cors import CORS
from routes.api import api_bp

app = Flask(__name__)
CORS(app)

# keep uploaded CSVs inside uploads/ folder
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # cap uploads at 16mb

app.register_blueprint(api_bp, url_prefix='/api')

@app.errorhandler(404)
def handle_404(_):
    return jsonify({"error": "Route not found"}), 404

@app.errorhandler(500)
def handle_500(err):
    return jsonify({"error": f"Server crashed: {str(err)}"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5004))
    app.run(host='0.0.0.0', port=port, debug=True)
