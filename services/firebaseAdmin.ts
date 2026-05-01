import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

let adminApp: admin.app.App | null = null;

export function getFirebaseAdmin() {
  if (!adminApp) {
    // AI Studio provides firebase-applet-config.json, but for admin we usually need 
    // service account or it can auto-discover if running in Google Cloud.
    // However, for this environment, we should check if a service account file exists 
    // or use the default credentials.
    
    // Check for a service account file if provided, otherwise try default
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    
    if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
      adminApp = admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8')))
      });
    } else {
      // If we are in Cloud Run, we can often just init
      try {
        adminApp = admin.initializeApp();
      } catch (e) {
        // Fallback or warning
        console.warn("Firebase Admin initialized without explicit credentials. Ensure it has IAM permissions if in production.");
        adminApp = admin.initializeApp();
      }
    }
  }
  return adminApp;
}

export { admin };
export const adminDb = getFirebaseAdmin().firestore();
export const adminAuth = getFirebaseAdmin().auth();
