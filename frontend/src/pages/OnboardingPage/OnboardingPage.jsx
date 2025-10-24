import React, { useState, useMemo } from 'react';
import './OnboardingPage.css';
import axios from 'axios'; // Import axios

// Define the list of goals
const FINANCIAL_GOALS = [
  'Build emergency fund',
  'Save for vacation',
  'Pay off debt',
  'Invest more',
  'Retirement planning',
];

const OnboardingPage = () => {
  // State to track the current step (1 or 2)
  const [currentStep, setCurrentStep] = useState(1);

  // State for Step 1
  const [selectedGoals, setSelectedGoals] = useState([]);

  // State for Step 2
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [monthlyExpenses, setMonthlyExpenses] = useState('');

  // Calculated savings rate for display
  const savingsRate = useMemo(() => {
    const income = parseFloat(monthlyIncome);
    const expenses = parseFloat(monthlyExpenses);
    if (income > 0 && expenses >= 0 && income >= expenses) {
      return (((income - expenses) / income) * 100).toFixed(0);
    }
    return '--'; // Return '--' if calculation isn't possible
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

  // --- Updated handleFinish function ---
  const handleFinish = async () => { // Make it async
    // !!! --- TEMPORARY --- !!!
    // In a real app with auth, you'd get the userId from your auth context/state.
    // For now, we'll hardcode the ID of the 'test@example.com' user
    // you created earlier. Go to Firestore > users collection, find that
    // user, and copy its Document ID here.
    const TEMP_USER_ID = "Np1YKMl0kpbDNRX9xPNxjCKYzVh1"; // <--- PASTE USER ID HERE

    if (TEMP_USER_ID === "YOUR_TEST_USER_DOCUMENT_ID_FROM_FIRESTORE") {
        alert("Developer Note: Please update TEMP_USER_ID in OnboardingPage.jsx with a real User ID from Firestore.");
        return; // Stop if the ID wasn't updated
    }
    // !!! --- END TEMPORARY --- !!!


    const onboardingPayload = {
      userId: TEMP_USER_ID,
      selectedGoals,
      monthlyIncome,
      monthlyExpenses,
    };

    try {
      // Send data to the backend
      await axios.post('http://localhost:3001/api/users/onboarding', onboardingPayload);

      console.log("Onboarding data sent successfully!");
      // **TODO:** Redirect to the dashboard
      // navigate('/dashboard');
      alert("Onboarding Complete! Data saved. Redirecting (simulation)..."); // Placeholder alert

    } catch (err) {
      console.error("Error saving onboarding data:", err);
      alert("Failed to save onboarding data. Please try again."); // Show error to user
    }
  };
  // --- End of updated handleFinish function ---

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
              onClick={goToNextStep} // Go to step 2
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
              disabled={!monthlyIncome || !monthlyExpenses} // Disable if inputs are empty
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