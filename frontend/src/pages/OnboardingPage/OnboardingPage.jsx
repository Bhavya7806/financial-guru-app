import React, { useState, useMemo } from 'react';
import './OnboardingPage.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase'; // CRITICAL: Import auth to get the current user UID

// Define the list of goals
const FINANCIAL_GOALS = [
  'Build emergency fund',
  'Save for vacation',
  'Pay off debt',
  'Invest more',
  'Retirement planning',
];

// CRITICAL: Receive setOnboardingComplete prop from App.jsx
const OnboardingPage = ({ setOnboardingComplete }) => { 
  // State to track the current step (1 or 2)
  const [currentStep, setCurrentStep] = useState(1);

  // State for Step 1
  const [selectedGoals, setSelectedGoals] = useState([]);

  // State for Step 2
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [monthlyExpenses, setMonthlyExpenses] = useState('');

  // Initialize navigate
  const navigate = useNavigate();

  // Calculated savings rate for display
  const savingsRate = useMemo(() => {
    const income = parseFloat(monthlyIncome);
    const expenses = parseFloat(monthlyExpenses);
    if (income > 0 && expenses >= 0 && income >= expenses) {
      return (((income - expenses) / income) * 100).toFixed(0);
    }
    return '--'; 
  }, [monthlyIncome, monthlyExpenses]);


  // --- Handlers ---
  const handleGoalToggle = (goal) => {
    setSelectedGoals(prevSelected =>
      prevSelected.includes(goal)
        ? prevSelected.filter(g => g !== goal)
        : [...prevSelected, goal]
    );
  };

  const goToNextStep = () => {
    setCurrentStep(2);
  };

  // --- Final handleFinish function for seamless redirect ---
  const handleFinish = async () => {
    // 1. CRITICAL FIX: Get User ID directly from Firebase Auth
    const firebaseUser = auth.currentUser; 
    
    if (!firebaseUser || !firebaseUser.uid) {
        alert("Authentication Error: Please log in again.");
        return; 
    }
    const USER_UID = firebaseUser.uid; // Use the real UID!

    const onboardingPayload = {
      userId: USER_UID, // Pass the dynamic UID
      selectedGoals,
      monthlyIncome,
      monthlyExpenses,
    };

    try {
      // 2. Send data to the backend (Saves to Firestore)
      await axios.post('http://localhost:8081/api/users/onboarding', onboardingPayload);
      await axios.post(`${import.meta.env.VITE_BACKEND_API_URL}/users/onboarding`, onboardingPayload);

      console.log("Onboarding data sent successfully!");

      // 3. Update the state in App.jsx immediately
      if (typeof setOnboardingComplete === 'function') {
          setOnboardingComplete(true);
      }
      
      // 4. Redirect to dashboard
      navigate('/dashboard'); 

    } catch (err) {
      console.error("Error saving onboarding data:", err);
      alert("Failed to save onboarding data. Please try again.");
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <h2>Welcome to Financial Guru!</h2>

        {/* --- Step 1: Financial Goals --- */}
        {currentStep === 1 && (
          <>
            <p>Let's personalize your experience. Select your main financial goals:</p>
            <div className="step-indicator">STEP 1 of 2: Financial Goals</div>

            <div className="goals-list">
              {FINANCIAL_GOALS.map((goal) => (
                <label key={goal} className="goal-item">
                  <input
                    type="checkbox"
                    checked={selectedGoals.includes(goal)}
                    onChange={() => handleGoalToggle(goal)}
                  />
                  {goal}
                </label>
              ))}
            </div>

            <button
              className="onboarding-next-btn"
              disabled={selectedGoals.length === 0}
              onClick={goToNextStep} 
            >
              Next: Financial Picture →
            </button>
          </>
        )}

        {/* --- Step 2: Current Financial Picture --- */}
        {currentStep === 2 && (
          <>
            <p>Tell us a bit about your current finances.</p>
            <div className="step-indicator">STEP 2 of 2: Financial Picture</div>

            <div className="financial-inputs">
              <div className="input-group-onboarding">
                <label htmlFor="income">Monthly take-home income</label>
                <div className="input-with-symbol">
                  <span>₹</span>
                  <input
                    type="number"
                    id="income"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    placeholder="e.g., 65000"
                  />
                </div>
              </div>

              <div className="input-group-onboarding">
                <label htmlFor="expenses">Estimated current monthly spending</label>
                 <div className="input-with-symbol">
                  <span>₹</span>
                  <input
                    type="number"
                    id="expenses"
                    value={monthlyExpenses}
                    onChange={(e) => setMonthlyExpenses(e.target.value)}
                    placeholder="e.g., 48000"
                  />
                 </div>
              </div>

              <div className="savings-rate-display">
                <label>Estimated Current Savings Rate</label>
                <div className="rate-value">{savingsRate}%</div>
              </div>
            </div>

            <button
              className="onboarding-next-btn finish-btn"
              disabled={!monthlyIncome || !monthlyExpenses} 
              onClick={handleFinish}
            >
              Finish Setup 🎉
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;