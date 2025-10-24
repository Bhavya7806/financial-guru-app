// --- backend/routes/expenses.js ---

const express = require('express');
const router = express.Router();
const { db } = require('../index');
const axios = require('axios'); // Needed for timeline route

// Define the base URL for your Python ML server
// Make sure this matches where your Python server is running
const ML_SERVER_BASE_URL = 'http://localhost:8082';

/**
 * @route   GET /api/expenses
 * @desc    Get all expenses
 * @access  Public
 */
router.get('/', async (req, res) => {
  console.log("-> HIT: GET /api/expenses"); // Log when route is hit
  try {
    const expensesRef = db.collection('expenses');
    // Sort by date (newest first) at the database level
    const snapshot = await expensesRef.orderBy('date', 'desc').get();

    const expenses = [];
    snapshot.forEach(doc => {
      expenses.push({
        id: doc.id,
        ...doc.data()
      });
    });
    console.log(`   Fetched ${expenses.length} expenses.`); // Log count
    res.json(expenses);

  } catch (err) {
    console.error("!!! GET /api/expenses Error:", err.message); // Log error
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /api/expenses
 * @desc    Add a new expense (no tags)
 * @access  Public
 */
router.post('/', async (req, res) => {
  console.log("-> HIT: POST /api/expenses"); // Log when route is hit
  try {
    const { description, amount, date, category } = req.body;
    console.log("   Received data:", req.body); // Log received data

    if (!description || !amount || !date || !category) {
       console.error("   Validation failed: Missing data");
      return res.status(400).json({ msg: 'Please enter all fields' });
    }

    // Create the basic expense object
    const newExpense = {
      description,
      amount: parseFloat(amount),
      date,
      category,
      createdAt: new Date().toISOString()
    };
    console.log("   Prepared data for Firestore:", newExpense); // Log data to be saved

    // Add the basic object to the 'expenses' collection
    console.log("   Attempting to save to Firestore...");
    const docRef = await db.collection('expenses').add(newExpense);
    console.log(`   Firestore save successful! Doc ID: ${docRef.id}`); // Log success

    // Respond with the object that was saved
    res.status(201).json({
      id: docRef.id,
      ...newExpense
    });

  } catch (err) {
    console.error("!!! POST /api/expenses Error:", err.message); // Log error
    res.status(500).send('Server Error');
  }
});


/**
 * @route   GET /api/expenses/timeline
 * @desc    Get spending timeline insight from ML server
 * @access  Public
 */
router.get('/timeline', async (req, res) => {
  console.log("-> HIT: GET /api/expenses/timeline"); // Log when route is hit
  try {
    // 1. Fetch all expenses from Firestore
    const expensesRef = db.collection('expenses');
    const snapshot = await expensesRef.orderBy('date', 'asc').get(); // Oldest to newest
    const allExpenses = [];
    snapshot.forEach(doc => {
      allExpenses.push({ id: doc.id, ...doc.data() });
    });
    console.log(`   Fetched ${allExpenses.length} expenses for timeline.`); // Log count

    if (allExpenses.length === 0) {
      console.log("   No expenses found for timeline.");
      return res.json({ insight: "Add some expenses to see your timeline." });
    }

    // 2. Call the Python ML server's /timeline route
    const timelineApiUrl = `${ML_SERVER_BASE_URL}/timeline`; // Construct URL

    // --- ADDED DEBUG LOG ---
    console.log(`---> Sending POST request TO: ${timelineApiUrl}`);
    // --- END ADD ---

    console.log(`   Sending ${allExpenses.length} expenses to ML server...`); // Existing log
    const mlResponse = await axios.post(timelineApiUrl, {
      expenses: allExpenses
    });

    console.log("   Received timeline insight from ML server:", mlResponse.data);
    // 3. Return the insight from the ML server
    res.json(mlResponse.data); // Should contain { "insight": "..." }

  } catch (err) {
    console.error("!!! GET /api/expenses/timeline Error:", err.message); // Log error
    // Check if it was an error connecting to the ML server
    if (err.code === 'ECONNREFUSED') {
       console.error(`   ML Server connection refused at ${timelineApiUrl}`);
       res.status(503).json({ insight: "Timeline analysis service is currently unavailable (Connection Refused)." });
    } else if (err.response) {
       // Error response from ML server (e.g., 4xx, 5xx)
       console.error(`   ML Server responded with status ${err.response.status}:`, err.response.data);
       res.status(503).json({ insight: `Timeline analysis service error: ${err.response.status}` });
    }
     else {
       // Other errors (e.g., network issues)
       res.status(500).send('Server Error: Failed to get timeline insight.');
    }
  }
});


module.exports = router;