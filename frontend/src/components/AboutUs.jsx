// --- src/components/AboutUs/AboutUs.jsx ---

import React from 'react';
import './AboutUs.css';

// ACTION: Add this image to your src/assets folder
import AboutImage from '../assets/about-us-image.jpg';

const AboutUs = () => {
  return (
    <section id="about" className="about-section">
      <div className="about-container">
        <div className="about-content">
          <h2 className="section-title">About Financial Guru</h2>
          <p className="about-description">
            "Financial Guru" was born in a college hackathon with one simple mission:
            to demystify personal finance for everyone. We believe that managing
            your money shouldn't be stressful or complicated.
          </p>
          <p className="about-description">
            Our app uses smart AI to categorize your spending, find saving
            opportunities, and give you a clear view of your financial health.
            We're not just an expense tracker; we're your personal guide to a
            more secure financial future.
          </p>
          <button className="about-learn-more">Learn More</button>
        </div>
        <div className="about-image-wrapper">
          <img src={AboutImage} alt="Financial Guru Dashboard" className="about-image" />
        </div>
      </div>
    </section>
  );
};

export default AboutUs;