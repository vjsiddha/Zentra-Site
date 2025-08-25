// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Use environment variables with fallback values for development
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-ABCDEF",
};

// Avoid re-initializing if Firebase app already exists
let app;
try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
} catch (error) {
  console.warn("Firebase initialization failed:", error);
  // Create a minimal app instance for development
  app = null;
}

// Optional: analytics only on client
let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { app, analytics };
