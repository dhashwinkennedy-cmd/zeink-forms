
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Check, Zap, Globe, ShieldCheck, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UpgradePage: React.FC = () => {
  const { user } = useAuth();
  const [showError, setShowError] = useState(false);

  const handleUpgradeAttempt = () => {
    setShowError(true);
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="text-center space-y-4 mb-16">
        <h1 className="text-5xl font-black text-[#0a0b10] tracking-tight">Scale your <span className="text-[#ff1a1a] italic">Intelligence.</span></h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">Choose the tier that fits your organization's evaluation needs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Free Tier */}
        <div className="bg-white rounded-3xl border shadow-sm p-10 space-y-8 flex flex-col opacity-60 grayscale hover:grayscale-0 transition-all">
          <div>
            <h3 className="text-xl font-black uppercase tracking-widest text-gray-400">Free Tier</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-5xl font-black">₹0</span>
              <span className="text-gray-500 font-bold">/ forever</span>
            </div>
          </div>
          <div className="flex-1 space-y-4">
            {[
              "150 Monthly AI Credits",
              "Max 15 AI Credits per Form Response",
              "Public & Private Forms",
              "Basic AI Evaluation"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                  <Check size={12} className="text-gray-400" />
                </div>
                <span className="text-gray-600 font-medium">{feature}</span>
              </div>
            ))}
          </div>
          <button disabled className="w-full py-4 bg-gray-100 text-gray-400 rounded-2xl font-bold cursor-not-allowed">
            Current Plan
          </button>
        </div>

        {/* Pro Tier */}
        <div className="bg-white rounded-3xl border-4 border-[#ff1a1a] shadow-2xl p-10 space-y-8 flex flex-col relative transform hover:-translate-y-2 transition-all">
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#ff1a1a] text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-red-200">
            Most Popular
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-widest text-[#ff1a1a]">Pro Tier</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-5xl font-black">₹399</span>
              <span className="text-gray-500 font-bold">/ month</span>
            </div>
          </div>
          <div className="flex-1 space-y-4">
            {[
              "700 Monthly AI Credits",
              "Unlimited AI Credits per Form",
              "Advanced Prompt Engineering",
              "Priority AI Queue",
              "Whitelabel Dashboard (Coming Soon)"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#fdebeb] flex items-center justify-center">
                  <Check size={12} className="text-[#ff1a1a]" />
                </div>
                <span className="text-[#0a0b10] font-bold">{feature}</span>
              </div>
            ))}
          </div>
          <button 
            onClick={handleUpgradeAttempt}
            disabled={user?.tier === 'pro'}
            className="w-full py-4 bg-[#ff1a1a] text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-200 hover:opacity-90 transition-all"
          >
            {user?.tier === 'pro' ? 'Current Plan' : 'Go Pro Now'}
          </button>
        </div>
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="space-y-3">
          <Zap className="mx-auto text-[#ff1a1a]" />
          <h4 className="font-bold">Fast Evaluation</h4>
          <p className="text-sm text-gray-500">Sub-second response grading with Gemini Flash.</p>
        </div>
        <div className="space-y-3">
          <Globe className="mx-auto text-[#ff1a1a]" />
          <h4 className="font-bold">Multilingual</h4>
          <p className="text-sm text-gray-500">AI understands and grades in over 40 languages.</p>
        </div>
        <div className="space-y-3">
          <ShieldCheck className="mx-auto text-[#ff1a1a]" />
          <h4 className="font-bold">Secure Data</h4>
          <p className="text-sm text-gray-500">Your form data is encrypted and private.</p>
        </div>
      </div>

      {/* DUMMY PAYMENT FAILURE POPUP */}
      {showError && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowError(false)} />
          <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full space-y-6 shadow-2xl animate-in zoom-in-95 duration-200 border-2 border-red-100">
             <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
               <AlertCircle size={32} />
             </div>
             <div className="text-center space-y-2">
                <h3 className="text-xl font-black text-[#0a0b10] uppercase">Upgrade Failed</h3>
                <p className="text-gray-500 font-medium text-sm">Requested entity was not found. Please verify your payment details or contact support.</p>
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

export default UpgradePage;
