
import { initializeApp, getApp, getApps } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const getSafeEnv = (key: string): string => {
  const val = process.env[key];
  return (val && val !== 'undefined') ? val : "";
};

const firebaseConfig = {
  apiKey: getSafeEnv('FIREBASE_API_KEY'),
  authDomain: getSafeEnv('FIREBASE_AUTH_DOMAIN'),
  projectId: getSafeEnv('FIREBASE_PROJECT_ID'),
  storageBucket: getSafeEnv('FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getSafeEnv('FIREBASE_MESSAGING_SENDER_ID'),
  appId: getSafeEnv('FIREBASE_APP_ID')
};

// Global flag to track if configuration is present and valid
export const isConfigValid = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

let app;
try {
  if (isConfigValid) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  } else {
    // Initialize with a dummy to prevent crashes, but isConfigValid will trigger the UI warning
    app = !getApps().length ? initializeApp({ apiKey: "missing", projectId: "missing" }) : getApp();
  }
} catch (e) {
  console.error("Firebase Initialization Failed", e);
}

export const auth = getAuth(app);
export const db = getFirestore(app);
