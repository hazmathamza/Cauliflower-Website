// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
// Replace these values with your own Firebase project configuration
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

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app);

export default app;