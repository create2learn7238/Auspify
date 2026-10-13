# Task 6 — Netflix Content Analytics Engine

> **Internship Task · Difficulty: Advanced**  
> Full-stack analytics platform combining EDA dashboards, 5-algorithm ML benchmarking, and a live prediction interface — all powered by the Netflix catalog dataset.

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.x-000000?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.x-F7931E?logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)

---

## 📑 Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup & Running](#setup--running)
- [ML Methodology](#ml-methodology)
- [Dashboard Features](#dashboard-features)
- [Results](#results)
- [REST API Reference](#rest-api-reference)

---

## Overview

Task 6 is the capstone of the internship suite — a complete **end-to-end analytics and ML benchmarking platform**. The system ingests the raw Netflix catalog, engineers 27 features, trains and evaluates 5 classification algorithms via cross-validation, and serves the results through a rich interactive React dashboard.

Key capabilities:
- **Exploratory Data Analysis** — Catalog distributions, production trends, genre heatmaps
- **Multi-Model Benchmark** — Side-by-side accuracy/precision/recall/F1 comparison
- **Confusion Matrix Viewer** — Selectable per-algorithm confusion matrices
- **Feature Importance** — Random Forest feature ranking
- **Live Prediction** — Custom input form with real-time probability output

**Ports:**
| Service | URL |
|---------|-----|
| Flask Backend | http://127.0.0.1:5006 |
| React Frontend | http://localhost:5176 |

---

## Project Structure

```text
Task_6_Netflix_Analytics/
├── Dataset.csv              # Netflix catalog records (~8,800 titles) — git-ignored
├── backend/
│   ├── server.py            # Flask REST API — all 16 endpoints
│   ├── ml_pipeline.py       # NetflixMLPipeline class:
│   │   │                    #   load_and_engineer() → train_models() → predict_single()
│   └── requirements.txt     # Python dependencies
└── frontend/
    ├── src/
    │   ├── App.jsx           # Application shell & React Router setup
    │   ├── api.js            # Centralised Axios API client
    │   ├── index.css         # Global layout, theming & responsive styles
    │   └── pages/
    │       ├── Dashboard.jsx # EDA charts: distribution, trends, genres, heatmap
    │       ├── MLModels.jsx  # Model training trigger & benchmark comparison
    │       ├── Insights.jsx  # Auto-generated catalog summary insights
    │       └── Predict.jsx   # Live prediction input form
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── start.bat             # Windows convenience launcher
```

---

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Python | 3.9+ (3.10+ recommended) |
| Node.js | 18+ |
| npm | 9+ |

The `Dataset.csv` must be present in the `Task_6_Netflix_Analytics/` root directory.
See the [root README](../README.md) for Kaggle download instructions.

---

## Setup & Running

### 1 — Backend

```bash
cd Task_6_Netflix_Analytics/backend
pip install -r requirements.txt
python server.py
```

The Flask API starts at **http://127.0.0.1:5006**

> **On startup**, the pipeline automatically runs `load_and_engineer()` and `train_rf_only()` (~10–20 seconds).
> Full benchmark training (`/api/ml/train`) runs all 5 models on demand from the UI.

### 2 — Frontend

Open a **second terminal**:

```bash
cd Task_6_Netflix_Analytics/frontend
npm install
npm run dev -- --port 5176
```

The React app is available at **http://localhost:5176**

### Windows Batch Launcher

```bat
start.bat
```

---

## ML Methodology

### 1. Feature Engineering (`ml_pipeline.py`)

27 features are engineered from raw catalog metadata:

| Category | Features |
|----------|---------|
| **Temporal** | `release_year`, `year_added`, `month_added`, `release_to_add_lag` |
| **Runtime** | `duration_minutes` (Movies), `duration_seasons` (TV Shows) |
| **Content** | `is_movie` binary flag |
| **Cast & Crew** | `cast_size`, `director_title_count` |
| **Genre flags** | Binary indicators for top 15 genres |
| **Country** | Frequency-encoded top 10 country codes |

### 2. Multi-Model Benchmark

Five classifiers are trained and evaluated using **5-fold stratified cross-validation**:

| # | Model | Configuration |
|---|-------|--------------|
| 1 | **Random Forest** | 150 estimators, max_depth=12, class_weight='balanced' |
| 2 | **Gradient Boosting** | 100 estimators, learning_rate=0.1 |
| 3 | **Logistic Regression** | L2 penalty, max_iter=500, solver='lbfgs' |
| 4 | **Support Vector Machine** | RBF kernel, C=1.0, probability=True |
| 5 | **K-Nearest Neighbors** | k=7, metric='minkowski' |

### 3. Evaluation Metrics

Each model is evaluated on:
- **Accuracy** — Fraction of correct predictions
- **Precision** (weighted) — Ratio of true positives to predicted positives
- **Recall** (weighted) — Ratio of true positives to actual positives
- **F1 Score** (weighted) — Harmonic mean of Precision and Recall
- **Confusion Matrix** — Full per-class prediction breakdown

### 4. Auto-Generated Insights (`generate_insights()`)
The pipeline programmatically generates 10+ textual data insights (e.g. "61% of titles are rated TV-MA or TV-14") that populate the Insights dashboard without manual curation.

---

## Dashboard Features

| Page | Features |
|------|---------|
| **Dashboard** | Content type split, yearly release trend, top 15 countries, rating distribution, top 15 genres, duration histogram, monthly additions (last 36 months), country×genre heatmap, top 10 directors |
| **ML Models** | One-click training trigger, accuracy/precision/recall/F1 bar charts, selectable confusion matrix, feature importance ranking |
| **Insights** | Auto-generated catalog summary cards |
| **Predict** | Custom input form → predicted classification + probability breakdown |

---

## Results

| Model | Accuracy | Weighted F1 |
|-------|:--------:|:-----------:|
| Random Forest | **highest** | ~0.80+ |
| Gradient Boosting | high | ~0.79 |
| Logistic Regression | moderate | ~0.73 |
| SVM (RBF) | moderate | ~0.74 |
| KNN (k=7) | moderate | ~0.70 |

> Exact metrics vary by run due to cross-validation fold randomness. Use the ML Models page in the UI for the most up-to-date figures.

**Query Performance:** All 16 API endpoints respond in **<10 ms** (in-memory pipeline, no disk I/O per request).

---

## REST API Reference

### Health & Overview

| Method | Endpoint | Response |
|--------|----------|---------|
| `GET` | `/api/health` | `{ status, records }` |
| `GET` | `/api/overview` | `{ total, movies, shows, countries, directors, genres, year_range }` |

### EDA Endpoints

| Method | Endpoint | Response |
|--------|----------|---------|
| `GET` | `/api/content-distribution` | `{ data: { Movie, TV Show } }` |
| `GET` | `/api/yearly-trend` | `{ data: { Movie: { years, counts }, TV Show: ... } }` |
| `GET` | `/api/top-countries` | `{ countries, counts }` |
| `GET` | `/api/ratings-distribution` | `{ ratings, counts }` |
| `GET` | `/api/genre-analysis` | `{ genres, counts }` |
| `GET` | `/api/duration-analysis` | Movie & TV Show histogram bin data |
| `GET` | `/api/monthly-additions` | `{ months, counts }` (last 36 months) |
| `GET` | `/api/top-directors` | `{ directors, counts }` |
| `GET` | `/api/heatmap` | `{ countries, genres, values }` (8×8 pivot) |
| `GET` | `/api/insights` | `{ insights: [ "...", ... ] }` |

### ML Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ml/train` | Train all 5 models; returns full benchmark results |
| `GET` | `/api/ml/feature-importance` | Random Forest feature importance scores |
| `GET` | `/api/ml/confusion-matrix?model=<name>` | Confusion matrix for the selected algorithm |
| `POST` | `/api/ml/predict` | Single-title prediction with class probabilities |

### Sample Predict Request

```json
POST /api/ml/predict
Content-Type: application/json

{
  "release_year": 2021,
  "type": "Movie",
  "duration": 95,
  "listed_in": "Action & Adventure, Thrillers",
  "country": "United States",
  "cast_size": 8,
  "director": "known_director"
}
```

### Sample Predict Response

```json
{
  "prediction": "Movie",
  "probabilities": {
    "Movie": 0.82,
    "TV Show": 0.18
  }
}
```

---

*Part of the [Auspify Netflix ML Internship Suite](../README.md)*
