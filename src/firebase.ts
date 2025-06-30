import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDzdM87r_mTeybmNq99_-89yV0p55edRSI",
    authDomain: "workproject-20744.firebaseapp.com",
    projectId: "workproject-20744",
    storageBucket: "workproject-20744.firebasestorage.app",
    messagingSenderId: "200221087389",
    appId: "1:200221087389:web:ad078df0d6f81c9171e674",
    measurementId: "G-8SDZK5662H"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
