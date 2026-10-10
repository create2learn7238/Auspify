# Auspify-Task 16 Sep to 16 Oct

This repository contains my project submissions for the Auspify Machine Learning Internship (September 16 – October 16). The internship focused on real-world applications of machine learning using the Netflix Movies and TV Shows dataset (~8,800 titles). 

The project is divided into four main tasks covering classification, unsupervised clustering, time-series forecasting, and an end-to-end analytics dashboard. Each task consists of a Python/Flask backend for data processing and model training, and a React frontend for visualizing findings and interacting with model predictions.

---

## Project Summary

| Task | Title | Level | Backend Port | Frontend Port | Folder |
|---|---|---|---|---|---|
| Task 3 | Netflix Audience Rating Classification | Medium | 5003 | 5173 | Task_3_Audience_Rating_Classification |
| Task 4 | Netflix Content Segmentation | Medium | 5004 | 5174 | Task_4_Netflix_Content_Segmentation |
| Task 5 | Netflix Trend Forecasting Model | Advanced | 5005 | 5175 | Task_5_Netflix_Trend_Forecasting_Model |
| Task 6 | Netflix Content Success Analytics Engine | Advanced | 5006 | 5176 | Task_6_Netflix_Analytics |

---

## Task Details

### Task 3: Netflix Audience Rating Classification (Medium)

**Goal:** Build and compare machine learning models to classify Netflix titles into their audience maturity ratings (TV-MA, TV-14, PG-13, R, etc.) based on available metadata.

**Workflow & Implementation:**
1. **Data Cleaning & Exploration:** Handled missing values in director, country, and date fields. Extracted release years, parsed duration (runtime minutes for movies, season counts for TV shows), and encoded target rating categories.
2. **Feature Preparation:** Extracted top genre tags from the `listed_in` column, one-hot encoded content types, and scaled numeric values.
3. **Model Training:** Trained a baseline Decision Tree classifier and an ensemble Random Forest classifier.
4. **Hyperparameter Tuning:** Tuned tree depth, minimum samples per split, and estimator counts to balance accuracy across minority classes.
5. **Evaluation:** Compared models on test splits using accuracy, macro F1, and weighted F1 metrics. Random Forest achieved ~54.4% accuracy across 14 unbalanced classes.

**Running Task 3:**
```bash
# Backend
cd Task_3_Audience_Rating_Classification/backend
python run.py

# Frontend
cd Task_3_Audience_Rating_Classification/frontend
npm run dev -- --port 5173
```
Frontend runs at: `http://localhost:5173`

---

### Task 4: Netflix Content Segmentation (Medium)

**Goal:** Group catalog titles into distinct clusters using unsupervised learning to identify hidden content groupings and programming patterns.

**Workflow & Implementation:**
1. **Feature Engineering:** Extracted combined text and numerical features including duration, release year, country frequency, and binary genre indicators.
2. **Standardization:** Applied StandardScaler to numerical features so duration and release year carry appropriate weight.
3. **Clustering:** Implemented K-Means clustering with user-selectable cluster counts (k=3 to 8).
4. **Dimensionality Reduction:** Used Principal Component Analysis (PCA) to reduce multi-dimensional feature space to 2 components for visual scatter plotting.
5. **Cluster Interpretation:** Extracted top genres, dominant countries, and average release years per cluster to provide descriptive cluster summaries.

**Running Task 4:**
```bash
# Backend
cd Task_4_Netflix_Content_Segmentation/backend
python server.py

# Frontend
cd Task_4_Netflix_Content_Segmentation/frontend-react
npm run dev -- --port 5174
```
Frontend runs at: `http://localhost:5174`

---

### Task 5: Netflix Trend Forecasting Model (Advanced)

**Goal:** Model historical release timelines and forecast monthly Netflix additions across future horizons (1 to 12 months).

**Workflow & Implementation:**
1. **Time-Series Aggregation:** Resampled catalog entries by `date_added` into monthly historical frequencies.
2. **Feature Engineering:** Generated lag features (Lag 1, Lag 3, Lag 12), rolling statistics (3-month rolling averages), and temporal features (year, month, quarter).
3. **Model Training:** Trained regression models (Random Forest Regressor / Gradient Boosting) to learn seasonal patterns and growth curves.
4. **Validation:** Evaluated performance using Time-Series Cross-Validation, tracking Mean Absolute Error (MAE) and Root Mean Squared Error (RMSE).
5. **Forecasting Interface:** Built interactive horizon controls allowing users to simulate 1 to 12 months of future content volume additions.

**Running Task 5:**
```bash
# Backend
cd Task_5_Netflix_Trend_Forecasting_Model/backend
python app.py

# Frontend
cd Task_5_Netflix_Trend_Forecasting_Model/frontend
npm run dev -- --port 5175
```
Frontend runs at: `http://localhost:5175`

---

### Task 6: Netflix Content Success Analytics Engine (Advanced)

**Goal:** Build a complete end-to-end data analytics pipeline and multi-model machine learning benchmark with interactive exploration tools.

**Workflow & Implementation:**
1. **Exploratory Data Analysis:** Computed catalog distributions across type (Movie vs TV Show), release decades, top producing countries, and genre co-occurrences.
2. **Feature Pipeline:** Engineered 27 distinct features from raw catalog metadata, including cast team sizes, director output history, release-to-addition delays, and genre indicators.
3. **Multi-Model Benchmark:** Trained and evaluated 5 classification algorithms using 5-fold cross validation:
   - Random Forest (150 trees, max depth 12)
   - Gradient Boosting (100 estimators)
   - Logistic Regression (L2 regularization)
   - Support Vector Machine (RBF kernel)
   - K-Nearest Neighbors (k=7)
4. **Model Comparison:** Visualized comparative metrics (Accuracy, Precision, Recall, F1) via bar charts and confusion matrices.
5. **Interactive Prediction:** Provided a prediction tool allowing users to enter custom content parameters and receive predicted classifications with class probability breakdown.

**Running Task 6:**
```bash
# Backend
cd Task_6_Netflix_Analytics/backend
python server.py

# Frontend
cd Task_6_Netflix_Analytics/frontend
npm run dev -- --port 5176
```
Frontend runs at: `http://localhost:5176`

---

## Technical Stack

- **Backend:** Python 3.10+, Flask, Flask-CORS, Pandas, NumPy, Scikit-learn
- **Frontend:** React 18, Vite, Recharts, CSS3
- **Dataset:** Netflix Movies and TV Shows dataset (Kaggle), containing titles added up through mid-2021.
