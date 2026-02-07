import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDYg1XvJ1MvPC5LIVH5x-35vzbwStq3fSM",
    authDomain: "thryv-c97b9.firebaseapp.com",
    projectId: "thryv-c97b9",
    storageBucket: "thryv-c97b9.firebasestorage.app",
    messagingSenderId: "1045879745466",
    appId: "1:1045879745466:web:c194bc563a677d3f9b0b83",
    measurementId: "G-SDJM2P5YTC"
  };
  
 
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);