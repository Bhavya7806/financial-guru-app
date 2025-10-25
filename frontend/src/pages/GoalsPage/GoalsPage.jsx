import React, { useState, useEffect, useMemo } from 'react';
import './GoalsPage.css';
import DashboardCard from '../../components/DashboardCard/DashboardCard';
import axios from 'axios';
import AddGoalModal from '../../components/AddGoalModal/AddGoalModal'; 
import { auth } from '../../firebase'; 

// API Endpoints (ensure port is correct)
const API_BASE_URL = 'http://localhost:8081/api';
const GOALS_API_URL = `${API_BASE_URL}/goals`;
const USER_API_URL = `${API_BASE_URL}/users`;

// Helper function to calculate months left and format date
const formatGoalDeadline = (deadlineString) => {
  if (!deadlineString) return { date: 'N/A', remaining: 'N/A' };
  try {
    const deadlineDate = new Date(deadlineString);
    const today = new Date();
    
    let monthsLeft = (deadlineDate.getFullYear() - today.getFullYear()) * 12;
    monthsLeft -= today.getMonth();
    monthsLeft += deadlineDate.getMonth();
    
    const monthYear = deadlineDate.toLocaleString('default', { month: 'short', year: 'numeric' });
    
    return {
      date: monthYear,
      remaining: `${monthsLeft <= 0 ? 0 : monthsLeft} months`
    };
  } catch (error) {
    console.error("Error formatting date:", deadlineString, error);
    return { date: 'Invalid Date', remaining: 'N/A' };
  }
};

// --- GoalCard Component ---
const GoalCard = ({ goal }) => {
  const targetAmount = goal.target || 0;
  const savedAmount = goal.saved || 0;
  const percent = targetAmount > 0 ? (savedAmount / targetAmount) * 100 : 0;
  const deadline = formatGoalDeadline(goal.deadline);

  return (
    <DashboardCard className="goal-card">
      <div className="goal-card-content">
        <h3 className="goal-title">{goal.title || 'Untitled Goal'}</h3>
        <div className="goal-target">🎯 Target: <span>₹{targetAmount.toLocaleString('en-IN')}</span></div>
        <div className="goal-saved">✅ Saved: <span>₹{savedAmount.toLocaleString('en-IN')}</span></div>
        <div className="progress-bar-container-goals"><div className="progress-bar-goals" style={{ width: `${Math.min(percent, 100)}%` }}></div></div>
        <div className="goal-percent">{percent.toFixed(0)}% Complete</div>
        <div className="goal-deadline">📅 {deadline.date} ({deadline.remaining})</div>
      </div>
    </DashboardCard>
  );
};
// --- End GoalCard ---


// --- Main GoalsPage Component ---
const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState('');
  const [showWizard, setShowWizard] = useState(false);
  const [currentWizardStep, setCurrentWizardStep] = useState(1);
  const [newGoalData, setNewGoalData] = useState({ title: '', type: '', target: '', saved: '0', deadline: '' });
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Fetch initial data
  useEffect(() => {
    setLoading(true); setError('');
    const userId = auth.currentUser?.uid; 

    if (!userId) { setError("User not logged in."); setLoading(false); return; }
    
    const fetchData = async () => {
      try {
        const [goalsRes, recommendationsRes] = await Promise.all([
          axios.get(`${GOALS_API_URL}?userId=${userId}`),
          axios.get(`${USER_API_URL}/${userId}/recommendations`)
        ]);

        setGoals(goalsRes.data);
        setRecommendations(recommendationsRes.data);
      } catch (err) {
        console.error("Error fetching goals data:", err); setError("Failed to load goals. Please refresh.");
      } finally { setLoading(false); }
    };
    fetchData();
  }, []); 

  // Handler for adding a goal via API
  const handleAddGoal = async (goalToAdd) => { 
    const userId = auth.currentUser?.uid; 
    if (!userId) { alert("Authentication required to save goal."); return; }

    const goalPayload = { ...goalToAdd, userId: userId }; 

     try {
        const response = await axios.post(GOALS_API_URL, goalPayload);
        const goalFromServer = response.data;
        const updatedGoals = [...goals, goalFromServer].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        setGoals(updatedGoals);
        setShowWizard(false); 
        setCurrentWizardStep(1); 
        setNewGoalData({ title: '', type: '', target: '', saved: '0', deadline: '' });
      } catch (err) {
        console.error("Error adding goal via API:", err);
        alert("Failed to save goal. Please check details and try again.");
      }
  };

  // --- Wizard Navigation Handlers ---
  const handleWizardNext = () => setCurrentWizardStep(prev => prev + 1);
  const handleWizardBack = () => setCurrentWizardStep(prev => prev - 1);
  const handleWizardInputChange = (e) => {
    const { name, value } = e.target;
    setNewGoalData(prev => ({ ...prev, [name]: value }));
  };
  const handleGoalTypeSelect = (type) => {
    setNewGoalData(prev => ({ ...prev, type: type, title: prev.title || type }));
    handleWizardNext();
  };
  const handleWizardFinish = () => {
     if (!newGoalData.title || !newGoalData.target || !newGoalData.deadline) {
      alert("Please fill in Title, Target Amount, and Deadline.");
      return;
    }
    handleAddGoal(newGoalData);
  };
  // --- End Wizard Handlers ---

  // --- Get unique goal types for filter ---
  const goalTypes = useMemo(() => {
     const types = new Set(goals.map(goal => goal.type || 'Custom'));
     return ['All', ...types];
  }, [goals]);
  // --- End goal types ---


  if (loading) return <div className="loading-container">Loading goals...</div>;
  if (error) return <div className="error-container">{error}</div>;

  return (
    <div className="goals-container">
      {/* Header */}
      <header className="goals-header">
        <h1>Your Financial Goals</h1>
        <button
          className="add-goal-btn"
          onClick={() => {
              setShowWizard(true);
              setCurrentWizardStep(1);
              setNewGoalData({ title: '', type: '', target: '', saved: '0', deadline: '' });
          }}
        >
          ➕ Create New Goal
        </button>
      </header>

      {/* Inline Wizard */}
      {showWizard && (
        <>
          <h2 className="section-heading">Create New Goal</h2>
          <DashboardCard>
            <div className="wizard-container">
              {/* Step Indicator */}
              <div className="wizard-steps">
                <span className={`wizard-step ${currentWizardStep >= 1 ? 'active' : ''}`}>1. Goal Type</span>
                <span className={`wizard-step ${currentWizardStep >= 2 ? 'active' : ''}`}>2. Amount</span>
                <span className={`wizard-step ${currentWizardStep >= 3 ? 'active' : ''}`}>3. Timeline</span>
              </div>
              {/* Wizard Content */}
              <div className="wizard-content">
                {currentWizardStep === 1 && ( /* Step 1 UI */
                  <>
                    <h4>What do you want to save for?</h4>
                    <div className="wizard-options">
                      <button onClick={() => handleGoalTypeSelect('Emergency Fund')}>○ Emergency Fund</button>
                      <button onClick={() => handleGoalTypeSelect('Vacation/Travel')}>○ Vacation/Travel</button>
                      <button onClick={() => handleGoalTypeSelect('Big Purchase')}>○ Big Purchase</button>
                      <button onClick={() => handleGoalTypeSelect('Debt Repayment')}>○ Debt Repayment</button>
                      <button onClick={() => handleGoalTypeSelect('Investment')}>○ Investment</button>
                      <button onClick={() => handleGoalTypeSelect('Custom')}>○ Custom</button>
                    </div>
                  </>
                )}
                {currentWizardStep === 2 && ( /* Step 2 UI */
                  <>
                     <h4>Set the Details</h4>
                     <div className="wizard-inputs">
                        {newGoalData.type === 'Custom' && (
                           <div className="input-group-wizard"><label htmlFor="title">Goal Title</label><input type="text" id="title" name="title" value={newGoalData.title} onChange={handleWizardInputChange} placeholder="e.g., Down Payment"/></div>
                        )}
                        <div className="input-group-wizard"><label htmlFor="target">Target Amount</label><input type="number" id="target" name="target" value={newGoalData.target} onChange={handleWizardInputChange} placeholder="₹50000"/></div>
                         <div className="input-group-wizard"><label htmlFor="saved">Already Saved (Optional)</label><input type="number" id="saved" name="saved" value={newGoalData.saved} onChange={handleWizardInputChange} placeholder="₹0"/></div>
                     </div>
                  </>
                )}
                 {currentWizardStep === 3 && ( /* Step 3 UI */
                   <>
                     <h4>When do you want to achieve this?</h4>
                     <div className="wizard-inputs">
                        <div className="input-group-wizard"><label htmlFor="deadline">Target Date</label><input type="date" id="deadline" name="deadline" value={newGoalData.deadline} onChange={handleWizardInputChange}/></div>
                     </div>
                   </>
                )}
                {/* Navigation Buttons */}
                <div className="wizard-navigation">
                  {currentWizardStep > 1 && (<button className="wizard-btn back-btn" onClick={handleWizardBack}>← Back</button>)}
                  {currentWizardStep < 3 && (<button className="wizard-btn next-btn" onClick={handleWizardNext} disabled={currentWizardStep === 2 && (!newGoalData.target || (newGoalData.type === 'Custom' && !newGoalData.title))}>Next →</button>)}
                   {currentWizardStep === 3 && (<button className="wizard-btn finish-btn" onClick={handleWizardFinish} disabled={!newGoalData.deadline}>Save Goal 🎉</button>)}
                </div>
              </div>
               <button className="wizard-close-btn" onClick={() => setShowWizard(false)}>Cancel</button>
            </div>
          </DashboardCard>
        </>
      )}
      {/* --- End Inline Wizard --- */}

      {/* Active Goals Grid */}
      <h2 className="section-heading">Active Goals</h2>
      {/* --- Filter Dropdown --- */}
      <div className="filter-container">
          <label htmlFor="goal-filter">Filter by Type:</label>
          <select id="goal-filter" value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)}>
              {goalTypes.map(type => (<option key={type} value={type}>{type}</option>))}
          </select>
      </div>
      {/* --- End Filter --- */}
      <div className="active-goals-grid">
         {(() => { // Filter logic
             const filteredGoals = goals.filter(goal => selectedFilter === 'All' || (goal.type || 'Custom') === selectedFilter);
             if (filteredGoals.length > 0) {
                 return filteredGoals.map(goal => (<GoalCard key={goal.id || goal.title} goal={goal} />));
             } else {
                 return <p>No goals found{selectedFilter !== 'All' ? ` for type: ${selectedFilter}` : ''}.</p>;
             }
         })()}
      </div>

      {/* Recommended Goals */}
      <h2 className="section-heading">Recommended Goals</h2>
      <DashboardCard>
         <div className="recommend-content">
          <p>💡 Based on your profile, we recommend focusing on:</p>
          {recommendations.length > 0 ? ( <ul> {recommendations.map((rec, index) => ( <li key={index}> <strong>{rec.title}:</strong> {rec.target} (Priority: {rec.priority}) <br /> <small>{rec.details}</small> </li> ))} </ul> ) : ( <p>No recommendations available right now.</p> )}
        </div>
      </DashboardCard>

    </div>
  );
};

export default GoalsPage;