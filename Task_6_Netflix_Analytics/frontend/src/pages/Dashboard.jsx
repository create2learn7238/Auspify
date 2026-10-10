import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  fetchYearlyTrend, fetchTopCountries, fetchRatings, fetchGenres,
  fetchMonthly, fetchTopDirectors, fetchHeatmap, fetchContentDist
} from '../api.js';

const COLORS = ['#e50914', '#a855f7', '#3b82f6', '#06b6d4', '#f59e0b', '#10b981', '#ec4899', '#f97316'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="value" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </div>
      ))}
    </div>
  );
};

export default function Dashboard({ overview }) {
  const [trend, setTrend] = useState(null);
  const [countries, setCountries] = useState(null);
  const [ratings, setRatings] = useState(null);
  const [genres, setGenres] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [directors, setDirectors] = useState(null);
  const [heatmap, setHeatmap] = useState(null);
  const [contentDist, setContentDist] = useState(null);

  useEffect(() => {
    fetchYearlyTrend().then(setTrend);
    fetchTopCountries().then(setCountries);
    fetchRatings().then(setRatings);
    fetchGenres().then(setGenres);
    fetchMonthly().then(setMonthly);
    fetchTopDirectors().then(setDirectors);
    fetchHeatmap().then(setHeatmap);
    fetchContentDist().then(setContentDist);
  }, []);

  const yearlyData = (() => {
    if (!trend?.data) return [];
    const movies = trend.data['Movie'];
    const shows = trend.data['TV Show'];
    const yearMap = {};
    movies?.years?.forEach((y, i) => { yearMap[y] = { year: y, Movie: movies.counts[i], 'TV Show': 0 }; });
    shows?.years?.forEach((y, i) => {
      if (!yearMap[y]) yearMap[y] = { year: y, Movie: 0, 'TV Show': 0 };
      yearMap[y]['TV Show'] = shows.counts[i];
    });
    return Object.values(yearMap).sort((a, b) => a.year - b.year);
  })();

  const monthlyData = monthly?.months?.map((m, i) => ({ month: m, count: monthly.counts[i] })) ?? [];
  const countryData = countries?.countries?.map((c, i) => ({ country: c, count: countries.counts[i] })) ?? [];
  const genreData = genres?.genres?.map((g, i) => ({ genre: g, count: genres.counts[i] })) ?? [];
  const directorData = directors?.directors?.map((d, i) => ({ director: d, count: directors.counts[i] })) ?? [];
  const ratingData = ratings?.ratings?.map((r, i) => ({ rating: r, count: ratings.counts[i] })) ?? [];
  const pieData = contentDist?.data ? Object.entries(contentDist.data).map(([k, v]) => ({ name: k, value: v })) : [];

  const statCards = [
    { label: 'Total Titles', value: overview?.total?.toLocaleString() ?? '…', icon: '🎬', gradient: 'linear-gradient(135deg,#e50914,#ff6b6b)', glow: 'rgba(229,9,20,0.3)' },
    { label: 'Movies', value: overview?.movies?.toLocaleString() ?? '…', icon: '🎥', gradient: 'linear-gradient(135deg,#a855f7,#6366f1)', glow: 'rgba(168,85,247,0.3)' },
    { label: 'TV Shows', value: overview?.shows?.toLocaleString() ?? '…', icon: '📺', gradient: 'linear-gradient(135deg,#3b82f6,#06b6d4)', glow: 'rgba(59,130,246,0.3)' },
    { label: 'Countries', value: overview?.countries?.toLocaleString() ?? '…', icon: '🌍', gradient: 'linear-gradient(135deg,#f59e0b,#ef4444)', glow: 'rgba(245,158,11,0.3)' },
    { label: 'Directors', value: overview?.directors?.toLocaleString() ?? '…', icon: '🎭', gradient: 'linear-gradient(135deg,#10b981,#06b6d4)', glow: 'rgba(16,185,129,0.3)' },
    { label: 'Genre Tags', value: overview?.genres?.toLocaleString() ?? '…', icon: '🏷️', gradient: 'linear-gradient(135deg,#ec4899,#a855f7)', glow: 'rgba(236,72,153,0.3)' },
  ];

  const HeatmapViz = () => {
    if (!heatmap) return <div className="loading-container" style={{ minHeight: 180 }}><div className="spinner" /></div>;
    const { countries: hc, genres: hg, values } = heatmap;
    const maxVal = Math.max(...values.flat(), 1);
    return (
      <div className="heatmap-container">
        <div style={{ display: 'grid', gridTemplateColumns: `120px ${hg.map(() => '1fr').join(' ')}`, gap: 3, minWidth: 600 }}>
          <div />
          {hg.map((g, i) => <div key={i} className="heatmap-header" title={g}>{g.length > 12 ? g.slice(0, 10) + '…' : g}</div>)}
          {hc.map((country, ri) => (
            <React.Fragment key={ri}>
              <div className="heatmap-label" title={country}>{country.length > 14 ? country.slice(0, 13) + '…' : country}</div>
              {values[ri].map((val, ci) => {
                const intensity = val / maxVal;
                return (
                  <div key={ci} className="heatmap-cell"
                    style={{ background: `rgba(229,9,20,${0.08 + intensity * 0.85})`, color: intensity > 0.5 ? '#fff' : '#aaa' }}
                    title={`${country} × ${hg[ci]}: ${val}`}>
                    {val > 0 ? val : ''}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const LoadingChart = () => <div className="loading-container" style={{ minHeight: 260 }}><div className="spinner" /></div>;

  return (
    <div>
      <div className="hero-banner">
        <div className="hero-title">🎬 Netflix Content <span className="hero-red">Analytics</span> Dashboard</div>
        <div className="hero-sub">Deep insights into Netflix's global content library — trends, patterns, and performance metrics.</div>
        <div className="hero-stats">
          {overview && [
            { val: overview.total?.toLocaleString(), lbl: 'Total Titles' },
            { val: overview.countries, lbl: 'Countries' },
            { val: `${overview.year_range?.[0]}–${overview.year_range?.[1]}`, lbl: 'Year Range' },
            { val: overview.directors?.toLocaleString(), lbl: 'Directors' },
          ].map((s, i) => (
            <div key={i} className="hero-stat">
              <span className="hero-stat-val">{s.val}</span>
              <span className="hero-stat-lbl">{s.lbl}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map((card, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: card.gradient, boxShadow: `0 4px 15px ${card.glow}` }}>{card.icon}</div>
            <div>
              <div className="stat-value" style={{ background: card.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{card.value}</div>
              <div className="stat-label">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Yearly Trend + Pie */}
      <div className="charts-grid wide">
        <div className="chart-card">
          <div className="chart-header">
            <div><div className="chart-title">📈 Content Added by Year</div><div className="chart-subtitle">Movies vs TV Shows over time</div></div>
            <span className="chart-badge">2000–2021</span>
          </div>
          {yearlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={yearlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="mg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#e50914" stopOpacity={0.4} /><stop offset="95%" stopColor="#e50914" stopOpacity={0.02} /></linearGradient>
                  <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} /><stop offset="95%" stopColor="#a855f7" stopOpacity={0.02} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="year" stroke="#52525b" tick={{ fill: '#71717a', fontSize: 11 }} />
                <YAxis stroke="#52525b" tick={{ fill: '#71717a', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area type="monotone" dataKey="Movie" stroke="#e50914" fill="url(#mg)" strokeWidth={2} />
                <Area type="monotone" dataKey="TV Show" stroke="#a855f7" fill="url(#sg)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <LoadingChart />}
        </div>
        <div className="chart-card">
          <div className="chart-header"><div><div className="chart-title">🍩 Content Type Split</div><div className="chart-subtitle">Movie vs TV Show distribution</div></div></div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={4} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: '#52525b' }}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : <LoadingChart />}
        </div>
      </div>

      {/* Monthly */}
      <div className="charts-grid full">
        <div className="chart-card">
          <div className="chart-header"><div><div className="chart-title">📅 Monthly Content Additions</div><div className="chart-subtitle">Last 36 months of catalog growth</div></div></div>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} /><stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#52525b" tick={{ fill: '#71717a', fontSize: 9 }} interval={3} />
                <YAxis stroke="#52525b" tick={{ fill: '#71717a', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" stroke="#06b6d4" fill="url(#cg)" strokeWidth={2} name="Additions" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <LoadingChart />}
        </div>
      </div>

      {/* Countries + Ratings */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header"><div><div className="chart-title">🌍 Top 15 Countries</div><div className="chart-subtitle">By number of titles</div></div></div>
          {countryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={countryData} layout="vertical" margin={{ top: 0, right: 20, left: 80, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="#52525b" tick={{ fill: '#71717a', fontSize: 11 }} />
                <YAxis type="category" dataKey="country" stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 11 }} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Titles">
                  {countryData.map((_, i) => <Cell key={i} fill={`hsl(${355 - i * 10},${70 - i * 2}%,${50 + i}%)`} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <LoadingChart />}
        </div>
        <div className="chart-card">
          <div className="chart-header"><div><div className="chart-title">⭐ Rating Distribution</div><div className="chart-subtitle">Content ratings breakdown</div></div></div>
          {ratingData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={ratingData} margin={{ top: 5, right: 10, left: 0, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="rating" stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 10 }} angle={-30} textAnchor="end" />
                <YAxis stroke="#52525b" tick={{ fill: '#71717a', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Titles">
                  {ratingData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <LoadingChart />}
        </div>
      </div>

      {/* Genres + Directors */}
      <div className="charts-grid" style={{ marginTop: 24 }}>
        <div className="chart-card">
          <div className="chart-header"><div><div className="chart-title">🎭 Top 15 Genres</div><div className="chart-subtitle">Most popular content categories</div></div></div>
          {genreData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={genreData} margin={{ top: 5, right: 10, left: 0, bottom: 70 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="genre" stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 9 }} angle={-40} textAnchor="end" />
                <YAxis stroke="#52525b" tick={{ fill: '#71717a', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Titles">
                  {genreData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <LoadingChart />}
        </div>
        <div className="chart-card">
          <div className="chart-header"><div><div className="chart-title">🎬 Top 10 Directors</div><div className="chart-subtitle">Most prolific Netflix directors</div></div></div>
          {directorData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={directorData} layout="vertical" margin={{ top: 0, right: 20, left: 100, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="#52525b" tick={{ fill: '#71717a', fontSize: 11 }} />
                <YAxis type="category" dataKey="director" stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 11 }} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Titles">
                  {directorData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <LoadingChart />}
        </div>
      </div>

      {/* Heatmap */}
      <div className="chart-card" style={{ marginTop: 24 }}>
        <div className="chart-header">
          <div><div className="chart-title">🗺️ Country × Genre Heatmap</div><div className="chart-subtitle">Darker = more content in that combination</div></div>
          <span className="chart-badge">Top 8 × Top 8</span>
        </div>
        <HeatmapViz />
      </div>
    </div>
  );
}
