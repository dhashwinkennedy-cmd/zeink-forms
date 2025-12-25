
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserTier } from '../types';
import { auth, db } from '../services/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User as FirebaseUser
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  addCredits: (amount: number) => Promise<void>;
  upgradeToPro: () => Promise<void>;
  updateUser: (updates: { name?: string; avatar?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signup = async (email: string, pass: string, username: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const newUser: User = {
      id: cred.user.uid,
      name: username,
      email: email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      credits_monthly: 150,
      credits_bonus: 50,
      tier: UserTier.FREE,
      reset_date: Date.now() + 30 * 24 * 60 * 60 * 1000
    };
    await setDoc(doc(db, 'users', cred.user.uid), newUser);
    setUser(newUser);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const addCredits = async (amount: number) => {
    if (!user) return;
    const newCredits = user.credits_bonus + amount;
    await updateDoc(doc(db, 'users', user.id), { credits_bonus: newCredits });
    setUser({ ...user, credits_bonus: newCredits });
  };

  const upgradeToPro = async () => {
    if (!user) return;
    const updates = { tier: UserTier.PRO, credits_monthly: 700 };
    await updateDoc(doc(db, 'users', user.id), updates);
    setUser({ ...user, ...updates });
  };

  const updateUser = async (updates: { name?: string; avatar?: string }) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.id), updates);
    setUser({ ...user, ...updates });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, addCredits, upgradeToPro, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
