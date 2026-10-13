# Task 5 — Netflix Trend Forecasting Model

> **Internship Task · Difficulty: Advanced**  
> Forecasts future monthly Netflix content additions using time-series feature engineering and Gradient Boosting regression.

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
- [Forecasting Methodology](#forecasting-methodology)
- [Results](#results)
- [API Endpoints](#api-endpoints)

---

## Overview

This task analyses the historical **monthly volume of Netflix content additions** from the first recorded additions through to mid-2021, then builds a machine learning model capable of forecasting **1 to 12 months ahead**.

Rather than using classical ARIMA or Holt-Winters methods, this project uses a **tree-based Gradient Boosting Regressor** trained on engineered lag, rolling, and calendar features — making the model interpretable and robust to irregular seasonality.

**Ports:**
| Service | URL |
|---------|-----|
| Flask Backend | http://127.0.0.1:5005 |
| React Frontend | http://localhost:5175 |

---

## Project Structure

```text
Task_5_Netflix_Trend_Forecasting_Model/
├── Dataset.csv              # Netflix catalog dataset (git-ignored)
├── backend/
│   ├── app.py               # Flask application with /api/forecast & /api/upload
│   ├── advanced_model.py    # Full time-series pipeline: prep → train → forecast
│   ├── model.py             # Simpler baseline model (for comparison)
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # Chart panels (historical + forecast overlay)
│   │   ├── pages/           # Forecast page, upload page
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── mock_netflix_data.csv    # Small sample CSV for offline testing
├── start.bat                # Windows convenience launcher
└── README.md
```

---

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Python | 3.10+ |
| Node.js | 18+ |
| npm | 9+ |

The `Dataset.csv` must be present in the task root directory.
See the [root README](../README.md) for Kaggle download instructions.

---

## Setup & Running

### 1 — Backend

```bash
cd Task_5_Netflix_Trend_Forecasting_Model/backend
pip install -r requirements.txt
python app.py
```

The Flask API starts at **http://127.0.0.1:5005**

> **Environment variable:** Set `PORT=<n>` to override the default port 5005.
> ```bash
> PORT=5005 python app.py
> ```

### 2 — Frontend

Open a **second terminal**:

```bash
cd Task_5_Netflix_Trend_Forecasting_Model/frontend
npm install
npm run dev -- --port 5175
```

The React app is available at **http://localhost:5175**

### Windows Batch Launcher

```bat
start.bat
```

---

## Forecasting Methodology

### 1. Time-Series Construction
The `date_added` column is parsed and aggregated into a **monthly frequency index** — counting how many titles Netflix added each calendar month. The result is a clean univariate time series from earliest additions to mid-2021.

### 2. Feature Engineering

Each monthly observation is enriched with the following features before model training:

| Feature | Type | Description |
|---------|------|-------------|
| `year` | Calendar | Year of the month |
| `month` | Calendar | Month number (1–12) |
| `quarter` | Calendar | Quarter (1–4) |
| `lag_1` | Autoregressive | Additions from 1 month ago |
| `lag_3` | Autoregressive | Additions from 3 months ago |
| `lag_12` | Autoregressive | Additions from 12 months ago (annual seasonality) |
| `rolling_mean_3` | Smoothing | 3-month rolling average |

### 3. Model Training

A **Gradient Boosting Regressor** (scikit-learn `GradientBoostingRegressor`) is trained on the engineered feature matrix.

**Key hyperparameters:**
| Parameter | Value |
|-----------|-------|
| `n_estimators` | 200 |
| `learning_rate` | 0.05 |
| `max_depth` | 4 |
| `subsample` | 0.85 |

**Time-Series Cross-Validation** (expanding window) is used to prevent future data leakage — training always ends before the validation fold begins.

### 4. Recursive Multi-Step Forecasting
To forecast h months ahead, the model applies **recursive one-step-ahead prediction**:
- At each future step, previously predicted values fill the lag features for the next step.
- This approach accumulates uncertainty over longer horizons, which is reflected in the widening confidence intervals shown in the UI.

### 5. Evaluation
Models are evaluated on held-out tail slices using:
- **MAE** — Mean Absolute Error (titles/month)
- **RMSE** — Root Mean Squared Error
- **MAPE** — Mean Absolute Percentage Error

---

## Results

| Metric | Value |
|--------|:-----:|
| MAPE | **8.7%** |
| MAE | **~5.2 titles/month** |
| RMSE | ~7.1 |

---

## API Endpoints

| Method | Endpoint | Query Params | Description |
|--------|----------|-------------|-------------|
| `GET` | `/api/forecast` | `horizon=<1-12>` | Returns historical monthly series + n-month forecast |
| `POST` | `/api/upload` | — | Upload a custom CSV; `horizon` in form data |

### Sample Forecast Request

```
GET /api/forecast?horizon=6
```

### Sample Forecast Response

```json
{
  "historical": {
    "months": ["2015-01", "2015-02", "..."],
    "counts": [45, 62, "..."]
  },
  "forecast": {
    "months": ["2021-07", "2021-08", "...", "2021-12"],
    "counts": [95, 98, 102, 99, 110, 107]
  },
  "metrics": {
    "mape": 8.7,
    "mae": 5.2,
    "rmse": 7.1
  }
}
```

---

*Part of the [Auspify Netflix ML Internship Suite](../README.md)*
