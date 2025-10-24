import React, { useState, useMemo, useEffect } from 'react';
import './ExpensesPage.css';
import DashboardCard from '../../components/DashboardCard/DashboardCard';
import ExpenseItem from '../../components/ExpenseItem/ExpenseItem';
import AddExpenseModal from '../../components/AddExpenseModal/AddExpenseModal';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api/expenses';

const ExpensesPage = () => {
  // ... (all your existing useState, useEffect, and useMemo hooks)
  const [expenses, setExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await axios.get(API_URL);
        const sortedExpenses = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setExpenses(sortedExpenses);
      } catch (err) {
        console.error("Error fetching expenses: ", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, []);

  const totalExpense = useMemo(() => {
    return expenses.reduce((acc, expense) => acc + expense.amount, 0);
  }, [expenses]);

  const categoryBreakdown = useMemo(() => {
    const categories = {};
    expenses.forEach(expense => {
      if (!categories[expense.category]) {
        categories[expense.category] = 0;
      }
      categories[expense.category] += expense.amount;
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
      expense.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [expenses, searchTerm]);

  const handleAddExpense = (newExpenseFromServer) => {
    setExpenses([newExpenseFromServer, ...expenses]);
  };
  const currentDate = new Date();
const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });
const currentYear = currentDate.getFullYear();

  if (loading) {
    return <div className="loading-container">Loading expenses...</div>;
  }

  return (
    <div className="expenses-container">
      {/* 1. HEADER */}
      <header className="expenses-header">
      <h1>Expenses • {currentMonthName} {currentYear}</h1>
        <div className="total-expense-display">
          Total: <span>-₹{totalExpense.toLocaleString('en-IN')}</span>
        </div>
      </header>

      {/* 2. CONTROLS (WITH NEW BUTTONS) */}
      <div className="controls-bar">
        {/* --- ADDED THIS BUTTON --- */}
        <button className="control-btn">📅 Date Filter</button>
        <input
          type="search"
          placeholder="🔍 Search expenses..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/* --- ADDED THIS BUTTON --- */}
        <button className="control-btn">📁 Export</button>
        <button 
          className="control-btn add-btn"
          onClick={() => setIsModalOpen(true)}
        >
          ➕ Add Expense
        </button>
      </div>

      {/* 3. MAIN LAYOUT (No changes) */}
      <div className="expenses-main-layout">
        {/* ... (expense-list-section) ... */}
        <section className="expense-list-section">
          {filteredExpenses.length > 0 ? (
            filteredExpenses.map(expense => (
              <ExpenseItem key={expense.id} expense={expense} />
            ))
          ) : (
            <p>No expenses found. Add one to get started!</p>
          )}
        </section>
        
        {/* ... (category-breakdown-section) ... */}
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

      {/* 4. BOTTOM SECTION (NEW) */}
      <div className="bottom-section">
        <DashboardCard title="Spending Timeline">
          <p>This is where the "Spending Timeline" heatmap and trend line will go.</p>
          <p>💡 "You typically overspend on Fridays"</p>
        </DashboardCard>
      </div>

      {/* 5. MODAL (No changes) */}
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