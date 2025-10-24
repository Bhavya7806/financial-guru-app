// --- src/components/Hero/Hero.jsx ---

import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <div className="hero-container">
      <div className="hero-content">
        <h1 className="hero-title">Take Control of Your Financial Future</h1>
        <p className="hero-subtitle">
          AI-powered expense tracking that actually saves you money.
        </p>
        <div className="hero-buttons">
          <button className="hero-btn primary">Get Started</button>
          <button className="hero-btn secondary">Watch Demo</button>
        </div>
      </div>
      <div className="hero-overlay"></div>
    </div>
  );
};

export default Hero;