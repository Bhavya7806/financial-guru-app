import React, { useState, useEffect } from 'react';
import './SettingsPage.css'; 
import axios from 'axios';
import { auth } from '../../firebase';

// Use the correct port (e.g., 8081)
const USER_API_URL = 'http://localhost:8081/api/users';

const SettingsPage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editableIncome, setEditableIncome] = useState(''); 
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Fetch user data on load
  useEffect(() => {
    setLoading(true); setError('');
    const userId = auth.currentUser?.uid; // CRITICAL: Get user ID

    if (!userId) { setError("Not logged in."); setLoading(false); return; }

    const fetchData = async () => {
      try {
        // CRITICAL FIX: Use userId in the URL path
        const response = await axios.get(`${USER_API_URL}/${userId}`);
        setUserData(response.data);
        setEditableIncome(response.data.monthlyIncome?.toString() || ''); 
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data. Please refresh.");
      } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  // Handle saving the updated income
  const handleSaveIncome = async (e) => {
    e.preventDefault(); 
    setIsSaving(true); setSaveMessage(''); setError('');
    const userId = auth.currentUser?.uid; // CRITICAL: Get user ID

    if (!userId) { setError("Not logged in."); setIsSaving(false); return; }

    const newIncome = parseFloat(editableIncome);
    if (isNaN(newIncome) || newIncome < 0) {
        setSaveMessage('Please enter a valid positive income amount.');
        setIsSaving(false);
        return;
    }

    try {
      // CRITICAL FIX: Include userId in the payload (optional, but good practice)
      const payload = { monthlyIncome: newIncome, userId: userId }; 

      // PUT to user's route (path variable used for userId)
      const response = await axios.put(`${USER_API_URL}/${userId}/income`, payload); 
      setUserData(response.data);
      setEditableIncome(response.data.monthlyIncome?.toString() || '');
      setSaveMessage('Income updated successfully!');
      setTimeout(() => setSaveMessage(''), 3000);

    } catch (err) {
      console.error("Error updating income:", err);
      setSaveMessage('Failed to update income. Please try again.');
    } finally { setIsSaving(false); }
  };


  if (loading) return <div className="loading-container">Loading settings...</div>;
  if (error) return <div className="error-container">{error}</div>;
  if (!userData) return <div className="error-container">Could not load user data.</div>; 

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
                    setSaveMessage(''); 
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
    </div>
  );
};

export default SettingsPage;