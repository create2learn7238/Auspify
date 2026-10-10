import React from 'react';
import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', icon: '📊', label: 'Dashboard' },
  { to: '/predict', icon: '🎯', label: 'Predict' },
  { to: '/compare', icon: '⚖️', label: 'Compare' },
  { to: '/analytics', icon: '📈', label: 'Analytics' },
  { to: '/insights', icon: '🧠', label: 'Insights' },
  { to: '/about', icon: 'ℹ️', label: 'About' },
];

const Sidebar = () => {
  return (
    <nav id="sidebar" className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">🎬</div>
        <div>
          <div className="logo-title">NetflixML</div>
          <div className="logo-sub">Rating Classifier</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </div>

      {/* Footer status */}
      <div className="sidebar-footer">
        <div className="status-indicator">
          <div className="status-dot"></div>
          <div className="status-text">
            <span className="status-label">ML Model</span>
            Random Forest Active
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
