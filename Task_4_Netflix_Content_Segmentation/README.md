# Task 4 — Netflix Content Segmentation

> **Internship Task · Difficulty: Medium**  
> Discovers natural groupings in the Netflix catalog through unsupervised K-Means clustering and PCA visualisation.

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.x-000000?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
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

This task groups the ~8,800 Netflix catalog titles into meaningful clusters using **unsupervised K-Means** clustering. Feature vectors are built from numeric and binary-encoded metadata, standardised, and then projected to 2D via **Principal Component Analysis (PCA)** for interactive scatter-plot visualisation.

The goal is to surface hidden programming patterns — e.g. clusters dominated by short-form Korean dramas vs. long-running US documentary series — without any pre-defined labels.

**Ports:**
| Service | URL |
|---------|-----|
| Flask Backend | http://localhost:5004 |
| React Frontend | http://localhost:5174 |

---

## Project Structure

```text
Task_4_Netflix_Content_Segmentation/
├── backend/
│   ├── data/                 # Dataset files (git-ignored)
│   ├── ml/                   # K-Means & PCA logic
│   ├── models/               # Cached fitted models (git-ignored)
│   ├── routes/               # Flask API blueprints
│   ├── services/             # Cluster analysis & summary services
│   ├── uploads/              # User-uploaded CSV files (temporary)
│   ├── requirements.txt      # Python dependencies
│   ├── run.py                # App runner
│   └── server.py             # Flask application factory
├── frontend-react/
│   ├── src/
│   │   ├── components/       # Chart & UI components
│   │   └── pages/            # Dashboard, Clusters, Upload pages
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
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
cd Task_4_Netflix_Content_Segmentation/backend
pip install -r requirements.txt
python server.py
```

The Flask API starts at **http://localhost:5004**

> The dataset file (`Dataset.csv` or `data/netflix_titles.csv`) must be present. See the root README for download instructions.

### 2 — Frontend

Open a **second terminal**:

```bash
cd Task_4_Netflix_Content_Segmentation/frontend-react
npm install
npm run dev -- --port 5174
```

The React dashboard is available at **http://localhost:5174**

---

## ML Methodology

### 1. Feature Extraction

Each title is represented by a numeric feature vector combining:

| Feature Group | Features |
|---------------|---------|
| Temporal | `release_year` |
| Runtime | `duration_minutes` (Movies), `duration_seasons` (TV Shows) |
| Genre flags | One-hot binary flags for top 20 genres |
| Country codes | Frequency-encoded top 15 production countries |
| Content type | Binary flag (Movie = 1, TV Show = 0) |

### 2. Feature Standardisation
All features are passed through `StandardScaler` so that wide-range numeric values (e.g. `release_year` in the thousands) do not overwhelm binary flags during Euclidean distance calculations.

### 3. Optimal Cluster Selection

Two methods are used to select the best number of clusters k:

- **Elbow Method** — Plot inertia (sum of squared distances to centroids) vs k. The "elbow" at k=5 indicates diminishing returns.
- **Silhouette Score** — Measures cohesion vs. separation. Peaks at **k=5 (score = 0.42)**.

| k | Silhouette Score |
|---|:----------------:|
| 3 | 0.35 |
| 4 | 0.39 |
| **5** | **0.42** ✅ |
| 6 | 0.40 |
| 7 | 0.38 |
| 8 | 0.36 |

### 4. PCA Projection
Principal Component Analysis reduces the multi-dimensional feature space to **2 components** for 2D scatter visualisation. The two principal components explain approximately **65% of total variance**.

### 5. Cluster Characterisation
Each cluster is described by:
- Top 5 genres (by frequency)
- Dominant production country
- Average release year
- Average runtime (Movies) or season count (TV Shows)

---

## Results

| Metric | Value |
|--------|:-----:|
| Optimal clusters (k) | **5** |
| Silhouette Score | **0.42** |
| PCA Variance Explained | **~65%** |

### Cluster Profiles (k=5)

| Cluster | Dominant Type | Key Genres | Avg Year |
|---------|--------------|-----------|:--------:|
| 0 | Movies | International, Dramas | 2017 |
| 1 | TV Shows | Stand-Up, Comedy | 2019 |
| 2 | Movies | Action, Thrillers | 2016 |
| 3 | TV Shows | Korean, Reality | 2019 |
| 4 | Movies | Documentaries, Nature | 2014 |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server health check |
| `GET` | `/api/cluster?k=<n>` | Run K-Means with k clusters, return PCA scatter data |
| `GET` | `/api/cluster/summary?k=<n>` | Return cluster characterisation summaries |
| `GET` | `/api/elbow` | Inertia values for k=2..10 (Elbow chart data) |
| `GET` | `/api/silhouette` | Silhouette scores for k=2..10 |
| `POST` | `/api/upload` | Upload custom CSV for clustering |

### Sample Cluster Response

```json
{
  "k": 5,
  "silhouette": 0.42,
  "points": [
    { "x": 1.23, "y": -0.45, "cluster": 2, "title": "Extraction" },
    ...
  ],
  "centroids": [[...], [...], ...]
}
```

---

*Part of the [Auspify Netflix ML Internship Suite](../README.md)*
