<div align="center">

# 🎬 Auspify — Netflix ML Suite 16 Sep - 16 Oct

**End-to-end Machine Learning applications built on the Netflix Movies & TV Shows dataset**

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.x-000000?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.x-F7931E?logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Organization:** Auspify  
> **Dataset:** Netflix Movies & TV Shows (~8,800 titles, Kaggle)

</div>

---

## 📑 Table of Contents

- [Project Overview](#-project-overview)
- [Repository Structure](#-repository-structure)
- [Task Summary](#-task-summary)
- [Performance Benchmarks](#-performance-benchmarks)
- [Prerequisites](#-prerequisites)
- [Quick Start — Run All Tasks](#-quick-start--run-all-tasks)
- [Task Details](#-task-details)
  - [Task 3 — Audience Rating Classification](#task-3--netflix-audience-rating-classification)
  - [Task 4 — Content Segmentation](#task-4--netflix-content-segmentation)
  - [Task 5 — Trend Forecasting Model](#task-5--netflix-trend-forecasting-model)
  - [Task 6 — Content Analytics Engine](#task-6--netflix-content-analytics-engine)
- [Tech Stack](#-tech-stack)
- [API Reference](#-api-reference)
- [Business Insights](#-business-insights)
- [Documentation & Reports](#-documentation--reports)
- [Contributing](#-contributing)

---

## 🔭 Project Overview

This repository is the complete submission for the **Auspify Machine Learning Internship** (Sep 16 – Oct 16). It showcases four production-ready ML applications that span the full data-science lifecycle — from raw CSV ingestion to interactive React dashboards — all powered by the Netflix catalog dataset.

Each task is self-contained with:
- A **Flask** REST API backend (data processing + model training)
- A **React 19 + Vite** frontend (data visualization + interactive predictions)
- Independent **port assignments** so all four tasks can run simultaneously

---

## 🗂 Repository Structure

```plaintext
Auspify/
├── Data/                                   # Raw dataset & internship documents
│   ├── Dataset.csv                         # Netflix catalog (~8,800 titles)
│   ├── MACHINE LEARNING TASK LIST.pdf      # Official internship task brief
│   └── Patel Dixitkumar Bharatkumar.pdf    # Intern credentials
│
├── docs/                                   # System documentation (Word format)
│   ├── ARCHITECTURE.docx                   # System architecture overview
│   ├── SETUP_GUIDE.docx                    # Step-by-step environment setup
│   └── API_REFERENCE.docx                  # Complete REST API reference
│
├── reports/                                # Technical task reports (text format)
│   ├── Task_3_Report.txt                   # Classification methodology & results
│   ├── Task_4_Report.txt                   # Clustering methodology & results
│   ├── Task_5_Report.txt                   # Forecasting methodology & results
│   ├── Task_6_Report.txt                   # Analytics engine summary
│   └── Final_Internship_Report.txt         # Consolidated final report
│
├── presentations/                          # Slide deck & presentation notes
├── screenshots/                            # UI screenshots & evaluation plots
│
├── Task_3_Audience_Rating_Classification/  # Task 3 — Supervised Classification
├── Task_4_Netflix_Content_Segmentation/    # Task 4 — Unsupervised Clustering
├── Task_5_Netflix_Trend_Forecasting_Model/ # Task 5 — Time-Series Forecasting
├── Task_6_Netflix_Analytics/              # Task 6 — Full-Stack Analytics Hub
│
├── run_all_servers.bat                     # Windows: start all 8 servers
├── run_all_servers.ps1                     # PowerShell: start all 8 servers
└── stop_all_servers.bat                    # Windows: stop all running servers
```

---

## 📊 Task Summary

| Task | Title | Approach | Backend Port | Frontend Port |
|:----:|-------|----------|:------------:|:-------------:|
| **3** | Netflix Audience Rating Classification | Supervised ML (Random Forest) | `5003` | `5173` |
| **4** | Netflix Content Segmentation | Unsupervised ML (K-Means + PCA) | `5004` | `5174` |
| **5** | Netflix Trend Forecasting Model | Time-Series (Gradient Boosting) | `5005` | `5175` |
| **6** | Netflix Content Analytics Engine | Full-Stack ML Pipeline | `5006` | `5176` |

---

## 🏆 Performance Benchmarks

| Task | Focus Area | Model Architecture | Key Result |
|:----:|------------|-------------------|:----------:|
| **3** | Rating Classification | Tuned Random Forest (max_depth=10) | **54.4% Accuracy** |
| **4** | Content Segmentation | K-Means (k=5) + PCA (2D) | **0.42 Silhouette Score** |
| **5** | Trend Forecasting | Gradient Boosting Regressor | **8.7% MAPE** |
| **6** | Full-Stack Analytics Hub | 5-Algorithm Benchmark | **<10 ms Query Latency** |

---

## ✅ Prerequisites

Make sure the following are installed before running any task:

| Requirement | Minimum Version | Install |
|-------------|-----------------|---------|
| Python | 3.10+ | [python.org](https://www.python.org/downloads/) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org/) |
| npm | 9+ | Bundled with Node.js |
| pip | 23+ | Bundled with Python |

> **Dataset Note:** The `Data/Dataset.csv` and task-level `Dataset.csv` files are excluded from Git via `.gitignore`.
> Download the [Netflix Movies and TV Shows dataset from Kaggle](https://www.kaggle.com/datasets/shivamb/netflix-shows)
> and place it at `Data/Dataset.csv`. Tasks 5 and 6 also need a copy in their respective task root folders.

---

## ⚡ Quick Start — Run All Tasks

### Option A — Windows Batch Script
```bat
run_all_servers.bat
```

### Option B — PowerShell Script
```powershell
.\run_all_servers.ps1
```

### Option C — Manual (individual tasks)
See the [Task Details](#-task-details) section below for per-task instructions.

Once running, open any of the following in your browser:

| Task | URL |
|------|-----|
| Task 3 | http://localhost:5173 |
| Task 4 | http://localhost:5174 |
| Task 5 | http://localhost:5175 |
| Task 6 | http://localhost:5176 |

---

## 📋 Task Details

---

### Task 3 — Netflix Audience Rating Classification

> **Difficulty:** Medium | **Backend:** `http://localhost:5003` | **Frontend:** `http://localhost:5173`

**Goal:** Predict the audience maturity rating (TV-MA, TV-14, PG-13, R, PG, etc.) of a Netflix title using its metadata — genre, country, release year, and duration.

#### ML Workflow
1. **Data Cleaning** — Imputed missing `director`, `country`, and `date_added` fields; parsed release year.
2. **Feature Engineering** — One-hot encoded top genres from `listed_in`; extracted runtime (minutes for movies, seasons for TV shows); encoded binary content-type flag.
3. **Model Training** — Trained a baseline Decision Tree and a tuned Random Forest classifier.
4. **Hyperparameter Tuning** — Grid search over `max_depth`, `min_samples_split`, and `n_estimators`; used stratified k-fold splits.
5. **Evaluation** — Compared Accuracy, Macro F1, and Weighted F1 across 14 rating classes.

#### Results
| Model | Accuracy | Weighted F1 |
|-------|:--------:|:-----------:|
| Decision Tree (baseline) | 47.1% | 0.45 |
| Random Forest (tuned) | **54.4%** | **0.53** |

#### Setup
```bash
# 1 — Backend
cd Task_3_Audience_Rating_Classification/backend
pip install -r requirements.txt
python run.py                         # → http://127.0.0.1:5003

# 2 — Frontend (new terminal)
cd Task_3_Audience_Rating_Classification/frontend
npm install
npm run dev -- --port 5173            # → http://localhost:5173
```

---

### Task 4 — Netflix Content Segmentation

> **Difficulty:** Medium | **Backend:** `http://localhost:5004` | **Frontend:** `http://localhost:5174`

**Goal:** Discover natural groupings within the Netflix catalog using unsupervised K-Means clustering, then visualise clusters in 2D via PCA.

#### ML Workflow
1. **Feature Extraction** — Combined release year, runtime, binary genre flags, and country frequency codes into a numeric feature matrix.
2. **Standardization** — Applied `StandardScaler` so no single feature dominates Euclidean distances.
3. **K-Means Clustering** — Evaluated cluster counts k = 3…8; selected optimal k via Elbow method and Silhouette score.
4. **PCA Projection** — Reduced high-dimensional features to 2 principal components (explains ~65% variance) for interactive scatter plots.
5. **Cluster Characterization** — Summarised each cluster by its top genres, dominant production countries, and average release decade.

#### Results
| Metric | Value |
|--------|:-----:|
| Optimal k | **5** |
| Silhouette Score | **0.42** |
| PCA Variance Explained | **~65%** |

#### Setup
```bash
# 1 — Backend
cd Task_4_Netflix_Content_Segmentation/backend
pip install -r requirements.txt
python server.py                      # → http://localhost:5004

# 2 — Frontend (new terminal)
cd Task_4_Netflix_Content_Segmentation/frontend-react
npm install
npm run dev -- --port 5174            # → http://localhost:5174
```

---

### Task 5 — Netflix Trend Forecasting Model

> **Difficulty:** Advanced | **Backend:** `http://localhost:5005` | **Frontend:** `http://localhost:5175`

**Goal:** Model Netflix's historical monthly content addition patterns and forecast future monthly volumes over a user-selectable 1–12 month horizon.

#### ML Workflow
1. **Time-Series Aggregation** — Resampled `date_added` into a uniform monthly frequency index.
2. **Feature Engineering** — Created temporal features (`year`, `month`, `quarter`) plus autoregressive lag features (`lag_1`, `lag_3`, `lag_12`) and a 3-month rolling mean.
3. **Model Training** — Trained a Gradient Boosting Regressor with Time-Series Cross-Validation to prevent look-ahead leakage.
4. **Evaluation** — Measured Mean Absolute Error (MAE) and Root Mean Squared Error (RMSE) on held-out time slices.
5. **Horizon Forecasting** — Recursive multi-step prediction generates forecasts 1–12 months into the future.

#### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/forecast?horizon=<n>` | Returns historical data + n-month forecast |
| `POST` | `/api/upload` | Upload a custom CSV for custom forecasts |

#### Results
| Metric | Value |
|--------|:-----:|
| MAPE | **8.7%** |
| MAE | ~5.2 titles/month |

#### Setup
```bash
# 1 — Backend
cd Task_5_Netflix_Trend_Forecasting_Model/backend
pip install -r requirements.txt
python app.py                         # → http://127.0.0.1:5005

# 2 — Frontend (new terminal)
cd Task_5_Netflix_Trend_Forecasting_Model/frontend
npm install
npm run dev -- --port 5175            # → http://localhost:5175
```

---

### Task 6 — Netflix Content Analytics Engine

> **Difficulty:** Advanced | **Backend:** `http://localhost:5006` | **Frontend:** `http://localhost:5176`

**Goal:** Build an end-to-end data analytics platform with multi-algorithm ML benchmarking, interactive EDA dashboards, and a live prediction interface.

#### ML Workflow
1. **Feature Engineering** — 27 features including cast team size, director output history, release-to-addition delay, binary genre indicators, and country frequency encoding.
2. **Multi-Model Benchmark** — 5-fold stratified cross-validation across 5 classifiers:
   - Random Forest (150 trees, max_depth=12)
   - Gradient Boosting (100 estimators)
   - Logistic Regression (L2)
   - Support Vector Machine (RBF kernel)
   - K-Nearest Neighbors (k=7)
3. **Dashboard Views** — Catalog distribution, yearly trends, country heatmaps, genre analysis, and duration histograms.
4. **Model Comparison** — Side-by-side Accuracy / Precision / Recall / F1 bar charts, feature importance rankings, and confusion matrices.
5. **Live Prediction** — Enter custom content parameters and receive real-time class probabilities.

#### REST API Reference
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server health + record count |
| `GET` | `/api/overview` | Catalog summary stats |
| `GET` | `/api/content-distribution` | Movie vs TV Show counts |
| `GET` | `/api/yearly-trend` | Release trend (2000–2021) |
| `GET` | `/api/top-countries` | Top 15 producing countries |
| `GET` | `/api/ratings-distribution` | Rating frequency breakdown |
| `GET` | `/api/genre-analysis` | Top 15 genres |
| `GET` | `/api/duration-analysis` | Runtime histograms |
| `GET` | `/api/monthly-additions` | Last 36-month additions |
| `GET` | `/api/top-directors` | Top 10 directors |
| `GET` | `/api/heatmap` | Country × genre co-occurrence |
| `GET` | `/api/insights` | Auto-generated data insights |
| `POST` | `/api/ml/train` | Train all 5 models |
| `GET` | `/api/ml/feature-importance` | Feature importance scores |
| `GET` | `/api/ml/confusion-matrix?model=<name>` | Confusion matrix for selected model |
| `POST` | `/api/ml/predict` | Single title prediction |

#### Setup
```bash
# 1 — Backend
cd Task_6_Netflix_Analytics/backend
pip install -r requirements.txt
python server.py                      # → http://127.0.0.1:5006

# 2 — Frontend (new terminal)
cd Task_6_Netflix_Analytics/frontend
npm install
npm run dev -- --port 5176            # → http://localhost:5176
```

---

## 🛠 Tech Stack

### Backend
| Library | Purpose |
|---------|---------|
| Python 3.10+ | Core language |
| Flask 3.x | REST API framework |
| Flask-CORS | Cross-origin request handling |
| Pandas | Data wrangling & aggregation |
| NumPy | Numerical computing |
| scikit-learn | ML algorithms, metrics, cross-validation |
| Joblib | Model serialization (`.pkl`) |
| Werkzeug | File upload utilities (Task 4) |

### Frontend
| Library | Purpose |
|---------|---------|
| React 19 | Component-based UI framework |
| Vite 8.x | Fast dev server & bundler |
| Recharts | Composable charting library |
| Chart.js + react-chartjs-2 | Additional chart types |
| Axios | HTTP client for API calls |
| React Router DOM v7 | Client-side page routing |

---

## 📡 API Reference

Full API documentation is available in [`docs/API_REFERENCE.docx`](docs/API_REFERENCE.docx).

A quick reference for Task 6 endpoints is included in the [Task 6 section](#task-6--netflix-content-analytics-engine) above.

---

## 💡 Business Insights

Key findings derived from the Netflix catalog analysis:

1. **📺 TV Show Pivot** — TV series additions grew by **>300%** post-2016, confirming episodic content as the primary driver of subscriber retention.
2. **🌏 Global Regionalization** — South Korea and India are the fastest-growing catalog segments, essential for international subscriber acquisition.
3. **🔞 Adult Audience Dominance** — Over **61%** of catalog titles fall under TV-MA or TV-14, underscoring the critical need for automated parental-control systems.
4. **🎭 Genre Concentration** — International Movies and Dramas are the two largest genre clusters, accounting for ~40% of all titles.
5. **📅 Seasonal Additions** — Content additions peak in Q4 (October–December), suggesting a holiday-aligned content strategy.

---

## 📄 Documentation & Reports

| Document | Location | Description |
|----------|----------|-------------|
| Architecture Overview | [`docs/ARCHITECTURE.docx`](docs/ARCHITECTURE.docx) | System design & microservices diagram |
| Setup Guide | [`docs/SETUP_GUIDE.docx`](docs/SETUP_GUIDE.docx) | Full environment setup walkthrough |
| API Reference | [`docs/API_REFERENCE.docx`](docs/API_REFERENCE.docx) | Complete REST API documentation |
| Task 3 Report | [`reports/Task_3_Report.txt`](reports/Task_3_Report.txt) | Classification results & analysis |
| Task 4 Report | [`reports/Task_4_Report.txt`](reports/Task_4_Report.txt) | Clustering results & analysis |
| Task 5 Report | [`reports/Task_5_Report.txt`](reports/Task_5_Report.txt) | Forecasting results & analysis |
| Task 6 Report | [`reports/Task_6_Report.txt`](reports/Task_6_Report.txt) | Analytics engine summary |
| Final Report | [`reports/Final_Internship_Report.txt`](reports/Final_Internship_Report.txt) | Consolidated internship report |

---

## 🤝 Contributing

This repository represents submitted internship work. If you would like to suggest improvements:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-improvement`
3. Commit your changes: `git commit -m "feat: describe your change"`
4. Push to the branch: `git push origin feature/your-improvement`
5. Open a Pull Request

---

## 📜 License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

<div align="center">

Built with ❤️ during the **Auspify Machine Learning Internship** · Sep – Oct 2024

</div>
