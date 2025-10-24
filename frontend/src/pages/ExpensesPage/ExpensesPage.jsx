import React, { useState, useMemo, useEffect } from 'react';
import './ExpensesPage.css';
import DashboardCard from '../../components/DashboardCard/DashboardCard';
import ExpenseItem from '../../components/ExpenseItem/ExpenseItem';
import AddExpenseModal from '../../components/AddExpenseModal/AddExpenseModal';
import axios from 'axios';

// Use the correct port for your Node server (e.g., 8081 if you changed it)
const API_BASE_URL = 'http://localhost:8081/api/expenses';

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true); // Loading state for expenses
  const [timelineInsight, setTimelineInsight] = useState(''); // State for insight
  const [loadingInsight, setLoadingInsight] = useState(true); // Loading state for insight

  // --- Fetch Expenses ---
  useEffect(() => {
    setLoading(true);
    const fetchExpenses = async () => {
      try {
        const response = await axios.get(API_BASE_URL);
        const sortedExpenses = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setExpenses(sortedExpenses);
      } catch (err) {
        console.error("Error fetching expenses: ", err);
        // Handle error display if needed
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, []);

  // --- Fetch Timeline Insight ---
  useEffect(() => {
    const fetchTimelineInsight = async () => {
      setLoadingInsight(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/timeline`);
        setTimelineInsight(response.data.insight || "Could not generate timeline insight.");
      } catch (err) {
        console.error("Error fetching timeline insight:", err);
        setTimelineInsight("Timeline analysis is currently unavailable.");
      } finally {
        setLoadingInsight(false);
      }
    };

    // Only fetch insight if there are expenses or after initial load
    if (!loading) { // Fetch after initial expense load finishes
        if (expenses.length > 0) {
            fetchTimelineInsight();
        } else {
            setTimelineInsight("Add expenses to see timeline insights.");
            setLoadingInsight(false);
        }
    }
  }, [expenses, loading]); // Depend on expenses and the main loading state

  // --- Calculations (useMemo Hooks) ---
  const totalExpense = useMemo(() => {
    return expenses.reduce((acc, expense) => acc + expense.amount, 0);
  }, [expenses]);

  const categoryBreakdown = useMemo(() => {
    const categories = {};
    expenses.forEach(expense => {
      if (!categories[expense.category]) {
        categories[expense.category] = 0;
      }
      // Ensure amount is a number before adding
      categories[expense.category] += Number(expense.amount) || 0;
    });
    if (totalExpense === 0) return [];
    return Object.entries(categories).map(([name, amount]) => ({
      name,
      amount,
      percent: (amount / totalExpense) * 100,
    })).sort((a, b) => b.percent - a.percent);
  }, [expenses, totalExpense]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense =>
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [expenses, searchTerm]);

  // --- Handler for Adding Expense ---
  const handleAddExpense = (newExpenseFromServer) => {
    setExpenses([newExpenseFromServer, ...expenses]);
  };

  // --- Loading State ---
  if (loading) {
    return <div className="loading-container">Loading expenses...</div>;
  }

  // --- Render Component ---
  return (
    <div className="expenses-container">
      {/* 1. HEADER */}
      <header className="expenses-header">
        <h1>Expenses • {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}</h1>
        <div className="total-expense-display">
          Total: <span>-₹{totalExpense.toLocaleString('en-IN')}</span>
        </div>
      </header>

      {/* 2. CONTROLS BAR */}
      <div className="controls-bar">
        <button className="control-btn">📅 Date Filter</button>
        <input
          type="search"
          placeholder="🔍 Search expenses..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="control-btn">📁 Export</button>
        <button
          className="control-btn add-btn"
          onClick={() => setIsModalOpen(true)}
        >
          ➕ Add Expense
        </button>
      </div>

      {/* 3. MAIN LAYOUT */}
      <div className="expenses-main-layout">
        {/* Expense List Section */}
        <section className="expense-list-section">
          {filteredExpenses.length > 0 ? (
            filteredExpenses.map(expense => (
              <ExpenseItem key={expense.id} expense={expense} />
            ))
          ) : (
            <p>No expenses found{searchTerm ? ' matching your search' : ''}. Add one to get started!</p>
          )}
        </section>

        {/* Category Breakdown Section */}
        <aside className="category-breakdown-section">
          <DashboardCard title="Category Breakdown">
            <div className="category-list">
              {categoryBreakdown.map(category => (
                <div key={category.name} className="category-item">
                  <div className="category-info">
                    <span>{category.name}</span>
                    <strong>{category.percent.toFixed(0)}%</strong>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar"
                      style={{ width: `${category.percent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>
        </aside>
      </div>

      {/* 4. BOTTOM SECTION - SPENDING TIMELINE */}
      <div className="bottom-section">
        <DashboardCard title="Spending Timeline">
          {loadingInsight ? (
            <p>Analyzing timeline...</p>
          ) : (
            <p>{timelineInsight}</p>
          )}
          <p className="timeline-placeholder">📈 Daily spending heatmap + trend line will go here.</p>
        </DashboardCard>
      </div>

      {/* 5. MODAL */}
      {isModalOpen && (
        <AddExpenseModal
          onClose={() => setIsModalOpen(false)}
          onAddExpense={handleAddExpense}
        />
      )}
    </div>
  );
};

export default ExpensesPage;