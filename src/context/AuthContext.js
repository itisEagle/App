import { createContext, useEffect, useState, useContext } from "react";
import { auth, googleProvider, db } from "../firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); // Firestore data (balance, role)

  const login = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userRef = doc(db, "users", result.user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // First time login - Initialize Wallet
        await setDoc(userRef, {
          name: result.user.displayName,
          email: result.user.email,
          balance: 0,
          role: "user", // or 'admin'
          isBlocked: false,
          createdAt: new Date()
        });
      }
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Real-time listener for balance updates
        const { onSnapshot } = require("firebase/firestore");
        onSnapshot(doc(db, "users", currentUser.uid), (doc) => {
           setUserData(doc.data());
        });
      } else {
        setUserData(null);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, login, logout: () => signOut(auth) }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
