// --- backend/index.js ---

// 1. IMPORT LIBRARIES
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const admin = require('firebase-admin');

// 2. INITIALIZE FIREBASE ADMIN SDK
const serviceAccountKeyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;

if (!serviceAccountKeyPath) {
  console.error("FATAL ERROR: FIREBASE_SERVICE_ACCOUNT_KEY_PATH is not set in .env");
  process.exit(1); // Stop the app if the key path is not set
}

const serviceAccount = require(serviceAccountKeyPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// 3. EXPORT FIREBASE SERVICES
// We can now import 'db' and 'auth' in other files
const db = admin.firestore();
const auth = admin.auth();
module.exports = { db, auth };

// 4. INITIALIZE APP & PORT
const app = express();
const PORT = process.env.PORT || 3001;

// 5. APPLY MIDDLEWARE
app.use(cors());
app.use(express.json());

// 6. DEFINE ROUTES
// Test route
app.get('/', (req, res) => {
  res.json({ message: "Welcome to the Financial Guru API! 💰 (Firebase Connected)" });
});

// "Mount" the expenses router
// This tells Express that any route starting with '/api/expenses'
// should be handled by the 'expenses.js' file.
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/users', require('./routes/users'));

// 7. START THE SERVER
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});