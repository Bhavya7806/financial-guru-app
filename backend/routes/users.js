// --- backend/routes/users.js ---

const express = require('express');
const router = express.Router();
const { db } = require('../index');
// We will need authMiddleware if we re-add security
// const authMiddleware = require('../middleware/auth');

/**
 * @route   GET /api/users/:userId
 * @desc    Get user profile data by ID
 * @access  Public (for now)
 */
router.get('/:userId', async (req, res) => { // Using URL parameter for userId
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ msg: 'User ID is required' });
    }

    const userDocRef = db.collection('users').doc(userId);
    const docSnap = await userDocRef.get();

    if (!docSnap.exists()) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Return all user data (excluding sensitive fields if needed later)
    res.json({ id: docSnap.id, ...docSnap.data() });

  } catch (err) {
    console.error("Get User Error:", err.message);
    res.status(500).send('Server Error');
  }
});


/**
 * @route   POST /api/users/onboarding
 * @desc    Save onboarding data for a user
 * @access  Public
 */
router.post('/onboarding', async (req, res) => {
  // ... (This route remains the same)
});

module.exports = router;