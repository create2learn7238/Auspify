import os
from server import app

if __name__ == '__main__':
    listen_port = int(os.environ.get('PORT', 5004))
    print(f"Content Segmentation backend spinning up on port {listen_port}...")
    app.run(host='0.0.0.0', port=listen_port, debug=False, use_reloader=False)
