
import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, FileText, Send, Share2, MoreVertical, ExternalLink, Pause, Play, Copy, X, Check, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FormStatus, FormSchema } from '../types';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'forms' | 'submissions'>('forms');
  const [search, setSearch] = useState('');
  const [forms, setForms] = useState<FormSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareForm, setShareForm] = useState<FormSchema | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      fetchForms();
    }
  }, [user]);

  const fetchForms = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'forms'), where('creatorId', '==', user?.id));
      const querySnapshot = await getDocs(q);
      const fetchedForms = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FormSchema));
      setForms(fetchedForms);
    } catch (e) {
      console.error("Error fetching forms:", e);
    }
    setLoading(false);
  };

  const handleCreateForm = () => {
    const id = Math.random().toString(36).substr(2, 9);
    navigate(`/editor/${id}`);
  };

  const handleRespondForm = () => {
    const input = prompt("Enter Form ID or Paste Link:");
    if (input) {
      let id = input.trim();
      if (id.includes('/run/')) {
        id = id.split('/run/')[1].split(/[?#]/)[0];
      }
      navigate(`/run/${id}`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredForms = forms.filter(f => f.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#0a0b10] tracking-tight">Dashboard</h1>
          <p className="text-gray-500 font-medium">Manage your secure cloud forms.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRespondForm}
            className="px-6 py-3 bg-white border-2 border-gray-100 text-[#0a0b10] rounded-2xl hover:border-[#ff1a1a] transition-all font-black uppercase text-xs tracking-widest flex items-center gap-2 shadow-sm"
          >
            <ExternalLink size={16} /> Respond
          </button>
          <button 
            onClick={handleCreateForm}
            className="px-6 py-3 bg-[#ff1a1a] text-white rounded-2xl hover:opacity-90 transition-all font-black uppercase text-xs tracking-widest flex items-center gap-2 shadow-xl shadow-red-100"
          >
            <Plus size={18} /> Create New
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2rem] shadow-sm border flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search forms..." 
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent border-2 focus:border-[#ff1a1a] rounded-xl focus:outline-none transition-all font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex border-b-2 border-gray-100">
        <button 
          onClick={() => setActiveTab('forms')}
          className={`px-8 py-4 font-black text-xs uppercase tracking-widest transition-all relative ${activeTab === 'forms' ? 'text-[#ff1a1a]' : 'text-gray-400 hover:text-gray-600'}`}
        >
          My Forms
          {activeTab === 'forms' && <div className="absolute bottom-[-2px] left-0 right-0 h-1 bg-[#ff1a1a] rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('submissions')}
          className={`px-8 py-4 font-black text-xs uppercase tracking-widest transition-all relative ${activeTab === 'submissions' ? 'text-[#ff1a1a]' : 'text-gray-400 hover:text-gray-600'}`}
        >
          My Submissions
          {activeTab === 'submissions' && <div className="absolute bottom-[-2px] left-0 right-0 h-1 bg-[#ff1a1a] rounded-t-full" />}
        </button>
      </div>

      {loading ? (
        // Fix for "Cannot find name 'Zap'" - Added missing import above
        <div className="text-center py-20"><Zap className="animate-spin mx-auto text-[#ff1a1a]" size={48} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeTab === 'forms' ? (
            filteredForms.map((form) => (
              <div 
                key={form.id} 
                className={`bg-white rounded-[2.5rem] p-8 border hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden ${form.status === FormStatus.PAUSED ? 'border-orange-100 shadow-orange-50/50' : ''}`}
                onClick={() => navigate(form.status === FormStatus.DRAFT ? `/editor/${form.id}` : `/summary/${form.id}`)}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 rounded-2xl shadow-lg ${
                    form.status === FormStatus.LIVE ? 'bg-[#ff1a1a] text-white shadow-red-100' : 
                    form.status === FormStatus.PAUSED ? 'bg-orange-500 text-white shadow-orange-100' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {form.status === FormStatus.PAUSED ? <Pause size={20} /> : <FileText size={20} />}
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShareForm(form); }}
                      className="p-2 text-gray-300 hover:text-[#ff1a1a] transition-colors rounded-xl hover:bg-red-50"
                    >
                      <Share2 size={18} />
                    </button>
                    <button className="p-2 text-gray-300 hover:text-gray-600 transition-colors rounded-xl hover:bg-gray-100">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>
                <h3 className="font-black text-xl text-[#0a0b10] group-hover:text-[#ff1a1a] transition-colors tracking-tight line-clamp-1">{form.title}</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-2">{new Date(form.createdAt).toLocaleDateString()}</p>
                
                <div className="flex items-center justify-between mt-8">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                    <Send size={14} className="text-[#ff1a1a]" />
                    <span>{form.responseCount} responses</span>
                  </div>
                  <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm border ${
                    form.status === FormStatus.LIVE ? 'bg-green-50 text-green-700 border-green-100' :
                    form.status === FormStatus.PAUSED ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-gray-100 text-gray-700 border-gray-200'
                  }`}>
                    {form.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-gray-400 font-bold">No submissions found.</div>
          )}
        </div>
      )}

      {/* Share Modal */}
      {shareForm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="fixed inset-0 bg-[#0a0b10]/60 backdrop-blur-md" onClick={() => setShareForm(null)} />
          <div className="relative bg-white rounded-[2.5rem] p-10 max-w-lg w-full space-y-8 shadow-2xl animate-in zoom-in-95 duration-300 border-2 border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-black text-[#0a0b10] tracking-tight italic uppercase">Share Form</h3>
              <button onClick={() => setShareForm(null)} className="p-2 hover:bg-gray-100 rounded-full transition-all"><X size={24}/></button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Form Link</p>
                <div className="flex gap-2">
                  <input 
                    readOnly 
                    className="flex-1 bg-gray-50 border-2 border-transparent p-4 rounded-2xl font-bold text-sm"
                    value={`${window.location.origin}/#/run/${shareForm.id}`}
                  />
                  <button 
                    onClick={() => copyToClipboard(`${window.location.origin}/#/run/${shareForm.id}`)}
                    className="p-4 bg-[#ff1a1a] text-white rounded-2xl hover:opacity-90 transition-all shadow-lg"
                  >
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Form Unique ID</p>
                <div className="flex gap-2">
                  <input 
                    readOnly 
                    className="flex-1 bg-gray-50 border-2 border-transparent p-4 rounded-2xl font-bold text-sm tracking-wider"
                    value={shareForm.id}
                  />
                  <button 
                    onClick={() => copyToClipboard(shareForm.id)}
                    className="p-4 bg-[#0a0b10] text-white rounded-2xl hover:opacity-90 transition-all shadow-lg"
                  >
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                  </button>
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-3xl border border-green-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <Send className="text-green-600" size={24} />
                </div>
                <p className="text-sm font-bold text-green-700">Paste the Link or ID in the "Respond" dashboard to start filling.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
