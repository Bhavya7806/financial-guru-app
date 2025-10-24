// --- src/components/Benefits.jsx ---

import React from 'react';
import './Benefits.css';

const Benefits = () => {
  return (
    <section id="benefits" className="benefits-section">
      <h2 className="section-title">Real-World Results</h2>
      <p className="section-subtitle">
        See how "Financial Guru" makes a tangible difference.
      </p>
      <div className="benefits-container">
        <div className="benefit-card">
          <span className="benefit-stat">₹2,500/mo</span>
          <p className="benefit-description">
            Average savings per user
          </p>
        </div>
        <div className="benefit-card">
          <span className="benefit-stat">30%</span>
          <p className="benefit-description">
            Reduction in unnecessary subscriptions
          </p>
        </div>
        <div className="benefit-card">
          <span className="benefit-stat">65%</span>
          <p className="benefit-description">
            Reduction in self-reported financial stress
          </p>
        </div>
      </div>
    </section>
  );
};

export default Benefits;