import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDoc, query, where, onSnapshot, updateDoc, increment } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut as fbSignOut } from "firebase/auth";
import { Form, FormResponse } from "../types.ts";

const config = {
  apiKey: process.env.FIREBASE_API_KEY || "",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.FIREBASE_APP_ID || ""
};

export const isLive = !!config.apiKey && !!config.projectId;

let db: any;
let auth: any;

if (isLive) {
  const app = initializeApp(config);
  db = getFirestore(app);
  auth = getAuth(app);
}

// Mock User for Local Mode
const MOCK_USER = { uid: 'dev-user', email: 'dev@zienk.io', displayName: 'Preview Architect' };

// Helpers for Local Storage
const getLocal = (k: string) => JSON.parse(localStorage.getItem(`zienk_${k}`) || '[]');
const setLocal = (k: string, v: any) => localStorage.setItem(`zienk_${k}`, JSON.stringify(v));

export const storage = {
  auth: {
    getCurrentUser: () => isLive ? auth?.currentUser : (JSON.parse(localStorage.getItem('zienk_auth') || 'null')),
    onAuthChange: (cb: any) => {
      if (isLive) return onAuthStateChanged(auth, cb);
      cb(JSON.parse(localStorage.getItem('zienk_auth') || 'null'));
      return () => {};
    },
    signIn: async () => {
      if (isLive) return signInWithEmailAndPassword(auth, 'demo@zienk.io', 'demo123');
      localStorage.setItem('zienk_auth', JSON.stringify(MOCK_USER));
      window.location.reload();
    },
    signOut: async () => {
      if (isLive) return fbSignOut(auth);
      localStorage.removeItem('zienk_auth');
      window.location.reload();
    }
  },
  forms: {
    save: async (form: Form) => {
      if (isLive) {
        await setDoc(doc(db, "forms", form.id), form);
      } else {
        const forms = getLocal('forms');
        const idx = forms.findIndex((f: any) => f.id === form.id);
        if (idx >= 0) forms[idx] = form; else forms.push(form);
        setLocal('forms', forms);
      }
    },
    getById: async (id: string): Promise<Form | null> => {
      if (isLive) {
        const s = await getDoc(doc(db, "forms", id));
        return s.exists() ? s.data() as Form : null;
      }
      return getLocal('forms').find((f: any) => f.id === id) || null;
    },
    subscribe: (userId: string, cb: (forms: Form[]) => void) => {
      if (isLive) {
        const q = query(collection(db, "forms"), where("ownerId", "==", userId));
        return onSnapshot(q, (s) => cb(s.docs.map(d => d.data() as Form)));
      }
      cb(getLocal('forms').filter((f: any) => f.ownerId === userId));
      return () => {};
    }
  },
  responses: {
    submit: async (res: FormResponse) => {
      if (isLive) {
        await setDoc(doc(db, "responses", res.id), res);
        await updateDoc(doc(db, "forms", res.formId), { responsesCount: increment(1) });
      } else {
        const rs = getLocal('responses');
        rs.push(res);
        setLocal('responses', rs);
        const fs = getLocal('forms');
        const f = fs.find((f: any) => f.id === res.formId);
        if (f) f.responsesCount++;
        setLocal('forms', fs);
      }
    },
    subscribe: (formId: string, cb: (res: FormResponse[]) => void) => {
      if (isLive) {
        const q = query(collection(db, "responses"), where("formId", "==", formId));
        return onSnapshot(q, (s) => cb(s.docs.map(d => d.data() as FormResponse)));
      }
      cb(getLocal('responses').filter((r: any) => r.formId === formId));
      return () => {};
    }
  }
};