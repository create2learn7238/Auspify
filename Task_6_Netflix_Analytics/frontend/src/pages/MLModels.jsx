import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Cell, ResponsiveContainer
} from 'recharts';
import { trainModels, fetchFeatureImportance, fetchConfusionMatrix } from '../api.js';

const COLORS = ['#e50914', '#a855f7', '#3b82f6', '#06b6d4', '#f59e0b'];
const MODEL_COLORS = {
  'Random Forest': '#e50914',
  'Gradient Boosting': '#a855f7',
  'Logistic Regression': '#3b82f6',
  'SVM': '#06b6d4',
  'KNN': '#f59e0b'
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="value" style={{ color: p.color }}>{p.name}: {p.value}%</div>
      ))}
    </div>
  );
};

export default function MLModels() {
  const [results, setResults] = useState(null);
  const [featureImp, setFeatureImp] = useState(null);
  const [confMatrix, setConfMatrix] = useState(null);
  const [selectedModel, setSelectedModel] = useState('Random Forest');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('comparison');

  const [errorMsg, setErrorMsg] = useState(null);

  const handleTrain = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await trainModels();
      setResults(res);
      const fi = await fetchFeatureImportance();
      setFeatureImp(fi);
      const cm = await fetchConfusionMatrix('Random Forest');
      setConfMatrix(cm);
    } catch (e) {
      console.error(e);
      setErrorMsg('Failed to connect to backend server on port 5006. Please ensure Flask is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleModelSelect = async (name) => {
    setSelectedModel(name);
    if (results) {
      const cm = await fetchConfusionMatrix(name);
      setConfMatrix(cm);
    }
  };

  const bestModel = results
    ? Object.entries(results.models).reduce((a, b) => a[1].accuracy > b[1].accuracy ? a : b)[0]
    : null;

  const radarData = results
    ? ['accuracy', 'precision', 'recall', 'f1'].map(m => ({
        metric: m.charAt(0).toUpperCase() + m.slice(1),
        ...Object.fromEntries(Object.entries(results.models).map(([k, v]) => [k, v[m]]))
      }))
    : [];

  const comparisonData = results
    ? Object.entries(results.models).map(([name, metrics]) => ({
        name: name.replace(' ', '\n'), Accuracy: metrics.accuracy,
        F1: metrics.f1, Precision: metrics.precision, Recall: metrics.recall,
      }))
    : [];

  const featureData = featureImp?.features?.map((f, i) => ({
    feature: f.replace(/_/g, ' ').replace('genre ', '').replace('country ', ''),
    importance: +(featureImp.importances[i] * 100).toFixed(2)
  })) ?? [];

  return (
    <div>
      <div className="hero-banner" style={{ marginBottom: 24 }}>
        <div className="hero-title">🤖 Machine Learning <span className="hero-red">Pipeline</span></div>
        <div className="hero-sub">Train 5 classifiers, compare performance, analyze feature importance & confusion matrices.</div>
        <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn btn-primary" onClick={handleTrain} disabled={loading}>
            {loading ? '⏳ Training…' : '🚀 Train All 5 Models'}
          </button>
          {results && (
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              Best: <strong style={{ color: 'var(--accent-gold)' }}>⭐ {bestModel}</strong>{' '}
              <strong style={{ color: 'var(--accent-green)' }}>{results.models[bestModel]?.accuracy}%</strong>
            </span>
          )}
        </div>
        {errorMsg && (
          <div style={{ marginTop: 12, padding: '10px 16px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: 8, color: '#fca5a5', fontSize: 13 }}>
            ⚠️ {errorMsg}
          </div>
        )}
      </div>

      {loading && (
        <div className="loading-container">
          <div className="spinner" />
          <div className="loading-text">⚡ Training 5 benchmark models with cross-validation… (~2–3s)</div>
        </div>
      )}

      {results && !loading && (
        <>
          <div className="section-title">📊 Model <span className="accent">Performance</span></div>
          <div className="model-grid" style={{ marginBottom: 28 }}>
            {Object.entries(results.models).map(([name, metrics]) => (
              <div key={name} className={`model-card ${name === bestModel ? 'best' : ''}`}
                onClick={() => handleModelSelect(name)}
                style={{ borderColor: selectedModel === name ? MODEL_COLORS[name] : undefined }}>
                {name === bestModel && <div className="best-badge">⭐ Best Model</div>}
                <div className="model-name" style={{ color: MODEL_COLORS[name] }}>{name}</div>
                {[['Accuracy', metrics.accuracy], ['F1 Score', metrics.f1], ['Precision', metrics.precision], ['Recall', metrics.recall]].map(([label, val]) => (
                  <div key={label}>
                    <div className="model-metric">
                      <span className="metric-label">{label}</span>
                      <span className="metric-value" style={{ color: MODEL_COLORS[name] }}>{val}%</span>
                    </div>
                    <div className="metric-bar"><div className="metric-fill" style={{ width: `${val}%`, background: MODEL_COLORS[name] }} /></div>
                  </div>
                ))}
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>CV: {metrics.cv_mean}% ± {metrics.cv_std}%</div>
              </div>
            ))}
          </div>

          <div className="tab-nav">
            {[['comparison','📊 Bar Comparison'],['radar','🕸️ Radar Chart'],['features','🔍 Feature Importance'],['confusion','🔲 Confusion Matrix']].map(([t, label]) => (
              <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{label}</button>
            ))}
          </div>

          {activeTab === 'comparison' && (
            <div className="chart-card" style={{ marginBottom: 24 }}>
              <div className="chart-header"><div><div className="chart-title">📊 Model Comparison</div><div className="chart-subtitle">Accuracy, F1, Precision & Recall side-by-side</div></div></div>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={comparisonData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                  <YAxis domain={[80, 100]} stroke="#52525b" tick={{ fill: '#71717a', fontSize: 11 }} unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  {['Accuracy', 'F1', 'Precision', 'Recall'].map((m, i) => (
                    <Bar key={m} dataKey={m} fill={COLORS[i]} radius={[3, 3, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === 'radar' && (
            <div className="chart-card" style={{ marginBottom: 24 }}>
              <div className="chart-header"><div><div className="chart-title">🕸️ Radar Comparison</div><div className="chart-subtitle">Multi-metric model overlay</div></div></div>
              <ResponsiveContainer width="100%" height={360}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[85, 100]} tick={{ fill: '#71717a', fontSize: 10 }} />
                  {Object.keys(results.models).map((name, i) => (
                    <Radar key={name} name={name} dataKey={name} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.12} strokeWidth={2} />
                  ))}
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === 'features' && featureData.length > 0 && (
            <div className="chart-card" style={{ marginBottom: 24 }}>
              <div className="chart-header"><div><div className="chart-title">🔍 Feature Importance (Random Forest)</div><div className="chart-subtitle">Top features driving classification</div></div></div>
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={featureData} layout="vertical" margin={{ top: 0, right: 20, left: 130, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" stroke="#52525b" tick={{ fill: '#71717a', fontSize: 11 }} unit="%" />
                  <YAxis type="category" dataKey="feature" stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 11 }} width={130} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="importance" radius={[0, 4, 4, 0]} name="Importance %">
                    {featureData.map((_, i) => <Cell key={i} fill={`hsl(${355 - i * 15},${80 - i * 3}%,${55 + i}%)`} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === 'confusion' && confMatrix && (
            <div className="chart-card" style={{ marginBottom: 24 }}>
              <div className="chart-header"><div><div className="chart-title">🔲 Confusion Matrix — {selectedModel}</div><div className="chart-subtitle">Predicted vs Actual classification results</div></div></div>
              <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <div className="cm-container">
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>← Predicted →</div>
                  <div className="cm-row"><div style={{ width: 80 }} />{confMatrix.classes.map(c => <div key={c} className="cm-axis-label">{c}</div>)}</div>
                  {confMatrix.matrix.map((row, ri) => {
                    const rowSum = row.reduce((a, b) => a + b, 0);
                    return (
                      <div key={ri} className="cm-row">
                        <div className="cm-axis-label" style={{ textAlign: 'right', paddingRight: 8 }}>{confMatrix.classes[ri]}</div>
                        {row.map((val, ci) => {
                          const isDiag = ri === ci;
                          return (
                            <div key={ci} className="cm-cell"
                              style={{ background: isDiag ? 'rgba(229,9,20,0.3)' : 'rgba(168,85,247,0.1)', border: `1px solid ${isDiag ? 'rgba(229,9,20,0.4)' : 'rgba(255,255,255,0.06)'}`, color: isDiag ? '#fff' : '#a1a1aa' }}>
                              <div className="cm-value">{val.toLocaleString()}</div>
                              <div className="cm-pct">{rowSum > 0 ? ((val / rowSum) * 100).toFixed(1) : 0}%</div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>{selectedModel} — Full Metrics</div>
                  {['accuracy', 'precision', 'recall', 'f1', 'cv_mean'].map(m => (
                    <div key={m} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{m.replace('_', ' ')}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: MODEL_COLORS[selectedModel] }}>{results.models[selectedModel]?.[m]}%</span>
                      </div>
                      <div className="metric-bar"><div className="metric-fill" style={{ width: `${results.models[selectedModel]?.[m]}%`, background: MODEL_COLORS[selectedModel] }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {!results && !loading && (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🤖</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Ready to Train</div>
          <div style={{ fontSize: 14 }}>Click "Train All 5 Models" above to start the ML pipeline with 5-fold cross-validation.</div>
        </div>
      )}
    </div>
  );
}
