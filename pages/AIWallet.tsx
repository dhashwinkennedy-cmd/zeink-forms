
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Wallet, Plus, Zap, Shield, CreditCard, ChevronRight, Sparkles, CheckCircle2, Minus, AlertCircle, X as CloseIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const AIWallet: React.FC = () => {
  const { user } = useAuth();
  const [showPayment, setShowPayment] = useState(false);
  const [purchaseQty, setPurchaseQty] = useState(100);
  const [showError, setShowError] = useState(false);

  if (!user) return null;

  const handlePurchaseAttempt = () => {
    setShowError(true);
  };

  const incrementQty = () => setPurchaseQty(prev => prev + 100);
  const decrementQty = () => setPurchaseQty(prev => Math.max(100, prev - 100));

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-[#ff1a1a]/10 rounded-xl">
               <Wallet className="text-[#ff1a1a]" size={32} />
             </div>
             <h1 className="text-4xl font-black text-[#0a0b10] tracking-tight">AI Wallet</h1>
          </div>
          <p className="text-gray-500 font-medium ml-1">Manage your generative credits and subscription benefits.</p>
        </div>
        <div className="px-5 py-2 bg-[#00f296]/10 text-[#00c77b] rounded-full text-xs font-black uppercase tracking-widest border border-[#00f296]/20">
          {user.tier} Account
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Wallet Section */}
        <div className="lg:col-span-7 bg-white rounded-[2.5rem] border shadow-sm p-10 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <Sparkles className="text-[#ff1a1a]" /> AI Credit Balance
            </h2>
          </div>

          <div className="bg-white border-2 border-[#fdebeb] rounded-[2rem] p-10 text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Zap size={120} className="fill-[#ff1a1a] text-[#ff1a1a]" />
            </div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest relative z-10">Total Available Credits</p>
            <div className="flex items-center justify-center gap-3 mt-3 relative z-10">
              <Zap className="text-[#ff1a1a] fill-[#ff1a1a]" size={48} />
              <span className="text-7xl font-black text-[#0a0b10] tabular-nums">{user.credits_monthly + user.credits_bonus}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Swapped: Credits (Bonus) now comes first */}
            <div className="p-6 bg-gray-50/50 border rounded-2xl space-y-2">
              <div className="flex justify-between items-center">
                <p className="font-black text-xs uppercase tracking-widest text-gray-500">Credits</p>
                <span className="font-black text-xl text-[#0a0b10]">{user.credits_bonus}</span>
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Lifetime validity</p>
            </div>
            {/* Swapped: Monthly Reset now comes second */}
            <div className="p-6 bg-gray-50/50 border rounded-2xl space-y-2">
              <div className="flex justify-between items-center">
                <p className="font-black text-xs uppercase tracking-widest text-gray-500">Monthly Reset</p>
                <span className="font-black text-xl text-[#0a0b10]">{user.credits_monthly}</span>
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Resets every 30 days</p>
            </div>
          </div>

          <button 
            onClick={() => setShowPayment(true)}
            className="w-full py-5 bg-[#0a0b10] text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl shadow-gray-200"
          >
            <Plus size={20} /> Purchase Extra Credits
          </button>
        </div>

        {/* Subscription Section */}
        <div className="lg:col-span-5 bg-white rounded-[2.5rem] border shadow-sm p-10 space-y-8 flex flex-col">
          <h2 className="text-2xl font-black flex items-center gap-3">
            <Shield className="text-[#ff1a1a]" /> Membership Info
          </h2>
          
          <div className="flex-1 space-y-6">
            <div className={`p-8 border-4 rounded-[2rem] relative overflow-hidden transition-all ${user.tier === 'pro' ? 'border-[#ff1a1a] bg-red-50/20' : 'border-gray-100'}`}>
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-[#0a0b10] mb-4">
                Current Plan: {user.tier}
              </h3>
              
              <div className="space-y-4">
                {user.tier === 'free' ? (
                  <>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="text-gray-400 shrink-0 mt-0.5" size={18} />
                      <p className="text-sm text-gray-600 font-medium leading-relaxed">Limit: 15 AI Credits per form response.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="text-gray-400 shrink-0 mt-0.5" size={18} />
                      <p className="text-sm text-gray-600 font-medium leading-relaxed">150 credits refreshed monthly.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="text-[#ff1a1a] shrink-0 mt-0.5" size={18} />
                      <p className="text-sm text-[#0a0b10] font-bold leading-relaxed">Unlimited AI Credits per form.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="text-[#ff1a1a] shrink-0 mt-0.5" size={18} />
                      <p className="text-sm text-[#0a0b10] font-bold leading-relaxed">700 credits refreshed monthly.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="text-[#ff1a1a] shrink-0 mt-0.5" size={18} />
                      <p className="text-sm text-[#0a0b10] font-bold leading-relaxed">Priority AI generation & support.</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* PRO TIP REMOVED AS PER SCREENSHOT */}
          </div>

          <Link 
            to="/upgrade"
            className="w-full py-5 bg-[#ff1a1a] text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-red-100"
          >
            {user.tier === 'free' ? 'Upgrade to Pro' : 'Manage Subscription'} <ChevronRight size={18} />
          </Link>
        </div>
      </div>

      {showPayment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="fixed inset-0 bg-[#0a0b10]/60 backdrop-blur-md" onClick={() => setShowPayment(false)} />
          <div className="relative bg-white rounded-[2.5rem] p-12 max-w-md w-full space-y-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="text-center space-y-2">
                <h3 className="text-3xl font-black text-[#0a0b10] tracking-tight">Add Credits</h3>
                <p className="text-gray-400 font-medium">Instantly boost your AI power.</p>
            </div>
            
            <div className="p-8 bg-white border-2 border-[#ff1a1a] rounded-[2rem] text-center shadow-lg shadow-red-50 relative">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Selected Pack</p>
              
              <div className="flex items-center justify-center gap-6 mt-4">
                <button onClick={decrementQty} className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors text-gray-600">
                  <Minus size={20} />
                </button>
                <div className="text-center">
                  <p className="text-xl font-black text-[#0a0b10]">{purchaseQty} Credits</p>
                  <p className="text-xs font-bold text-gray-400 uppercase">Qty: {purchaseQty / 100}</p>
                </div>
                <button onClick={incrementQty} className="p-2 bg-[#ff1a1a] rounded-xl hover:opacity-90 transition-opacity text-white">
                  <Plus size={20} />
                </button>
              </div>

              <p className="text-4xl font-black text-[#ff1a1a] mt-4">₹{(purchaseQty / 100) * 80}.00</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-5 border-2 border-gray-100 rounded-2xl cursor-pointer bg-white hover:border-[#ff1a1a] transition-all group">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-red-50 transition-colors">
                    <CreditCard size={24} className="text-gray-400 group-hover:text-[#ff1a1a]" />
                </div>
                <div className="flex-1">
                  <p className="font-black text-sm uppercase">Secure Checkout</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">UPI • Cards • NetBanking</p>
                </div>
              </div>
              
              <button 
                onClick={handlePurchaseAttempt}
                className="w-full py-5 bg-[#0a0b10] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-black transition-all"
              >
                Confirm & Pay
              </button>
              
              <button 
                onClick={() => setShowPayment(false)}
                className="w-full py-2 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-gray-600 transition-colors"
              >
                Cancel Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DUMMY PAYMENT FAILURE POPUP */}
      {showError && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowError(false)} />
          <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full space-y-6 shadow-2xl animate-in zoom-in-95 duration-200 border-2 border-red-100">
             <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
               <AlertCircle size={32} />
             </div>
             <div className="text-center space-y-2">
                <h3 className="text-xl font-black text-[#0a0b10] uppercase">Payment Failed</h3>
                <p className="text-gray-500 font-medium text-sm">Requested entity was not found or payment timed out. Please try again later.</p>
             </div>
             <button 
               onClick={() => setShowError(false)}
               className="w-full py-4 bg-red-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:opacity-90 transition-all shadow-lg shadow-red-100"
             >
               Try Again
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIWallet;
