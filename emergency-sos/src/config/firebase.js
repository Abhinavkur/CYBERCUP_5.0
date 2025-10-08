import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAY4EBSiMRsEGl1Ar9RW-YoHKqsXhXSaTc",
  authDomain: "emergency-sos-system-e3269.firebaseapp.com",
  projectId: "emergency-sos-system-e3269",
  storageBucket: "emergency-sos-system-e3269.firebasestorage.app",
  messagingSenderId: "515319019259",
  appId: "1:515319019259:web:e774720891cc88b1b2e25e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);