// --- backend/routes/goals.js ---

const express = require('express');
const router = express.Router();
const { db } = require('../index');

const goalsRef = db.collection('goals');

/**
 * @route   GET /api/goals
 * @desc    Get all active goals
 * @access  Public
 */
router.get('/', async (req, res) => {
  console.log("-> HIT: GET /api/goals"); // Added log
  try {
    const snapshot = await goalsRef.orderBy('deadline', 'asc').get();

    const goals = [];
    snapshot.forEach(doc => {
      goals.push({
        id: doc.id,
        ...doc.data()
      });
    });
    console.log(`   Fetched ${goals.length} goals.`); // Added log

    // Send the goals, or a default list if none exist and DB is empty
    if (goals.length > 0) {
      res.json(goals);
    } else {
       // Check if the collection truly exists but is empty
       const collectionExists = await goalsRef.limit(1).get();
       if (collectionExists.empty) {
          console.log("   Goals collection is empty, sending default goals."); // Added log
          // Send the default starting goals ONLY if the collection is empty
          res.json([
            { id: "1", title: 'Emergency Fund 🛡️', type: 'Emergency Fund', target: 50000, saved: 42000, deadline: '2025-10-31' },
            { id: "2", title: 'Vacation Fund 🌴', type: 'Vacation/Travel', target: 80000, saved: 25000, deadline: '2025-12-31' },
            { id: "3", title: 'New Laptop 💻', type: 'Big Purchase', target: 65000, saved: 18000, deadline: '2025-11-30' },
          ]);
       } else {
           // Collection exists but query returned no results (shouldn't happen with current query)
           res.json([]);
       }
    }
  } catch (err) {
    console.error("!!! GET /api/goals Error:", err); // Updated log
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /api/goals
 * @desc    Create a new goal
 * @access  Public
 */
router.post('/', async (req, res) => {
  console.log("-> HIT: POST /api/goals");
  try {
    // Extract 'type' from req.body
    const { title, target, saved, deadline, type } = req.body;
    console.log("   Received Goal Data:", req.body);

    // Include 'type' in validation
    if (!title || !target || saved === undefined || !deadline || !type) {
        console.error("   Validation failed: Missing required goal data (incl. type)");
      return res.status(400).json({ msg: 'Please provide title, target, saved, deadline, and type' });
    }

    // Include 'type' when creating the object
    const newGoal = {
      title,
      target: parseFloat(target),
      saved: parseFloat(saved),
      deadline,
      type // Add the type here
    };
    console.log("   Prepared Goal for Firestore:", newGoal);

    const docRef = await goalsRef.add(newGoal);
    console.log(`   Goal saved successfully! Doc ID: ${docRef.id}`);

    res.status(201).json({
      id: docRef.id,
      ...newGoal
    });

  } catch (err) {
    console.error("!!! POST /api/goals Error:", err);
    res.status(500).send('Server Error');
  }
});

// We can add PUT (update) and DELETE routes later if needed

module.exports = router;