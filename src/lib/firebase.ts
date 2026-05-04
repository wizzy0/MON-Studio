import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, getDocFromServer, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signOut = () => auth.signOut();

export const syncUser = async (user: User) => {
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
    await setDoc(userRef, userData);
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
