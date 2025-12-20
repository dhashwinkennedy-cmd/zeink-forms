import React from 'react';
import { storage } from '../services/storage.ts';
import { Zap, ArrowRight, ShieldCheck } from 'lucide-react';

export const Auth = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl p-12 text-center border border-white">
        <div className="w-20 h-20 bg-[#ff1a1a] rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-red-200 animate-float">
          <span className="text-white font-black text-4xl italic">Z</span>
        </div>
        
        <h1 className="text-3xl font-black text-[#0a0b10] mb-2">Zienk Engine</h1>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-12">Next-Gen Form Logic</p>
        
        <button 
          onClick={() => storage.auth.signIn()}
          className="w-full py-5 bg-[#ff1a1a] text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-red-100"
        >
          Enter Workspace <ArrowRight className="w-4 h-4" />
        </button>
        
        <div className="mt-12 flex items-center justify-center gap-2 opacity-30">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[8px] font-black uppercase tracking-widest">Enterprise Secured</span>
        </div>
      </div>
    </div>
  );
};