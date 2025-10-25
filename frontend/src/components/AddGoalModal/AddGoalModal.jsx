import React, { useState } from 'react';
import axios from 'axios';
import '../AddExpenseModal/AddExpenseModal.css'; 

const API_URL = `${import.meta.env.VITE_BACKEND_API_URL}/goals`;

// CRITICAL: Receive userId prop
const AddGoalModal = ({ onClose, onAddGoal, userId }) => { 
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [saved, setSaved] = useState('0');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => { 
    e.preventDefault();
    setError(''); setLoading(true);

    if (!title || !target || !deadline) { setError("Please fill out all fields."); setLoading(false); return; }
    if (!userId) { setError("Authentication failed. Please log in."); setLoading(false); return; }

    const newGoal = {
      title, target: parseFloat(target), saved: parseFloat(saved), deadline,
      userId: userId // CRITICAL FIX: Add userId to the payload
    };

    try {
      const response = await axios.post(API_URL, newGoal);
      onAddGoal(response.data);
      onClose();
    } catch (err) {
      console.error("Error adding goal: ", err);
      setError("Failed to save goal. Please try again.");
    } finally { setLoading(false); }
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
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Vacation Fund" required />
          </div>
          
          <div className="form-group-row">
            <div className="form-group">
              <label htmlFor="target">Target Amount</label>
              <input type="number" id="target" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="₹50000" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="saved">Already Saved (Optional)</label>
              <input type="number" id="saved" value={saved} onChange={(e) => setSaved(e.target.value)} placeholder="₹0" />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="deadline">Target Date</label>
            <input type="date" id="deadline" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
          </div>
          
          <button type="submit" className="form-submit-btn" disabled={loading}>
            {loading ? 'Adding...' : 'Add Goal'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddGoalModal;