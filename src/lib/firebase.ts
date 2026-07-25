import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Default Firebase configuration object (without importing JSON file to prevent Vercel ESM ERR_IMPORT_ATTRIBUTE_MISSING)
const defaultConfig = {
  projectId: 'ai-studio-applet-webapp-6637d',
  appId: '1:246839558578:web:da968bfceb13625ca2e4ab',
  apiKey: 'AIzaSyDENG5XvfyR3esvsPLOCTy4kU3A3QtGD1E',
  authDomain: 'ai-studio-applet-webapp-6637d.firebaseapp.com',
  firestoreDatabaseId: 'ai-studio-1a117e15-25fa-4b78-9cb8-47a667bf5596',
  storageBucket: 'ai-studio-applet-webapp-6637d.firebasestorage.app',
  messagingSenderId: '246839558578',
};

// Safely configure Firebase for both Vite frontend and Node Serverless environments
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || defaultConfig.projectId,
  appId: process.env.FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID || defaultConfig.appId,
  apiKey: process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || defaultConfig.apiKey,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN || defaultConfig.authDomain,
  firestoreDatabaseId: process.env.FIREBASE_DATABASE_ID || process.env.VITE_FIREBASE_DATABASE_ID || process.env.FIRESTORE_DATABASE_ID || defaultConfig.firestoreDatabaseId,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET || defaultConfig.storageBucket,
  messagingSenderId: defaultConfig.messagingSenderId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;

