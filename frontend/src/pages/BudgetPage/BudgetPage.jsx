import React, { useState, useMemo, useEffect } from 'react';
import './BudgetPage.css';
import DashboardCard from '../../components/DashboardCard/DashboardCard';
import axios from 'axios';

// Define API endpoints
const BUDGETS_API_URL = 'http://localhost:3001/api/budgets';
const EXPENSES_API_URL = 'http://localhost:3001/api/expenses';

const BudgetPage = () => {
  // Set up states
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState(65000); // This can stay static for now
  const [loading, setLoading] = useState(true);

  // Fetch data on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both budgets and expenses at the same time
        const [budgetsRes, expensesRes] = await Promise.all([
          axios.get(BUDGETS_API_URL),
          axios.get(EXPENSES_API_URL)
        ]);
        
        setBudgets(budgetsRes.data);
        setExpenses(expensesRes.data);
        
      } catch (err) {
        console.error("Error fetching data: ", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate category totals (THIS IS THE CORRECTED LOGIC)
  const categorySpending = useMemo(() => {
    const spending = {};
    // Initialize all budget categories with 0 spending
    budgets.forEach(budget => {
      spending[budget.category] = 0;
    });

    // Sum up expenses by mapping them to the correct budget category
    expenses.forEach(expense => {
      let budgetCategory;
      
      // Map expense categories to budget categories
      if (expense.category === 'Food') {
        budgetCategory = 'Food 🍕';
      } else if (expense.category === 'Housing') {
        budgetCategory = 'Rent 🏠'; // 'Housing' maps to 'Rent 🏠'
      } else if (expense.category === 'Transportation') {
        budgetCategory = 'Transport 🚗'; // 'Transportation' maps to 'Transport 🚗'
      } else if (expense.category === 'Bills') {
        budgetCategory = 'Bills 💼';
      } else if (expense.category === 'Entertainment') {
        budgetCategory = 'Fun 🎉'; // 'Entertainment' maps to 'Fun 🎉'
      }
      
      // If we found a match and that budget exists, add the amount
      if (budgetCategory && spending[budgetCategory] !== undefined) {
        spending[budgetCategory] += expense.amount;
      }
    });

    return spending;
  }, [budgets, expenses]);


  // Calculate totals for the overview card
  const { totalPlanned, totalSpent, totalLeft } = useMemo(() => {
    const spendingBudgets = budgets.filter(b => !b.category.includes('Savings'));
    
    const totalPlanned = spendingBudgets.reduce((acc, b) => acc + b.planned, 0);
    
    const totalSpent = Object.keys(categorySpending)
      .filter(key => !key.includes('Savings'))
      .reduce((acc, key) => acc + categorySpending[key], 0);

    const totalLeft = totalPlanned - totalSpent;
    
    return { totalPlanned, totalSpent, totalLeft };
  }, [budgets, categorySpending]);

  // Helper to get progress bar color
  const getProgressColor = (spent, planned) => {
    if (planned === 0) return 'var(--border-color)';
    const percent = (spent / planned) * 100;
    if (percent >= 100) return '#DC3545'; // Red (Overspent)
    if (percent > 80) return '#FFC107'; // Yellow (Warning)
    return 'var(--primary-color)'; // Green/Blue (Good)
  };

  // Show loading state
  if (loading) {
    return <div className="loading-container">Loading budgets...</div>;
  }

  return (
    <div className="budget-container">
      {/* 1. HEADER */}
      <header className="budget-header">
        <h1>Budget • {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}</h1>
        <div className="income-display">
          Monthly Income: <span>₹{income.toLocaleString('en-IN')}</span>
        </div>
      </header>

      {/* 2. BUDGET OVERVIEW */}
      <div className="budget-overview-grid">
        <DashboardCard title="Planned">
          <div className="overview-stat">₹{totalPlanned.toLocaleString('en-IN')}</div>
        </DashboardCard>
        <DashboardCard title="Spent">
          <div className="overview-stat">₹{totalSpent.toLocaleString('en-IN')}</div>
        </DashboardCard>
        <DashboardCard title="Left">
          <div className="overview-stat" style={{ color: totalLeft < 0 ? '#DC3545' : 'var(--success-color)' }}>
            ₹{totalLeft.toLocaleString('en-IN')}
          </div>
        </DashboardCard>
        <DashboardCard title="Status">
          <div className="overview-stat" style={{ color: 'var(--success-color)' }}>
            🟢 Good
          </div>
        </DashboardCard>
      </div>

      {/* 3. INTERACTIVE BUDGET ALLOCATOR */}
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
            const planned = budget.planned || 0; // Ensure planned is not undefined
            const percent = planned > 0 ? (spent / planned) * 100 : 0;
            const isSavings = budget.category.includes('Savings');
            
            return (
              <div className="allocator-row" key={budget.category}>
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
                  <button className="action-btn">⚙️</button>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. SCENARIO PLANNER */}
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
    </div>
  );
};

export default BudgetPage;