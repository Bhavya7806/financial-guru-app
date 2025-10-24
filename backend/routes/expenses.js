// --- backend/routes/expenses.js --- (Simplified - No Tags)

const express = require('express');
const router = express.Router();
const { db } = require('../index');
// No need for axios anymore

/**
 * @route   GET /api/expenses
 * @desc    Get all expenses
 * @access  Public
 */
router.get('/', async (req, res) => {
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

    res.json(expenses);

  } catch (err) {
    console.error("GET Error:", err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /api/expenses
 * @desc    Add a new expense (no tags)
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { description, amount, date, category } = req.body;

    if (!description || !amount || !date || !category) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }

    // 1. Create the basic expense object
    const newExpense = {
      description,
      amount: parseFloat(amount),
      date,
      category,
      createdAt: new Date().toISOString()
      // No 'tags' property anymore
    };

    // 2. Add the basic object to the 'expenses' collection
    const docRef = await db.collection('expenses').add(newExpense);

    // 3. Respond with the object that was saved
    res.status(201).json({
      id: docRef.id,
      ...newExpense
    });

  } catch (err) {
    console.error("POST Error:", err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;