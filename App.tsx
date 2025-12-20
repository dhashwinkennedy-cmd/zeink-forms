
import React, { useState, useEffect } from 'react';
import { auth, subscribeToMyForms, subscribeToAllMyResponses, isFirebaseConfigured } from './services/firebase.ts';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u: any) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user?.uid) {
      const unsubForms = subscribeToMyForms(user.uid, setForms);
      const unsubRes = subscribeToAllMyResponses(user.uid, setResponses);
      return () => {
        unsubForms();
        unsubRes();
      };
    }
  }, [user]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FEECEC]">
      <Loader2 className="w-10 h-10 text-[#ff1a1a] animate-spin mb-4" />
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Initializing Engine...</span>
    </div>
  );

  if (!user) return <Auth />;

  return (
    <div className="min-h-screen selection:bg-[#ff1a1a] selection:text-white">
      {view !== 'responder' && (
        <Navbar 
          user={user} 
          onHome={() => setView('dashboard')} 
          isDemo={!isFirebaseConfigured}
          onSignOut={() => {
            localStorage.removeItem('zienk_auth_user');
            window.location.reload();
          }}
        />
      )}

      <main className={view === 'responder' ? '' : 'pt-24 sm:pt-28'}>
        {view === 'dashboard' && (
          <Dashboard 
            forms={forms}
            responses={responses}
            onFormClick={(f) => { setActiveForm(f); setView('details'); }} 
            onCreateClick={() => {
              const newForm: Form = {
                id: Math.random().toString(36).substr(2, 9),
                title: 'Untitled Form',
                description: '',
                pages: [{ id: 'p1', title: 'Welcome', fields: [] }],
                status: 'draft',
                createdAt: Date.now(),
                ownerId: user.uid,
                responsesCount: 0
              };
              setActiveForm(newForm);
              setView('editor');
            }}
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
            onBack={() => setView('dashboard')} 
          />
        )}

        {view === 'editor' && activeForm && (
          <FormEditor 
            form={activeForm} 
            onBack={() => setView('dashboard')}
            onUpdateForm={(updated) => setActiveForm(updated)}
          />
        )}

        {view === 'responder' && (
          <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-white">
            <h2 className="text-xl font-black mb-4">Enter Form ID</h2>
            <input 
              type="text" 
              placeholder="Form ID..." 
              className="px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold text-center mb-4"
              onKeyDown={async (e) => {
                if (e.key === 'Enter') {
                  const target = e.target as HTMLInputElement;
                  const formsList = JSON.parse(localStorage.getItem('zienk_forms') || '[]');
                  const f = formsList.find((form: any) => form.id === target.value);
                  if (f) {
                    setActiveForm(f);
                  } else {
                    alert("Form not found in local library.");
                  }
                }
              }}
            />
            {activeForm && (
              <FormResponder 
                form={activeForm}
                userResponses={responses}
                onExit={() => setView('dashboard')} 
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
