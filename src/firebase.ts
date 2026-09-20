// Configuration and initialization for Firebase in ORAX-ADMIN
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfigJson from '../firebase-applet-config.json';

const firebaseConfig = {
  projectId: firebaseConfigJson.projectId || "ai-studio-applet-webapp-3c127",
  appId: firebaseConfigJson.appId || "1:299319202281:web:5227a71224b243d70dbb78",
  apiKey: firebaseConfigJson.apiKey || "AIzaSyDhrD3pgfu16WhmB7engluvuxde-iAelOI",
  authDomain: firebaseConfigJson.authDomain || "ai-studio-applet-webapp-3c127.firebaseapp.com",
  storageBucket: firebaseConfigJson.storageBucket || "ai-studio-applet-webapp-3c127.firebasestorage.app",
  messagingSenderId: firebaseConfigJson.messagingSenderId || "299319202281",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Explicitly connect to the requested custom database ID with robust long-polling for reverse-proxy & container environments
export const db = initializeFirestore(
  app,
  {
    experimentalForceLongPolling: true,
  },
  firebaseConfigJson.firestoreDatabaseId || "ai-studio-botcloudpaas-8d8460bb-f04e-41af-8df5-12b96b425cc6"
);

// Validate connection to Firestore on boot (from firebase-integration skill)
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection verified successfully.");
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration: client is offline.");
    } else {
      console.log("Firestore connection check status:", error instanceof Error ? error.message : error);
    }
    return false;
  }
}

// Fire connection test non-blockingly
if (typeof window !== 'undefined') {
  testConnection().catch(() => {});
}

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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
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

export default app;
