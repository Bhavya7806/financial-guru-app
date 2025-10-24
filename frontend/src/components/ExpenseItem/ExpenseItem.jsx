import React from 'react';
import './ExpenseItem.css';

// ... (getCategoryIcon and formatDate functions are the same)
const getCategoryIcon = (category) => {
  switch (category) {
    case 'Food': return '🍕';
    case 'Housing': return '🏠';
    case 'Transportation': return '🚗';
    case 'Bills': return '💼';
    case 'Entertainment': return '🎉';
    default: return '🛒';
  }
};
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const ExpenseItem = ({ expense }) => {
  return (
    <div className="expense-item-card">
      {/* --- TOP ROW (No changes) --- */}
      <div className="item-main-row">
        <div className="item-icon">{getCategoryIcon(expense.category)}</div>
        <div className="item-details">
          <span className="item-desc">{expense.description}</span>
          <span className="item-category">{expense.category}</span>
        </div>
        <div className="item-cost">
          <span className="item-amount">
            -₹{expense.amount.toLocaleString('en-IN')}
          </span>
          <span className="item-date">{formatDate(expense.date)}</span>
        </div>
      </div>
      
      {/* --- SMART TAG ROW (NEW) --- */}
      {/* We check if tags exist. If not, we still render the row
          so the layout is consistent, but it will be empty.
          This is where the AI tags will go later. */}
      <div className="item-smart-row">
        {expense.tags?.map((tag, index) => (
          <span key={index} className="smart-tag">
            {tag}
          </span>
        ))}
        {/* You could add a placeholder if no tags exist */}
        {/* {!expense.tags && <span className="smart-tag-placeholder">No insights yet...</span>} */}
      </div>
    </div>
  );
};

export default ExpenseItem;