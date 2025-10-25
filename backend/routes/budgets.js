// --- backend/routes/budgets.js ---

const express = require('express');
const router = express.Router();
const { db } = require('../index');

const getUserId = (req) => req.query.userId || req.body.userId || 'default_user';

/**
 * @route   GET /api/budgets
 * @desc    Get all budget items for current user
 * @access  Public (Requires userId query param)
 */
router.get('/', async (req, res) => {
  const userId = getUserId(req);
  try {
    const budgetsRef = db.collection('users').doc(userId).collection('budgets');
    const snapshot = await budgetsRef.get();
    
    const budgets = [];
    snapshot.forEach(doc => { budgets.push({ id: doc.id, ...doc.data() }); });
    
    // Send the budget items, or default list if NONE exist for THIS user
    if (budgets.length > 0) {
      res.json(budgets);
    } else {
      // Send the default starting budgets
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
 * @desc    Create or update a budget item for current user
 * @access  Public (Requires userId in body)
 */
router.post('/', async (req, res) => {
  const userId = getUserId(req);
  try {
    const { category, planned } = req.body;
    
    if (!category || planned === undefined) {
      return res.status(400).json({ msg: 'Please provide category and planned amount' });
    }

    const budgetsRef = db.collection('users').doc(userId).collection('budgets');
    const snapshot = await budgetsRef.where('category', '==', category).limit(1).get();

    let docRef;
    if (snapshot.empty) {
      docRef = await budgetsRef.add({ category, planned: parseFloat(planned) });
    } else {
      const docId = snapshot.docs[0].id;
      docRef = budgetsRef.doc(docId);
      await docRef.update({ planned: parseFloat(planned) });
    }

    const doc = await docRef.get();
    res.status(201).json({ id: doc.id, ...doc.data() });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;