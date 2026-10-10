# Task 4: Netflix Content Segmentation

A machine learning project that groups Netflix titles using K-Means clustering and PCA (Principal Component Analysis) to discover organic clusters of similar programming.

## Project Structure

```text
Task_4_Netflix_Content_Segmentation/
├── backend/
│   ├── server.py             # Flask API and clustering logic
│   └── requirements.txt      # Python dependencies
├── frontend-react/
│   ├── src/                  # React dashboard components
│   └── package.json          # Frontend dependencies
└── README.md
```

## Setup and Running

### 1. Backend Setup
Open a terminal in the `backend` folder:

```bash
cd backend
pip install -r requirements.txt
python server.py
```
*Backend runs on http://localhost:5004*

### 2. Frontend Setup
Open a second terminal in the `frontend-react` folder:

```bash
cd frontend-react
npm install
npm run dev -- --port 5174
```
*Frontend runs on http://localhost:5174*

## Methodology

1. **Feature Extraction:** Encoded release years, runtimes, binary genre presence flags, and country codes into a combined numeric feature vector.
2. **Feature Scaling:** Standardized features using StandardScaler so features with wider ranges do not dominate distance calculations.
3. **K-Means Clustering:** Applied K-Means with cluster selection (k=3 to 8).
4. **PCA Projection:** Used Principal Component Analysis to reduce feature space to 2 principal components for 2D scatter visualization.
5. **Cluster Characterization:** Calculated cluster centroids and summaries (top genres, dominant countries, average duration) to explain cluster definitions.
