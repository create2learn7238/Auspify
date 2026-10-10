# Task 6: Netflix Content Analytics and ML Pipeline

A full-stack data analytics and machine learning project for exploring the Netflix catalog dataset, benchmarking multiple classification algorithms, and running predictions on content attributes.

## Project Structure

```text
Task_6_Netflix_Analytics/
├── Dataset.csv              # Netflix catalog records (~8,800 titles)
├── backend/
│   ├── server.py            # Flask REST API endpoints
│   ├── ml_pipeline.py       # Data cleaning, feature engineering, and model training
│   └── requirements.txt     # Python package requirements
└── frontend/
    ├── src/
    │   ├── App.jsx           # Application shell & page routing
    │   ├── api.js            # Axios backend client
    │   ├── index.css         # Layout, charts, and responsive styling
    │   └── pages/
    │       ├── Dashboard.jsx # Visual catalog distribution charts
    │       ├── MLModels.jsx  # Multi-model training and evaluation
    │       ├── Insights.jsx  # Catalog summary metrics
    │       └── Predict.jsx   # Live prediction form
    ├── package.json
    └── vite.config.js
```

## Setup and Installation

### 1. Backend Setup
Make sure Python 3.9+ is installed. Open a terminal in the `backend` folder:

```bash
cd backend
pip install -r requirements.txt
python server.py
```
The Flask API server will start on `http://127.0.0.1:5006`.

### 2. Frontend Setup
Open a second terminal in the `frontend` folder:

```bash
cd frontend
npm install
npm run dev -- --port 5176
```
The user interface will be accessible at `http://localhost:5176`.

## Machine Learning Methodology

1. **Feature Engineering:**
   - Handled missing values across text fields (`director`, `country`, `cast`, `rating`).
   - Parsed release year and date added to compute the lag (in years) between initial premiere and Netflix addition.
   - Converted duration into separate numeric fields: runtime minutes for movies, season counts for TV shows.
   - Built binary indicators for major genres and frequency encodings for top countries.

2. **Model Evaluation:**
   - Evaluated 5 different algorithms using 5-fold stratified cross-validation:
     - Random Forest Classifier (150 estimators, max depth 12)
     - Gradient Boosting Classifier (100 estimators)
     - Logistic Regression (L2 penalty)
     - Support Vector Classifier (RBF kernel)
     - K-Nearest Neighbors (k=7)
   - Tracked accuracy, precision, recall, and F1 scores across training and test splits.

3. **Dashboard Views:**
   - **Catalog Overview:** Visual breakdown of movie vs. TV show splits, country production volumes, and release timeline trends.
   - **Model Benchmark:** Side-by-side performance comparison charts, feature importance scores, and confusion matrix views.
   - **Prediction Interface:** Form allowing custom input (release year, genre count, duration, country) to generate probability distributions across content types.
