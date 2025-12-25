
import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, FileText, Send, Share2, MoreVertical, ExternalLink, Pause, Play, Copy, X, Check, Zap, Loader2, Layout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FormStatus, FormSchema } from '../types';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

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

  const handleRespondForm = async () => {
    const input = prompt("Enter Form ID or Paste Full Link:");
    if (!input) return;

    let id = input.trim();
    // Logic to extract ID if a URL was pasted
    if (id.includes('/run/')) {
      id = id.split('/run/')[1].split(/[?#]/)[0];
    }

    // Quick verification check
    try {
      const docRef = doc(db, 'forms', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        navigate(`/run/${id}`);
      } else {
        alert("Verification Failed: Form ID not found in Zienk Cloud.");
      }
    } catch (err) {
      alert("Error: Cloud connectivity issue. Please try again.");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredForms = forms.filter(f => f.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#0a0b10] tracking-tight">Dashboard</h1>
          <p className="text-gray-500 font-medium italic">Your secure cloud workspace.</p>
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
            placeholder="Search your forms..." 
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
        <div className="text-center py-20 flex flex-col items-center gap-4">
          <Zap className="animate-spin text-[#ff1a1a]" size={48} />
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Syncing with Zienk Cloud...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
          {activeTab === 'forms' ? (
            filteredForms.length > 0 ? (
              filteredForms.map((form) => (
                <div 
                  key={form.id} 
                  className={`bg-white rounded-[2.5rem] p-8 border hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden ${form.status === FormStatus.PAUSED ? 'border-orange-100 opacity-80' : ''}`}
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
              <div className="col-span-full py-20 text-center border-2 border-dashed rounded-[3rem] bg-gray-50/50">
                <FileText className="mx-auto text-gray-200 mb-4" size={48} />
                <p className="text-gray-400 font-bold">Your cloud workspace is empty. Create your first form!</p>
              </div>
            )
          ) : (
            <div className="col-span-full py-20 text-center text-gray-400 font-bold border-2 border-dashed rounded-[3rem] bg-gray-50/50">No activity history found.</div>
          )}
        </div>
      )}

      {/* Shared/Published Popup (Unified Logic) */}
      {shareForm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="fixed inset-0 bg-[#0a0b10]/80 backdrop-blur-md" onClick={() => setShareForm(null)} />
          <div className="relative bg-white rounded-[3rem] p-10 max-w-lg w-full space-y-8 shadow-2xl animate-in zoom-in-95 duration-300 border-2 border-white overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                {/* Added Layout import above to fix missing name error */}
                <Layout size={120} className="text-[#ff1a1a] rotate-12" />
            </div>

            <div className="flex items-center justify-between relative z-10">
              <h3 className="text-3xl font-black text-[#0a0b10] tracking-tighter italic uppercase">Form Access</h3>
              <button onClick={() => setShareForm(null)} className="p-2 hover:bg-gray-100 rounded-full transition-all"><X size={24}/></button>
            </div>
            
            <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Direct Share Link</p>
                <div className="flex gap-2">
                  <input 
                    readOnly 
                    className="flex-1 bg-gray-50 border-2 border-transparent p-4 rounded-2xl font-bold text-sm overflow-hidden text-ellipsis text-gray-600"
                    value={`${window.location.origin}/#/run/${shareForm.id}`}
                  />
                  <button 
                    onClick={() => copyToClipboard(`${window.location.origin}/#/run/${shareForm.id}`)}
                    className="p-4 bg-[#ff1a1a] text-white rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-red-100"
                  >
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Unique Form ID</p>
                <div className="flex gap-2">
                  <input 
                    readOnly 
                    className="flex-1 bg-gray-50 border-2 border-transparent p-4 rounded-2xl font-bold text-sm tracking-widest text-[#0a0b10]"
                    value={shareForm.id}
                  />
                  <button 
                    onClick={() => copyToClipboard(shareForm.id)}
                    className="p-4 bg-[#0a0b10] text-white rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg"
                  >
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                  </button>
                </div>
              </div>

              <div className="bg-[#fdebeb] p-6 rounded-[2rem] border border-[#ff1a1a]/10 flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <ExternalLink className="text-[#ff1a1a]" size={24} />
                </div>
                <p className="text-xs font-bold text-[#0a0b10] leading-relaxed">Respondents can access this by clicking the link or pasting the ID in the <span className="text-[#ff1a1a]">Respond</span> dashboard.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
