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
let auth: any;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (e) {
    console.error("Firebase initialization failed:", e);
  }
}

export { db, auth };

const sanitize = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(sanitize);
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, sanitize(v)])
    );
  }
  return obj;
};

export const signUpUser = (email: string, pass: string) => {
  if (!auth) throw new Error("Auth not initialized");
  return createUserWithEmailAndPassword(auth, email, pass);
};

export const signInUser = (email: string, pass: string) => {
  if (!auth) throw new Error("Auth not initialized");
  return signInWithEmailAndPassword(auth, email, pass);
};

export const signOutUser = () => {
  if (!auth) throw new Error("Auth not initialized");
  return firebaseSignOut(auth);
};

export const saveFormToCloud = async (form: Form) => {
  if (!db || !auth?.currentUser) return;
  try {
    const formRef = doc(db, "forms", form.id);
    const dataToSave = sanitize({
      ...form,
      ownerId: auth.currentUser.uid,
      updatedAt: Date.now()
    });
    await setDoc(formRef, dataToSave, { merge: true });
  } catch (e) {
    console.error("Cloud save failed:", e);
  }
};

export const submitResponse = async (response: FormResponse) => {
  if (!db || !auth?.currentUser) return false;
  
  try {
    const responseRef = doc(db, "responses", response.id);
    const formRef = doc(db, "forms", response.formId);
    
    const dataToSave = sanitize({
      ...response,
      respondentUid: auth.currentUser.uid,
      respondentEmail: auth.currentUser.email
    });
    
    await setDoc(responseRef, dataToSave);
    await updateDoc(formRef, { responsesCount: increment(1) });
    return true;
  } catch (e) {
    console.error("Submission failed:", e);
    return false;
  }
};

export const fetchFormById = async (id: string): Promise<Form | null> => {
  if (!db) return null;
  try {
    const formRef = doc(db, "forms", id);
    const snap = await getDoc(formRef);
    return snap.exists() ? (snap.data() as Form) : null;
  } catch (e) {
    return null;
  }
};

export const subscribeToMyForms = (userId: string, callback: (forms: Form[]) => void) => {
  if (!db) return () => {};
  const formsCollection = collection(db, "forms");
  const q = query(formsCollection, where("ownerId", "==", userId));
  return onSnapshot(q, (snapshot) => {
    const forms = snapshot.docs.map(doc => doc.data() as Form);
    callback(forms.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
  });
};

export const subscribeToAllMyResponses = (userId: string, callback: (responses: any[]) => void) => {
  if (!db) return () => {};
  const responsesCollection = collection(db, "responses");
  const q = query(responsesCollection, where("respondentUid", "==", userId));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => doc.data()).sort((a: any, b: any) => (b.submittedAt || 0) - (a.submittedAt || 0)));
  });
};