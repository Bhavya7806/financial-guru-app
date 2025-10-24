// --- src/firebase.js ---

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDwF3xAzxSsmf17nwzm6uyYkSy66uX6jKU",
    authDomain: "financial-guru-hackathon.firebaseapp.com",
    projectId: "financial-guru-hackathon",
    storageBucket: "financial-guru-hackathon.firebasestorage.app",
    messagingSenderId: "81321000301",
    appId: "1:81321000301:web:f2f336762da038a8152e64",
    measurementId: "G-EBBV8ZC9M6"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services you'll need
export const auth = getAuth(app);
export const db = getFirestore(app);