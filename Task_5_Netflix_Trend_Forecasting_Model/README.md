# Task 5: Netflix Trend Forecasting Model

A time-series forecasting project that analyzes historical additions of Netflix content and forecasts future monthly volume trends across selectable horizons.

## Project Structure

```text
Task_5_Netflix_Trend_Forecasting_Model/
├── Dataset.csv              # Netflix catalog dataset
├── backend/
│   ├── app.py               # Flask application with forecast endpoints
│   └── requirements.txt     # Python requirements
├── frontend/
│   ├── src/                 # React UI with time-series charts
│   └── package.json         # Frontend packages
└── README.md
```

## Setup and Running

### 1. Backend Setup
Open a terminal in the `backend` folder:

```bash
cd backend
pip install -r requirements.txt
python app.py
```
*Backend runs on http://127.0.0.1:5005*

### 2. Frontend Setup
Open a second terminal in the `frontend` folder:

```bash
cd frontend
npm install
npm run dev -- --port 5175
```
*Frontend runs on http://localhost:5175*

## Forecasting Approach

1. **Time-Series Transformation:** Grouped catalog data by `date_added` into monthly intervals, creating a uniform monthly frequency index from the earliest additions to mid-2021.
2. **Feature Engineering:**
   - Temporal features: `year`, `month`, `quarter`.
   - Autoregressive lag features: `lag_1`, `lag_3`, `lag_12` to capture recent velocity and annual seasonality.
   - Rolling statistics: 3-month rolling mean to smooth short-term variance.
3. **Model Training & Cross-Validation:** Trained gradient boosted decision tree regressors using Time-Series Cross-Validation to prevent future data leakage. Evaluated using Mean Absolute Error (MAE) and Root Mean Squared Error (RMSE).
4. **Horizon Forecasting:** Generates recursive multi-step forecasts for customizable horizons ranging from 1 to 12 months ahead.
