import React, { useState, useEffect, useRef } from 'react'; // Added useRef
import { Routes, Route, Navigate } from 'react-router-dom';
import { auth, db } from './firebase'; 
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; 

// Import all pages
import HomePage from './pages/HomePage/HomePage';
import AuthModal from './components/AuthModal/AuthModal';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import ExpensesPage from './pages/ExpensesPage/ExpensesPage';
import BudgetPage from './pages/BudgetPage/BudgetPage';
import GoalsPage from './pages/GoalsPage/GoalsPage';
import SettingsPage from './pages/SettingsPage/SettingsPage';
import OnboardingPage from './pages/OnboardingPage/OnboardingPage'; 

// --- ProtectedRoute Component ---
const ProtectedRoute = ({ user, isOnboardingComplete, children }) => {
  if (!user) {
    return <Navigate to="/" replace />; 
  }
  if (!isOnboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }
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
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false); 
  
  // 1. Footer Ref for smooth scrolling
  const footerRef = useRef(null); 

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch User Data to check onboarding status
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists() && userDocSnap.data().onboardingCompleted) {
          setIsOnboardingComplete(true);
        } else {
          setIsOnboardingComplete(false);
        }
      } else {
        setIsOnboardingComplete(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []); 
  
  // 2. Define the smooth scroll handler function
  const scrollToContact = () => {
    if (footerRef.current) {
      footerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openAuthModal = (view) => {
    setAuthInitialView(view);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  if (loading) { return <div>Loading...</div>; }

  return (
    <div className="App">
      {/* 3. Pass scroll handler to Navbar */}
      <Navbar 
        user={user} 
        onOpenAuthModal={openAuthModal} 
        onScrollToContact={scrollToContact} 
      />

      <Routes>
        {/* 4. Pass refs and handlers to HomePage */}
        <Route
          path="/"
          element={user && !isOnboardingComplete 
            ? <Navigate to="/onboarding" replace /> 
            : <HomePage 
                 footerRef={footerRef} 
                 onOpenAuthModal={openAuthModal} 
                 user={user} 
              />} 
        />

        {/* --- Onboarding Route --- */}
        <Route
          path="/onboarding"
          element={
            !user 
              ? <Navigate to="/" replace /> 
              : (isOnboardingComplete 
                  ? <Navigate to="/dashboard" replace /> 
                  : <OnboardingPage 
                        setOnboardingComplete={setIsOnboardingComplete} 
                    />
                )
          }
        />

        {/* --- Protected Routes --- */}
        <Route path="/dashboard" element={<ProtectedRoute user={user} isOnboardingComplete={isOnboardingComplete}><DashboardPage user={user} /></ProtectedRoute>} />
        <Route path="/expenses" element={<ProtectedRoute user={user} isOnboardingComplete={isOnboardingComplete}><ExpensesPage /></ProtectedRoute>} />
        <Route path="/budget" element={<ProtectedRoute user={user} isOnboardingComplete={isOnboardingComplete}><BudgetPage /></ProtectedRoute>} />
        <Route path="/goals" element={<ProtectedRoute user={user} isOnboardingComplete={isOnboardingComplete}><GoalsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute user={user} isOnboardingComplete={isOnboardingComplete}><SettingsPage /></ProtectedRoute>} />

        <Route path="*" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />} />
      </Routes>

      {isAuthModalOpen && (<AuthModal initialView={authInitialView} onClose={closeAuthModal} />)}
    </div>
  );
}

export default App;