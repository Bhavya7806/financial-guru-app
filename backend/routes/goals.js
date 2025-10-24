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
  try {
    const snapshot = await goalsRef.orderBy('deadline', 'asc').get();
    
    const goals = [];
    snapshot.forEach(doc => {
      goals.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Send the goals, or a default list if none exist
    if (goals.length > 0) {
      res.json(goals);
    } else {
      // Send the default starting goals from your blueprint
      res.json([
        { id: "1", title: 'Emergency Fund 🛡️', target: 50000, saved: 42000, deadline: '2025-10-31' },
        { id: "2", title: 'Vacation Fund 🌴', target: 80000, saved: 25000, deadline: '2025-12-31' },
        { id: "3", title: 'New Laptop 💻', target: 65000, saved: 18000, deadline: '2025-11-30' },
      ]);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /api/goals
 * @desc    Create a new goal
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { title, target, saved, deadline } = req.body;

    if (!title || !target || saved === undefined || !deadline) {
      return res.status(400).json({ msg: 'Please provide title, target, saved, and deadline' });
    }

    const newGoal = {
      title,
      target: parseFloat(target),
      saved: parseFloat(saved),
      deadline
    };

    const docRef = await goalsRef.add(newGoal);

    res.status(201).json({
      id: docRef.id,
      ...newGoal
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// We can add PUT (update) and DELETE routes later if needed

module.exports = router;