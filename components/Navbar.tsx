import React from 'react';
import { LogOut, DatabaseZap, LayoutGrid } from 'lucide-react';

export const Navbar = ({ user, onHome, onSignOut, isDemo }: any) => {
  return (
    <nav className="fixed top-0 inset-x-0 h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 flex items-center justify-between px-8">
      <div className="flex items-center gap-4 cursor-pointer" onClick={onHome}>
        <div className="w-10 h-10 bg-[#ff1a1a] rounded-xl flex items-center justify-center text-white font-black italic text-xl shadow-lg">Z</div>
        <div className="flex flex-col">
          <span className="font-black text-lg tracking-tighter leading-none">Zienk</span>
          {isDemo && <span className="text-[7px] font-black uppercase text-amber-600 flex items-center gap-1"><DatabaseZap className="w-2 h-2" /> Demo Mode</span>}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Architect</span>
          <span className="text-xs font-black">{user.email}</span>
        </div>
        <button onClick={onSignOut} className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:text-red-500 transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
};