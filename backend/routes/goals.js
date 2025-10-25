// --- backend/routes/goals.js ---

const express = require('express');
const router = express.Router();
const { db } = require('../index');

const getUserId = (req) => req.query.userId || req.body.userId || 'default_user';

/**
 * @route   GET /api/goals
 * @desc    Get all active goals for current user
 * @access  Public (Requires userId query param)
 */
router.get('/', async (req, res) => {
  const userId = getUserId(req);
  try {
    const goalsRef = db.collection('users').doc(userId).collection('goals');
    const snapshot = await goalsRef.orderBy('deadline', 'asc').get();
    
    const goals = [];
    snapshot.forEach(doc => { goals.push({ id: doc.id, ...doc.data() }); });
    
    if (goals.length > 0) {
      res.json(goals);
    } else {
        // Send the default starting goals ONLY if the collection is empty for this user
        res.json([
            { id: "1", title: 'Emergency Fund 🛡️', type: 'Emergency Fund', target: 50000, saved: 42000, deadline: '2025-10-31' },
            { id: "2", title: 'Vacation Fund 🌴', type: 'Vacation/Travel', target: 80000, saved: 25000, deadline: '2025-12-31' },
            { id: "3", title: 'New Laptop 💻', type: 'Big Purchase', target: 65000, saved: 18000, deadline: '2025-11-30' },
        ]);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /api/goals
 * @desc    Create a new goal for current user
 * @access  Public (Requires userId in body)
 */
router.post('/', async (req, res) => {
  const userId = getUserId(req);
  try {
    const { title, target, saved, deadline, type } = req.body;
    
    if (!title || !target || saved === undefined || !deadline || !type) {
      return res.status(400).json({ msg: 'Please provide title, target, saved, deadline, and type' });
    }

    const newGoal = { title, target: parseFloat(target), saved: parseFloat(saved), deadline, type };
    
    const goalsRef = db.collection('users').doc(userId).collection('goals');
    const docRef = await goalsRef.add(newGoal);

    res.status(201).json({ id: docRef.id, ...newGoal });

  } catch (err) {
    console.error("!!! POST /api/goals Error:", err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;