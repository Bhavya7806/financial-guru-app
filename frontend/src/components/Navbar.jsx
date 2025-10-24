// --- src/components/Navbar.jsx ---

import React from 'react';
import './Navbar.css';
import Logo from '../assets/logo.png'; 
import { Link, useNavigate } from 'react-router-dom'; // 1. Import Link and useNavigate
import { auth } from '../firebase'; // 2. Import auth
import { signOut } from 'firebase/auth'; // 3. Import signOut

// 4. Accept 'user' prop
const Navbar = ({ user, onOpenAuthModal }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); // 5. Redirect to home page on logout
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {/* 6. Logo is now a Link to home */}
        <Link to="/" className="navbar-logo-link">
          <img src={Logo} alt="Financial Guru Logo" className="navbar-logo" />
        </Link>
        <Link to="/" className="navbar-title-link">
          <span className="navbar-title">Financial Guru</span>
        </Link>
      </div>
      <div className="navbar-right">
        <a href="/#about" className="nav-link">About</a>
        <a href="/#contact" className="nav-link">Contact Us</a>

        {/* 7. Conditional rendering based on user state */}
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