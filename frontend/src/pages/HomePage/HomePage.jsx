import React, { useRef, forwardRef } from 'react';
import './HomePage.css';
import Hero from '../../components/Hero';     
import Features from '../../components/Features'; 
import AboutUs from '../../components/AboutUs'; 
import Benefits from '../../components/Benefits';
import Footer from '../../components/Footer';

// Use React.forwardRef if Footer needs a ref
const FooterWithRef = forwardRef((props, ref) => <Footer {...props} ref={ref} />);

const HomePage = ({ onOpenAuthModal, user, onScrollToContact }) => {
  
  return (
    <div className="homepage">
      {/* Pass modal/user status to Hero */}
      <Hero user={user} onOpenAuthModal={onOpenAuthModal} />
      
      {/* ADD ID FOR LEARN MORE BUTTON TO SCROLL TO */}
      <section id="features">
         <Features /> 
      </section>
      
      {/* ADD ID FOR ABOUT SECTION TO SCROLL TO */}
      <section id="about">
         <AboutUs /> 
      </section>
      
      <Benefits />
      
      {/* Footer is attached via the ref from App.jsx's global state */}
      <FooterWithRef /> 
    </div>
  );
};

export default HomePage;