import React, { useState, useEffect, useMemo } from 'react';
import './DashboardPage.css';
import DashboardCard from '../../components/DashboardCard/DashboardCard';
import SpendingPieChart from '../../components/SpendingPieChart/SpendingPieChart';
import NetWorthTrend from '../../components/NetWorthTrend/NetWorthTrend';
import axios from 'axios';
// Import auth to get user ID for fetching user profile (containing income)
import { auth } from '../../firebase'; 

// API Endpoints (ensure port is correct)
const API_EXPENSES_URL = 'http://localhost:8081/api/expenses';
const API_BUDGETS_URL = 'http://localhost:8081/api/budgets';
const API_GOALS_URL = 'http://localhost:8081/api/goals';
const API_USER_URL = 'http://localhost:8081/api/users'; // Add User API URL

const DashboardPage = ({ user }) => {
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState(0); // New state for dynamic income

  // --- Data Fetching ---
  useEffect(() => {
    setLoading(true);
    setError('');

    const fetchData = async (userId) => { // Takes userId now
      if (!userId) {
          setError("User not logged in.");
          setLoading(false);
          return;
      }
      try {
        const [expensesRes, budgetsRes, goalsRes, userRes] = await Promise.all([
          axios.get(API_EXPENSES_URL),
          axios.get(API_BUDGETS_URL),
          axios.get(API_GOALS_URL),
          axios.get(`${API_USER_URL}/${userId}`) // Fetch User Data
        ]);

        setExpenses(expensesRes.data);
        setBudgets(budgetsRes.data);
        setGoals(goalsRes.data);
        // Set Income from User Data
        setMonthlyIncome(userRes.data.monthlyIncome || 0);

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please refresh.");
      } finally {
        setLoading(false);
      }
    };
    
    // Listen for auth state to get the UID
    const unsubscribe = auth.onAuthStateChanged(firebaseUser => {
        if (firebaseUser) {
            fetchData(firebaseUser.uid);
        } else {
            setLoading(false);
        }
    });
    return () => unsubscribe();

  }, []);


  // --- Data Calculations (useMemo) ---

  // 1. Calculate Cash Flow (Income, Expenses, Savings)
  const cashFlow = useMemo(() => {
    // Use the dynamic income fetched from the user profile
    const income = monthlyIncome; 
    
    // Calculate total expenses from the fetched data
    const totalExpenses = expenses.reduce((acc, exp) => acc + (Number(exp.amount) || 0), 0);
    
    // Savings is calculated directly from income - expenses
    const totalSavings = income - totalExpenses;

    return {
      income: income,
      expenses: totalExpenses,
      savings: totalSavings,
    };
  }, [expenses, monthlyIncome]); // Recalculate if expenses OR income changes


  // 2. Calculate Spending Breakdown (for Pie Chart)
  const spendingBreakdown = useMemo(() => {
    const categories = {};
    expenses.forEach(expense => {
      const categoryName = expense.category || 'Other';
      if (!categories[categoryName]) {
        categories[categoryName] = 0;
      }
      categories[categoryName] += Number(expense.amount) || 0;
    });

    // Format for Recharts
    return Object.entries(categories).map(([name, amount]) => ({
      name: name,
      value: amount,
    }));
  }, [expenses]);

  // --- Loading/Error State ---
  if (loading) {
    return <div className="loading-container">Loading Dashboard...</div>;
  }
  if (error) {
    return <div className="error-container">{error}</div>;
  }

  const username = user?.displayName || 'User';

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-welcome">
        Welcome back, <span className="username">{username}</span>!
      </h1>
      
      <div className="dashboard-grid">

        {/* Card 1: Financial Health (Placeholder) */}
        <DashboardCard title="Financial Health Score">
          {/* ... (static content remains) ... */}
          <div className="health-score-content">
            <span className="trophy">🏆</span>
            <div className="score">
              82<span className="total">/100</span>
            </div>
            <div className="score-trend positive">
              ↑ +5 pts from last month
            </div>
          </div>
        </DashboardCard>

        {/* Card 2: Cash Flow (NOW USES REAL DATA) */}
        <DashboardCard title="Cash Flow This Month">
          <div className="cash-flow-content">
            <div className="cash-flow-item income">
              <span>Income</span>
              <strong>₹{cashFlow.income.toLocaleString('en-IN')}</strong>
            </div>
            <div className="cash-flow-item expenses">
              <span>Expenses</span>
              <strong>₹{cashFlow.expenses.toLocaleString('en-IN')}</strong>
            </div>
            <div className="cash-flow-item savings">
              <span>Savings</span>
              <strong style={{ color: cashFlow.savings >= 0 ? 'var(--success-color)' : '#DC3545' }}>
                ₹{Math.abs(cashFlow.savings).toLocaleString('en-IN')} {cashFlow.savings >= 0 ? '↑' : '↓'}
              </strong>
            </div>
          </div>
        </DashboardCard>

        {/* Card 3: Spending Breakdown (Pass real data) */}
        <SpendingPieChart data={spendingBreakdown} />

        {/* Card 4: Net Worth Trend (Static mock data remains) */}
        <NetWorthTrend />
        
      </div>
    </div>
  );
};

export default DashboardPage;