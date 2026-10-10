# Task 3: Netflix Audience Rating Classification

A machine learning project focused on predicting audience maturity ratings (e.g., TV-MA, TV-14, PG-13, R, PG) for Netflix titles using metadata such as duration, genre, country, and release year.

## Project Structure

```text
Task_3_Audience_Rating_Classification/
├── backend/
│   ├── app/                  # Flask services, routes, and utilities
│   ├── data/                 # Raw and cleaned dataset files
│   ├── models/               # Serialized model weights (.pkl)
│   ├── outputs/              # Evaluation plots and metric files
│   ├── requirements.txt      # Python libraries
│   └── run.py                # Flask entry point
├── frontend/
│   ├── src/                  # React components, pages, and CSS
│   └── package.json          # Frontend packages
└── README.md
```

## Setup and Running

### Backend Setup
Open a terminal inside the `backend` directory:

```bash
cd backend
pip install -r requirements.txt
python run.py
```
*Runs on http://127.0.0.1:5003*

### Frontend Setup
Open a second terminal inside the `frontend` directory:

```bash
cd frontend
npm install
npm run dev -- --port 5173
```
*Runs on http://localhost:5173*

## Implementation Details

1. **Preprocessing & Feature Engineering:**
   - Parsed content duration into continuous runtime values (minutes for movies, season counts for shows).
   - Extracted release year and month added.
   - One-hot encoded primary genres and top production countries.
   - Handled multi-class target labels across 14 rating categories.

2. **Model Training & Comparison:**
   - Evaluated baseline Decision Tree vs. tuned Random Forest models.
   - Addressed class imbalance across minority ratings using stratified splits and hyperparameter tuning (max_depth, min_samples_split, class_weight).
   - Evaluated models using Accuracy, Macro F1, and Weighted F1 scores.
