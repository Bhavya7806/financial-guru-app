import React, { useState } from 'react';
import axios from 'axios';
// We can reuse the same CSS as the expense modal!
import '../AddExpenseModal/AddExpenseModal.css'; 

const API_URL = 'http://localhost:3001/api/goals';

const AddGoalModal = ({ onClose, onAddGoal }) => {
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [saved, setSaved] = useState('0'); // Default to 0
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || !target || !deadline) {
      setError("Please fill out title, target amount, and deadline.");
      return;
    }

    const newGoal = {
      title,
      target: parseFloat(target),
      saved: parseFloat(saved),
      deadline,
    };

    try {
      // Send the POST request to your backend
      const response = await axios.post(API_URL, newGoal);
      const goalFromServer = response.data;
      
      onAddGoal(goalFromServer); // Pass the new goal to the parent
      onClose(); // Close the modal

    } catch (err) {
      console.error("Error adding goal: ", err);
      setError("Failed to add goal. Please try again.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <h2>Create New Goal</h2>

        {error && <p className="modal-error">{error}</p>}
        
        <form onSubmit={handleSubmit} className="expense-form">
          <div className="form-group">
            <label htmlFor="title">Goal Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Vacation Fund 🌴"
              required
            />
          </div>
          
          <div className="form-group-row">
            <div className="form-group">
              <label htmlFor="target">Target Amount</label>
              <input
                type="number"
                id="target"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="₹80,000"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="saved">Already Saved (Optional)</label>
              <input
                type="number"
                id="saved"
                value={saved}
                onChange={(e) => setSaved(e.target.value)}
                placeholder="₹0"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="deadline">Target Date</label>
            <input
              type="date"
              id="deadline"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="form-submit-btn">
            Add Goal
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddGoalModal;