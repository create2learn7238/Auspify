# Task 3 — Netflix Audience Rating Classification

> **Internship Task · Difficulty: Medium**  
> Predicts Netflix title audience maturity ratings using supervised machine learning on catalog metadata.

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
- [Results](#results)
- [API Endpoints](#api-endpoints)

---

## Overview

This task builds and compares machine learning models that classify Netflix titles into their **audience maturity rating** (TV-MA, TV-14, PG-13, R, PG, G, NR, etc.) based purely on available catalog metadata — no content or review text required.

The challenge: 14 imbalanced rating classes, many with very few samples, requiring careful stratification and hyperparameter tuning.

**Ports:**
| Service | URL |
|---------|-----|
| Flask Backend | http://127.0.0.1:5003 |
| React Frontend | http://localhost:5173 |

---

## Project Structure

```text
Task_3_Audience_Rating_Classification/
├── backend/
│   ├── app/                  # Flask application package
│   │   ├── routes/           # API route blueprints
│   │   ├── services/         # ML training & prediction services
│   │   └── utils/            # Data loading & preprocessing helpers
│   ├── data/                 # Raw and cleaned dataset files
│   ├── models/               # Serialized model weights (.pkl) — git-ignored
│   ├── outputs/              # Evaluation plots & metric JSON files
│   ├── requirements.txt      # Python dependencies
│   └── run.py                # Flask application entry point
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   ├── pages/            # Page-level views
│   │   └── main.jsx          # App entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── run.ps1                   # PowerShell convenience launcher
└── README.md
```

---

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Python | 3.10+ |
| Node.js | 18+ |
| npm | 9+ |

---

## Setup & Running

### 1 — Backend

```bash
cd Task_3_Audience_Rating_Classification/backend
pip install -r requirements.txt
python run.py
```

The Flask API starts at **http://127.0.0.1:5003**

> **First run:** The backend trains the models on startup. This takes ~30–60 seconds depending on your machine.

### 2 — Frontend

Open a **second terminal**:

```bash
cd Task_3_Audience_Rating_Classification/frontend
npm install
npm run dev -- --port 5173
```

The React app is available at **http://localhost:5173**

### PowerShell Convenience Script

```powershell
.\run.ps1
```

---

## ML Methodology

### 1. Data Cleaning
- Imputed missing `director`, `country`, and `date_added` fields using mode imputation.
- Filtered out rows with null or rare rating labels (< 5 samples).
- Parsed `date_added` to extract `month_added` as an ordinal feature.

### 2. Feature Engineering
| Feature | Description |
|---------|-------------|
| `content_type` | Binary flag: 1 = Movie, 0 = TV Show |
| `release_year` | Numeric year of original release |
| `duration_minutes` | Runtime in minutes (Movies only) |
| `duration_seasons` | Season count (TV Shows only) |
| `genre_*` | One-hot flags for top 20 genres from `listed_in` |
| `country_*` | One-hot flags for top 10 producing countries |

### 3. Model Training

Two classifiers were trained and compared:

| Model | Configuration |
|-------|--------------|
| **Decision Tree** | Baseline; max_depth=8, min_samples_split=5 |
| **Random Forest** | 200 estimators, max_depth=10, min_samples_split=4, class_weight='balanced' |

### 4. Hyperparameter Tuning
- Stratified 5-fold cross-validation to handle class imbalance.
- Grid search over `max_depth` ∈ {6, 8, 10, 12}, `n_estimators` ∈ {100, 200}, `min_samples_split` ∈ {2, 4, 8}.

### 5. Evaluation Metrics
- **Accuracy** — Overall correct predictions.
- **Macro F1** — Unweighted mean F1 across all rating classes (penalises minority class failures equally).
- **Weighted F1** — F1 weighted by class support (reflects real-world distribution).

---

## Results

| Model | Accuracy | Macro F1 | Weighted F1 |
|-------|:--------:|:--------:|:-----------:|
| Decision Tree (baseline) | 47.1% | 0.38 | 0.45 |
| **Random Forest (tuned)** | **54.4%** | **0.44** | **0.53** |

> The 14-class imbalance is the primary performance ceiling. TV-MA dominates at ~40% of titles, while several classes have fewer than 100 samples.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server health check |
| `GET` | `/api/models` | List available trained models |
| `GET` | `/api/metrics` | Return training evaluation metrics |
| `POST` | `/api/predict` | Predict rating for a single title |
| `GET` | `/api/features` | Return feature importance scores |
| `GET` | `/api/confusion-matrix` | Return confusion matrix data |

### Sample Predict Request

```json
POST /api/predict
{
  "type": "Movie",
  "release_year": 2020,
  "duration": 112,
  "listed_in": "Dramas, International Movies",
  "country": "United States"
}
```

### Sample Predict Response

```json
{
  "predicted_rating": "TV-MA",
  "probabilities": {
    "TV-MA": 0.42,
    "R": 0.28,
    "TV-14": 0.15,
    "PG-13": 0.08,
    "other": 0.07
  }
}
```

---

*Part of the [Auspify Netflix ML Internship Suite](../README.md)*
