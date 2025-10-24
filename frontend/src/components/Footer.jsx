// --- src/components/Footer.jsx ---

import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-about">
          <h3>Financial Guru</h3>
          <p>Take control of your financial future. 
            <br />
            AI-powered expense tracking that saves you money.
          </p>
        </div>
        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#features">Features</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#contact">Contact</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
          </ul>
        </div>
        <div className="footer-contact">
          <h4>Contact</h4>
          <p>Hackathon HQ, College Campus</p>
          <p>Email: contact@financial.guru</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Financial Guru. All rights reserved. 
        <br />
        Built for the Hackathon.</p>
      </div>
    </footer>
  );
};

export default Footer;