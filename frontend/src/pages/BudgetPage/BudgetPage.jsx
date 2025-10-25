import React, { useState, useMemo, useEffect } from 'react';
import './BudgetPage.css';
import DashboardCard from '../../components/DashboardCard/DashboardCard';
import axios from 'axios';
import { auth } from '../../firebase'; // Import auth to get user ID
import EditBudgetModal from '../../components/EditBudgetModal/EditBudgetModal'; // Import the new modal

// Define API endpoints (ensure port is correct, e.g., 8081)
const BUDGETS_API_URL = 'http://localhost:8081/api/budgets';
const EXPENSES_API_URL = 'http://localhost:8081/api/expenses';
const USER_API_URL = 'http://localhost:8081/api/users';

const BudgetPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // State for the Edit Budget Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState(null); // State to hold the item being edited

  // Fetch initial data (budgets, expenses, user income)
  useEffect(() => {
    setError('');
    setLoading(true);

    const fetchData = async (userId) => {
      if (!userId) {
        setError("User ID not found. Cannot fetch data.");
        setLoading(false);
        return;
      }
      try {
        console.log(`Fetching data for user: ${userId}`);
        const [budgetsRes, expensesRes, userRes] = await Promise.all([
          axios.get(BUDGETS_API_URL),
          axios.get(EXPENSES_API_URL),
          axios.get(`${USER_API_URL}/${userId}`)
        ]);
        setBudgets(budgetsRes.data);
        setExpenses(expensesRes.data);
        setIncome(userRes.data.monthlyIncome || 0);
      } catch (err) {
        console.error("Error fetching data: ", err);
        if (err.response && err.response.status === 404) {
             setError("User profile not found. Please complete onboarding.");
        } else {
             setError("Failed to load budget data. Please refresh.");
        }
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchData(user.uid);
      } else {
        setError("Please log in to view your budget.");
        setBudgets([]);
        setExpenses([]);
        setIncome(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Calculate spending per category
  const categorySpending = useMemo(() => {
    const spending = {};
    budgets.forEach(budget => {
      spending[budget.category] = 0;
    });
    expenses.forEach(expense => {
      let budgetCategory;
      if (expense.category === 'Food') budgetCategory = 'Food 🍕';
      else if (expense.category === 'Housing') budgetCategory = 'Rent 🏠';
      else if (expense.category === 'Transportation') budgetCategory = 'Transport 🚗';
      else if (expense.category === 'Bills') budgetCategory = 'Bills 💼';
      else if (expense.category === 'Entertainment') budgetCategory = 'Fun 🎉';
      if (budgetCategory && spending[budgetCategory] !== undefined) {
        spending[budgetCategory] += expense.amount;
      }
    });
    return spending;
  }, [budgets, expenses]);

  // Calculate overview totals
  const { totalPlanned, totalSpent, totalLeft } = useMemo(() => {
    const spendingBudgets = budgets.filter(b => !b.category.includes('Savings'));
    const totalPlanned = spendingBudgets.reduce((acc, b) => acc + (b.planned || 0), 0); // Handle potential undefined planned
    const totalSpent = Object.keys(categorySpending)
      .filter(key => !key.includes('Savings'))
      .reduce((acc, key) => acc + categorySpending[key], 0);
    const totalLeft = totalPlanned - totalSpent;
    return { totalPlanned, totalSpent, totalLeft };
  }, [budgets, categorySpending]);

  // Helper for progress bar color
  const getProgressColor = (spent, planned) => {
    if (!planned || planned === 0) return 'var(--border-color)';
    const percent = (spent / planned) * 100;
    if (percent >= 100) return '#DC3545'; // Red
    if (percent > 80) return '#FFC107'; // Yellow
    return 'var(--primary-color)'; // Blue/Green
  };

  // --- Modal Handler Functions ---
  const openEditModal = (budget) => {
    setBudgetToEdit(budget);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setBudgetToEdit(null);
  };

  const handleBudgetSaved = (updatedBudget) => {
    // Update the budget list in the state
    setBudgets(prevBudgets =>
      prevBudgets.map(b =>
        // Match by category OR id if available from backend response
        (b.category === updatedBudget.category || b.id === updatedBudget.id)
          ? { ...b, ...updatedBudget } // Merge updates, keep existing id if not in response
          : b
      )
    );
    // Recalculations happen automatically via useMemo
  };
  // --- End Modal Handlers ---


  // Show loading or error state
  if (loading) {
    return <div className="loading-container">Loading budgets...</div>;
  }
  if (error) {
     return <div className="error-container">{error}</div>;
  }

  return (
    <div className="budget-container">
      {/* Header */}
      <header className="budget-header">
        <h1>Budget • {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}</h1>
        <div className="income-display">
          Monthly Income: <span>₹{(income ?? 0).toLocaleString('en-IN')}</span>
        </div>
      </header>

      {/* Budget Overview */}
      <div className="budget-overview-grid">
        <DashboardCard title="Planned"><div className="overview-stat">₹{totalPlanned.toLocaleString('en-IN')}</div></DashboardCard>
        <DashboardCard title="Spent"><div className="overview-stat">₹{totalSpent.toLocaleString('en-IN')}</div></DashboardCard>
        <DashboardCard title="Left"><div className="overview-stat" style={{ color: totalLeft < 0 ? '#DC3545' : 'var(--success-color)' }}>₹{totalLeft.toLocaleString('en-IN')}</div></DashboardCard>
        <DashboardCard title="Status"><div className="overview-stat" style={{ color: 'var(--success-color)' }}>🟢 Good</div></DashboardCard>
      </div>

      {/* Interactive Budget Allocator */}
      <div className="allocator-card">
        <header className="allocator-header">
          <span className="col-category">Category</span>
          <span className="col-budget">Budget</span>
          <span className="col-spent">Spent</span>
          <span className="col-progress">Progress</span>
          <span className="col-action">Action</span>
        </header>

        <div className="allocator-body">
          {budgets.map((budget) => {
            const spent = categorySpending[budget.category] || 0;
            const planned = budget.planned || 0;
            const percent = planned > 0 ? (spent / planned) * 100 : 0;
            const isSavings = budget.category.includes('Savings');

            return (
              <div className="allocator-row" key={budget.id || budget.category}> {/* Use id if available */}
                <span className="col-category">{budget.category}</span>
                <span className="col-budget">₹{planned.toLocaleString('en-IN')}</span>
                <span className="col-spent">{isSavings ? '---' : `₹${spent.toLocaleString('en-IN')}`}</span>
                <span className="col-progress">
                  {!isSavings && (
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar"
                        style={{
                          width: `${Math.min(percent, 100)}%`,
                          backgroundColor: getProgressColor(spent, planned)
                        }}
                      ></div>
                    </div>
                  )}
                </span>
                <span className="col-action">
                  {/* Call openEditModal when gear is clicked */}
                  <button className="action-btn" onClick={() => openEditModal(budget)}>
                    ⚙️
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scenario Planner */}
      <div className="scenario-grid">
        <DashboardCard title="🎯 What-if Simulator">
          <div className="scenario-content">
            <p className="scenario-text">"If I reduce eating out by 30%..."</p>
            <p className="scenario-result">→ You could save <strong>₹3,600 more</strong> this month</p>
            <p className="scenario-result">→ Your savings rate would increase from <strong>25% to 31%</strong></p>
          </div>
        </DashboardCard>
        <DashboardCard title="🚀 Goal Accelerator">
          <div className="scenario-content">
            <p className="scenario-text">"Want to reach ₹1,00,000 savings faster?"</p>
            <p className="scenario-result">→ Save <strong>₹2,000 more</strong> monthly = <strong>3 months earlier</strong></p>
          </div>
        </DashboardCard>
      </div>

      {/* Edit Budget Modal */}
      {isEditModalOpen && (
        <EditBudgetModal
          budgetToEdit={budgetToEdit}
          onClose={closeEditModal}
          onBudgetSaved={handleBudgetSaved}
        />
      )}
    </div>
  );
};

export default BudgetPage;