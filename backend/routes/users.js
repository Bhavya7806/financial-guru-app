// --- backend/routes/users.js ---

const express = require('express');
const router = express.Router();
const { db } = require('../index');
// const authMiddleware = require('../middleware/auth'); // If needed later

/**
 * @route   GET /api/users/:userId
 * @desc    Get user profile data by ID
 * @access  Public (for now)
 */
router.get('/:userId', async (req, res) => {
  console.log(`-> HIT: GET /api/users/${req.params.userId}`);
  try {
    const userId = req.params.userId;
    if (!userId) {
      console.error("   GET User Error: User ID missing from URL parameters");
      return res.status(400).json({ msg: 'User ID is required in the URL path' });
    }

    const userDocRef = db.collection('users').doc(userId);
    console.log(`   Querying Firestore for user: ${userId}`);
    const docSnap = await userDocRef.get();

    // Use .exists (property), not .exists() (function)
    if (!docSnap.exists) {
      console.warn(`   User document not found for ID: ${userId}`);
      return res.status(404).json({ msg: 'User not found' });
    }

    console.log(`   User found for ID: ${userId}`);
    // Return all user data
    res.json({ id: docSnap.id, ...docSnap.data() });

  } catch (err) {
    console.error("!!! GET User Error in CATCH block:", err);
    res.status(500).send('Server Error: Failed to retrieve user data.');
  }
});

/**
 * @route   POST /api/users/onboarding
 * @desc    Save onboarding data for a user
 * @access  Public
 */
router.post('/onboarding', async (req, res) => {
  console.log("-> HIT: POST /api/users/onboarding route");
  try {
    const { userId, selectedGoals, monthlyIncome, monthlyExpenses } = req.body;
    console.log("   Received data:", { userId, selectedGoals, monthlyIncome, monthlyExpenses });

    if (!userId || !selectedGoals || !monthlyIncome || !monthlyExpenses) {
      console.error("   Validation failed: Missing data");
      return res.status(400).json({ msg: 'Missing required onboarding data' });
    }

    const userDocRef = db.collection('users').doc(userId);

    const onboardingData = {
      financialGoals: selectedGoals,
      monthlyIncome: parseFloat(monthlyIncome),
      estimatedMonthlyExpenses: parseFloat(monthlyExpenses),
      onboardingCompleted: true,
      onboardingTimestamp: new Date().toISOString(),
    };
    console.log("   Prepared data for Firestore:", onboardingData);

    console.log("   Attempting to save to Firestore...");
    await userDocRef.set(onboardingData, { merge: true });
    console.log("   Firestore save successful!");

    console.log(`   Onboarding data saved for user: ${userId}`);
    res.status(200).json({ msg: 'Onboarding data saved successfully' });

  } catch (err) {
    console.error("!!! Onboarding Save Error in CATCH block:", err);
    res.status(500).send('Server Error: Failed to save onboarding data.');
  }
});

/**
 * @route   GET /api/users/:userId/recommendations
 * @desc    Generate goal recommendations based on user income
 * @access  Public (for now)
 */
router.get('/:userId/recommendations', async (req, res) => {
  console.log(`-> HIT: GET /api/users/${req.params.userId}/recommendations`);
  try {
    const userId = req.params.userId;
    if (!userId) {
       console.error("   GET Recommendations Error: User ID missing");
      return res.status(400).json({ msg: 'User ID is required' });
    }

    // 1. Fetch the user document
    const userDocRef = db.collection('users').doc(userId);

    console.log(`   Attempting Firestore query for doc: users/${userId}`);
    const docSnap = await userDocRef.get();
    console.log(`   Firestore query completed. Snapshot exists: ${docSnap.exists}`);

    if (!docSnap.exists) {
      console.warn(`   Returning 404 because docSnap.exists is false.`);
      return res.status(404).json({ msg: 'User not found' });
    }

    const userData = docSnap.data();
    const income = userData.monthlyIncome; // Get income from onboarding data
    console.log(`   User income: ${income}`); // Log income

    // 2. Generate Recommendations (Simple Logic V1)
    const recommendations = [];

    if (income && income > 0) {
      // Recommend an Emergency Fund of 3 months' income
      const emergencyFundTarget = income * 3;
      recommendations.push({
        title: "Emergency Fund",
        target: emergencyFundTarget.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }),
        priority: "High",
        details: `Aim to save 3 months of your income (₹${emergencyFundTarget.toLocaleString('en-IN')}) for unexpected events.`
      });

      // Recommend starting Retirement savings (e.g., 10% of income)
      const retirementSavings = income * 0.10;
      recommendations.push({
        title: "Retirement",
        target: `${retirementSavings.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}/month`,
        priority: "Medium",
        details: `Start saving around 10% of your income (₹${retirementSavings.toLocaleString('en-IN')}/month) for the long term.`
      });
    } else {
        console.log("   Income not found or zero, providing default recommendations."); // Log default case
      // Default recommendations if income isn't set
      recommendations.push({
        title: "Emergency Fund",
        target: "₹50,000", // Example default
        priority: "High",
        details: "Aim to save 3-6 months of essential expenses."
      });
       recommendations.push({
        title: "Retirement",
        target: "₹5,000/month", // Example default
        priority: "Medium",
        details: "Start saving consistently for the long term."
      });
    }

    console.log(`   Generated recommendations for user: ${userId}`);
    res.json(recommendations); // 3. Send recommendations back

  } catch (err) {
    console.error("!!! GET Recommendations Error:", err);
    res.status(500).send('Server Error: Failed to generate recommendations.');
  }
});
// --- Add this PUT route inside backend/routes/users.js ---

/**
 * @route   PUT /api/users/:userId/income
 * @desc    Update user's monthly income
 * @access  Public (for now)
 */
router.put('/:userId/income', async (req, res) => {
  console.log(`-> HIT: PUT /api/users/${req.params.userId}/income`);
  try {
    const userId = req.params.userId;
    const { monthlyIncome } = req.body; // Expect { "monthlyIncome": 55000 }

    if (!userId) {
      return res.status(400).json({ msg: 'User ID is required' });
    }
    if (monthlyIncome === undefined || isNaN(parseFloat(monthlyIncome)) || parseFloat(monthlyIncome) < 0) {
      return res.status(400).json({ msg: 'Valid monthly income is required' });
    }

    const userDocRef = db.collection('users').doc(userId);

    // Update only the monthlyIncome field
    await userDocRef.update({
      monthlyIncome: parseFloat(monthlyIncome)
    });

    console.log(`   Updated income for user: ${userId} to ${monthlyIncome}`);
    // Fetch the updated document to return it (optional but good practice)
    const updatedDoc = await userDocRef.get();
    res.json({ id: updatedDoc.id, ...updatedDoc.data() }); // Return updated user data

  } catch (err) {
    // Check if the error is because the user wasn't found
    if (err.code === 5) { // Firestore code for NOT_FOUND when updating non-existent doc
        console.warn(`   Attempted to update income for non-existent user: ${req.params.userId}`);
        return res.status(404).json({ msg: 'User not found' });
    }
    console.error("!!! PUT Income Error:", err);
    res.status(500).send('Server Error: Failed to update income.');
  }
});



module.exports = router;