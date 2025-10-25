import React, { useState } from 'react';
import './AddExpenseModal.css';
import axios from 'axios'; 

const API_URL = `${import.meta.env.VITE_BACKEND_API_URL}/expenses`;

// CRITICAL: Receive userId prop
const AddExpenseModal = ({ onClose, onAddExpense, userId }) => { 
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Food'); 
  const [error, setError] = useState(''); 
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => { 
    e.preventDefault();
    setError(''); setLoading(true);

    if (!description || !amount || !date || !category) { setError("Please fill out all fields."); setLoading(false); return; }
    if (!userId) { setError("Authentication failed. Please log in."); setLoading(false); return; }

    const newExpense = {
      description, amount: parseFloat(amount), date, category,
      userId: userId, // CRITICAL FIX: Add userId to the payload
    };

    try {
      const response = await axios.post(API_URL, newExpense);
      onAddExpense(response.data); 
      onClose(); 
    } catch (err) {
      console.error("Error adding expense: ", err);
      setError(`Failed to add expense. Error: ${err.message}`);
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <h2>Add New Expense</h2>

        {error && <p className="modal-error">{error}</p>}
        
        <form onSubmit={handleSubmit} className="expense-form">
          <div className="form-group">
            <label htmlFor="description">Where did you spend?</label>
            <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Starbucks Coffee" required />
          </div>
          
          <div className="form-group-row">
            <div className="form-group">
              <label htmlFor="amount">How much?</label>
              <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="₹0.00" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Food">Food 🍕</option>
              <option value="Housing">Housing 🏠</option>
              <option value="Transportation">Transportation 🚗</option>
              <option value="Bills">Bills 💼</option>
              <option value="Entertainment">Entertainment 🎉</option>
              <option value="Other">Other 🛒</option>
            </select>
          </div>
          
          <button type="submit" className="form-submit-btn" disabled={loading}>
            {loading ? 'Adding...' : 'Add Expense'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;