
import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, ChevronRight, Wallet, UserCircle, LogOut, Camera, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const AccountSettings: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!user) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = () => {
    setIsUpdating(true);
    // Simulate API delay
    setTimeout(() => {
      updateUser({ name, avatar });
      setIsUpdating(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black text-[#0a0b10] tracking-tight">Profile Settings</h1>
        <div className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-black uppercase tracking-widest border">
          User ID: {user.id}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-20">
        {/* Left Column: Profile Info */}
        <div className="md:col-span-8 space-y-8">
          <div className="bg-white rounded-[2.5rem] border shadow-sm p-10 space-y-8">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full border-4 border-[#fdebeb] shadow-lg overflow-hidden bg-gray-50">
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                >
                  <Camera size={24} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-[#0a0b10]">{user.name}</h2>
                <p className="text-gray-400 font-medium">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 pt-6 border-t border-dashed">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Display Name</label>
                <div className="relative">
                  <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                  <input 
                    type="text" 
                    className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 border-transparent focus:border-[#ff1a1a] rounded-2xl font-bold transition-all focus:outline-none focus:bg-white"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Email Address (Locked)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                  <input 
                    type="email" 
                    disabled 
                    className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl font-bold opacity-50 cursor-not-allowed"
                    value={user.email}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={handleUpdateProfile}
                disabled={isUpdating}
                className={`px-10 py-4 bg-[#0a0b10] text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-100 flex items-center gap-2 ${isUpdating ? 'opacity-70 cursor-wait' : ''}`}
              >
                {isUpdating ? 'Updating...' : 'Update Profile'}
              </button>
              
              {showSuccess && (
                <div className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase tracking-widest animate-in slide-in-from-left-2">
                  <Check size={16} /> Changes Saved Successfully
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border shadow-sm p-10 space-y-6">
            <h3 className="text-xl font-black flex items-center gap-3">
              <Shield className="text-[#ff1a1a]" /> Security
            </h3>
            <div className="flex items-center justify-between p-6 bg-gray-50/50 rounded-2xl border">
               <div>
                  <p className="font-black text-sm uppercase tracking-tight">Password</p>
                  <p className="text-xs text-gray-400 font-medium italic mt-1">Managed via Enterprise SSO</p>
               </div>
               <button className="px-6 py-2 border-2 border-gray-100 rounded-xl font-black text-[10px] uppercase tracking-widest hover:border-[#ff1a1a] hover:text-[#ff1a1a] transition-all">
                  Details
               </button>
            </div>
            <button 
              onClick={() => { logout(); navigate('/login'); }}
              className="w-full py-4 text-red-600 bg-red-50 hover:bg-red-100 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all"
            >
              <LogOut size={18} /> Sign Out of all devices
            </button>
          </div>
        </div>

        {/* Right Column: Quick Links */}
        <div className="md:col-span-4 space-y-6">
          <Link to="/wallet" className="block group">
            <div className="bg-white rounded-[2.5rem] border shadow-sm p-8 space-y-4 hover:border-[#ff1a1a] transition-all">
              <div className="w-12 h-12 bg-[#fdebeb] rounded-2xl flex items-center justify-center group-hover:bg-[#ff1a1a] transition-colors">
                <Wallet className="text-[#ff1a1a] group-hover:text-white transition-colors" />
              </div>
              <div>
                <h4 className="font-black text-lg">AI Wallet</h4>
                <p className="text-xs text-gray-400 font-medium">Credits, payments & tier details.</p>
              </div>
              <div className="flex items-center gap-1 text-[#ff1a1a] font-black text-[10px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                Go to Wallet <ChevronRight size={14} />
              </div>
            </div>
          </Link>

          <Link to="/upgrade" className="block group">
            <div className="bg-[#0a0b10] rounded-[2.5rem] p-8 space-y-4 shadow-xl border border-[#1a1c24]">
              <div className="w-12 h-12 bg-[#ff1a1a] rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20">
                <Shield className="text-white" />
              </div>
              <div className="text-white">
                <h4 className="font-black text-lg">Membership</h4>
                <p className="text-xs text-white/40 font-medium">Current plan: {user.tier.toUpperCase()}</p>
              </div>
              <div className="flex items-center gap-1 text-[#ff1a1a] font-black text-[10px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                Upgrade Now <ChevronRight size={14} />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
