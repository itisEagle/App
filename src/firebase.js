import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyCEEpovN3WLQ3-I2ot2XF-1a7xkJt2O2ds",
  authDomain: "e-comourse-6d7e0.firebaseapp.com",
  projectId: "e-comourse-6d7e0",
  storageBucket: "e-comourse-6d7e0.firebasestorage.app",
  messagingSenderId: "322753262912",
  appId: "1:322753262912:web:f5c4c4e8fac6960f26f6a5"
  measurementId: "G-Y7QJ006T9Z"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
