import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc,
  deleteDoc, 
  onSnapshot, 
  getDocs, 
  getDoc, 
  Firestore 
} from 'firebase/firestore';
import {
  getDatabase,
  ref,
  set,
  remove,
  onValue,
  get,
  Database
} from 'firebase/database';
import firebaseConfigFile from '../../firebase-applet-config.json';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentUser = auth?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo: currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

let app: any = null;
export let auth: any = null;
export let db: Firestore | null = null;
export let rtdb: Database | null = null;
export let isFirebaseConfigured = false;

// Attempt to load configuration
export function initFirebase(customConfig?: any): boolean {
  try {
    const config = customConfig || firebaseConfigFile || (window as any).__FIREBASE_CONFIG__;
    if (config && config.apiKey && config.projectId) {
      app = !getApps().length ? initializeApp(config) : getApp();
      auth = getAuth(app);
      
      // Initialize Cloud Firestore if configured
      try {
        const dbId = config.firestoreDatabaseId;
        db = dbId ? getFirestore(app, dbId) : getFirestore(app);
      } catch (err) {
        console.warn('Firestore initialization notice:', err);
      }

      // Initialize Realtime Database if databaseURL is provided
      if (config.databaseURL) {
        try {
          rtdb = getDatabase(app, config.databaseURL);
        } catch (err) {
          console.warn('Realtime Database initialization notice:', err);
        }
      }

      isFirebaseConfigured = true;
      return true;
    }
  } catch (err) {
    console.warn('Firebase initialization warning:', err);
  }
  return false;
}

export async function loginWithGoogle(): Promise<User | null> {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized. Please configure Firebase in Admin Settings or use built-in admin credentials.');
  }
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function logoutUser(): Promise<void> {
  if (auth) {
    await fbSignOut(auth);
  }
}

export function onAuthChange(cb: (user: User | null) => void) {
  if (auth) {
    return onAuthStateChanged(auth, cb);
  }
  return () => {};
}
