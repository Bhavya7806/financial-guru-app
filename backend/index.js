// --- backend/index.js ---

// 1. IMPORT LIBRARIES
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const admin = require('firebase-admin'); 

// 2. INITIALIZE FIREBASE ADMIN SDK
const FIREBASE_CONFIG_BASE64 = process.env.FIREBASE_CONFIG_BASE64; 
    
let serviceAccount = null;
let db = null;
let auth = null;

try {
  if (!FIREBASE_CONFIG_BASE64) {
    console.error("FATAL ERROR: FIREBASE_CONFIG_BASE64 is missing. Check Render Environment variables.");
    throw new Error("Missing Base64 Config");
  }

  // Decode the Base64 string back into a JSON object
  serviceAccount = JSON.parse(Buffer.from(FIREBASE_CONFIG_BASE64, 'base64').toString('ascii'));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  // If initialization succeeds, set the database and auth objects
  db = admin.firestore();
  auth = admin.auth();
  console.log("SUCCESS: Firebase Admin SDK initialized.");

} catch (e) {
  console.error(`SERVER STARTUP FAILED: Firebase initialization error: ${e.message}`);
  // If the key is bad, db and auth remain null, which prevents crashing later
}


// 3. EXPORT FIREBASE SERVICES
// Export the initialized (or null) objects
module.exports = { db, auth };


// 4. INITIALIZE APP & PORT
const app = express();
const PORT = process.env.PORT || 8081; 

// 5. APPLY MIDDLEWARE
app.use(cors());
app.use(express.json());


// 6. DEFINE ROUTES
// Test route
app.get('/', (req, res) => {
  res.json({ message: "Welcome to the Financial Guru API! 💰 (Status: " + (db ? "Connected" : "ERROR - DB OFFLINE") + ")" });
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
    // If Firebase initialization failed, the server cannot function.
    console.error("Server startup aborted: Database connection failed.");
}