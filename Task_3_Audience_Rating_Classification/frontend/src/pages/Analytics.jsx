import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Area, AreaChart
} from 'recharts';

const COLORS = ['#e50914', '#a855f7', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <div className="label">{label || payload[0].name}</div>
        <div className="value" style={{ color: payload[0].color || '#ff2d3b' }}>
          {payload[0].value?.toLocaleString()}
        </div>
      </div>
    );
  }
  return null;
};

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://127.0.0.1:5003/api/analytics_data')
      .then(res => { setData(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader"><div className="spinner"></div><p className="loading-text">Loading analytics…</p></div>;
  if (!data) return <div className="panel" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Failed to load data. Make sure the backend is running.</div>;

  const typeData = data.type_data.labels.map((label, i) => ({
    name: label, value: data.type_data.values[i]
  }));

  const ratingData = data.rating_data.labels.map((label, i) => ({
    rating: label, count: data.rating_data.values[i]
  }));

  const yearData = data.year_data.labels.map((label, i) => ({
    year: label, count: data.year_data.values[i]
  }));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Rating Analytics</h1>
        <p className="page-description">Explore the distribution of Netflix content attributes and historical release patterns.</p>
      </div>

      <div className="charts-grid">
        {/* Type Distribution Donut */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Content Type Distribution</div>
              <div className="chart-subtitle">Movies vs TV Shows</div>
            </div>
            <div className="chart-badge">Donut</div>
          </div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4}>
                  {typeData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 13, color: '#a1a1aa' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rating Category Bar */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Top Rating Categories</div>
              <div className="chart-subtitle">Count of titles per rating</div>
            </div>
            <div className="chart-badge">Bar</div>
          </div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingData} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="rating" stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 11 }} angle={-30} textAnchor="end" />
                <YAxis stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {ratingData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Year Trend */}
      <div className="chart-card" style={{ marginBottom: 24 }}>
        <div className="chart-header">
          <div>
            <div className="chart-title">Content Releases Over Time</div>
            <div className="chart-subtitle">Netflix additions since year 2000</div>
          </div>
          <div className="chart-badge">Trend</div>
        </div>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={yearData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="yearGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e50914" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#e50914" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="year" stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
              <YAxis stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" stroke="#e50914" strokeWidth={2.5} fill="url(#yearGrad)"
                dot={false} activeDot={{ r: 5, fill: '#e50914', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
