import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Reuse styles from AddExpenseModal
import '../AddExpenseModal/AddExpenseModal.css';

const BUDGETS_API_URL = 'http://localhost:8081/api/budgets'; // Make sure port is correct

const EditBudgetModal = ({ budgetToEdit, onClose, onBudgetSaved }) => {
  const [plannedAmount, setPlannedAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Pre-fill the input when the modal opens
  useEffect(() => {
    if (budgetToEdit) {
      setPlannedAmount(budgetToEdit.planned.toString()); // Convert to string for input
    }
  }, [budgetToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const newAmount = parseFloat(plannedAmount);
    if (isNaN(newAmount) || newAmount < 0) {
      setError("Please enter a valid positive amount.");
      setLoading(false);
      return;
    }

    try {
      // Call the backend POST route (it handles updates based on category)
      const response = await axios.post(BUDGETS_API_URL, {
        category: budgetToEdit.category, // Send the category to identify which budget to update
        planned: newAmount
      });

      onBudgetSaved(response.data); // Pass the updated budget back to the parent
      onClose();

    } catch (err) {
      console.error("Error saving budget:", err);
      setError("Failed to save budget. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!budgetToEdit) return null; // Don't render if no budget data is passed

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <h2>Edit Budget for "{budgetToEdit.category}"</h2>

        {error && <p className="modal-error">{error}</p>}

        <form onSubmit={handleSubmit} className="expense-form"> {/* Reuse form class */}
          <div className="form-group"> {/* Reuse group class */}
            <label htmlFor="plannedAmount">New Planned Amount</label>
            <div className="input-with-symbol"> {/* Reuse style */}
              <span>₹</span>
              <input
                type="number"
                id="plannedAmount"
                value={plannedAmount}
                onChange={(e) => setPlannedAmount(e.target.value)}
                placeholder="e.g., 13000"
                required
                min="0" // Prevent negative numbers
              />
            </div>
          </div>

          <button type="submit" className="form-submit-btn" disabled={loading}>
            {loading ? 'Saving...' : 'Save Budget'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditBudgetModal;