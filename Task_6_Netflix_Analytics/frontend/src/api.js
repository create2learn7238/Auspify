export const API_BASE = 'http://127.0.0.1:5006/api';

export const fetchOverview = () => fetch(`${API_BASE}/overview`).then(r => r.json());
export const fetchContentDist = () => fetch(`${API_BASE}/content-distribution`).then(r => r.json());
export const fetchYearlyTrend = () => fetch(`${API_BASE}/yearly-trend`).then(r => r.json());
export const fetchTopCountries = () => fetch(`${API_BASE}/top-countries`).then(r => r.json());
export const fetchRatings = () => fetch(`${API_BASE}/ratings-distribution`).then(r => r.json());
export const fetchGenres = () => fetch(`${API_BASE}/genre-analysis`).then(r => r.json());
export const fetchDuration = () => fetch(`${API_BASE}/duration-analysis`).then(r => r.json());
export const fetchMonthly = () => fetch(`${API_BASE}/monthly-additions`).then(r => r.json());
export const fetchTopDirectors = () => fetch(`${API_BASE}/top-directors`).then(r => r.json());
export const fetchHeatmap = () => fetch(`${API_BASE}/heatmap`).then(r => r.json());
export const fetchInsights = () => fetch(`${API_BASE}/insights`).then(r => r.json());
export const trainModels = () =>
  fetch(`${API_BASE}/ml/train`, { method: 'POST' }).then(r => r.json());
export const fetchFeatureImportance = () =>
  fetch(`${API_BASE}/ml/feature-importance`).then(r => r.json());
export const fetchConfusionMatrix = (model) =>
  fetch(`${API_BASE}/ml/confusion-matrix?model=${encodeURIComponent(model)}`).then(r => r.json());
export const predictContent = (data) =>
  fetch(`${API_BASE}/ml/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json());
