import React, { useState, useMemo, useEffect } from 'react';
import './ExpensesPage.css';
import DashboardCard from '../../components/DashboardCard/DashboardCard';
import ExpenseItem from '../../components/ExpenseItem/ExpenseItem';
import AddExpenseModal from '../../components/AddExpenseModal/AddExpenseModal';
import DateFilterModal from '../../components/DateFilterModal/DateFilterModal'; // Import the new modal
import axios from 'axios';

// Use the correct port for your Node server
const API_BASE_URL = 'http://localhost:8081/api/expenses';

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [timelineInsight, setTimelineInsight] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(true);
  
  // --- Date Filter State ---
  const [isDateModalOpen, setIsDateModalOpen] = useState(false); // State to open filter modal
  const [startDateFilter, setStartDateFilter] = useState(''); // Stores filter start date
  const [endDateFilter, setEndDateFilter] = useState(''); // Stores filter end date
  // --- End Date Filter State ---

  // --- Fetch Expenses ---
  useEffect(() => {
    setLoading(true);
    const fetchExpenses = async () => {
      try {
        // NOTE: For true date filtering, this API call should be updated 
        // to pass startDateFilter and endDateFilter as query parameters.
        const response = await axios.get(API_BASE_URL);
        const sortedExpenses = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setExpenses(sortedExpenses);
      } catch (err) {
        console.error("Error fetching expenses: ", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, []); // Run only once on mount for now

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

    if (!loading) { 
        if (expenses.length > 0) {
            fetchTimelineInsight();
        } else {
            setTimelineInsight("Add expenses to see timeline insights.");
            setLoadingInsight(false);
        }
    }
  }, [expenses, loading]); 

  // --- Helper function to convert data to CSV ---
    const convertToCSV = (data) => {
        if (!data || data.length === 0) {
            return '';
        }
        const headers = ['ID', 'Date', 'Description', 'Category', 'Amount', 'Tags'];
        const rows = data.map(expense =>
            [
                expense.id || '',
                expense.date || '',
                `"${expense.description?.replace(/"/g, '""') || ''}"`, 
                expense.category || '',
                expense.amount || 0,
                `"${expense.tags?.join('; ') || ''}"` // Include tags
            ].join(',')
        );
        return [headers.join(','), ...rows].join('\n');
    };
    // --- End Helper ---

  // --- Placeholder Handlers for Controls ---
  const handleDateFilterClick = () => {
    setIsDateModalOpen(true); // Open the date filter modal
  };

  const handleApplyDateFilter = (start, end) => {
    setStartDateFilter(start);
    setEndDateFilter(end);
    // TODO: Trigger API call with updated dates to filter expenses
    console.log("Date filter applied. Filtered dates:", { start, end });
  };

  const handleExportClick = () => {
    // Use the currently filtered expenses for export
    const csvData = convertToCSV(filteredExpenses);
    if (!csvData) {
        alert("No data to export.");
        return;
    }
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        const filename = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        alert("CSV export is not supported in your browser.");
    }
  };
  // --- End Placeholder Handlers ---


  // --- Calculations (useMemo Hooks) ---
  const totalExpense = useMemo(() => {
    return expenses.reduce((acc, expense) => acc + (Number(expense.amount) || 0), 0);
  }, [expenses]);

  const categoryBreakdown = useMemo(() => {
    const categories = {};
    expenses.forEach(expense => {
      const categoryName = expense.category || 'Uncategorized';
      if (!categories[categoryName]) {
        categories[categoryName] = 0;
      }
      categories[categoryName] += Number(expense.amount) || 0;
    });
    if (totalExpense === 0) return [];
    return Object.entries(categories).map(([name, amount]) => ({
      name,
      amount,
      percent: (amount / totalExpense) * 100,
    })).sort((a, b) => b.percent - a.percent);
  }, [expenses, totalExpense]);

  const filteredExpenses = useMemo(() => {
    // Basic filtering logic (by search term)
    let list = expenses.filter(expense =>
        expense.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // NOTE: This client-side filtering is only for the UI, NOT the API query.
    // If you add date filtering, it should be done on the backend.
    return list;
  }, [expenses, searchTerm]);

  // --- Handler for Adding Expense ---
  const handleAddExpense = (newExpenseFromServer) => {
     setExpenses(prevExpenses => [newExpenseFromServer, ...prevExpenses]);
  };


  if (loading) {
    return <div className="loading-container">Loading expenses...</div>;
  }

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
        <button className="control-btn" onClick={handleDateFilterClick}>
          📅 Date Filter
        </button>
        <input
          type="search"
          placeholder="🔍 Search expenses..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="control-btn" onClick={handleExportClick}>
          📁 Export
        </button>
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
              expense.id ? <ExpenseItem key={expense.id} expense={expense} /> : null
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
                      style={{ width: `${Math.min(category.percent, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {categoryBreakdown.length === 0 && <p>No spending data yet.</p>}
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
      
      {/* 6. DATE FILTER MODAL */}
      {isDateModalOpen && (
        <DateFilterModal
          initialStartDate={startDateFilter}
          initialEndDate={endDateFilter}
          onClose={() => setIsDateModalOpen(false)}
          onApplyFilter={handleApplyDateFilter}
        />
      )}
    </div>
  );
};

export default ExpensesPage;