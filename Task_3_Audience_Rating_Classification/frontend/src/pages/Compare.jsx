import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

const MODELS_DATA = [
  { model: 'Decision Tree (Baseline)', accuracy: 0.4772, macro_f1: 0.2896, weighted_f1: 0.4699 },
  { model: 'Decision Tree (Tuned)', accuracy: 0.5017, macro_f1: 0.2903, weighted_f1: 0.4803 },
  { model: 'Random Forest (Base)', accuracy: 0.5512, macro_f1: 0.3529, weighted_f1: 0.5280 },
  { model: 'Random Forest (Tuned)', accuracy: 0.5438, macro_f1: 0.3294, weighted_f1: 0.5187 },
];

const COLORS = ['#52525b', '#a855f7', '#3b82f6', '#e50914'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <div className="label" style={{ marginBottom: 8 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 4 }}>
            <span style={{ color: p.color, fontSize: 12 }}>{p.name}</span>
            <span className="value" style={{ fontSize: 13, color: '#fff' }}>{(p.value * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const Compare = () => {
  const chartData = MODELS_DATA.map(m => ({
    name: m.model.replace('(', '\n('),
    Accuracy: m.accuracy,
    'Macro F1': m.macro_f1,
    'Weighted F1': m.weighted_f1,
  }));

  const best = MODELS_DATA.reduce((a, b) => a.accuracy > b.accuracy ? a : b);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Model Comparison</h1>
        <p className="page-description">Side-by-side performance metrics across all trained classification algorithms.</p>
      </div>

      {/* Best Model Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(229,9,20,0.1), rgba(168,85,247,0.08))',
        border: '1px solid rgba(229,9,20,0.25)', borderRadius: 16, padding: '20px 28px',
        marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap'
      }}>
        <div style={{ fontSize: 32 }}>🏆</div>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Best Performing Model</div>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 20, fontWeight: 800, color: '#fff' }}>{best.model}</div>
          <div style={{ fontSize: 13, color: '#a855f7', marginTop: 4 }}>Accuracy: {(best.accuracy * 100).toFixed(2)}% · Deployed in production</div>
        </div>
      </div>

      {/* Chart */}
      <div className="panel">
        <div className="panel-title">📊 Performance Comparison Chart</div>
        <div style={{ height: 360 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <XAxis dataKey="name" stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
              <YAxis domain={[0, 1]} tickFormatter={v => `${(v * 100).toFixed(0)}%`} stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 13, color: '#a1a1aa' }} />
              <Bar dataKey="Accuracy" fill="#e50914" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Macro F1" fill="#a855f7" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Weighted F1" fill="#3b82f6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model Cards */}
      <div className="model-grid">
        {MODELS_DATA.map((m, i) => (
          <div key={m.model} className={`model-card ${m === best ? 'best' : ''}`}>
            {m === best && <div className="best-badge">⭐ Best Model</div>}
            <div className="model-name">{m.model}</div>
            {[
              { label: 'Accuracy', val: m.accuracy, color: '#e50914' },
              { label: 'Macro F1', val: m.macro_f1, color: '#a855f7' },
              { label: 'Weighted F1', val: m.weighted_f1, color: '#3b82f6' },
            ].map(({ label, val, color }) => (
              <div key={label}>
                <div className="model-metric">
                  <span className="metric-label">{label}</span>
                  <span className="metric-value" style={{ color }}>{(val * 100).toFixed(2)}%</span>
                </div>
                <div className="metric-bar">
                  <div className="metric-fill" style={{ width: `${val * 100}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="panel" style={{ marginTop: 24 }}>
        <div className="panel-title">📝 Notes</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.8 }}>
          The <strong style={{ color: '#fff' }}>Tuned Random Forest</strong> model's accuracy dipped slightly compared to the baseline due to strict hyperparameter constraints designed to prevent overfitting on minority rating classes. Despite this, the Tuned version is deployed in production as it generalizes better to unseen data.
        </p>
      </div>
    </div>
  );
};

export default Compare;
