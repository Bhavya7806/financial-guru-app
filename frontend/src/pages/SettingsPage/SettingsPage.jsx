import React, { useState, useEffect } from 'react';
import './SettingsPage.css'; // We'll create this next
import axios from 'axios';
import { auth } from '../../firebase';

// Use the correct port (e.g., 8081)
const USER_API_URL = 'http://localhost:8081/api/users';

const SettingsPage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editableIncome, setEditableIncome] = useState(''); // State for the input field
  const [isSaving, setIsSaving] = useState(false); // State for save button
  const [saveMessage, setSaveMessage] = useState(''); // Success/error message

  // Fetch user data on load
  useEffect(() => {
    setLoading(true);
    setError('');

    const fetchData = async (userId) => {
      if (!userId) {
        setError("Not logged in.");
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${USER_API_URL}/${userId}`);
        setUserData(response.data);
        setEditableIncome(response.data.monthlyIncome?.toString() || ''); // Pre-fill income input
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data. Please refresh.");
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchData(user.uid);
      } else {
        setError("Please log in to view settings.");
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Handle saving the updated income
  const handleSaveIncome = async (e) => {
    e.preventDefault(); // Prevent form submission
    setIsSaving(true);
    setSaveMessage('');
    setError('');
    const userId = auth.currentUser?.uid;

    if (!userId) {
      setError("Not logged in.");
      setIsSaving(false);
      return;
    }

    const newIncome = parseFloat(editableIncome);
    if (isNaN(newIncome) || newIncome < 0) {
        setSaveMessage('Please enter a valid positive income amount.');
        setIsSaving(false);
        return;
    }


    try {
      // Call the new PUT endpoint
      const response = await axios.put(`${USER_API_URL}/${userId}/income`, {
        monthlyIncome: newIncome
      });
      setUserData(response.data); // Update local state with response
      setEditableIncome(response.data.monthlyIncome?.toString() || ''); // Update input field state
      setSaveMessage('Income updated successfully!');
      // Auto-clear success message after a few seconds
      setTimeout(() => setSaveMessage(''), 3000);

    } catch (err) {
      console.error("Error updating income:", err);
      setSaveMessage('Failed to update income. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };


  // Render states
  if (loading) return <div className="loading-container">Loading settings...</div>;
  if (error) return <div className="error-container">{error}</div>;
  if (!userData) return <div className="error-container">Could not load user data.</div>; // Should be covered by error state, but safe check


  // Render the page content
  return (
    <div className="settings-container">
      <h1>Settings</h1>

      <div className="settings-section">
        <h2>User Profile</h2>
        <p><strong>Username:</strong> {userData.username || 'N/A'}</p>
        <p><strong>Email:</strong> {userData.email || 'N/A'}</p>
      </div>

      <div className="settings-section">
        <h2>Onboarding Data</h2>
        <p><strong>Financial Goals:</strong> {userData.financialGoals?.join(', ') || 'Not set'}</p>
        <p><strong>Estimated Monthly Expenses:</strong> ₹{userData.estimatedMonthlyExpenses?.toLocaleString('en-IN') || 'Not set'}</p>

        {/* Income Update Form */}
        <form onSubmit={handleSaveIncome} className="income-form">
           <label htmlFor="monthlyIncome"><strong>Monthly Income:</strong></label>
           <div className="input-with-symbol">
              <span>₹</span>
              <input
                type="number"
                id="monthlyIncome"
                value={editableIncome}
                onChange={(e) => {
                    setEditableIncome(e.target.value);
                    setSaveMessage(''); // Clear message when user types
                }}
                placeholder="Enter income"
                min="0"
              />
           </div>
           <button type="submit" className="save-button" disabled={isSaving}>
             {isSaving ? 'Saving...' : 'Update Income'}
           </button>
           {saveMessage && <p className={`save-message ${saveMessage.includes('Failed') ? 'error' : 'success'}`}>{saveMessage}</p>}
        </form>
      </div>

      {/* Add more sections later (e.g., Change Password, Delete Account) */}

    </div>
  );
};

export default SettingsPage;