import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, getDocFromServer, serverTimestamp } from 'firebase/firestore';

// Configuration strictly from environment variables
// This prevents GitHub leaks by using Vercel/Local Secrets
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID,
};

// Handle missing config gracefully to avoid white screen
const isConfigValid = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

if (!isConfigValid) {
  console.warn("Firebase configuration is missing! Make sure to set VITE_FIREBASE_* environment variables.");
}

const app = isConfigValid ? initializeApp(firebaseConfig) : undefined;
export const db = app ? getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)') : undefined as any;
export const auth = app ? getAuth(app) : undefined as any;
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  if (!auth) {
    throw new Error("Firebase Auth is not initialized. Check your environment variables.");
  }
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    console.error("Login component error:", error);
    throw error;
  }
};

export const signOut = () => auth?.signOut();

export const syncUser = async (user: User) => {
  if (!db) return null;
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  const isAdminEmail = user.email === 'AnomMahesa02@gmail.com';
  
  if (!userSnap.exists()) {
    const role = isAdminEmail ? 'owner' : 'editor';
    const userData = {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    try {
      await setDoc(userRef, userData);
    } catch (e: any) {
      console.error("Failed to create user doc (likely 403):", e);
      // If it's a 403, we might still want to return the local data so the app can try to function
      // for the owner who bypasses document check in rules
      if (isAdminEmail) return userData;
      throw e;
    }
    return userData;
  }
  
  const existingData = userSnap.data();
  // Ensure admin email always has owner role if not already
  if (isAdminEmail && existingData.role !== 'owner') {
    await setDoc(userRef, { role: 'owner', updatedAt: serverTimestamp() }, { merge: true });
    return { ...existingData, role: 'owner' };
  }
  
  return existingData;
};

// CRITICAL: Validate connection to Firestore
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
