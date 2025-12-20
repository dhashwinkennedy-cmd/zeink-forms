import React, { useState, useEffect } from 'react';
import { storage, isLive } from './services/storage.ts';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return storage.auth.onAuthChange((u: any) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Loader2 className="w-10 h-10 text-[#ff1a1a] animate-spin mb-4" />
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Booting Zienk...</span>
    </div>
  );

  if (!user) return <Auth />;

  return (
    <div className="min-h-screen">
      {view !== 'responder' && (
        <Navbar 
          user={user} 
          onHome={() => setView('dashboard')} 
          isDemo={!isLive}
          onSignOut={() => storage.auth.signOut()}
        />
      )}

      <main className={view === 'responder' ? '' : 'pt-24'}>
        {view === 'dashboard' && (
          <Dashboard 
            user={user} 
            onSelectForm={(f) => { setActiveForm(f); setView('details'); }} 
            onCreate={() => {
              const newForm: Form = {
                id: Math.random().toString(36).substr(2, 9),
                title: 'New Form',
                description: '',
                pages: [{ id: 'p1', title: 'First Page', fields: [] }],
                status: 'draft',
                createdAt: Date.now(),
                ownerId: user.uid,
                responsesCount: 0
              };
              setActiveForm(newForm);
              setView('editor');
            }}
            onRespond={() => setView('responder')}
          />
        )}

        {view === 'details' && activeForm && (
          <FormDetails 
            form={activeForm} 
            onEdit={() => setView('editor')} 
            onBack={() => setView('dashboard')} 
          />
        )}

        {view === 'editor' && activeForm && (
          <FormEditor 
            form={activeForm} 
            onSave={async (f) => {
              await storage.forms.save(f);
              setActiveForm(f);
            }} 
            onBack={() => setView('details')}
            onPublish={async (f) => {
              const published = { ...f, status: 'published' as const };
              await storage.forms.save(published);
              setView('dashboard');
            }}
          />
        )}

        {view === 'responder' && (
          <FormResponder 
            onExit={() => setView('dashboard')} 
          />
        )}
      </main>
    </div>
  );
}