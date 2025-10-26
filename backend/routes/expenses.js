// --- backend/routes/expenses.js ---

const express = require('express');
const router = express.Router();
const { db } = require('../index');
const axios = require('axios');

// Define the base URL for your Python ML server
const ML_SERVER_BASE_URL = process.env.ML_SERVER_BASE_URL || 'http://localhost:8082'; // Use the correct port

// Helper to get UID from query or body (Temporary for unsecured API)
const getUserId = (req) => req.query.userId || req.body.userId || 'default_user';

/**
 * @route   GET /api/expenses
 * @desc    Get all expenses for current user
 * @access  Public (Requires userId query param)
 */
router.get('/', async (req, res) => {
  const userId = getUserId(req);
  console.log(`-> HIT: GET /api/expenses for user: ${userId}`);
  try {
    // CRITICAL FIX: Query the user's specific subcollection
    const expensesRef = db.collection('users').doc(userId).collection('expenses');
    const snapshot = await expensesRef.orderBy('date', 'desc').get();

    const expenses = [];
    snapshot.forEach(doc => {
      expenses.push({ id: doc.id, ...doc.data() });
    });
    console.log(`   Fetched ${expenses.length} expenses for ${userId}.`);
    res.json(expenses);

  } catch (err) {
    console.error("!!! GET /api/expenses Error:", err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /api/expenses
 * @desc    Add a new expense for current user
 * @access  Public (Requires userId in body)
 */
router.post('/', async (req, res) => {
  const userId = getUserId(req);
  console.log(`-> HIT: POST /api/expenses for user: ${userId}`);
  try {
    const { description, amount, date, category } = req.body;
    
    if (!description || !amount || !date || !category) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }

    const newExpense = {
      description, amount: parseFloat(amount), date, category,
      createdAt: new Date().toISOString()
    };
    console.log(`[DEBUG] Attempting to save expense for user: ${userId}`);
    // CRITICAL FIX: Add to the user's specific subcollection
    const docRef = await db.collection('users').doc(userId).collection('expenses').add(newExpense);

    res.status(201).json({ id: docRef.id, ...newExpense });

  } catch (err) {
    console.error("!!! POST /api/expenses Error:", err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   GET /api/expenses/timeline
 * @desc    Get spending timeline insight from ML server
 * @access  Public (Requires userId query param)
 */
router.get('/timeline', async (req, res) => {
  const userId = getUserId(req);
  console.log(`-> HIT: GET /api/expenses/timeline for user: ${userId}`);
  try {
    // CRITICAL FIX: Fetch from user's subcollection
    const expensesRef = db.collection('users').doc(userId).collection('expenses');
    const snapshot = await expensesRef.orderBy('date', 'asc').get();
    const allExpenses = [];
    snapshot.forEach(doc => { allExpenses.push({ id: doc.id, ...doc.data() }); });
    
    if (allExpenses.length === 0) {
      return res.json({ insight: "Add some expenses to see your timeline." });
    }

    // Call the Python ML server
    const timelineApiUrl = `${ML_SERVER_BASE_URL}/timeline`;
    const mlResponse = await axios.post(timelineApiUrl, { expenses: allExpenses });

    res.json(mlResponse.data); 

  } catch (err) {
    console.error("!!! GET /api/expenses/timeline Error:", err.message);
    // Check if it was an error connecting to the ML server
    if (err.code === 'ECONNREFUSED') {
       res.status(503).json({ insight: "Timeline analysis service is currently unavailable (Connection Refused)." });
    } else {
       res.status(500).send('Server Error: Failed to get timeline insight.');
    }
  }
});

module.exports = router;