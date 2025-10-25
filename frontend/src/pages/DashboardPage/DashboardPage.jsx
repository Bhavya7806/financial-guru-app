import React, { useState, useEffect, useMemo } from 'react'; // Removed useRef
import './DashboardPage.css';
import DashboardCard from '../../components/DashboardCard/DashboardCard';
import SpendingPieChart from '../../components/SpendingPieChart/SpendingPieChart';
import NetWorthTrend from '../../components/NetWorthTrend/NetWorthTrend';
import axios from 'axios';
import { auth } from '../../firebase'; 

// API Endpoints (Ensure port is correct)
const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL;
const API_EXPENSES_URL = `${API_BASE_URL}/expenses`;
const API_BUDGETS_URL = `${API_BASE_URL}/budgets`;
const API_GOALS_URL = `${API_BASE_URL}/goals`;
const API_USER_URL = `${API_BASE_URL}/users`;

const DashboardPage = ({ user }) => {
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  
  // --- Data Fetching ---
  useEffect(() => {
    setLoading(true); setError('');
    const userId = auth.currentUser?.uid; // CRITICAL: Get user ID

    if (!userId) { setError("User not logged in."); setLoading(false); return; }

    const fetchData = async () => {
      try {
        // CRITICAL FIX: Add userId query param to all data GET requests
        const [expensesRes, budgetsRes, goalsRes, userRes] = await Promise.all([
          axios.get(`${API_EXPENSES_URL}?userId=${userId}`),
          axios.get(`${API_BUDGETS_URL}?userId=${userId}`),
          axios.get(`${API_GOALS_URL}?userId=${userId}`),
          axios.get(`${API_USER_URL}/${userId}`)
        ]);

        setExpenses(expensesRes.data);
        setBudgets(budgetsRes.data);
        setGoals(goalsRes.data);
        setMonthlyIncome(userRes.data.monthlyIncome || 0);

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please refresh.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); 

  // --- Data Calculations ---
  const cashFlow = useMemo(() => {
    const income = monthlyIncome; 
    const totalExpenses = expenses.reduce((acc, exp) => acc + (Number(exp.amount) || 0), 0);
    const totalSavings = income - totalExpenses;
    return { income: income, expenses: totalExpenses, savings: totalSavings };
  }, [expenses, monthlyIncome]); 

  const spendingBreakdown = useMemo(() => {
    const categories = {};
    expenses.forEach(expense => {
      const categoryName = expense.category || 'Other';
      if (!categories[categoryName]) { categories[categoryName] = 0; }
      categories[categoryName] += Number(expense.amount) || 0;
    });
    return Object.entries(categories).map(([name, amount]) => ({
      name: name, value: amount,
    }));
  }, [expenses]);

  // --- Loading/Error State ---
  if (loading) { return <div className="loading-container">Loading Dashboard...</div>; }
  if (error) { return <div className="error-container">{error}</div>; }
  const username = user?.displayName || 'User';

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-welcome">
        Welcome back, <span className="username">{username}</span>!
      </h1>
      
      <div className="dashboard-grid"> 

        {/* Card 1: Financial Health (Static placeholder) */}
        <DashboardCard title="Financial Health Score">
          <div className="health-score-content">
            <span className="trophy">🏆</span>
            <div className="score">82<span className="total">/100</span></div>
            <div className="score-trend positive">↑ +5 pts from last month</div>
          </div>
        </DashboardCard>

        {/* Card 2: Cash Flow (Uses real data) */}
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
              {/* Uses CSS variables defined in index.css for vibrant theme */}
              <strong style={{ color: cashFlow.savings >= 0 ? 'var(--success-color)' : 'var(--danger-color)' }}>
                ₹{Math.abs(cashFlow.savings).toLocaleString('en-IN')} {cashFlow.savings >= 0 ? '↑' : '↓'}
              </strong>
            </div>
          </div>
        </DashboardCard>

        {/* Card 3: Spending Breakdown (Pass real data) */}
        <SpendingPieChart data={spendingBreakdown} />

        {/* Card 4: Net Worth Trend (Static mock data) */}
        <NetWorthTrend />
        
      </div>
    </div>
  );
};

export default DashboardPage;