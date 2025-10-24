// --- src/components/Features/Features.jsx ---

import React from 'react';
import './Features.css';

// ACTION: Add these images to your src/assets folder
import IconCategorization from '../assets/feature-icon-1.png';
import IconPredict from '../assets/feature-icon-2.png';
import IconInsights from '../assets/feature-icon-3.png';
import IconSecurity from '../assets/feature-icon-4.png';

const Features = () => {
  return (
    <section id="features" className="features-section">
      <h2 className="section-title">Features That Empower You</h2>
      <div className="features-grid">
        <div className="feature-card">
          <img src={IconCategorization} alt="Categorization" className="feature-icon" />
          <h3>Smart Categorization</h3>
          <p>Get 95% accuracy in automatic expense sorting. Know exactly where your money goes.</p>
        </div>
        <div className="feature-card">
          <img src={IconPredict} alt="Prediction" className="feature-icon" />
          <h3>Predict Your Financial Future</h3>
          <p>Our ML models forecast your spending habits and upcoming bills, so you're never caught off guard.</p>
        </div>
        <div className="feature-card">
          <img src={IconInsights} alt="Insights" className="feature-icon" />
          <h3>Personalized Saving Insights</h3>
          <p>Receive custom, AI-driven recommendations on how to cut costs and save more money.</p>
        </div>
        <div className="feature-card">
          <img src={IconSecurity} alt="Security" className="feature-icon" />
          <h3>Bank-Level Security</h3>
          <p>Your financial data is encrypted and protected using the highest industry standards.</p>
        </div>
      </div>
    </section>
  );
};

export default Features;