
import React, { useState, useEffect } from 'react';
import { auth, subscribeToMyForms, subscribeToAllMyResponses, isFirebaseConfigured, signOutUser } from './services/firebase.ts';
import { Navbar } from './components/Navbar.tsx';
import { Auth } from './components/Auth.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { FormEditor } from './components/FormEditor.tsx';
import { FormResponder } from './components/FormResponder.tsx';
import { FormDetails } from './components/FormDetails.tsx';
import { Form } from './types.ts';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState<'dashboard' | 'editor' | 'responder' | 'details'>('dashboard');
  const [activeForm, setActiveForm] = useState<Form | null>(null);
  const [forms, setForms] = useState<Form[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Sync Auth State
    const unsubscribeAuth = auth.onAuthStateChanged((u: any) => {
      setUser(u);
      setIsInitializing(false);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user?.uid) {
      const unsubForms = subscribeToMyForms(user.uid, (updatedForms) => {
        setForms(updatedForms);
      });
      const unsubRes = subscribeToAllMyResponses(user.uid, (updatedResponses) => {
        setResponses(updatedResponses);
      });
      return () => {
        unsubForms();
        unsubRes();
      };
    } else {
      setForms([]);
      setResponses([]);
    }
  }, [user]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FEECEC]">
        <Loader2 className="w-10 h-10 text-[#ff1a1a] animate-spin mb-4" />
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Booting Engine...</span>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const handleCreateForm = () => {
    const newForm: Form = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Logic Form',
      description: '',
      pages: [{ id: 'p1', title: 'Welcome Page', fields: [] }],
      status: 'draft',
      createdAt: Date.now(),
      ownerId: user.uid,
      responsesCount: 0
    };
    setActiveForm(newForm);
    setView('editor');
  };

  const handleSignOut = async () => {
    await signOutUser();
    setView('dashboard');
  };

  return (
    <div className="min-h-screen selection:bg-[#ff1a1a] selection:text-white">
      {view !== 'responder' && (
        <Navbar 
          user={user} 
          onHome={() => { setView('dashboard'); setActiveForm(null); }} 
          isDemo={!isFirebaseConfigured}
          onSignOut={handleSignOut}
        />
      )}

      <main className={view === 'responder' ? '' : 'pt-24 sm:pt-28'}>
        {view === 'dashboard' && (
          <Dashboard 
            forms={forms}
            responses={responses}
            onFormClick={(f) => { setActiveForm(f); setView('details'); }} 
            onCreateClick={handleCreateForm}
            onRespondClick={() => setView('responder')}
            onResponseClick={(r) => {
              const f = forms.find(form => form.id === r.formId);
              if (f) {
                setActiveForm(f);
                setView('details');
              }
            }}
          />
        )}

        {view === 'details' && activeForm && (
          <FormDetails 
            form={activeForm} 
            responses={responses.filter(r => r.formId === activeForm.id)}
            onEdit={() => setView('editor')} 
            onBack={() => { setView('dashboard'); setActiveForm(null); }} 
          />
        )}

        {view === 'editor' && activeForm && (
          <FormEditor 
            form={activeForm} 
            onBack={() => { setView('dashboard'); setActiveForm(null); }}
            onUpdateForm={(updated) => setActiveForm(updated)}
          />
        )}

        {view === 'responder' && (
          <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
             {!activeForm ? (
               <div className="w-full max-w-md text-center">
                 <h2 className="text-2xl font-black mb-6">Enter Form ID</h2>
                 <input 
                   type="text" 
                   placeholder="e.g. x8j2k9..." 
                   className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold text-center mb-4 focus:ring-2 ring-[#ff1a1a]/20 transition-all"
                   onKeyDown={async (e) => {
                     if (e.key === 'Enter') {
                       const val = (e.target as HTMLInputElement).value;
                       // Check local forms first for convenience in demo
                       const localForms = JSON.parse(localStorage.getItem('zienk_forms') || '[]');
                       const found = localForms.find((f: any) => f.id === val);
                       if (found) {
                         setActiveForm(found);
                       } else {
                         alert("Form not found. Ensure the ID is correct.");
                       }
                     }
                   }}
                 />
                 <button onClick={() => setView('dashboard')} className="text-xs font-black text-gray-400 uppercase tracking-widest">Back to Dashboard</button>
               </div>
             ) : (
               <FormResponder 
                 form={activeForm}
                 userResponses={responses}
                 onExit={() => { setView('dashboard'); setActiveForm(null); }} 
               />
             )}
          </div>
        )}
      </main>
    </div>
  );
}
