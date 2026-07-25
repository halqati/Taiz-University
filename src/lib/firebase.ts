import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import path from 'path';
import fs from 'fs';

// Helper to safely load firebase configuration in both Vite and Node Serverless environments
function loadFirebaseConfig() {
  // 1. First check environment variables
  if (process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID) {
    return {
      projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID,
      appId: process.env.FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID,
      apiKey: process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN,
      firestoreDatabaseId: process.env.FIREBASE_DATABASE_ID || process.env.VITE_FIREBASE_DATABASE_ID || process.env.FIRESTORE_DATABASE_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET,
    };
  }

  // 2. Try loading local JSON file safely using fs to prevent Vercel ESM module import errors
  try {
    const possiblePaths = [
      path.resolve(process.cwd(), 'firebase-applet-config.json'),
      path.resolve(process.cwd(), '../firebase-applet-config.json'),
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, 'utf-8');
        return JSON.parse(raw);
      }
    }
  } catch {
    // Ignore filesystem read errors and fall back to hardcoded defaults
  }

  // 3. Fallback defaults from project firebase configuration
  return {
    projectId: 'ai-studio-applet-webapp-6637d',
    appId: '1:246839558578:web:da968bfceb13625ca2e4ab',
    apiKey: 'AIzaSyDENG5XvfyR3esvsPLOCTy4kU3A3QtGD1E',
    authDomain: 'ai-studio-applet-webapp-6637d.firebaseapp.com',
    firestoreDatabaseId: 'ai-studio-1a117e15-25fa-4b78-9cb8-47a667bf5596',
    storageBucket: 'ai-studio-applet-webapp-6637d.firebasestorage.app',
    messagingSenderId: '246839558578',
  };
}

const firebaseConfig = loadFirebaseConfig();

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
