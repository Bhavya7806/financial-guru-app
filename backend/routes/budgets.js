// --- backend/routes/budgets.js ---

const express = require('express');
const router = express.Router();
const { db } = require('../index');

// Helper to get UID from query or body (Temporary for unsecured API)
const getUserId = (req) => req.query.userId || req.body.userId || 'default_user';

// Define the default list structure (can be outside the route handler)
const DEFAULT_BUDGET_LIST = [
  { category: 'Food 🍕', planned: 12000 },
  { category: 'Rent 🏠', planned: 15000 },
  { category: 'Transport 🚗', planned: 7000 },
  { category: 'Bills 💼', planned: 7000 },
  { category: 'Fun 🎉', planned: 5000 },
  { category: 'Savings 💰', planned: 16500 },
];

/**
 * @route   GET /api/budgets
 * @desc    Get all budget items for current user, merged with defaults
 * @access  Public (Requires userId query param)
 */
router.get('/', async (req, res) => {
  const userId = getUserId(req);
  console.log(`-> HIT: GET /api/budgets (merged) for user: ${userId}`);
  
  // Ensure db is initialized before proceeding
  if (!db) {
    console.error("DATABASE ERROR (GET /budgets): Firestore client is null.");
    return res.status(500).json({ msg: "Server configuration error: Database offline." });
  }

  try {
    const budgetsRef = db.collection('users').doc(userId).collection('budgets');
    const snapshot = await budgetsRef.get();
    
    // 1. Fetch user's saved budgets into a Map for easy lookup
    const savedBudgetsMap = new Map();
    snapshot.forEach(doc => {
      savedBudgetsMap.set(doc.data().category, { id: doc.id, ...doc.data() });
    });
    console.log(`   Found ${savedBudgetsMap.size} saved budget items.`);

    // 2. Create the final list by merging defaults with saved data
    const finalBudgets = DEFAULT_BUDGET_LIST.map(defaultBudget => {
      // If the user has saved data for this category, use it
      if (savedBudgetsMap.has(defaultBudget.category)) {
        return savedBudgetsMap.get(defaultBudget.category);
      }
      // Otherwise, use the default item (give it a temp ID for React keys)
      else {
        // Ensure default has a planned amount, default to 0 if missing
        return { ...defaultBudget, planned: defaultBudget.planned || 0, id: `default-${defaultBudget.category}` }; 
      }
    });

    console.log(`   Returning merged list of ${finalBudgets.length} budget items.`);
    res.json(finalBudgets); // Return the complete, merged list

  } catch (err) {
    console.error("!!! GET /api/budgets Error:", err.message);
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
  console.log(`-> HIT: POST /api/budgets for user: ${userId}`);

  // Ensure db is initialized
  if (!db) {
    console.error("DATABASE ERROR (POST /budgets): Firestore client is null.");
    return res.status(500).json({ msg: "Server configuration error: Database offline." });
  }
  
  try {
    const { category, planned } = req.body;
    console.log("   Received data:", { category, planned });
    
    if (!category || planned === undefined || isNaN(parseFloat(planned))) {
      console.error("   Validation failed: Invalid data");
      return res.status(400).json({ msg: 'Please provide a valid category and planned amount' });
    }

    const budgetsRef = db.collection('users').doc(userId).collection('budgets');
    const snapshot = await budgetsRef.where('category', '==', category).limit(1).get();

    let docRef;
    const plannedAmount = parseFloat(planned); // Ensure it's a number

    if (snapshot.empty) {
      console.log(`   Creating new budget for category: ${category}`);
      docRef = await budgetsRef.add({ category, planned: plannedAmount });
    } else {
      const docId = snapshot.docs[0].id;
      console.log(`   Updating existing budget (ID: ${docId}) for category: ${category}`);
      docRef = budgetsRef.doc(docId);
      await docRef.update({ planned: plannedAmount });
    }

    const doc = await docRef.get();
    console.log("   Save/Update successful!");
    res.status(201).json({ id: doc.id, ...doc.data() });

  } catch (err) {
    console.error("!!! POST /api/budgets Error:", err); // Log full error
    res.status(500).send('Server Error');
  }
});

module.exports = router;