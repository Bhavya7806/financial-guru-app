// --- src/App.jsx --- (Updated)

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import { auth, db } from './firebase'; // 2. Import db
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // 3. Import getDoc

// ... (Import all your pages: HomePage, AuthModal, Navbar, Sidebar, DashboardPage, ExpensesPage, BudgetPage, GoalsPage, SettingsPage)
import HomePage from './pages/HomePage/HomePage';
import AuthModal from './components/AuthModal/AuthModal';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import ExpensesPage from './pages/ExpensesPage/ExpensesPage';
import BudgetPage from './pages/BudgetPage/BudgetPage';
import GoalsPage from './pages/GoalsPage/GoalsPage';
import SettingsPage from './pages/SettingsPage/SettingsPage';
import OnboardingPage from './pages/OnboardingPage/OnboardingPage'; // 4. Import OnboardingPage

// --- ProtectedRoute Component (No changes needed) ---
const ProtectedRoute = ({ user, isOnboardingComplete, children }) => {
  if (!user) {
    return <Navigate to="/" replace />; // Not logged in, go home
  }
  // 5. NEW CHECK: If logged in but onboarding NOT complete, force onboarding
  if (!isOnboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }
  // Logged in AND onboarding complete, show dashboard layout
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialView, setAuthInitialView] = useState('login');

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false); // 6. Add onboarding status state

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // --- 7. FETCH USER DATA ---
        // User is logged in, check their onboarding status in Firestore
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists() && userDocSnap.data().onboardingCompleted) {
          setIsOnboardingComplete(true);
        } else {
          setIsOnboardingComplete(false);
        }
        // --- END FETCH ---
      } else {
        // User logged out, reset onboarding status
        setIsOnboardingComplete(false);
      }
      setLoading(false);
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // Run only once on mount

  const openAuthModal = (view) => {
    setAuthInitialView(view);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Show loading indicator
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <Navbar user={user} onOpenAuthModal={openAuthModal} />

      <Routes>
        {/* --- Public Route --- */}
        <Route
          path="/"
          element={user && !isOnboardingComplete ? <Navigate to="/onboarding" replace /> : <HomePage />} // 8. If logged in but not onboarded, redirect from home too
        />

        {/* --- Onboarding Route --- */}
        {/* Only accessible if logged in but onboarding is NOT complete */}
        <Route
          path="/onboarding"
          element={!user ? <Navigate to="/" replace /> : (isOnboardingComplete ? <Navigate to="/dashboard" replace /> : <OnboardingPage />)} // 9. Logic for onboarding route access
        />

        {/* --- Protected Routes --- */}
        {/* These now use the isOnboardingComplete check inside ProtectedRoute */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user} isOnboardingComplete={isOnboardingComplete}>
              <DashboardPage user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedRoute user={user} isOnboardingComplete={isOnboardingComplete}>
              <ExpensesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/budget"
          element={
            <ProtectedRoute user={user} isOnboardingComplete={isOnboardingComplete}>
              <BudgetPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/goals"
          element={
            <ProtectedRoute user={user} isOnboardingComplete={isOnboardingComplete}>
              <GoalsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute user={user} isOnboardingComplete={isOnboardingComplete}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all for logged-in users trying invalid paths */}
        <Route path="*" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />} />

      </Routes>

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal
          initialView={authInitialView}
          onClose={closeAuthModal}
        />
      )}
    </div>
  );
}

export default App;