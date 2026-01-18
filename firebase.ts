
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-storage.js';

/**
 * Firebase Configuration
 * Note: Values are hardcoded from the project requirements to ensure 
 * connectivity and resolve 'auth/invalid-api-key' issues often caused 
 * by environment variable access patterns in standard ESM environments.
 */
const firebaseConfig = {
  apiKey: "AIzaSyDF5EQdcG44-wLVnDmJKa8hG9xtS_IwQGY",
  authDomain: "solar-infra.firebaseapp.com",
  projectId: "solar-infra",
  storageBucket: "solar-infra.firebasestorage.app",
  messagingSenderId: "838772887388",
  appId: "1:838772887388:web:bb0d4b66b53556333d7b99",
  measurementId: "G-WRX5DSJDL8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
