import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { predictContent } from '../api.js';

const RATINGS = ['G','PG','PG-13','R','NC-17','TV-G','TV-PG','TV-14','TV-MA','TV-Y','TV-Y7','Unknown'];
const COUNTRIES = ['United States','India','United Kingdom','Canada','France','Japan','South Korea','Spain','Germany','Australia','Other'];
const GENRES = ['Dramas','Comedies','Documentaries','Action','Thrillers','Romance','Horror','Children','International','Crime'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const PIE_COLORS = { 'Movie': '#e50914', 'TV Show': '#a855f7' };

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return <div className="custom-tooltip"><div className="value" style={{ color: payload[0].fill }}>{payload[0].name}: {payload[0].value}%</div></div>;
};

const PRESETS = [
  { label: '🎬 Feature Film (90m)', values: { release_year: 2021, year_added: 2021, month_added: 9, genre_count: 2, duration: 90, country: 'United States', genre: 'Dramas', rating: 'TV-MA' } },
  { label: '📺 Mini-Series (45m)', values: { release_year: 2020, year_added: 2021, month_added: 3, genre_count: 3, duration: 45, country: 'United Kingdom', genre: 'Crime', rating: 'TV-MA' } },
  { label: '🍿 Comedy Movie (105m)', values: { release_year: 2019, year_added: 2020, month_added: 11, genre_count: 2, duration: 105, country: 'United States', genre: 'Comedies', rating: 'PG-13' } },
  { label: '🌏 Anime Series (24m)', values: { release_year: 2022, year_added: 2022, month_added: 4, genre_count: 3, duration: 24, country: 'Japan', genre: 'Action', rating: 'TV-14' } }
];

export default function Predict() {
  const [form, setForm] = useState({ release_year: 2021, year_added: 2021, month_added: 9, genre_count: 2, duration: 90, country: 'United States', genre: 'Dramas', rating: 'TV-MA' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [predictDuration, setPredictDuration] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [history, setHistory] = useState([]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: isNaN(value) || value === '' ? value : +value }));
  };

  const handleApplyPreset = (presetValues) => {
    setForm(prev => ({ ...prev, ...presetValues }));
    setErrorMsg(null);
  };

  const handlePredict = async () => {
    setLoading(true);
    setErrorMsg(null);
    const startMs = performance.now();
    try {
      const res = await predictContent(form);
      const elapsed = Math.round(performance.now() - startMs);
      setPredictDuration(elapsed);
      setResult(res);
      setHistory(prev => [{ ...form, ...res, ts: new Date().toLocaleTimeString(), elapsed }, ...prev.slice(0, 4)]);
    } catch (e) {
      console.error(e);
      setErrorMsg('Failed to fetch prediction from backend (port 5006). Please ensure server is running.');
    } finally {
      setLoading(false);
    }
  };

  const pieData = result ? Object.entries(result.probabilities).map(([name, value]) => ({ name, value })) : [];

  return (
    <div>
      <div className="hero-banner" style={{ marginBottom: 28 }}>
        <div className="hero-title">🔮 Content <span className="hero-red">Predictor</span></div>
        <div className="hero-sub">Enter content attributes to predict content type using our trained Random Forest model.</div>
        
        {/* Quick Presets */}
        <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>⚡ Quick Presets:</span>
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(p.values)}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 20,
                padding: '5px 12px',
                fontSize: 12,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(229,9,20,0.2)'; e.currentTarget.style.borderColor = 'rgba(229,9,20,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="predict-page-grid">
        {/* Form */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">📝 Content Attributes</div>
              <div className="chart-subtitle">Fill in details to get an instant prediction</div>
            </div>
          </div>
          {errorMsg && (
            <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: 8, color: '#fca5a5', fontSize: 13 }}>
              ⚠️ {errorMsg}
            </div>
          )}
          <div className="predict-form">
            <div className="form-group">
              <label className="form-label">Release Year</label>
              <input className="form-input" type="number" name="release_year" value={form.release_year} onChange={handleChange} min={1950} max={2025} />
            </div>
            <div className="form-group">
              <label className="form-label">Year Added to Netflix</label>
              <input className="form-input" type="number" name="year_added" value={form.year_added} onChange={handleChange} min={2008} max={2025} />
            </div>
            <div className="form-group">
              <label className="form-label">Month Added</label>
              <select className="form-select" name="month_added" value={form.month_added} onChange={handleChange}>
                {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Duration (minutes)</label>
              <input className="form-input" type="number" name="duration" value={form.duration} onChange={handleChange} min={1} max={300} />
            </div>
            <div className="form-group">
              <label className="form-label">Genre Count</label>
              <input className="form-input" type="number" name="genre_count" value={form.genre_count} onChange={handleChange} min={1} max={5} />
            </div>
            <div className="form-group">
              <label className="form-label">Country</label>
              <select className="form-select" name="country" value={form.country} onChange={handleChange}>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Primary Genre</label>
              <select className="form-select" name="genre" value={form.genre} onChange={handleChange}>
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Rating</label>
              <select className="form-select" name="rating" value={form.rating} onChange={handleChange}>
                {RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <button className="btn btn-primary" onClick={handlePredict} disabled={loading}
            style={{ marginTop: 20, width: '100%', justifyContent: 'center', fontSize: 15, padding: '12px 20px' }}>
            {loading ? '⏳ Predicting…' : '🔮 Predict Content Type'}
          </button>
        </div>

        {/* Result */}
        <div className="chart-card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="chart-header">
            <div>
              <div className="chart-title">🎯 Prediction Result</div>
              <div className="chart-subtitle">Random Forest classification output</div>
            </div>
            {predictDuration && (
              <span style={{ fontSize: 12, color: 'var(--accent-green)', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '3px 10px', borderRadius: 12, fontWeight: 700 }}>
                ⚡ {predictDuration}ms
              </span>
            )}
          </div>
          {result ? (
            <>
              <div className="predict-result">
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div className="result-icon">{result.prediction === 'Movie' ? '🎬' : '📺'}</div>
                  <div>
                    <div className="result-label">Predicted Content Type</div>
                    <div className="result-prediction">{result.prediction}</div>
                    <div className="result-confidence">Confidence: {result.confidence}%</div>
                  </div>
                </div>
                <div className="prob-bars">
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Class Probabilities</div>
                  {Object.entries(result.probabilities).map(([cls, prob]) => (
                    <div key={cls} className="prob-bar-item">
                      <span className="prob-bar-label">{cls}</span>
                      <div className="prob-bar-track"><div className="prob-bar-fill" style={{ width: `${prob}%`, background: PIE_COLORS[cls] || '#a855f7' }} /></div>
                      <span className="prob-bar-val">{prob}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Probability Distribution</div>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} innerRadius={35} dataKey="value" paddingAngle={4}
                      label={({ name, value }) => `${name}: ${value}%`} labelLine={{ stroke: '#52525b' }}>
                      {pieData.map((entry, i) => <Cell key={i} fill={PIE_COLORS[entry.name] || '#a855f7'} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔮</div>
              <div style={{ fontSize: 14 }}>Fill in the form and click Predict to see the result.</div>
            </div>
          )}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="chart-card">
          <div className="chart-header"><div className="chart-title">📜 Prediction History</div></div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Time','Release Year','Country','Genre','Duration','Prediction','Confidence'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{h.ts}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{h.release_year}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{h.country}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{h.genre}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{h.duration} min</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ background: h.prediction === 'Movie' ? 'rgba(229,9,20,0.15)' : 'rgba(168,85,247,0.15)', color: h.prediction === 'Movie' ? '#ff2d3b' : '#c084fc', border: `1px solid ${h.prediction === 'Movie' ? 'rgba(229,9,20,0.3)' : 'rgba(168,85,247,0.3)'}`, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{h.prediction}</span>
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-green)', fontWeight: 700 }}>{h.confidence}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
