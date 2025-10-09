import { useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserRole(userSnap.data().role);
        }
      }
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async (role) => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const userRef = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);

      // Upsert role on sign-in to ensure the selected role is stored
      await setDoc(userRef, {
        email: result.user.email,
        name: result.user.displayName,
        role,
        // Only set createdAt if missing; merge keeps existing fields intact
        createdAt: userSnap.exists() ? userSnap.data().createdAt || new Date().toISOString() : new Date().toISOString()
      }, { merge: true });

      setUser(result.user);
      setUserRole(role);
    } catch (error) {
      console.error("Google Sign-in Error:", error.message);
      alert("Sign-in failed. Please try again.");
    }
  };

  const logout = () => auth.signOut();

  return { user, userRole, loading, signInWithGoogle, logout };
};
