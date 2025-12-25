
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Layout, Mail, ArrowRight, UserCircle, Lock, Zap } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, username);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#fdebeb] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-12 space-y-8 border-2 border-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 opacity-5 rotate-12">
            <Layout size={200} className="text-[#ff1a1a]" />
        </div>

        <div className="text-center space-y-4 relative z-10">
          <div className="w-20 h-20 bg-[#ff1a1a] rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-red-200 mb-6 group hover:rotate-6 transition-all">
            <Layout className="text-white w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-[#0a0b10] italic tracking-tighter uppercase">Zienk Forms</h1>
          <p className="text-gray-400 font-bold tracking-tight">Enterprise cloud form evaluation.</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 animate-bounce">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Username</label>
              <div className="relative">
                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  required
                  placeholder="TheFormMaster" 
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[#ff1a1a] rounded-2xl focus:outline-none transition-all font-bold text-sm"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="email" 
                required
                placeholder="you@company.com" 
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[#ff1a1a] rounded-2xl focus:outline-none transition-all font-bold text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="password" 
                required
                placeholder="••••••••" 
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[#ff1a1a] rounded-2xl focus:outline-none transition-all font-bold text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#0a0b10] text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-2xl disabled:opacity-50"
          >
            {loading ? <Zap className="animate-spin" size={20}/> : (isLogin ? 'Sign In' : 'Create Account')} <ArrowRight size={18} />
          </button>
        </form>

        <div className="text-center relative z-10">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-[#ff1a1a] transition-all"
          >
            {isLogin ? "New here? Create Workspace" : "Already have access? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
