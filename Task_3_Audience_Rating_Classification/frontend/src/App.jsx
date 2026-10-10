import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Predict from './pages/Predict';
import Compare from './pages/Compare';
import Analytics from './pages/Analytics';
import Insights from './pages/Insights';
import About from './pages/About';

const PAGE_TITLES = {
  '/': { title: 'Dashboard', sub: 'Key metrics & model overview' },
  '/predict': { title: 'Rating Predictor', sub: 'Predict audience rating with ML' },
  '/compare': { title: 'Model Comparison', sub: 'Compare classification algorithms' },
  '/analytics': { title: 'Analytics', sub: 'Deep-dive into dataset patterns' },
  '/insights': { title: 'Model Insights', sub: 'Feature importance & visualizations' },
  '/about': { title: 'About', sub: 'Project details & methodology' },
};

function AppInner() {
  const location = useLocation();
  const page = PAGE_TITLES[location.pathname] || PAGE_TITLES['/'];

  return (
    <>
      <Sidebar />
      <main className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <div>
            <div className="topbar-title">{page.title}</div>
            <div className="topbar-sub">{page.sub}</div>
          </div>
          <div className="topbar-right">
            <div className="topbar-badge">🎬 Netflix Rating Classifier</div>
            <div className="topbar-badge">🤖 Random Forest</div>
          </div>
        </div>
        {/* Page Content */}
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/predict" element={<Predict />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
      </main>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppInner />
    </Router>
  );
}

export default App;
