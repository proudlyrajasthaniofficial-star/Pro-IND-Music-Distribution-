import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

let adminApp: admin.app.App | null = null;

export function getFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.apps[0];
  }

  // AI Studio provides firebase-applet-config.json, but for admin we usually need 
  // service account or it can auto-discover if running in Google Cloud.
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  
  try {
    if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
      return admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8')))
      });
    } else {
      // In Cloud Run environment, this will use the service account attached to the revision
      return admin.initializeApp();
    }
  } catch (error: any) {
    if (error.code === 'app/duplicate-app') {
      return admin.apps[0];
    }
    console.error("❌ Firebase Admin Initialization Error:", error.message);
    // Return the first app if initialization failed but an app exists, otherwise rethrow
    if (admin.apps.length > 0) return admin.apps[0];
    throw error;
  }
}

let _firebaseConfig: any = null;
function getFirebaseConfig() {
  if (!_firebaseConfig) {
    try {
      const firebaseConfigPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../firebase-applet-config.json');
      if (fs.existsSync(firebaseConfigPath)) {
        _firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));
      } else {
        console.warn("⚠️ firebase-applet-config.json not found, using defaults");
        _firebaseConfig = {};
      }
    } catch (error) {
      console.error("❌ Failed to load firebase-applet-config.json:", error);
      _firebaseConfig = {};
    }
  }
  return _firebaseConfig;
}

import { getFirestore } from 'firebase-admin/firestore';

export { admin };

let _db: any = null;
export const getAdminDb = () => {
  if (!_db) {
    const config = getFirebaseConfig();
    _db = getFirestore(getFirebaseAdmin(), config.firestoreDatabaseId || '(default)');
  }
  return _db;
};

let _auth: any = null;
export const getAdminAuth = () => {
  if (!_auth) {
    _auth = getFirebaseAdmin().auth();
  }
  return _auth;
};
