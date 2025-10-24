// --- src/components/AuthModal/AuthModal.jsx ---

import React, { useState } from 'react';
import './AuthModal.css';
import { auth, db } from '../../firebase'; // 1. Import auth and db
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; // 2. Import firestore functions
import { useNavigate } from 'react-router-dom'; // 3. IMPORTED FOR REDIRECTION

// This is an inline SVG for the Google icon
const GoogleIcon = () => (
  <svg className="google-icon" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const AuthModal = ({ initialView, onClose }) => {
  const [isLoginView, setIsLoginView] = useState(initialView === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // 4. INITIALIZE NAVIGATE

  // Helper function to create a user doc in Firestore
  const createUserDocument = async (user, additionalData = {}) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const data = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || additionalData.username || 'User',
      createdAt: serverTimestamp(),
      ...additionalData,
    };
    try {
      await setDoc(userRef, data, { merge: true }); // merge:true prevents overwriting
    } catch (err) {
      console.error("Error creating user document: ", err);
      setError("Failed to save user data.");
    }
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    if (!username) {
      setError("Please enter a username.");
      return;
    }
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update Firebase auth profile
      await updateProfile(user, { displayName: username });
      
      // Create user document in Firestore
      await createUserDocument(user, { username });
      
      onClose(); // Close modal on success
      navigate('/dashboard'); // 5. ADDED REDIRECT
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onClose(); // Close modal on success
      navigate('/dashboard'); // 6. ADDED REDIRECT
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Create a user doc in Firestore (if they are new)
      await createUserDocument(user);
      
      onClose(); // Close modal on success
      navigate('/dashboard'); // 7. ADDED REDIRECT
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-form-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        
        <h2>{isLoginView ? 'Login' : 'Sign Up'}</h2>
        
        {error && <p className="error-message">{error}</p>}
        
        <form onSubmit={isLoginView ? handleEmailLogin : handleEmailSignUp}>
          {!isLoginView && (
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.g.target.value)}
                required
              />
            </div>
          )}
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={isLoginView ? 0 : 6}
            />
          </div>
          <button type="submit" className="auth-btn">
            {isLoginView ? 'Login' : 'Sign Up'}
          </button>
        </form>
        
        <div className="divider">
          <span>OR</span>
        </div>
        
        <button className="google-btn" onClick={handleGoogleSignIn}>
          <GoogleIcon />
          <span>Sign in with Google</span>
        </button>
        
        <p className="toggle-view">
          {isLoginView ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setIsLoginView(!isLoginView)}>
            {isLoginView ? 'Sign Up' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;