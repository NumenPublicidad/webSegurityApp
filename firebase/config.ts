'use client';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCzpofLS_iEA2WFNWDYGQZEQE_xtcuShqM",
  authDomain: "segurity-app-40a4a.firebaseapp.com",
  projectId: "segurity-app-40a4a",
  storageBucket: "segurity-app-40a4a.firebasestorage.app",
  messagingSenderId: "640657316924",
  appId: "1:640657316924:web:e027b396a07e49e3f7b739",
  measurementId: "G-VRVGDVWLRK"
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
