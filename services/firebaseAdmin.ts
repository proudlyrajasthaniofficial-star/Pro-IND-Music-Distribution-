import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

let adminApp: admin.app.App | null = null;

export function getFirebaseAdmin() {
  if (!adminApp) {
    try {
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
      
      if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
        adminApp = admin.initializeApp({
          credential: admin.credential.cert(JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8')))
        });
      } else {
        // AI Studio usually provides credentials or uses default
        adminApp = admin.initializeApp();
      }
    } catch (e) {
      console.warn("⚠️ Firebase Admin could not be initialized. Some server features may be unavailable.", e);
      // Return a mock or handle gracefully
    }
  }
  return adminApp;
}

export { admin };

// Use proxy or getter to avoid module-level crashes
export const adminDb = {
  collection: (path: string) => {
    const instance = getFirebaseAdmin();
    if (!instance) throw new Error("Firebase Admin not initialized");
    return instance.firestore().collection(path);
  }
} as any;

export const adminAuth = {
  verifyIdToken: (token: string) => {
    const instance = getFirebaseAdmin();
    if (!instance) throw new Error("Firebase Admin not initialized");
    return instance.auth().verifyIdToken(token);
  },
  getUser: (uid: string) => {
    const instance = getFirebaseAdmin();
    if (!instance) throw new Error("Firebase Admin not initialized");
    return instance.auth().getUser(uid);
  }
} as any;
