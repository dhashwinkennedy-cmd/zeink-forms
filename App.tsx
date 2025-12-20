
import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { FormEditor } from './components/FormEditor';
import { FormResponder } from './components/FormResponder';
import { FormDetails } from './components/FormDetails';
import { Auth } from './components/Auth';
import { Form, FormResponse } from './types';
import { Plus, X, Loader2, FileText, Settings, ShieldAlert, ExternalLink, Info } from 'lucide-react';
import { auth, saveFormToCloud, subscribeToMyForms, fetchFormById, subscribeToAllMyResponses, signOutUser, isFirebaseConfigured } from './services/firebase';
import { onAuthStateChanged, User } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
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
  const [selectedResponseForReport, setSelectedResponseForReport] = useState<any | null>(null);
  
  const [respondInput, setRespondInput] = useState('');
  const [respondError, setRespondError] = useState<string | null>(null);
  const [respondLoading, setRespondLoading] = useState(false);
  
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [shareForm, setShareForm] = useState<Form | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setIsLoading(false);
      return;
    }

    let unsubscribeForms: (() => void) | undefined;
    let unsubscribeResponses: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth!, (user) => {
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
    });

    return () => {
      if (unsubscribeForms) unsubscribeForms();
      if (unsubscribeResponses) unsubscribeResponses();
      unsubscribeAuth();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (e) {
      console.error("Sign out error:", e);
    }
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

  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen bg-[#FEECEC] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8 sm:p-12 text-center border border-white">
          <div className="w-20 h-20 bg-amber-100 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 text-amber-600">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-[#0a0b10] mb-4">Setup Required</h1>
          <p className="text-sm text-gray-500 font-bold mb-8 leading-relaxed">
            Zienk Forms needs your <span className="text-[#ff1a1a]">Firebase Keys</span> to function. Please add them to your deployment environment variables.
          </p>
          <div className="space-y-3 text-left mb-8">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-[10px] font-black shadow-sm">1</div>
              <span className="text-[11px] font-black uppercase text-gray-400">Add FIREBASE_API_KEY</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-[10px] font-black shadow-sm">2</div>
              <span className="text-[11px] font-black uppercase text-gray-400">Add FIREBASE_PROJECT_ID</span>
            </div>
          </div>
          <a href="https://console.firebase.google.com/" target="_blank" className="flex items-center justify-center gap-2 w-full py-4 bg-[#0a0b10] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all">
            Firebase Console <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FEECEC]">
        <Loader2 className="w-10 h-10 text-[#ff1a1a] animate-spin mb-3" />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading Engine...</p>
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
        />
      )}
      
      {view === 'dashboard' ? (
        <Dashboard 
          forms={forms}
          responses={responses}
          onCreateClick={() => setShowCreatePopup(true)}
          onRespondClick={() => setShowRespondModal(true)}
          onResponseClick={(resp) => setSelectedResponseForReport(resp)}
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

      {/* Popups & Modals */}
      {showCreatePopup && (
        <div className="fixed inset-0 bg-[#0a0b10]/90 backdrop-blur-xl z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
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
        <div className="fixed inset-0 bg-[#0a0b10]/95 backdrop-blur-2xl z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
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
