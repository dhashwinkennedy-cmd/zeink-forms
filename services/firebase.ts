import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  where, 
  onSnapshot,
  increment,
  updateDoc
} from "firebase/firestore";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut as firebaseSignOut
} from "firebase/auth";
import { Form, FormResponse } from "../types.ts";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.FIREBASE_APP_ID || ""
};

export const isFirebaseConfigured = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

let app: any;
let db: any;
let authInstance: any;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    authInstance = getAuth(app);
  } catch (e) {
    console.error("Firebase initialization failed:", e);
  }
}

// --- MOCK PERSISTENCE FOR PREVIEW MODE ---
const getLocalData = (key: string) => JSON.parse(localStorage.getItem(`zienk_${key}`) || '[]');
const setLocalData = (key: string, data: any) => localStorage.setItem(`zienk_${key}`, JSON.stringify(data));

const mockUser = {
  uid: 'demo-user-123',
  email: 'demo@zienk.io',
  displayName: 'Demo Architect'
};

const mockAuth = {
  get currentUser() {
    return JSON.parse(localStorage.getItem('zienk_auth_user') || 'null');
  },
  onAuthStateChanged: (callback: any) => {
    const user = JSON.parse(localStorage.getItem('zienk_auth_user') || 'null');
    callback(user);
    // Listen for storage changes to sync across tabs if needed
    const listener = (e: StorageEvent) => {
      if (e.key === 'zienk_auth_user') {
        callback(JSON.parse(e.newValue || 'null'));
      }
    };
    window.addEventListener('storage', listener);
    return () => window.removeEventListener('storage', listener);
  }
};

export const auth = isFirebaseConfigured ? authInstance : mockAuth;

export const signUpUser = async (email: string, pass: string) => {
  if (isFirebaseConfigured) return createUserWithEmailAndPassword(auth, email, pass);
  const user = { ...mockUser, email };
  localStorage.setItem('zienk_auth_user', JSON.stringify(user));
  window.dispatchEvent(new Event('storage')); // Trigger local update
  return { user };
};

export const signInUser = async (email: string, pass: string) => {
  if (isFirebaseConfigured) return signInWithEmailAndPassword(auth, email, pass);
  localStorage.setItem('zienk_auth_user', JSON.stringify(mockUser));
  window.dispatchEvent(new Event('storage'));
  return { user: mockUser };
};

export const signOutUser = async () => {
  if (isFirebaseConfigured) return firebaseSignOut(auth);
  localStorage.removeItem('zienk_auth_user');
  window.location.reload(); // Hard reload for clean state
};

export const saveFormToCloud = async (form: Form) => {
  if (isFirebaseConfigured && auth.currentUser) {
    try {
      const formRef = doc(db, "forms", form.id);
      await setDoc(formRef, { ...form, ownerId: auth.currentUser.uid, updatedAt: Date.now() }, { merge: true });
    } catch (e) { console.error(e); }
  } else {
    const forms = getLocalData('forms');
    const idx = forms.findIndex((f: any) => f.id === form.id);
    const updatedForm = { ...form, ownerId: mockUser.uid, updatedAt: Date.now() };
    if (idx >= 0) forms[idx] = updatedForm;
    else forms.push(updatedForm);
    setLocalData('forms', forms);
  }
};

export const submitResponse = async (response: FormResponse) => {
  if (isFirebaseConfigured && auth.currentUser) {
    try {
      const responseRef = doc(db, "responses", response.id);
      const formRef = doc(db, "forms", response.formId);
      await setDoc(responseRef, { ...response, respondentUid: auth.currentUser.uid });
      await updateDoc(formRef, { responsesCount: increment(1) });
      return true;
    } catch (e) { return false; }
  } else {
    const resps = getLocalData('responses');
    resps.push({ ...response, respondentUid: mockUser.uid });
    setLocalData('responses', resps);
    
    const forms = getLocalData('forms');
    const fIdx = forms.findIndex((f: any) => f.id === response.formId);
    if (fIdx >= 0) {
      forms[fIdx].responsesCount = (forms[fIdx].responsesCount || 0) + 1;
      setLocalData('forms', forms);
    }
    return true;
  }
};

export const fetchFormById = async (id: string): Promise<Form | null> => {
  if (isFirebaseConfigured) {
    const snap = await getDoc(doc(db, "forms", id));
    return snap.exists() ? (snap.data() as Form) : null;
  }
  return getLocalData('forms').find((f: any) => f.id === id) || null;
};

export const subscribeToMyForms = (userId: string, callback: (forms: Form[]) => void) => {
  if (isFirebaseConfigured) {
    const q = query(collection(db, "forms"), where("ownerId", "==", userId));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => doc.data() as Form).sort((a, b) => b.createdAt - a.createdAt));
    });
  }
  const forms = getLocalData('forms').filter((f: any) => f.ownerId === userId);
  callback(forms.sort((a: any, b: any) => b.createdAt - a.createdAt));
  return () => {};
};

export const subscribeToAllMyResponses = (userId: string, callback: (responses: any[]) => void) => {
  if (isFirebaseConfigured) {
    const q = query(collection(db, "responses"), where("respondentUid", "==", userId));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => doc.data()).sort((a: any, b: any) => b.submittedAt - a.submittedAt));
    });
  }
  const resps = getLocalData('responses').filter((r: any) => r.respondentUid === userId);
  callback(resps.sort((a: any, b: any) => b.submittedAt - a.submittedAt));
  return () => {};
};
