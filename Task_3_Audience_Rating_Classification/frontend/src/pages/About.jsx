import React from 'react';

const SKILLS = [
  { icon: '🌲', label: 'Decision Trees', desc: 'Baseline classification model with tree-based splitting' },
  { icon: '🌳', label: 'Random Forest', desc: 'Ensemble of decision trees for improved accuracy' },
  { icon: '📊', label: 'Classification Metrics', desc: 'Accuracy, Precision, Recall, F1-Score analysis' },
  { icon: '🔧', label: 'Hyperparameter Tuning', desc: 'RandomizedSearchCV for optimal model parameters' },
];

const FEATURES = [
  { icon: '🎯', label: 'Rating Prediction', desc: 'Predict audience rating from content attributes' },
  { icon: '🏆', label: 'Multi-Class Classification', desc: 'TV-MA, TV-14, PG-13, R, and more' },
  { icon: '⚖️', label: 'Model Comparison', desc: 'Side-by-side metrics across all models' },
  { icon: '📈', label: 'Accuracy Analysis', desc: 'Confusion matrices and score breakdowns' },
];

const About = () => {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">About the Project</h1>
        <p className="page-description">Task 3 (Medium) — Netflix Audience Rating Classification</p>
      </div>

      {/* Hero Info */}
      <div className="hero-banner">
        <div className="hero-title">
          Netflix <span className="hero-red">Rating</span> Classifier
        </div>
        <div className="hero-sub">
          Build a machine learning model that predicts the audience rating category of Netflix content using content attributes like genre, duration, country, and release year.
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-val" style={{ color: '#ff2d3b' }}>2</div>
            <div className="hero-stat-lbl">ML Models</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-val" style={{ color: '#a855f7' }}>5</div>
            <div className="hero-stat-lbl">Workflow Steps</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-val" style={{ color: '#10b981' }}>Medium</div>
            <div className="hero-stat-lbl">Difficulty</div>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="panel">
        <div className="panel-title">Core Machine Learning Concepts</div>
        <div className="model-grid">
          {SKILLS.map(({ icon, label, desc }) => (
            <div key={label} style={{
              background: 'rgba(229,9,20,0.05)', border: '1px solid rgba(229,9,20,0.15)',
              borderRadius: 12, padding: 20
            }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Features */}
      <div className="panel">
        <div className="panel-title">Project Features</div>
        <div className="insights-grid">
          {FEATURES.map(({ icon, label, desc }) => (
            <div key={label} className="insight-card priority-medium">
              <div className="insight-icon" style={{ background: 'rgba(245,158,11,0.1)', fontSize: 24 }}>{icon}</div>
              <div>
                <div className="insight-title">{label}</div>
                <div className="insight-detail">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Workflow */}
      <div className="panel">
        <div className="panel-title">Implementation Steps</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>
          {[
            'Analyze rating categories and understand class distribution',
            'Prepare training datasets with feature engineering',
            'Train classification models (Decision Tree + Random Forest)',
            'Optimize model performance with hyperparameter tuning',
            'Evaluate prediction accuracy using classification metrics',
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: 'var(--gradient-red)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 13, color: '#fff'
              }}>
                {i + 1}
              </div>
              <div style={{ paddingTop: 6, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{step}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="panel">
        <div className="panel-title">🛠️ Technology Stack</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {['Flask', 'React', 'Scikit-learn', 'Pandas', 'NumPy', 'Recharts', 'Vite', 'Python 3'].map(tech => (
            <div key={tech} style={{
              background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: 20,
              padding: '6px 16px', fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500
            }}>{tech}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
