// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyAsBbhjyrjOWTfF3ws7s-7-4HFhrC8Dun4",
  authDomain: "ayudapp-eaa08.firebaseapp.com",
  projectId: "ayudapp-eaa08",
  storageBucket: "ayudapp-eaa08.firebasestorage.app",
  messagingSenderId: "771558705094",
  appId: "1:771558705094:web:556aec21b6b5516f64d4c7"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
