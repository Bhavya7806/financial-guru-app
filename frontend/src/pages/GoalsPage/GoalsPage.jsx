import React, { useState, useEffect } from 'react';
import './GoalsPage.css';
import DashboardCard from '../../components/DashboardCard/DashboardCard';
import axios from 'axios';
import AddGoalModal from '../../components/AddGoalModal/AddGoalModal';
import { auth } from '../../firebase'; // Import auth

// API Endpoints
// API Endpoints
const GOALS_API_URL = 'http://localhost:8081/api/goals'; // Use new port 8081
const USER_API_URL = 'http://localhost:8081/api/users'; // Use new port 8081// Add User API

// Helper function to calculate months left and format date
const formatGoalDeadline = (deadlineString) => {
  if (!deadlineString) return { date: 'N/A', remaining: 'N/A' }; // Handle undefined deadline
  try {
    const deadlineDate = new Date(deadlineString);
    const today = new Date();
    
    // Calculate months left
    let monthsLeft = (deadlineDate.getFullYear() - today.getFullYear()) * 12;
    monthsLeft -= today.getMonth();
    monthsLeft += deadlineDate.getMonth();
    
    // Format the date (e.g., "Oct 2025")
    const monthYear = deadlineDate.toLocaleString('default', { month: 'short', year: 'numeric' });
    
    return {
      date: monthYear,
      remaining: `${monthsLeft <= 0 ? 0 : monthsLeft} months`
    };
  } catch (error) {
    console.error("Error formatting date:", deadlineString, error);
    return { date: 'Invalid Date', remaining: 'N/A' }; // Handle invalid date format
  }
};

// --- THIS IS THE GoalCard COMPONENT DEFINITION ---
// It MUST come before the main GoalsPage component below
const GoalCard = ({ goal }) => {
  // Add checks for potentially missing goal data
  const targetAmount = goal.target || 0;
  const savedAmount = goal.saved || 0;
  const percent = targetAmount > 0 ? (savedAmount / targetAmount) * 100 : 0;
  const deadline = formatGoalDeadline(goal.deadline);

  return (
    <DashboardCard className="goal-card">
      <div className="goal-card-content">
        <h3 className="goal-title">{goal.title || 'Untitled Goal'}</h3>

        <div className="goal-target">
          🎯 Target: <span>₹{targetAmount.toLocaleString('en-IN')}</span>
        </div>
        <div className="goal-saved">
          ✅ Saved: <span>₹{savedAmount.toLocaleString('en-IN')}</span>
        </div>

        <div className="progress-bar-container-goals">
          <div
            className="progress-bar-goals"
            style={{ width: `${Math.min(percent, 100)}%` }}
          ></div>
        </div>

        <div className="goal-percent">{percent.toFixed(0)}% Complete</div>

        <div className="goal-deadline">
          📅 {deadline.date} ({deadline.remaining})
        </div>
      </div>
    </DashboardCard>
  );
};
// --- END OF GoalCard DEFINITION ---


// --- This is the main GoalsPage component ---
const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');

    const fetchData = async (userId) => {
      if (!userId) {
        setError("User not logged in.");
        setLoading(false);
        return;
      }
      try {
        const [goalsRes, recommendationsRes] = await Promise.all([
          axios.get(GOALS_API_URL),
          axios.get(`${USER_API_URL}/${userId}/recommendations`)
        ]);

        setGoals(goalsRes.data);
        setRecommendations(recommendationsRes.data);

      } catch (err) {
        console.error("Error fetching goals data:", err);
        setError("Failed to load goals. Please refresh.");
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchData(user.uid);
      } else {
        setError("Please log in to view goals.");
        setLoading(false);
      }
    });
    return () => unsubscribe();

  }, []);

  const handleAddGoal = (newGoalFromServer) => {
    const updatedGoals = [...goals, newGoalFromServer].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    setGoals(updatedGoals);
  };

  if (loading) {
    return <div className="loading-container">Loading goals...</div>;
  }
   if (error) {
     return <div className="error-container">{error}</div>;
  }


  return (
    <div className="goals-container">
      {/* Header */}
      <header className="goals-header">
        <h1>Your Financial Goals</h1>
        <button
          className="add-goal-btn"
          onClick={() => setIsModalOpen(true)}
        >
          ➕ Create New Goal
        </button>
      </header>

      {/* Active Goals Grid - Uses GoalCard here */}
      <h2 className="section-heading">Active Goals</h2>
      <div className="active-goals-grid">
        {goals.length > 0 ? (
          goals.map(goal => (
            <GoalCard key={goal.id || goal.title} goal={goal} /> // Make sure GoalCard is defined above
          ))
        ) : (
          <p>No active goals yet. Create one!</p>
        )}
      </div>

      {/* Goal Creation Wizard (Static) */}
      <h2 className="section-heading">Goal Creation Wizard</h2>
      <DashboardCard>
         <div className="wizard-container">
          <div className="wizard-steps">
            <span className="wizard-step active">1. Goal Type</span>
            <span className="wizard-step">2. Amount</span>
            <span className="wizard-step">3. Timeline</span>
            <span className="wizard-step">4. Strategy</span>
          </div>
          <div className="wizard-content">
            <h4>What do you want to save for?</h4>
            <div className="wizard-options">
              <button>○ Emergency Fund</button>
              <button>○ Vacation/Travel</button>
              <button>○ Big Purchase</button>
              <button>○ Debt Repayment</button>
              <button>○ Investment</button>
              <button>○ Custom</button>
            </div>
          </div>
        </div>
      </DashboardCard>

      {/* Recommended Goals (Dynamic) */}
      <h2 className="section-heading">Recommended Goals</h2>
      <DashboardCard>
        <div className="recommend-content">
          <p>💡 Based on your profile, we recommend focusing on:</p>
          {recommendations.length > 0 ? (
            <ul>
              {recommendations.map((rec, index) => (
                <li key={index}>
                  <strong>{rec.title}:</strong> {rec.target} (Priority: {rec.priority})
                  <br />
                  <small>{rec.details}</small>
                </li>
              ))}
            </ul>
          ) : (
            <p>No recommendations available right now.</p>
          )}
        </div>
      </DashboardCard>

      {/* Modal */}
       {isModalOpen && (
        <AddGoalModal
          onClose={() => setIsModalOpen(false)}
          onAddGoal={handleAddGoal}
        />
      )}
    </div>
  );
};

export default GoalsPage;