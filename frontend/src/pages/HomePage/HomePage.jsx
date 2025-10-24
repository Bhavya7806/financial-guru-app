// --- src/pages/HomePage/HomePage.jsx ---

import React from 'react';
import './HomePage.css';
// 1. Navbar is no longer imported or rendered here
import Hero from '../../components/Hero';     
import Features from '../../components/Features'; 
import AboutUs from '../../components/AboutUs'; 
import Benefits from '../../components/Benefits';
import Footer from '../../components/Footer';

// 2. It no longer needs any props
const HomePage = () => {
  return (
    <div className="homepage">
      {/* 3. Navbar is gone from here */}
      <Hero />
      <Features />
      <AboutUs />
      <Benefits />
      <Footer />
    </div>
  );
};

export default HomePage;