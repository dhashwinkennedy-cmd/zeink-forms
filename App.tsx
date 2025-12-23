
import React, { useState, useEffect } from 'react';
import { auth, subscribeToMyForms, subscribeToAllMyResponses, isFirebaseConfigured, signOutUser, fetchFormById, saveFormToCloud } from './services/firebase.ts';
import { Navbar } from './components/Navbar.tsx';
import { Auth } from './components/Auth.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { FormEditor } from './components/FormEditor.tsx';
import { FormResponder } from './components/FormResponder.tsx';
import { FormDetails } from './components/FormDetails.tsx';
import { Form } from './types.ts';
import { Search, Loader2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState<'dashboard' | 'editor' | 'responder' | 'details'>('dashboard');
  const [activeForm, setActiveForm] = useState<Form | null>(null);
  const [forms, setForms] = useState<Form[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [isSearchingForm, setIsSearchingForm] = useState(false);

  useEffect(() => {
    let unsubscribeAuth: any;
    try {
      if (auth && typeof auth.onAuthStateChanged === 'function') {
        unsubscribeAuth = auth.onAuthStateChanged((u: any) => {
          setUser(u);
        });
      }
    } catch (error) {
      console.error("App: Auth initialization error:", error);
    }

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
    };
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

  if (!user) {
    return <Auth />;
  }

  const handleCreateForm = async () => {
    const newForm: Form = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Logic Form',
      subtitle: 'Build something incredible.',
      description: '',
      pages: [{ 
        id: 'p1', 
        title: 'Welcome Page', 
        fields: [],
        navigationControl: { allowRevisiting: true }
      }],
      status: 'draft',
      createdAt: Date.now(),
      ownerId: user.uid,
      responsesCount: 0
    };
    await saveFormToCloud(newForm);
    setActiveForm(newForm);
    setView('editor');
  };

  const handleUpdateForm = async (updated: Form) => {
    setActiveForm(updated);
    await saveFormToCloud(updated);
  };

  const handleSignOut = async () => {
    await signOutUser();
    setView('dashboard');
  };

  const handleFindForm = async (id: string) => {
    if (!id.trim()) return;
    setIsSearchingForm(true);
    
    const remote = await fetchFormById(id);
    if (remote) {
      setActiveForm(remote);
      // We don't automatically go to responder here, responder is shown by the UI state
    } else {
      alert("Form Engine: Reference not found. Please check the ID.");
    }
    setIsSearchingForm(false);
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
            onUpdateForm={handleUpdateForm}
          />
        )}

        {view === 'responder' && (
          <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
             {!activeForm ? (
               <div className="w-full max-w-md text-center animate-in fade-in zoom-in duration-500">
                 <div className="w-16 h-16 bg-[#ff1a1a] rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-red-100">
                    <Search className="text-white w-8 h-8" />
                 </div>
                 <h2 className="text-3xl font-black mb-2 tracking-tighter">Enter Form ID</h2>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">Access a workspace via unique hash</p>
                 
                 <div className="relative mb-6">
                    <input 
                      type="text" 
                      placeholder="e.g. x8j2k9..." 
                      disabled={isSearchingForm}
                      className="w-full px-8 py-5 bg-[#F8F9FA] rounded-[1.5rem] border-none outline-none font-black text-center text-lg focus:ring-4 ring-[#ff1a1a]/5 transition-all placeholder-gray-200"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleFindForm((e.target as HTMLInputElement).value);
                      }}
                    />
                    {isSearchingForm && (
                      <div className="absolute right-6 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-5 h-5 text-[#ff1a1a] animate-spin" />
                      </div>
                    )}
                 </div>
                 <button onClick={() => setView('dashboard')} className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] hover:text-[#ff1a1a] transition-colors">Return to Console</button>
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
