import React, { useState, useMemo, useEffect } from 'react';
import './ExpensesPage.css';
import DashboardCard from '../../components/DashboardCard/DashboardCard';
import ExpenseItem from '../../components/ExpenseItem/ExpenseItem';
import AddExpenseModal from '../../components/AddExpenseModal/AddExpenseModal';
import DateFilterModal from '../../components/DateFilterModal/DateFilterModal'; 
import axios from 'axios';
import { auth } from '../../firebase'; // CRITICAL: Import auth

// CRITICAL FIX: Use the dynamic environment variable base URL
const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL;
const EXPENSES_API_URL = `${API_BASE_URL}/expenses`;

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [timelineInsight, setTimelineInsight] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(true);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false); 
  const [startDateFilter, setStartDateFilter] = useState(''); 
  const [endDateFilter, setEndDateFilter] = useState(''); 
  
  const [dataVersion, setDataVersion] = useState(0); 

  // --- Fetch Expenses (Runs on mount and when dataVersion changes) ---
  useEffect(() => {
    setLoading(true);
    const userId = auth.currentUser?.uid; 

    if (!userId) { setLoading(false); return; }

    const fetchExpenses = async () => {
      try {
        // FIX: Constructs URL using the correct dynamic base
        const response = await axios.get(`${EXPENSES_API_URL}?userId=${userId}`); 
        const sortedExpenses = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setExpenses(sortedExpenses);
      } catch (err) {
        console.error("Error fetching expenses: ", err);
        setExpenses([]); 
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, [dataVersion]); 

  // --- Fetch Timeline Insight ---
  useEffect(() => {
    const userId = auth.currentUser?.uid; 
    if (!userId) { return; }

    const fetchTimelineInsight = async () => {
      setLoadingInsight(true);
      try {
        // FIX: Constructs URL using the correct dynamic base
        const response = await axios.get(`${EXPENSES_API_URL}/timeline?userId=${userId}`);
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
  }, [loading, dataVersion]); 

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
    let list = expenses.filter(expense =>
        expense.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return list;
  }, [expenses, searchTerm]);

  // --- Handler for Adding Expense ---
  const handleAddExpense = (newExpenseFromServer) => {
     // Increment dataVersion to force re-fetch from API
     setDataVersion(prev => prev + 1);
     setIsModalOpen(false); // Close modal
  };

  // ... (Other Handlers remain the same) ...
  const handleDateFilterClick = () => { setIsDateModalOpen(true); };
  const handleApplyDateFilter = (start, end) => { setStartDateFilter(start); setEndDateFilter(end); console.log("Date filter applied. Filtered dates:", { start, end }); };
  // --- Inside src/pages/ExpensesPage/ExpensesPage.jsx ---

// --- Helper function to convert data to CSV ---
const convertToCSV = (data) => {
  if (!data || data.length === 0) {
      return '';
  }
  // Define CSV headers
  const headers = ['ID', 'Date', 'Description', 'Category', 'Amount', 'Tags']; // Added Tags
  // Map data rows
  const rows = data.map(expense =>
      [
          expense.id || '', // Handle potential missing ID
          expense.date || '', // Handle potential missing date
          `"${expense.description?.replace(/"/g, '""') || ''}"`, // Escape quotes in description
          expense.category || '',
          expense.amount || 0,
          `"${expense.tags?.join('; ') || ''}"` // Join tags with semicolon, escape quotes if needed
      ].join(',') // Join fields with commas
  );
  // Join header and rows with newlines
  return [headers.join(','), ...rows].join('\n');
};
// --- End Helper ---


// --- Replace your empty handleExportClick with this ---
const handleExportClick = () => {
  console.log("Export button clicked."); // Log start

  // Use the currently filtered expenses for export (make sure filteredExpenses is available in scope)
  const csvData = convertToCSV(filteredExpenses);

  if (!csvData) {
      console.log("No data found to export.");
      alert("No data to export.");
      return;
  }
  console.log("CSV Data generated (first 100 chars):", csvData.substring(0, 100) + "...");

  // Create a Blob (binary large object) for the CSV data
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  console.log("Blob created.");

  // Create a temporary link element
  const link = document.createElement("a");

  // Check if browser supports the download attribute
  if (link.download !== undefined) {
      // Create a URL for the Blob object
      const url = URL.createObjectURL(blob);
      console.log("Blob URL created.");

      link.setAttribute("href", url);
      // Set filename based on current date
      const filename = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden'; // Make the link invisible
      document.body.appendChild(link); // Add link to the document

      console.log("Attempting to click download link...");
      link.click(); // Simulate a click on the link to trigger download
      console.log("Download link clicked.");

      // Clean up the temporary link and Blob URL after a short delay
      setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          console.log("Link removed and URL revoked.");
      }, 100);

  } else {
      console.error("Download attribute not supported in this browser.");
      alert("CSV export is not supported in your browser.");
  }
};
// --- End Correct Export Handler ---


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
        <button className="control-btn" onClick={handleDateFilterClick}>📅 Date Filter</button>
        <input type="search" placeholder="🔍 Search expenses..." className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <button className="control-btn" onClick={handleExportClick}>📁 Export</button>
        <button className="control-btn add-btn" onClick={() => setIsModalOpen(true)}>➕ Add Expense</button>
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
          {loadingInsight ? (<p>Analyzing timeline...</p>) : (<p>{timelineInsight}</p>)}
          <p className="timeline-placeholder">📈 Daily spending heatmap + trend line will go here.</p>
        </DashboardCard>
      </div>

      {/* 5. ADD EXPENSE MODAL */}
      {isModalOpen && (
        <AddExpenseModal
          onClose={() => setIsModalOpen(false)}
          onAddExpense={handleAddExpense}
          userId={auth.currentUser?.uid} 
        />
      )}
      
      {/* 6. DATE FILTER MODAL */}
      {isDateModalOpen && (
        <DateFilterModal
          initialStartDate={startDateFilter}
          initialEndDate={endDateFilter}
          onClose={() => setIsDateModalOpen(false)}
          onApplyFilter={handleApplyDateFilter}
          userId={auth.currentUser?.uid} 
        />
      )}
    </div>
  );
};

export default ExpensesPage;