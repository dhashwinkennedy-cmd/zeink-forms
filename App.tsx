import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { FormEditor } from './components/FormEditor.tsx';
import { FormResponder } from './components/FormResponder.tsx';
import { FormDetails } from './components/FormDetails.tsx';
import { Auth } from './components/Auth.tsx';
import { Form } from './types.ts';
import { X, Loader2, Plus } from 'lucide-react';
import { auth, saveFormToCloud, subscribeToMyForms, fetchFormById, subscribeToAllMyResponses, signOutUser, isFirebaseConfigured } from './services/firebase.ts';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [view, setView] = useState<'dashboard' | 'editor' | 'responder' | 'details'>('dashboard');
  const [forms, setForms] = useState<Form[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [activeForm, setActiveForm] = useState<Form | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'saved' | 'error'>('idle');
  
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showRespondModal, setShowRespondModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  
  const [respondInput, setRespondInput] = useState('');
  const [respondError, setRespondError] = useState<string | null>(null);
  const [respondLoading, setRespondLoading] = useState(false);
  
  const [isPublishing, setIsPublishing] = useState(false);
  const [shareForm, setShareForm] = useState<Form | null>(null);

  useEffect(() => {
    let unsubscribeForms: (() => void) | undefined;
    let unsubscribeResponses: (() => void) | undefined;

    const handleAuth = (user: any) => {
      setCurrentUser(user);
      if (user) {
        unsubscribeForms = subscribeToMyForms(user.uid, (cloudForms) => {
          setForms(cloudForms);
          setIsLoading(false);
        });
        unsubscribeResponses = subscribeToAllMyResponses(user.uid, (cloudResponses) => {
          setResponses(cloudResponses);
        });
      } else {
        setForms([]);
        setResponses([]);
        setIsLoading(false);
        setView('dashboard');
      }
    };

    if (isFirebaseConfigured && (auth as any).onAuthStateChanged) {
      const unsubscribeAuth = (auth as any).onAuthStateChanged(handleAuth);
      return () => {
        if (unsubscribeForms) unsubscribeForms();
        if (unsubscribeResponses) unsubscribeResponses();
        unsubscribeAuth();
      };
    } else {
      // Demo Mode Initialization
      handleAuth(auth.currentUser);
    }
  }, []);

  const handleSignOut = async () => {
    await signOutUser();
  };

  const handleCreateNew = async () => {
    const newForm: Form = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'Untitled Form',
      subtitle: 'Write a short description...',
      bannerUrl: '',
      createdAt: Date.now(),
      responsesCount: 0,
      pages: [{
        id: Math.random().toString(36).substr(2, 9),
        title: 'Page 1',
        fields: [],
        navigationControl: { allowRevisiting: true },
        redirectionLogics: []
      }],
      status: 'draft',
      settings: {
        access: 'PUBLIC',
        whitelist: [],
        blocklist: [],
        expiryEnabled: false,
        results: {
          showAfterSubmission: true,
          scheduled: false,
          showAfterApproval: false
        }
      }
    };
    
    setSyncStatus('syncing');
    await saveFormToCloud(newForm);
    setSyncStatus('saved');
    setTimeout(() => setSyncStatus('idle'), 2000);
    
    setActiveForm(newForm);
    setView('editor');
    setShowCreatePopup(false);
  };

  const handlePublish = async () => {
    if (!activeForm) return;
    setIsPublishing(true);
    const updatedForm = { ...activeForm, status: 'published' as const };
    await saveFormToCloud(updatedForm);
    setIsPublishing(false);
    setView('dashboard');
    setShareForm(updatedForm);
  };

  const handleRespondSubmit = async () => {
    setRespondError(null);
    let id = respondInput.trim();
    if (id.includes('/view/')) id = id.split('/view/').pop() || '';

    if (!id) {
      setRespondError('Enter a valid link or ID.');
      return;
    }

    setRespondLoading(true);
    try {
      const target = await fetchFormById(id);
      if (!target) {
        setRespondError('Form not found.');
      } else if (target.status === 'draft') {
        setRespondError('Form is not published.');
      } else {
        setActiveForm(target);
        setView('responder');
        setShowRespondModal(false);
        setRespondInput('');
      }
    } catch (e) {
      setRespondError('Error fetching form.');
    } finally {
      setRespondLoading(false);
    }
  };

  const handleUpdateActiveForm = useCallback(async (updated: Form) => {
    setActiveForm(updated);
    setSyncStatus('syncing');
    await saveFormToCloud(updated);
    setSyncStatus('saved');
    setTimeout(() => setSyncStatus('idle'), 2000);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FEECEC]">
        <Loader2 className="w-10 h-10 text-[#ff1a1a] animate-spin mb-3" />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading Zienk Engine...</p>
      </div>
    );
  }

  if (!currentUser) return <Auth />;

  return (
    <div className="min-h-screen selection:bg-[#ff1a1a] selection:text-white pb-10">
      {view !== 'responder' && (
        <Navbar 
          onHomeClick={() => setView('dashboard')}
          onSignOut={handleSignOut}
          onWalletClick={() => setShowWalletModal(true)}
          showPublish={view === 'editor'}
          onPublish={handlePublish}
          onScheduleClick={() => setShowScheduleModal(true)}
          isSaving={isPublishing}
          isDemo={!isFirebaseConfigured}
        />
      )}
      
      {view === 'dashboard' ? (
        <Dashboard 
          forms={forms}
          responses={responses}
          onCreateClick={() => setShowCreatePopup(true)}
          onRespondClick={() => setShowRespondModal(true)}
          onResponseClick={() => {}} 
          onFormClick={(form) => { setActiveForm(form); setView('details'); }}
        />
      ) : view === 'details' && activeForm ? (
        <FormDetails
          form={activeForm}
          responses={responses.filter(r => r.formId === activeForm.id)}
          onBack={() => setView('dashboard')}
          onEdit={() => setView('editor')}
        />
      ) : view === 'editor' && activeForm ? (
        <FormEditor 
          form={activeForm}
          onBack={() => setView('details')}
          onUpdateForm={handleUpdateActiveForm}
        />
      ) : view === 'responder' && activeForm ? (
        <FormResponder 
          form={activeForm}
          userResponses={responses.filter(r => r.formId === activeForm.id)}
          onExit={() => setView('dashboard')}
        />
      ) : null}

      {showCreatePopup && (
        <div className="fixed inset-0 bg-[#0a0b10]/90 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-8 sm:p-10 text-center">
            <div className="flex justify-end mb-4"><button onClick={() => setShowCreatePopup(false)} className="p-2 text-gray-300"><X className="w-5 h-5" /></button></div>
            <h2 className="text-2xl font-black text-[#0a0b10] mb-8">New Form</h2>
            <button onClick={handleCreateNew} className="w-full p-6 rounded-3xl bg-[#ff1a1a] text-left flex items-center gap-5 shadow-2xl shadow-red-100">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white"><Plus className="w-6 h-6" /></div>
              <div><h3 className="text-lg font-black text-white leading-tight">Blank Canvas</h3><p className="text-[8px] text-white/70 font-bold uppercase tracking-widest">Start from scratch</p></div>
            </button>
          </div>
        </div>
      )}

      {showRespondModal && (
        <div className="fixed inset-0 bg-[#0a0b10]/95 backdrop-blur-2xl z-[200] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-8 sm:p-10">
            <div className="flex items-center justify-between mb-8"><h3 className="text-2xl font-black text-[#0a0b10]">Open Form</h3><button onClick={() => setShowRespondModal(false)} className="p-2 text-gray-400"><X className="w-6 h-6" /></button></div>
            <div className="space-y-6">
              <input type="text" placeholder="Form ID..." className="w-full px-5 py-4 bg-gray-50 rounded-xl outline-none font-bold text-sm" value={respondInput} onChange={(e) => setRespondInput(e.target.value)} />
              {respondError && <p className="text-red-500 text-[10px] font-black uppercase text-center">{respondError}</p>}
              <button onClick={handleRespondSubmit} disabled={respondLoading} className="w-full py-4 bg-[#ff1a1a] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-100 disabled:opacity-50">{respondLoading ? 'Loading...' : 'Go to Form'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
