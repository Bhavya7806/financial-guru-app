import React from 'react';
import './Navbar.css';
import Logo from '../assets/logo.png'; 
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

// The prop onScrollToContact is no longer needed
const Navbar = ({ user, onOpenAuthModal }) => { 
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); 
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo-link">
          <img src={Logo} alt="Financial Guru Logo" className="navbar-logo" />
        </Link>
        <Link to="/" className="navbar-title-link">
          <span className="navbar-title">Financial Guru</span>
        </Link>
      </div>
      <div className="navbar-right">
        {/* About: Remains */}
        <a href="#about" className="nav-link">About</a>
        
        {/* CONTACT US BUTTON HAS BEEN REMOVED */}

        {/* Conditional rendering based on user state */}
        {user ? (
          <>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <button 
              className="nav-button logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button 
              className="nav-button signup-btn"
              onClick={() => onOpenAuthModal('signup')}
            >
              Sign Up
            </button>
            <button 
              className="nav-button login-btn"
              onClick={() => onOpenAuthModal('login')}
            >
              Login
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;