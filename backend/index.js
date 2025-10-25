// --- backend/index.js ---

// 1. IMPORT LIBRARIES
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const admin = require('firebase-admin'); 

// 2. INITIALIZE FIREBASE ADMIN SDK
const FIREBASE_CONFIG_BASE64 = process.env.FIREBASE_CONFIG_BASE64; 
    
if (!FIREBASE_CONFIG_BASE64) {
  console.error("FATAL ERROR: FIREBASE_CONFIG_BASE64 is missing.");
  // For production environments, you might want to call process.exit(1) here
}

// Decode the Base64 string back into a JSON object
let serviceAccount;
try {
  serviceAccount = JSON.parse(Buffer.from(FIREBASE_CONFIG_BASE64, 'base64').toString('ascii'));
} catch (e) {
  console.error("FATAL ERROR: Could not decode or parse FIREBASE_CONFIG_BASE64.");
  // process.exit(1);
}

if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
}


// 3. EXPORT FIREBASE SERVICES (Only if initialized)
const db = admin.apps.length ? admin.firestore() : null;
const auth = admin.apps.length ? admin.auth() : null;
module.exports = { db, auth };


// 4. INITIALIZE APP & PORT
const app = express();
// CRITICAL FIX: Prioritize Render's assigned port, otherwise use local default 8081
const PORT = process.env.PORT || 8081; 

// 5. APPLY MIDDLEWARE
app.use(cors());
app.use(express.json());


// 6. DEFINE ROUTES
// Test route
app.get('/', (req, res) => {
  res.json({ message: "Welcome to the Financial Guru API! 💰 (Firebase Status: " + (db ? "Connected" : "Error") + ")" });
});

// Mount all routers
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/users', require('./routes/users'));


// 7. START THE SERVER (CRITICAL FIX: Bind to 0.0.0.0)
if (db) {
    app.listen(PORT, '0.0.0.0', () => { // Binds to all network interfaces
      console.log(`Server is running on http://0.0.0.0:${PORT}`);
    });
} else {
    console.error("Server startup aborted: Firebase was not initialized.");
}