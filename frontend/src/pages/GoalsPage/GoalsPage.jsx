import React, { useState, useEffect } from 'react';
import './GoalsPage.css';
import DashboardCard from '../../components/DashboardCard/DashboardCard';
import axios from 'axios';
import AddGoalModal from '../../components/AddGoalModal/AddGoalModal';

const GOALS_API_URL = 'http://localhost:3001/api/goals';

// Helper function to calculate months left and format date
const formatGoalDeadline = (deadlineString) => {
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
};

// --- This is the GoalCard sub-component ---
const GoalCard = ({ goal }) => {
  const percent = (goal.saved / goal.target) * 100;
  const deadline = formatGoalDeadline(goal.deadline);

  return (
    <DashboardCard className="goal-card">
      <div className="goal-card-content">
        <h3 className="goal-title">{goal.title}</h3>
        
        <div className="goal-target">
          🎯 Target: <span>₹{goal.target.toLocaleString('en-IN')}</span>
        </div>
        <div className="goal-saved">
          ✅ Saved: <span>₹{goal.saved.toLocaleString('en-IN')}</span>
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

// --- This is the main GoalsPage component ---
const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch goals from the API when the component loads
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await axios.get(GOALS_API_URL);
        setGoals(response.data);
      } catch (err) {
        console.error("Error fetching goals: ", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGoals();
  }, []); // Empty array means this runs once on mount

  // Handler for adding a new goal from the modal
  const handleAddGoal = (newGoalFromServer) => {
    const updatedGoals = [...goals, newGoalFromServer].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    setGoals(updatedGoals);
  };

  // Show a loading message
  if (loading) {
    return <div className="loading-container">Loading goals...</div>;
  }

  return (
    <div className="goals-container">
      {/* 1. HEADER */}
      <header className="goals-header">
        <h1>Your Financial Goals</h1>
        <button 
          className="add-goal-btn"
          onClick={() => setIsModalOpen(true)}
        >
          ➕ Create New Goal
        </button>
      </header>

      {/* 2. ACTIVE GOALS */}
      <h2 className="section-heading">Active Goals</h2>
      <div className="active-goals-grid">
        {goals.map(goal => (
          <GoalCard key={goal.id || goal.title} goal={goal} />
        ))}
      </div>

      {/* 3. GOAL CREATION WIZARD (Static) */}
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

      {/* 4. RECOMMENDED GOALS (Static) */}
      <h2 className="section-heading">Recommended Goals</h2>
      <DashboardCard>
        <div className="recommend-content">
          <p>💡 "Based on your income, we recommend:</p>
          <ul>
            <li><strong>Emergency Fund:</strong> ₹1,50,000 (Priority: High)</li>
            <li><strong>Retirement:</strong> Start with ₹5,000/month (Priority: Medium)</li>
          </ul>
        </div>
      </DashboardCard>

      {/* 5. MODAL */}
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