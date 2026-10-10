import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RATING_COLORS = {
  'TV-MA': '#e50914', 'TV-14': '#f59e0b', 'TV-PG': '#3b82f6',
  'PG-13': '#a855f7', 'R': '#ef4444', 'PG': '#06b6d4',
  'TV-G': '#10b981', 'G': '#10b981', 'NR': '#71717a', 'UR': '#71717a',
};

const Predict = () => {
  const [options, setOptions] = useState({ countries: [], genres: [], types: [], directors: [] });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    type: 'Movie', release_year: 2021,
    duration: '', date_added: '',
    director: '', country: '', listed_in: ''
  });

  useEffect(() => {
    axios.get('http://127.0.0.1:5003/api/form_options')
      .then(res => setOptions(res.data))
      .catch(() => {});
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setResult(null); setError(null);
    try {
      const res = await axios.post('http://127.0.0.1:5003/api/predict', formData);
      if (res.data.success) setResult(res.data.data);
      else setError(res.data.error);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  const ratingColor = result ? (RATING_COLORS[result.prediction] || '#e50914') : '#e50914';
  const probEntries = result ? Object.entries(result.probabilities).sort((a, b) => b[1] - a[1]) : [];
  const topProb = probEntries.length > 0 ? probEntries[0][1] : 0;

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <h1 className="page-title">Rating Prediction</h1>
        <p className="page-description">Enter content attributes and let the ML model predict the Netflix audience rating.</p>
      </div>

      <div className={`predict-layout ${result ? 'two-col' : ''}`}>
        {/* Form Panel */}
        <div className="panel">
          <div className="panel-title">🎬 Content Details</div>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Content Type</label>
                <select name="type" className="form-control" value={formData.type} onChange={handleChange} required>
                  <option value="Movie">🎬 Movie</option>
                  <option value="TV Show">📺 TV Show</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Release Year</label>
                <input type="number" name="release_year" className="form-control"
                  placeholder="e.g. 2021" required min="1900" max="2100"
                  value={formData.release_year} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label className="form-label">Duration</label>
                <input type="text" name="duration" className="form-control"
                  placeholder="90 min  or  2 Seasons" required
                  value={formData.duration} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label className="form-label">Date Added to Netflix</label>
                <input type="date" name="date_added" className="form-control"
                  required value={formData.date_added} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">
                  Director <span style={{ color: 'var(--text-muted)', textTransform: 'none', fontSize: 11 }}>(optional)</span>
                </label>
                <input type="text" name="director" list="director-options" className="form-control"
                  placeholder="Search or type a director name..." value={formData.director} onChange={handleChange} />
                <datalist id="director-options">
                  {options.directors?.map((d, i) => <option key={i} value={d} />)}
                </datalist>
              </div>

              <div className="form-group">
                <label className="form-label">Country</label>
                <select name="country" className="form-control" value={formData.country} onChange={handleChange}>
                  <option value="">Select a Country</option>
                  {options.countries?.map((c, i) => <option key={i} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Genre</label>
                <select name="listed_in" className="form-control" required value={formData.listed_in} onChange={handleChange}>
                  <option value="">Select Genre</option>
                  {options.genres?.map((g, i) => <option key={i} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" id="predict-btn" disabled={loading}>
              {loading ? '⏳ Predicting…' : '🎯 Predict Audience Rating'}
            </button>
          </form>
        </div>

        {/* Result Panel */}
        {result && !loading && (
          <div className="result-container" style={{ margin: 0 }}>
            <div className="result-card">
              <div>
                <div className="result-label">Predicted Audience Rating</div>
                <div className="result-value" style={{
                  background: `linear-gradient(135deg, ${ratingColor}, #ff6b6b)`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
                }}>
                  {result.prediction}
                </div>
                <div className="result-confidence">
                  {(topProb * 100).toFixed(1)}% confidence
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                  Probability Distribution
                </div>
                <div className="prob-bars">
                  {probEntries.map(([cls, prob]) => (
                    <div key={cls} className="prob-bar-item">
                      <span className="prob-bar-label">{cls}</span>
                      <div className="prob-bar-track">
                        <div
                          className="prob-bar-fill"
                          style={{
                            width: `${(prob * 100).toFixed(1)}%`,
                            background: RATING_COLORS[cls] ? `linear-gradient(90deg, ${RATING_COLORS[cls]}, ${RATING_COLORS[cls]}aa)` : 'var(--gradient-red)'
                          }}
                        />
                      </div>
                      <span className="prob-bar-val">{(prob * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="loader">
            <div className="spinner"></div>
            <p className="loading-text">Analyzing content attributes…</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="panel" style={{ border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.05)' }}>
            <div style={{ color: '#ef4444', fontWeight: 600, marginBottom: 8 }}>⚠️ Prediction Error</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Predict;
