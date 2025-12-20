
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Calendar, Send, Clock, User, Wallet, LogOut } from 'lucide-react';

interface NavbarProps {
  onHomeClick: () => void;
  onSignOut: () => void;
  onWalletClick: () => void;
  showPublish?: boolean;
  onPublish: () => void;
  onScheduleClick: () => void;
  isSaving?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onHomeClick, 
  onSignOut,
  onWalletClick,
  showPublish, 
  onPublish, 
  onScheduleClick,
  isSaving 
}) => {
  const [showPublishDropdown, setShowPublishDropdown] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  
  const publishRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (publishRef.current && !publishRef.current.contains(event.target as Node)) setShowPublishDropdown(false);
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) setShowAccountDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="h-16 sm:h-20 w-full bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 fixed top-0 z-[100] shadow-sm">
      <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={onHomeClick}>
        <div className="w-8 h-8 sm:w-11 sm:h-11 bg-[#ff1a1a] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-red-100">
          <span className="text-white font-black text-lg sm:text-2xl italic">Z</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[#0a0b10] font-black text-sm sm:text-xl tracking-tighter leading-none">Zienk</span>
          <span className="hidden sm:inline text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Forms Engine</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        {showPublish && (
          <div className="flex items-center relative" ref={publishRef}>
            <div className="flex rounded-xl sm:rounded-2xl overflow-hidden shadow-xl shadow-red-50">
              <button 
                onClick={onPublish}
                disabled={isSaving}
                className="bg-[#ff1a1a] text-white px-3 sm:px-6 py-2 sm:py-3.5 font-black text-[9px] sm:text-[11px] uppercase tracking-widest flex items-center gap-1 sm:gap-2 disabled:opacity-50"
              >
                {isSaving ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span className="hidden xs:inline">Publish</span>
              </button>
              <button 
                onClick={() => setShowPublishDropdown(!showPublishDropdown)}
                className="bg-[#d41515] text-white px-2 sm:px-3 flex items-center border-l border-white/10"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showPublishDropdown ? 'rotate-180' : ''}`} />
              </button>
            </div>
            {showPublishDropdown && (
              <div className="absolute top-full right-0 mt-3 w-48 sm:w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 animate-in fade-in slide-in-from-top-2">
                <button onClick={() => { onScheduleClick(); setShowPublishDropdown(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl text-left transition-all">
                  <Calendar className="w-4 h-4 text-gray-400" /><span className="text-[10px] font-black text-[#0a0b10] uppercase tracking-widest">Schedule</span>
                </button>
              </div>
            )}
          </div>
        )}

        <div className="relative" ref={accountRef}>
          <button onClick={() => setShowAccountDropdown(!showAccountDropdown)} className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center border-2 ${showAccountDropdown ? 'bg-[#ff1a1a] border-[#ff1a1a] text-white' : 'bg-gray-50 border-transparent text-gray-400'}`}>
            <User className="w-5 h-5" />
          </button>
          {showAccountDropdown && (
            <div className="absolute top-full right-0 mt-3 w-56 sm:w-72 bg-white rounded-[2rem] shadow-2xl border border-gray-50 overflow-hidden animate-in fade-in zoom-in-95">
              <div className="p-6 bg-gray-50/50 border-b border-gray-100">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Account</p>
                <p className="text-xs font-black text-[#0a0b10] truncate">Active User</p>
              </div>
              <div className="p-2">
                <button onClick={() => { setShowAccountDropdown(false); onWalletClick(); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-xl transition-all group">
                  <Wallet className="w-4 h-4 text-gray-400 group-hover:text-[#ff1a1a]" />
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">My Wallet</span>
                </button>
                <button onClick={() => { setShowAccountDropdown(false); onSignOut(); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-xl transition-all group text-red-500">
                  <LogOut className="w-4 h-4" /><span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
