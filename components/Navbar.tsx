import React, { useState } from 'react';
import { User, Wallet, LogOut, RefreshCcw, ShieldCheck } from 'lucide-react';

const Navbar: React.FC = () => {
  const [showOverlay, setShowOverlay] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between z-50">
      <div className="flex items-center gap-3">
        <div className="bg-primary p-1.5 rounded-lg">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold text-secondary tracking-tight">Zienk Forms</span>
      </div>

      <div className="relative">
        <button 
          onClick={() => setShowOverlay(!showOverlay)}
          className="w-10 h-10 rounded-full bg-[#FFF5F5] flex items-center justify-center border border-gray-200 hover:border-primary transition-colors overflow-hidden"
        >
          <img src="https://picsum.photos/seed/user/100" alt="Avatar" className="w-full h-full object-cover" />
        </button>

        {showOverlay && (
          <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-3 border-b border-gray-50 mb-1">
              <p className="font-bold text-secondary">Security Admin</p>
              <p className="text-sm text-gray-500">admin@zienk.io</p>
            </div>
            <OverlayItem icon={<User size={18}/>} label="My Account" />
            <OverlayItem icon={<Wallet size={18}/>} label="My Wallet" badge="$1,240.50" />
            <OverlayItem icon={<RefreshCcw size={18}/>} label="Switch Account" />
            <div className="h-px bg-gray-50 my-1" />
            <OverlayItem icon={<LogOut size={18}/>} label="Sign Out" className="text-primary hover:bg-red-50" />
          </div>
        )}
      </div>
    </nav>
  );
};

const OverlayItem = ({ icon, label, badge, className = "" }: { icon: React.ReactNode, label: string, badge?: string, className?: string }) => (
  <button className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#FFF5F5] transition-colors text-secondary text-sm ${className}`}>
    <div className="flex items-center gap-3">
      {icon}
      <span>{label}</span>
    </div>
    {badge && <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{badge}</span>}
  </button>
);

export default Navbar;