import React, { useState } from 'react';
import './AddExpenseModal.css';
import axios from 'axios'; // 1. Import axios

// 2. Define your API endpoint
const API_URL = 'http://localhost:3001/api/expenses';

const AddExpenseModal = ({ onClose, onAddExpense }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Food');
  const [error, setError] = useState(''); // 3. Add error state

  const handleSubmit = async (e) => { // 4. Make this function async
    e.preventDefault();
    setError(''); // Clear previous errors

    if (!description || !amount || !date || !category) {
      setError("Please fill out all fields.");
      return;
    }

    // 5. Create the new expense object (no ID needed)
    const newExpense = {
      description,
      amount: parseFloat(amount),
      date,
      category,
    };

    try {
      // 6. Send the POST request to your backend
      const response = await axios.post(API_URL, newExpense);

      // 7. Get the new expense (with ID) from the server's response
      const expenseFromServer = response.data;
      
      onAddExpense(expenseFromServer); // 8. Pass the new expense to the parent
      onClose(); // 9. Close the modal on success

    } catch (err) {
      console.error("Error adding expense: ", err);
      setError("Failed to add expense. Please try again.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <h2>Add New Expense</h2>

        {/* 10. Show the error message */}
        {error && <p className="modal-error">{error}</p>}
        
        <form onSubmit={handleSubmit} className="expense-form">
          {/* ... all your form-group inputs are the same ... */}
          {/* (Description) */}
          <div className="form-group">
            <label htmlFor="description">Where did you spend?</label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Starbucks Coffee"
              required
            />
          </div>
          
          {/* (Amount & Date) */}
          <div className="form-group-row">
            <div className="form-group">
              <label htmlFor="amount">How much?</label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="₹0.00"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>
          
          {/* (Category) */}
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Food">Food 🍕</option>
              <option value="Housing">Housing 🏠</option>
              <option value="Transportation">Transportation 🚗</option>
              <option value="Bills">Bills 💼</option>
              <option value="Entertainment">Entertainment 🎉</option>
              <option value="Other">Other 🛒</option>
            </select>
          </div>
          
          <button type="submit" className="form-submit-btn">
            Add Expense
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;