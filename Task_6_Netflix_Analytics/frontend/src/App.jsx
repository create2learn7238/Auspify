import React, { useState, useEffect } from 'react';
import './index.css';
import Dashboard from './pages/Dashboard.jsx';
import MLModels from './pages/MLModels.jsx';
import Insights from './pages/Insights.jsx';
import Predict from './pages/Predict.jsx';
import { fetchOverview } from './api.js';

const NAV_ITEMS = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard', section: 'Analytics' },
  { id: 'ml', icon: '🤖', label: 'ML Models', section: 'Analytics', badge: '5' },
  { id: 'insights', icon: '💡', label: 'Content Insights', section: 'Analysis' },
  { id: 'predict', icon: '🔮', label: 'Predict', section: 'Analysis' },
];

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [overview, setOverview] = useState(null);
  const [serverOnline, setServerOnline] = useState(false);

  useEffect(() => {
    fetchOverview()
      .then(data => { setOverview(data); setServerOnline(true); })
      .catch(() => setServerOnline(false));
  }, []);

  const pages = { dashboard: Dashboard, ml: MLModels, insights: Insights, predict: Predict };
  const ActivePage = pages[activePage];
  const sections = [...new Set(NAV_ITEMS.map(i => i.section))];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">🎬</div>
          <div>
            <div className="logo-title">NetflixIQ</div>
            <div className="logo-sub">Analytics Engine</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {sections.map(section => (
            <React.Fragment key={section}>
              <div className="nav-section-label">{section}</div>
              {NAV_ITEMS.filter(i => i.section === section).map(item => (
                <div
                  key={item.id}
                  className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                  onClick={() => setActivePage(item.id)}
                >
                  <span className="icon">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                </div>
              ))}
            </React.Fragment>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="status-indicator">
            <div className={`status-dot ${serverOnline ? '' : 'offline'}`} />
            <div className="status-text">
              <span className="status-label">{serverOnline ? 'Server Online' : 'Connecting…'}</span>
              {overview && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{overview.total?.toLocaleString()} records</span>}
            </div>
          </div>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <div>
            <div className="topbar-title">
              {NAV_ITEMS.find(i => i.id === activePage)?.icon}{' '}
              {NAV_ITEMS.find(i => i.id === activePage)?.label}
            </div>
            <div className="topbar-sub">Netflix Content Success Analytics Engine</div>
          </div>
          <div className="topbar-right">
            <div className="topbar-badge">🎬 {overview?.total?.toLocaleString() ?? '…'} titles</div>
            <div className="topbar-badge">🌍 {overview?.countries ?? '…'} countries</div>
            <div className="topbar-badge">📅 {overview?.year_range?.[0] ?? '…'}–{overview?.year_range?.[1] ?? '…'}</div>
          </div>
        </header>

        <div className="page-content">
          <ActivePage overview={overview} />
        </div>
      </div>
    </div>
  );
}

export default App;
