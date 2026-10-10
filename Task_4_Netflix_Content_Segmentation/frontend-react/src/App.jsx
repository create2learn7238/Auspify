import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './index.css';

const API_URL = 'http://127.0.0.1:5004/api';
const COLORS = ['#e50914', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0]?.payload;
    return (
      <div style={{
        background: '#16161e', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 12, padding: '12px 16px', fontSize: 13
      }}>
        <div style={{ fontWeight: 700, marginBottom: 6, color: '#fff' }}>{d?.title || 'Title'}</div>
        <div style={{ color: '#a1a1aa' }}>Cluster: <strong style={{ color: COLORS[d?.cluster % COLORS.length] }}>Group {d?.cluster}</strong></div>
        <div style={{ color: '#a1a1aa' }}>Type: {d?.type}</div>
        <div style={{ color: '#a1a1aa' }}>Year: {d?.year}</div>
      </div>
    );
  }
  return null;
};

function App() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [kValue, setKValue] = useState(4);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/statistics`);
      setStats(res.data);
      if (res.data.metrics) {
        const clusterRes = await axios.get(`${API_URL}/clusters`);
        setResults(clusterRes.data);
      }
    } catch {
      setError('Could not connect to the backend server.');
    }
  };

  const handleRunClustering = async () => {
    setLoading(true); setError(null);
    try {
      const res = await axios.post(`${API_URL}/cluster`, { n_clusters: kValue });
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Clustering failed. Please try again.');
    } finally { setLoading(false); }
  };

  const handleReset = async () => {
    try { await axios.post(`${API_URL}/dataset/reset`); setResults(null); fetchStats(); }
    catch {}
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setUploading(true); setError(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const uploadRes = await axios.post(`${API_URL}/dataset/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const tmpPath = uploadRes.data.preview.tmp_path;
      await axios.post(`${API_URL}/dataset/confirm`, { tmp_path: tmpPath });
      setResults(null);
      fetchStats();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload. Make sure it is a valid CSV.');
    } finally { setUploading(false); }
  };

  return (
    <div>
      <div className="glass-bg"></div>
      <div className="app-wrapper">

        {/* Header */}
        <header className="app-header">
          <div className="header-brand">
            <div className="header-logo">🎬</div>
            <div>
              <div className="header-title">Netflix Segmentation</div>
              <div className="header-sub">K-Means Content Clustering Dashboard</div>
            </div>
          </div>
          <div className="header-badge">
            <span>🤖</span>
            <span>K-Means Clustering Engine</span>
          </div>
        </header>

        {/* Error Banner */}
        {error && <div className="error-banner">⚠️ {error}</div>}

        {/* Two Column Layout */}
        <div className="grid-layout">
          {/* Config Panel */}
          <section className="card">
            <h2 className="card-title">
              <span style={{ color: 'var(--accent-blue)', fontSize: 20 }}>⚙️</span>
              Configuration
            </h2>

            <div className="form-group">
              <label>Number of Clusters (K)</label>
              <input
                type="number" min="2" max="10" value={kValue}
                onChange={(e) => setKValue(parseInt(e.target.value))}
                className="modern-input"
              />
            </div>

            <button
              className={`btn btn-primary ${loading ? 'loading' : ''}`}
              onClick={handleRunClustering}
              disabled={loading || uploading}
              id="run-clustering-btn"
            >
              {loading ? '⏳ Processing…' : '🚀 Run Segmentation'}
            </button>

            <hr className="divider" />

            <div className="form-group">
              <label>Upload Custom Dataset</label>
              <input type="file" accept=".csv" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileUpload} />
              <button
                className={`btn btn-secondary ${uploading ? 'loading' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                disabled={loading || uploading}
              >
                {uploading ? '⏳ Uploading…' : '📁 Upload CSV File'}
              </button>
            </div>

            <button className="btn btn-secondary mt-3" onClick={handleReset} style={{ opacity: 0.7, fontSize: 13 }}>
              🔄 Reset to Default Dataset
            </button>
          </section>

          {/* Dataset Overview */}
          <section className="card">
            <h2 className="card-title">
              <span style={{ color: 'var(--accent-blue)', fontSize: 20 }}>🗄️</span>
              Dataset Overview
            </h2>
            <div className="stats-grid">
              {[
                { label: 'Titles', val: stats?.dataset_info?.total_rows?.toLocaleString() || '—', color: '#e50914' },
                { label: 'Features', val: stats?.dataset_info?.total_columns || '—', color: '#a855f7' },
                { label: 'Missing', val: stats?.dataset_info?.missing_values ? Object.values(stats.dataset_info.missing_values).reduce((a, b) => a + b, 0).toLocaleString() : '—', color: '#f59e0b' },
                { label: 'Duplicates', val: stats?.dataset_info?.duplicate_count ?? '—', color: '#3b82f6' },
              ].map(({ label, val, color }) => (
                <div key={label} className="stat-box">
                  <span className="stat-value" style={{ color }}>{val}</span>
                  <span className="stat-label">{label}</span>
                </div>
              ))}
            </div>

            {results && (
              <div style={{ marginTop: 20, padding: '14px 16px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10 }}>
                <div style={{ fontSize: 13, color: '#10b981', fontWeight: 600, marginBottom: 4 }}>✅ Clustering Complete</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {kValue} clusters discovered · {results.visualization?.length?.toLocaleString() || 0} data points visualized
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Results */}
        {results && (
          <div className="results-area fade-in">
            {/* Scatter Chart */}
            <section className="card viz-card">
              <h2 className="card-title">
                <span style={{ color: 'var(--accent-blue)', fontSize: 20 }}>🔵</span>
                Cluster Visualization (PCA 2D Projection)
              </h2>
              <div className="chart-container" style={{ height: 460 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis type="number" dataKey="x" name="PC 1" stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 11 }} label={{ value: 'Principal Component 1', position: 'insideBottom', offset: -10, fill: '#52525b', fontSize: 11 }} />
                    <YAxis type="number" dataKey="y" name="PC 2" stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 11 }} label={{ value: 'PC 2', angle: -90, position: 'insideLeft', fill: '#52525b', fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.2)' }} />
                    <Scatter name="Titles" data={results.visualization}>
                      {results.visualization.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.cluster % COLORS.length]} fillOpacity={0.85} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {Array.from({ length: kValue }, (_, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length] }}></div>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Group {i}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Insights & Profiles */}
            <section className="card">
              <h2 className="card-title">
                <span style={{ color: 'var(--accent-green)', fontSize: 20 }}>✅</span>
                Cluster Insights
              </h2>
              <div className="insights-list">
                {results.insights.map((insight, idx) => (
                  <div key={idx} className="insight-item">💡 {insight}</div>
                ))}
              </div>

              <div className="profiles-grid mt-4">
                {results.profiles.map((p) => {
                  const topGenre = p.top_genres && Object.keys(p.top_genres).length > 0 ? Object.keys(p.top_genres)[0] : 'Mixed';
                  return (
                    <div key={p.cluster_id} className="profile-card" style={{ borderTopColor: COLORS[p.cluster_id % COLORS.length] }}>
                      <h3>
                        <span>Group {p.cluster_id}</span>
                        <span className="badge" style={{ background: `${COLORS[p.cluster_id % COLORS.length]}22`, color: COLORS[p.cluster_id % COLORS.length] }}>
                          {p.percentage.toFixed(1)}%
                        </span>
                      </h3>
                      <p><strong>Type</strong><span>{p.movie_percentage > p.tv_percentage ? '🎬 Movies' : '📺 TV Shows'}</span></p>
                      <p><strong>Top Genre</strong><span>{topGenre}</span></p>
                      <p><strong>Avg Year</strong><span>{p.median_release_year ? Math.round(p.median_release_year) : 'N/A'}</span></p>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
