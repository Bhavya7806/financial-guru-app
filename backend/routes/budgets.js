// --- backend/routes/budgets.js ---

const express = require('express');
const router = express.Router();
const { db } = require('../index');

const budgetsRef = db.collection('budgets');

/**
 * @route   GET /api/budgets
 * @desc    Get all budget items
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const snapshot = await budgetsRef.get();
    
    const budgets = [];
    snapshot.forEach(doc => {
      budgets.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Send the budget items, or a default list if none exist
    if (budgets.length > 0) {
      res.json(budgets);
    } else {
      // Send the default starting budgets from your blueprint
      res.json([
        { id: "1", category: 'Food 🍕', planned: 12000 },
        { id: "2", category: 'Rent 🏠', planned: 15000 },
        { id: "3", category: 'Transport 🚗', planned: 7000 },
        { id: "4", category: 'Bills 💼', planned: 7000 },
        { id: "5", category: 'Fun 🎉', planned: 5000 },
        { id: "6", category: 'Savings 💰', planned: 16500 },
      ]);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /api/budgets
 * @desc    Create or update a budget item (upsert)
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { category, planned } = req.body;

    if (!category || planned === undefined) {
      return res.status(400).json({ msg: 'Please provide category and planned amount' });
    }

    // This query finds a budget document with a matching category
    const snapshot = await budgetsRef.where('category', '==', category).limit(1).get();

    let docRef;
    if (snapshot.empty) {
      // --- Create New Budget ---
      // No document exists, so we create a new one
      docRef = await budgetsRef.add({
        category,
        planned: parseFloat(planned)
      });
    } else {
      // --- Update Existing Budget ---
      // A document with this category exists, so we update it
      const docId = snapshot.docs[0].id;
      docRef = budgetsRef.doc(docId);
      await docRef.update({
        planned: parseFloat(planned)
      });
    }

    const doc = await docRef.get(); // Get the final document data
    res.status(201).json({
      id: doc.id,
      ...doc.data()
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;