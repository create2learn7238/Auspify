import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import './index.css';

const STAT_CONFIG = [
  { key: 'algorithm', label: 'Algorithm', icon: '🤖', color: '#a855f7', grad: 'linear-gradient(135deg,rgba(168,85,247,0.15),rgba(168,85,247,0.05))' },
  { key: 'cv_mae', label: 'Cross-Val MAE', icon: '📉', color: '#3b82f6', grad: 'linear-gradient(135deg,rgba(59,130,246,0.15),rgba(59,130,246,0.05))' },
  { key: 'cv_rmse', label: 'Cross-Val RMSE', icon: '📊', color: '#f59e0b', grad: 'linear-gradient(135deg,rgba(245,158,11,0.15),rgba(245,158,11,0.05))' },
  { key: 'horizon', label: 'Forecast Horizon', icon: '🔮', color: '#e50914', grad: 'linear-gradient(135deg,rgba(229,9,20,0.15),rgba(229,9,20,0.05))' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <div className="label">{label}</div>
        {payload.map((p, i) => (
          p.value != null && (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 4 }}>
              <span style={{ color: p.color, fontSize: 12 }}>{p.name}</span>
              <span className="value" style={{ fontSize: 13 }}>{p.value}</span>
            </div>
          )
        ))}
      </div>
    );
  }
  return null;
};

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [horizon, setHorizon] = useState(3);

  useEffect(() => {
    fetchData();
  }, [horizon]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://127.0.0.1:5005/api/forecast?horizon=${horizon}`);
      processResponse(response.data);
    } catch {
      setError('Failed to load forecast data. Ensure the backend is running.');
      setLoading(false);
    }
  };

  const processResponse = (responseData) => {
    const { historical, forecast } = responseData;
    const chartData = [];
    historical.forEach(item => chartData.push({ date: item.date, 'Historical': item.count, 'Forecast': null }));
    forecast.forEach(item => chartData.push({ date: item.date, 'Historical': null, 'Forecast': item.count }));
    setData({ raw: responseData, chartData });
    setLoading(false);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setLoading(true); setError(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post('http://127.0.0.1:5005/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      processResponse(response.data);
    } catch {
      setError('Failed to process the uploaded dataset.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="bg-glow"></div>
        <div className="loading">
          <div className="spinner"></div>
          <p className="loading-text">Analyzing historical patterns & generating forecast…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="bg-glow"></div>
        <div className="loading">
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ color: '#ef4444', marginBottom: 12, fontFamily: 'Outfit, sans-serif' }}>Connection Error</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 400, textAlign: 'center' }}>{error}</p>
          <button onClick={fetchData} style={{
            marginTop: 20, padding: '10px 24px', background: 'var(--gradient-red)',
            border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', fontWeight: 600
          }}>Retry</button>
        </div>
      </div>
    );
  }

  const totalHistorical = data.raw.historical.reduce((sum, item) => sum + item.count, 0);
  const avgMonthly = Math.round(totalHistorical / data.raw.historical.length);
  const totalForecasted = data.raw.forecast.reduce((sum, item) => sum + item.count, 0);

  const statValues = {
    algorithm: data.raw.metrics?.algorithm || 'LightGBM',
    cv_mae: data.raw.metrics?.cv_mae || 'N/A',
    cv_rmse: data.raw.metrics?.cv_rmse || 'N/A',
    horizon: `${horizon} Months`,
  };

  return (
    <div>
      <div className="bg-glow"></div>
      <div className="dashboard-container">

        {/* Header */}
        <header className="header">
          <div className="title-group">
            <div className="title-icon">📈</div>
            <div>
              <h1>Netflix <span style={{ color: 'var(--netflix-red-soft)' }}>Forecast</span></h1>
              <p>Advanced Machine Learning Trend Analytics</p>
            </div>
          </div>

          <div className="controls-group">
            <div className="slider-container">
              <div className="slider-label">Horizon</div>
              <input type="range" min="1" max="12" value={horizon}
                onChange={(e) => setHorizon(parseInt(e.target.value))} />
              <div className="slider-val">{horizon} mo</div>
            </div>
            <label className="upload-btn" htmlFor="csv-upload">
              📁 Upload CSV
              <input id="csv-upload" type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
          </div>
        </header>

        {/* Stat Cards */}
        <div className="stats-grid">
          {STAT_CONFIG.map(({ key, label, icon, color, grad }) => (
            <div key={key} className="stat-card">
              <div className="stat-icon-box" style={{ background: grad, color }}>
                <span style={{ fontSize: 20 }}>{icon}</span>
              </div>
              <div>
                <div className="stat-title">{label}</div>
                <div className="stat-value" style={{ color }}>{statValues[key]}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 16, marginBottom: 28 }}>
          {[
            { icon: '📅', label: 'Historical Months', val: data.raw.historical.length, color: '#8b5cf6' },
            { icon: '📦', label: 'Total Historical', val: totalHistorical.toLocaleString(), color: '#3b82f6' },
            { icon: '📌', label: 'Avg Monthly', val: avgMonthly, color: '#06b6d4' },
            { icon: '🔮', label: 'Forecasted Total', val: totalForecasted, color: '#e50914' },
          ].map(({ icon, label, val, color }) => (
            <div key={label} style={{
              background: 'var(--bg-glass)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: '16px 20px'
            }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 22, fontWeight: 800, color, marginBottom: 4 }}>{val}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Main Chart */}
        <div className="glass-panel">
          <div className="panel-title">
            📈 Content Release Trends & Projections
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradHist" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradFore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e50914" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#e50914" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="date" stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                <YAxis stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 13, color: '#a1a1aa', paddingTop: 12 }} />
                <Area type="monotone" dataKey="Historical" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#gradHist)"
                  dot={false} activeDot={{ r: 5, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }} connectNulls={false} />
                <Area type="monotone" dataKey="Forecast" stroke="#e50914" strokeWidth={2.5} fillOpacity={1} fill="url(#gradFore)"
                  strokeDasharray="8 4" dot={false} activeDot={{ r: 5, fill: '#e50914', stroke: '#fff', strokeWidth: 2 }}
                  connectNulls={false} animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Forecast Table */}
        <div className="glass-panel">
          <div className="panel-title">
            🔮 Detailed Categorical Forecast — Next {horizon} Month{horizon > 1 ? 's' : ''}
          </div>
          <div className="table-container">
            <table className="forecast-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Content Type</th>
                  <th>Primary Genre</th>
                  <th>Predicted Releases</th>
                </tr>
              </thead>
              <tbody>
                {data.raw.detailed_forecast?.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.date}</td>
                    <td>{item.type === 'Movie' ? '🎬' : '📺'} {item.type}</td>
                    <td><span style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 10px', borderRadius: 20, fontSize: 12 }}>{item.genre}</span></td>
                    <td>
                      <span style={{
                        fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 16,
                        color: '#e50914'
                      }}>{item.count}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
