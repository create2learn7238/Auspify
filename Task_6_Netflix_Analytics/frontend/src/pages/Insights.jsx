import React, { useState, useEffect } from 'react';
import { fetchInsights } from '../api.js';

const PRIORITY = {
  high: { label: 'High Priority', color: '#e50914', bg: 'rgba(229,9,20,0.08)', border: 'rgba(229,9,20,0.25)' },
  medium: { label: 'Medium Priority', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
  low: { label: 'Low Priority', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.25)' },
};
const CAT_COLORS = {
  'Content Mix': '#e50914', 'Growth': '#10b981', 'Geographic': '#3b82f6',
  'Genre': '#a855f7', 'Duration': '#06b6d4', 'Diversity': '#f59e0b',
  'Audience': '#ec4899', 'Freshness': '#f97316',
};

export default function Insights() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetchInsights()
      .then(d => { setInsights(d.insights); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? insights : insights.filter(i => i.priority === filter);
  const counts = { all: insights.length, high: insights.filter(i => i.priority === 'high').length, medium: insights.filter(i => i.priority === 'medium').length, low: insights.filter(i => i.priority === 'low').length };

  if (loading) return <div className="loading-container"><div className="spinner" /><div className="loading-text">Analyzing catalog trends…</div></div>;

  return (
    <div>
      <div className="hero-banner" style={{ marginBottom: 28 }}>
        <div className="hero-title">💡 Catalog <span className="hero-red">Insights & Findings</span></div>
        <div className="hero-sub">Statistical findings and pattern analysis extracted across the Netflix catalog.</div>
        <div className="hero-stats" style={{ marginTop: 20 }}>
          <div className="hero-stat"><span className="hero-stat-val" style={{ color: '#e50914' }}>{counts.high}</span><span className="hero-stat-lbl">High Priority</span></div>
          <div className="hero-stat"><span className="hero-stat-val" style={{ color: '#f59e0b' }}>{counts.medium}</span><span className="hero-stat-lbl">Medium Priority</span></div>
          <div className="hero-stat"><span className="hero-stat-val" style={{ color: '#3b82f6' }}>{counts.low}</span><span className="hero-stat-lbl">Low Priority</span></div>
          <div className="hero-stat"><span className="hero-stat-val">{counts.all}</span><span className="hero-stat-lbl">Total Insights</span></div>
        </div>
      </div>

      <div className="tab-nav" style={{ marginBottom: 24 }}>
        {[['all','All Insights'],['high','🔴 High'],['medium','🟡 Medium'],['low','🔵 Low']].map(([val, label]) => (
          <button key={val} className={`tab-btn ${filter === val ? 'active' : ''}`} onClick={() => setFilter(val)}>
            {label} ({counts[val]})
          </button>
        ))}
      </div>

      <div className="insights-grid">
        {filtered.map((insight, i) => {
          const cfg = PRIORITY[insight.priority];
          const catColor = CAT_COLORS[insight.category] || '#a1a1aa';
          const isExp = expanded === i;
          return (
            <div key={i} className={`insight-card priority-${insight.priority}`}
              onClick={() => setExpanded(isExp ? null : i)}
              style={{ background: isExp ? cfg.bg : undefined, borderColor: isExp ? cfg.border : undefined }}>
              <div className="insight-icon" style={{ background: `${catColor}18` }}>{insight.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                  <div>
                    <div className="insight-category" style={{ color: catColor }}>{insight.category}</div>
                    <div className="insight-title">{insight.title}</div>
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, flexShrink: 0, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>{cfg.label}</div>
                </div>
                {isExp && (
                  <div style={{ marginTop: 12, padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <div className="insight-detail">{insight.detail}</div>
                  </div>
                )}
                {!isExp && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>Click to expand →</div>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="chart-card" style={{ marginTop: 28 }}>
        <div className="chart-header"><div className="chart-title">🎯 Strategic Recommendations</div></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {[
            { icon: '🌍', title: 'Expand International Content', desc: 'Invest in content from Asia-Pacific and Latin America to capture growing subscriber bases.' },
            { icon: '🎭', title: 'Diversify Genre Mix', desc: 'Balance the drama-heavy catalog with sci-fi and documentary content to reduce churn.' },
            { icon: '📺', title: 'Boost TV Show Pipeline', desc: 'TV Shows drive engagement — increase production pipeline for multi-season series.' },
            { icon: '✨', title: 'Prioritize Fresh Releases', desc: 'Continue adding content within 1 year of release to maintain competitive edge.' },
          ].map((rec, i) => (
            <div key={i} style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{rec.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{rec.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{rec.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
