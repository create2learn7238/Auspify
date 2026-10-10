import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

const COLORS = ['#e50914', '#ff2d3b', '#a855f7', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#f97316', '#14b8a6', '#ef4444', '#84cc16', '#e879f9', '#38bdf8'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <div className="label">{label}</div>
        <div className="value" style={{ color: '#ff2d3b' }}>{(payload[0].value * 100).toFixed(2)}%</div>
      </div>
    );
  }
  return null;
};

const Insights = () => {
  const [featureData, setFeatureData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState({});

  useEffect(() => {
    axios.get('http://127.0.0.1:5003/api/feature_importance')
      .then(res => {
        const chartData = res.data.labels.map((label, i) => ({
          feature: label, importance: res.data.values[i]
        }));
        setFeatureData(chartData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Model Insights</h1>
        <p className="page-description">Feature importance, confusion matrices, and classification visualizations.</p>
      </div>

      {/* Feature Importance */}
      <div className="panel">
        <div className="panel-title">🔍 Feature Importance — Tuned Random Forest</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>
          Top 15 features driving the model's rating predictions, ranked by mean impurity decrease.
        </p>
        {loading ? (
          <div className="loader"><div className="spinner"></div></div>
        ) : featureData ? (
          <div style={{ height: 420 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={featureData} margin={{ top: 5, right: 15, left: typeof window !== 'undefined' && window.innerWidth < 600 ? 90 : 140, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" tickFormatter={v => `${(v * 100).toFixed(1)}%`} stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                <YAxis type="category" dataKey="feature" stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: typeof window !== 'undefined' && window.innerWidth < 600 ? 10 : 12 }} width={typeof window !== 'undefined' && window.innerWidth < 600 ? 85 : 130} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                  {featureData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>Feature data unavailable. Ensure backend is running.</p>
        )}
      </div>

      {/* Confusion Matrices */}
      <div className="panel">
        <div className="panel-title">🎯 Confusion Matrices</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>
          Visualizing true vs predicted classifications — each row is a true class, each column a predicted class.
        </p>
        <div className="charts-grid">
          {[
            { title: 'Random Forest (Baseline)', src: 'http://127.0.0.1:5003/outputs/plots/random_forest_confusion_matrix.png', key: 'rf' },
            { title: 'Decision Tree (Baseline)', src: 'http://127.0.0.1:5003/outputs/plots/decision_tree_confusion_matrix.png', key: 'dt' },
          ].map(({ title, src, key }) => (
            <div key={key} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16, textAlign: 'center' }}>{title}</div>
              {!imgError[key] ? (
                <img
                  src={src} alt={title}
                  className="insight-image"
                  onError={() => setImgError(e => ({ ...e, [key]: true }))}
                />
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 20px' }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🖼️</div>
                  <p style={{ fontSize: 13 }}>Image not available. Run the backend to generate confusion matrix plots.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Insights;
