// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Check if Firebase configuration is available
const hasFirebaseConfig = !!(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_APP_ID
);

let app: any = null;
let analytics: ReturnType<typeof getAnalytics> | null = null;

// Only initialize Firebase if proper configuration is available
if (hasFirebaseConfig) {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

  try {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);

    // Initialize analytics only on client with valid app
    if (typeof window !== "undefined" && app) {
      analytics = getAnalytics(app);
    }
  } catch (error) {
    console.warn("Firebase initialization failed:", error);
    app = null;
  }
} else {
  console.warn("Firebase configuration not found. Firebase features will be disabled.");
}

export { app, analytics };
