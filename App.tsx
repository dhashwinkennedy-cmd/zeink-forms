import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import FormEditor from './components/FormEditor/FormEditor';
import FormRunner from './components/FormRunner/FormRunner';
import SummaryPage from './components/Summary/SummaryPage';
import ResultView from './components/Summary/ResultView';
import LoginPage from './pages/LoginPage';
import AccountSettings from './pages/AccountSettings';
import UpgradePage from './pages/UpgradePage';
import AIWallet from './pages/AIWallet';
import { ShieldAlert, Zap, X, CloudOff, Key, ExternalLink } from 'lucide-react';
import { isConfigValid } from './services/firebase';

// Extend Window interface for AI Studio tools
// Fix: Use the expected AIStudio interface name to match global declarations and avoid modifier/type conflicts.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio: AIStudio;
  }
}

const APIErrorShield: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  const [hasGeminiKey, setHasGeminiKey] = useState(true);
  
  const firebaseKeyMissing = !isConfigValid;

  useEffect(() => {
    const checkKeys = async () => {
      // Check environment variable first
      const envKey = process.env.API_KEY;
      const hasEnvKey = envKey && envKey !== 'undefined' && envKey.length > 5;
      
      if (hasEnvKey) {
        setHasGeminiKey(true);
      } else if (window.aistudio) {
        // Fallback to AI Studio selection check
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasGeminiKey(selected);
      } else {
        setHasGeminiKey(false);
      }
    };

    checkKeys();
    const interval = setInterval(checkKeys, 3000); // Poll for key selection
    return () => clearInterval(interval);
  }, []);

  const handleConnectGemini = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        // Proceed as if successful per guidelines
        setHasGeminiKey(true);
      } catch (err) {
        console.error("Key selection failed", err);
      }
    } else {
      alert("AI Studio environment not detected. Please ensure you are running this in a compatible workspace.");
    }
  };

  const geminiKeyMissing = !hasGeminiKey;

  if (dismissed || (!geminiKeyMissing && !firebaseKeyMissing)) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 z-[9999] animate-in slide-in-from-bottom-10 duration-500">
      <div className="bg-[#0a0b10] border-2 border-[#ff1a1a] rounded-[2.5rem] p-6 shadow-2xl flex flex-col md:flex-row items-center gap-6 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <ShieldAlert size={120} className="text-[#ff1a1a]" />
        </div>
        
        <div className="w-16 h-16 bg-[#ff1a1a] rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-red-500/20">
          <CloudOff size={32} className="text-white" />
        </div>

        <div className="flex-1 space-y-1 relative z-10 text-center md:text-left">
          <h3 className="text-xl font-black uppercase tracking-tighter italic">Cloud Connectivity Alert</h3>
          <div className="space-y-2">
            {firebaseKeyMissing && (
              <p className="text-sm font-bold text-red-200 flex items-center justify-center md:justify-start gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ff1a1a] animate-pulse" />
                Firebase Configuration missing. App is in Offline/Guest mode.
              </p>
            )}
            {geminiKeyMissing && (
              <div className="space-y-1">
                <p className="text-sm font-bold text-orange-200 flex items-center justify-center md:justify-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  Gemini API Key is missing. AI Evaluation features are disabled.
                </p>
                <a 
                  href="https://ai.google.dev/gemini-api/docs/billing" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[10px] text-gray-400 hover:text-white underline ml-4 flex items-center gap-1 justify-center md:justify-start"
                >
                  Learn about Billing & Paid Projects <ExternalLink size={10} />
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10 w-full md:w-auto">
          {geminiKeyMissing && (
            <button 
              onClick={handleConnectGemini}
              className="flex-1 md:flex-none px-6 py-3 bg-white text-[#0a0b10] rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
            >
              <Key size={14} /> Connect Gemini
            </button>
          )}
          {firebaseKeyMissing && (
            <a 
              href="https://console.firebase.google.com/" 
              target="_blank" 
              className="flex-1 md:flex-none px-6 py-3 bg-[#ff1a1a] text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all text-center"
            >
              Firebase Console
            </a>
          )}
          <button 
            onClick={() => setDismissed(true)}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user && !location.pathname.startsWith('/run')) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen flex flex-col">
      <APIErrorShield />
      {user && <Navbar />}
      <main className={`flex-1 ${user ? 'mt-16' : ''} p-4 md:p-8`}>
        <Routes>
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/editor/:id" element={<ProtectedRoute><FormEditor /></ProtectedRoute>} />
          <Route path="/run/:id" element={<FormRunner />} />
          <Route path="/summary/:id" element={<ProtectedRoute><SummaryPage /></ProtectedRoute>} />
          <Route path="/result/:responseId" element={<ProtectedRoute><ResultView /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><AIWallet /></ProtectedRoute>} />
          <Route path="/upgrade" element={<ProtectedRoute><UpgradePage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </HashRouter>
  );
};

export default App;