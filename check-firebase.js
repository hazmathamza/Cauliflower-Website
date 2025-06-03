// This script checks if your Firebase configuration is valid
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getDatabase, ref, set } from "firebase/database";

// Your Firebase configuration from src/lib/firebase.js
const firebaseConfig = {
  apiKey: "AIzaSyDaOuCQ5bmQGvQZZHcP2GY9H9sXZWdWGAI",
  authDomain: "cauliflower-v2.firebaseapp.com",
  projectId: "cauliflower-v2",
  storageBucket: "cauliflower-v2.appspot.com",
  messagingSenderId: "495337370550",
  appId: "1:495337370550:web:f0a117a103d9ee698b4717",
  databaseURL: "https://cauliflower-v2-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);

console.log("Firebase initialized successfully!");
console.log("Checking Firebase services...");

// Check Firestore
async function checkFirestore() {
  try {
    const usersSnapshot = await getDocs(collection(db, "users"));
    console.log(`Firestore: Successfully connected. Found ${usersSnapshot.size} users.`);
    return true;
  } catch (error) {
    console.error("Firestore check failed:", error.message);
    return false;
  }
}

// Check Realtime Database
async function checkRealtimeDB() {
  try {
    const testRef = ref(rtdb, 'test');
    await set(testRef, { timestamp: Date.now() });
    console.log("Realtime Database: Successfully connected and wrote test data.");
    return true;
  } catch (error) {
    console.error("Realtime Database check failed:", error.message);
    return false;
  }
}

// Run checks
async function runChecks() {
  console.log("\n=== Firebase Configuration Check ===\n");
  
  let firestoreOk = await checkFirestore();
  let rtdbOk = await checkRealtimeDB();
  
  console.log("\n=== Check Summary ===");
  console.log(`Firestore: ${firestoreOk ? '✅ OK' : '❌ Failed'}`);
  console.log(`Realtime Database: ${rtdbOk ? '✅ OK' : '❌ Failed'}`);
  
  if (!firestoreOk || !rtdbOk) {
    console.log("\n⚠️ Some Firebase services are not working correctly.");
    console.log("Please update your Firebase security rules using the FIREBASE_RULES_FIX.md guide.");
  } else {
    console.log("\n✅ All Firebase services are working correctly!");
    console.log("If you're still experiencing login issues, please update your Firebase security rules.");
  }
}

runChecks().catch(error => {
  console.error("Error running checks:", error);
});