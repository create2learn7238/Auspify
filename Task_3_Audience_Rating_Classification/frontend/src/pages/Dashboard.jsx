import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <div className="label">{label}</div>
        <div className="value" style={{ color: '#ff2d3b' }}>{payload[0].value}</div>
      </div>
    );
  }
  return null;
};

const STAT_ICONS = [
  { key: 'total_titles', icon: '🎬', label: 'Total Netflix Titles', color: '#e50914', gradient: 'linear-gradient(135deg,rgba(229,9,20,0.15),rgba(229,9,20,0.05))' },
  { key: 'rating_categories', icon: '🏷️', label: 'Rating Categories', color: '#a855f7', gradient: 'linear-gradient(135deg,rgba(168,85,247,0.15),rgba(168,85,247,0.05))' },
  { key: 'train_samples', icon: '🗄️', label: 'Training Samples', color: '#3b82f6', gradient: 'linear-gradient(135deg,rgba(59,130,246,0.15),rgba(59,130,246,0.05))' },
  { key: 'test_samples', icon: '🧪', label: 'Testing Samples', color: '#06b6d4', gradient: 'linear-gradient(135deg,rgba(6,182,212,0.15),rgba(6,182,212,0.05))' },
  { key: 'final_accuracy', icon: '🎯', label: 'Model Accuracy', color: '#10b981', gradient: 'linear-gradient(135deg,rgba(16,185,129,0.15),rgba(16,185,129,0.05))' },
  { key: 'final_f1', icon: '⚖️', label: 'F1 Score', color: '#f59e0b', gradient: 'linear-gradient(135deg,rgba(245,158,11,0.15),rgba(245,158,11,0.05))' },
];

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_titles: '--', rating_categories: '--',
    train_samples: '--', test_samples: '--',
    final_accuracy: '--', final_f1: '--',
    ratings_data: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://127.0.0.1:5003/api/dashboard_stats')
      .then(res => { setStats(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-title">
          Netflix <span className="hero-red">Audience Rating</span> Classifier
        </div>
        <div className="hero-sub">
          Predicts Netflix audience rating categories (TV-MA, TV-14, PG-13, etc.) based on title duration, release year, country, and genre.
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-val" style={{ color: '#ff2d3b' }}>{stats.total_titles}</div>
            <div className="hero-stat-lbl">Total Titles</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-val" style={{ color: '#a855f7' }}>{stats.rating_categories}</div>
            <div className="hero-stat-lbl">Rating Classes</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-val" style={{ color: '#10b981' }}>{stats.final_accuracy}</div>
            <div className="hero-stat-lbl">Accuracy</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="loader">
          <div className="spinner"></div>
          <p className="loading-text">Loading metrics…</p>
        </div>
      ) : (
        <div className="stats-grid">
          {STAT_ICONS.map(({ key, icon, label, color, gradient }, i) => (
            <div className="stat-card" key={key} style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="stat-icon-box" style={{ background: gradient, color }}>
                <span style={{ fontSize: 22 }}>{icon}</span>
              </div>
              <div>
                <div className="stat-value" style={{ color }}>{stats[key]}</div>
                <div className="stat-label">{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rating Distribution Chart */}
      {stats.ratings_data && stats.ratings_data.length > 0 && (
        <div className="panel">
          <div className="panel-title">📊 Rating Category Distribution</div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.ratings_data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <XAxis dataKey="rating" stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 12 }} angle={-30} textAnchor="end" />
                <YAxis stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {stats.ratings_data.map((_, i) => (
                    <Cell key={i} fill={i % 2 === 0 ? '#e50914' : '#a855f7'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Project Info */}
      <div className="panel">
        <div className="panel-title">🚀 Project Overview</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 14 }}>
          This interactive dashboard is the front-end for the <strong style={{ color: '#fff' }}>Netflix Audience Rating Classification</strong> project.
          It uses an optimized <strong style={{ color: '#ff2d3b' }}>Random Forest</strong> model trained on Netflix catalog data to classify
          content into audience rating categories (e.g., TV-MA, TV-14, PG-13). Navigate using the sidebar to:
        </p>
        <div className="overview-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginTop: 20 }}>
          {[
            { icon: '🎯', label: 'Predict Rating', desc: 'Input content attributes' },
            { icon: '⚖️', label: 'Compare Models', desc: 'Decision Tree vs Random Forest' },
            { icon: '📈', label: 'Analytics', desc: 'Explore dataset patterns' },
            { icon: '🧠', label: 'Insights', desc: 'Feature importance & plots' },
          ].map(({ icon, label, desc }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12, padding: '14px 12px', minWidth: 0
            }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#fff', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
