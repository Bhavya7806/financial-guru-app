import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../AddExpenseModal/AddExpenseModal.css'; 

const API_URL = `${import.meta.env.VITE_BACKEND_API_URL}/budgets`;

// CRITICAL: Receive userId prop
const EditBudgetModal = ({ budgetToEdit, onClose, onBudgetSaved, userId }) => { 
  const [plannedAmount, setPlannedAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (budgetToEdit) {
      setPlannedAmount(budgetToEdit.planned?.toString() || '');
    }
  }, [budgetToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);

    const newAmount = parseFloat(plannedAmount);
    if (isNaN(newAmount) || newAmount < 0) { setError("Please enter a valid positive amount."); setLoading(false); return; }
    if (!userId) { setError("Authentication failed. Please log in."); setLoading(false); return; }


    try {
      // CRITICAL FIX: Add userId to the payload
      const response = await axios.post(BUDGETS_API_URL, {
        category: budgetToEdit.category, 
        planned: newAmount,
        userId: userId 
      });

      onBudgetSaved(response.data);
      onClose();
    } catch (err) {
      console.error("Error saving budget:", err);
      setError("Failed to save budget. Please try again.");
    } finally { setLoading(false); }
  };

  if (!budgetToEdit) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <h2>Edit Budget for "{budgetToEdit.category}"</h2>

        {error && <p className="modal-error">{error}</p>}

        <form onSubmit={handleSubmit} className="expense-form">
          <div className="form-group">
            <label htmlFor="plannedAmount">New Planned Amount</label>
            <div className="input-with-symbol">
              <span>₹</span>
              <input
                type="number"
                id="plannedAmount"
                value={plannedAmount}
                onChange={(e) => setPlannedAmount(e.target.value)}
                placeholder="e.g., 13000"
                required
                min="0"
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