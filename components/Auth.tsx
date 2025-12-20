
import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, ShieldCheck, ExternalLink, Settings } from 'lucide-react';
import { signInUser, signUpUser, isFirebaseConfigured } from '../services/firebase.ts';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ code?: string; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirebaseConfigured) return;
    setError(null);
    setLoading(true);
    try {
      if (isLogin) {
        await signInUser(email, password);
      } else {
        await signUpUser(email, password);
      }
    } catch (err: any) {
      let friendlyMessage = err.message.replace('Firebase: ', '');
      switch (err.code) {
        case 'auth/invalid-credential':
          friendlyMessage = "Incorrect email or password.";
          break;
        case 'auth/email-already-in-use':
          friendlyMessage = "An account with this email already exists.";
          break;
        case 'auth/weak-password':
          friendlyMessage = "Password is too weak (min 6 chars).";
          break;
      }
      setError({ code: err.code, message: friendlyMessage });
    } finally {
      setLoading(false);
    }
  };

  const isNotAllowedError = error?.code === 'auth/operation-not-allowed';

  return (
    <div className="min-h-screen bg-[#FEECEC] flex items-center justify-center p-4 sm:p-6 selection:bg-[#ff1a1a] selection:text-white">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-white rounded-[2rem] sm:rounded-[3.5rem] shadow-xl overflow-hidden border border-white">
          <div className="p-8 sm:p-12 text-center">
            {/* Logo */}
            <div className="w-14 h-14 sm:w-20 sm:h-20 bg-[#ff1a1a] rounded-2xl sm:rounded-[2rem] flex items-center justify-center shadow-2xl shadow-red-200 mx-auto mb-6 sm:mb-10 group hover:scale-110 transition-transform cursor-default">
              <span className="text-white font-black text-2xl sm:text-4xl italic">Z</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-[#0a0b10] tracking-tight mb-1 sm:mb-2">
              {isLogin ? 'Welcome Back' : 'Get Started'}
            </h1>
            <p className="text-[8px] sm:text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-8 sm:mb-12">
              Zienk Forms Engine
            </p>

            {isNotAllowedError ? (
              <div className="bg-red-50 p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] border-2 border-red-100 text-left mb-6 sm:mb-8">
                <div className="flex items-center gap-3 mb-4 text-[#ff1a1a]">
                  <Settings className="w-5 h-5 animate-spin-slow" />
                  <h3 className="font-black text-[10px] uppercase tracking-widest">Setup Required</h3>
                </div>
                <p className="text-[11px] text-[#0a0b10] font-bold leading-relaxed mb-6">
                  Email authentication is disabled in Firebase. Enable it under <b>Authentication > Sign-in method</b>.
                </p>
                <a 
                  href="https://console.firebase.google.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 sm:py-4 bg-[#0a0b10] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all"
                >
                  Firebase Console <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#ff1a1a] transition-colors" />
                    <input 
                      type="email"
                      required
                      placeholder="Email address"
                      className="w-full pl-12 pr-5 py-4 sm:py-5 bg-gray-50 rounded-xl sm:rounded-2xl outline-none border-2 border-transparent focus:border-[#ff1a1a]/10 focus:bg-white transition-all font-bold text-sm text-[#0a0b10]"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#ff1a1a] transition-colors" />
                    <input 
                      type="password"
                      required
                      placeholder="Password"
                      className="w-full pl-12 pr-5 py-4 sm:py-5 bg-gray-50 rounded-xl sm:rounded-2xl outline-none border-2 border-transparent focus:border-[#ff1a1a]/10 focus:bg-white transition-all font-bold text-sm text-[#0a0b10]"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-3 px-4 py-3 bg-red-50 rounded-xl text-red-500 text-[10px] font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="text-left leading-tight">{error.message}</span>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 sm:py-5 bg-[#ff1a1a] text-white rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-xl shadow-red-100 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      {isLogin ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-50">
              <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
                {isLogin ? "New to Zienk?" : "Already a member?"}
              </p>
              <button 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                }}
                className="mt-2 text-[#ff1a1a] font-black text-[10px] uppercase tracking-widest hover:underline"
              >
                {isLogin ? 'Join Zienk Now' : 'Sign in to your account'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 opacity-40">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="text-[8px] font-black uppercase tracking-[0.4em]">Enterprise Grade</span>
        </div>
      </div>
    </div>
  );
};
