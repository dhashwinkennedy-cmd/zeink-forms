
import React, { useState } from 'react';
import { User, LogOut, Settings, Users, Layout, Zap, Crown, CreditCard, Wallet } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const [showProfile, setShowProfile] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm border-b z-50 px-6 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-[#ff1a1a] rounded-lg flex items-center justify-center">
          <Layout className="text-white w-5 h-5" />
        </div>
        <span className="text-[#0a0b10] font-black text-xl tracking-tighter">Zienk Forms</span>
      </Link>

      <div className="flex items-center gap-4">
        <Link 
          to="/wallet"
          className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100 hover:border-[#ff1a1a] transition-all group"
        >
          <Zap size={14} className="text-[#ff1a1a] fill-[#ff1a1a]" />
          <span className="text-xs font-black text-[#0a0b10]">{user.credits_monthly + user.credits_bonus}</span>
        </Link>

        {user.tier === 'pro' ? (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full border border-yellow-100">
            <Crown size={14} />
            <span className="text-[10px] font-black uppercase tracking-wider">PRO</span>
          </div>
        ) : (
          <button 
            onClick={() => navigate('/upgrade')}
            className="hidden md:block px-4 py-1.5 bg-[#ff1a1a] text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-red-100 hover:scale-105 transition-all"
          >
            Upgrade
          </button>
        )}

        <div className="relative">
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border hover:border-[#ff1a1a] transition-all overflow-hidden"
          >
            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
          </button>

          {showProfile && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border p-2 z-50 overflow-hidden">
                <div className="p-4 border-b bg-gray-50 mb-1 rounded-t-xl">
                  <p className="font-black text-sm text-[#0a0b10]">{user.name}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{user.email}</p>
                </div>
                <div className="p-1">
                  <button 
                    onClick={() => { setShowProfile(false); navigate('/account'); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-[#fdebeb] hover:text-[#ff1a1a] rounded-xl transition-all text-left font-bold"
                  >
                    <Settings size={16} /> Account Settings
                  </button>
                  <button 
                    onClick={() => { setShowProfile(false); navigate('/wallet'); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-[#fdebeb] hover:text-[#ff1a1a] rounded-xl transition-all text-left font-bold"
                  >
                    <Wallet size={16} /> AI Wallet
                  </button>
                  <div className="h-px bg-gray-100 my-1 mx-2" />
                  <button 
                    onClick={() => { logout(); navigate('/login'); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all text-left font-bold"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
