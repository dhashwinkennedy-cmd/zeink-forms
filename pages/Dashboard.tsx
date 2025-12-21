import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Filter, ArrowUpRight, Copy, CheckCircle, 
  Clock, PauseCircle, FileEdit, Link2, Key, Loader2, 
  ArrowDownWideNarrow, ChevronDown, Check
} from 'lucide-react';
import { useStore } from '../store';
import { FormStatus, Form } from '../types';

type SortOption = 'date' | 'responses' | 'title';
type FilterOption = 'ALL' | FormStatus;

const Dashboard: React.FC = () => {
  const { forms, fetchForms, setCurrentForm, isLoading } = useStore();
  const [activeTab, setActiveTab] = useState<'my-forms' | 'submissions'>('my-forms');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRespondModal, setShowRespondModal] = useState(false);
  const [respondInput, setRespondInput] = useState('');
  
  // Search, Filter, Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterOption>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  const handleCreateBlank = () => {
    const newForm: Form = {
      id: crypto.randomUUID(),
      title: 'Untitled Form',
      subtitle: 'Add a description here',
      status: FormStatus.DRAFT,
      responseCount: 0,
      createdAt: new Date().toISOString(),
      blocks: [],
      settings: { 
        allowRevisit: true, 
        redirectionRules: [] 
      }
    };
    setCurrentForm(newForm);
    setShowCreateModal(false);
    window.location.hash = '#/editor';
  };

  const handleRespond = (e: React.FormEvent) => {
    e.preventDefault();
    if (!respondInput.trim()) return;
    
    let formId = respondInput;
    if (respondInput.includes('/view/')) {
      formId = respondInput.split('/view/')[1];
    }

    setShowRespondModal(false);
    setRespondInput('');
    window.location.hash = `#/view/${formId}`;
  };

  // Logic for filtering and sorting
  const filteredAndSortedForms = useMemo(() => {
    let result = [...forms];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(f => 
        f.title.toLowerCase().includes(q) || 
        f.subtitle.toLowerCase().includes(q)
      );
    }

    // Filter
    if (filterStatus !== 'ALL') {
      result = result.filter(f => f.status === filterStatus);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'responses') {
        return (b.responseCount || 0) - (a.responseCount || 0);
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  }, [forms, searchQuery, filterStatus, sortBy]);

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 max-w-[95%] mx-auto">
      {/* Dashboard Main Area */}
      <div className="bg-white rounded-[48px] shadow-2xl shadow-primary/5 border border-gray-100 overflow-hidden min-h-[750px] flex flex-col">
        {/* Header Row */}
        <div className="px-10 pt-10 pb-6 flex items-center justify-between border-b border-gray-50">
          <div className="flex items-center gap-10">
            <button 
              onClick={() => setActiveTab('my-forms')}
              className={`text-xl font-black pb-3 transition-all relative ${activeTab === 'my-forms' ? 'text-primary' : 'text-gray-300 hover:text-gray-400'}`}
            >
              My Forms
              {activeTab === 'my-forms' && <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-primary rounded-full animate-in slide-in-from-left-2 duration-200" />}
            </button>
            <button 
              onClick={() => setActiveTab('submissions')}
              className={`text-xl font-black pb-3 transition-all relative ${activeTab === 'submissions' ? 'text-primary' : 'text-gray-300 hover:text-gray-400'}`}
            >
              My Responses
              {activeTab === 'submissions' && <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-primary rounded-full animate-in slide-in-from-left-2 duration-200" />}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowRespondModal(true)}
              className="text-secondary hover:text-primary px-5 py-3 rounded-2xl flex items-center gap-2 transition-all font-bold text-sm hover:bg-accent border-2 border-orange-500 hover:border-primary/20"
            >
              Respond to a Form
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-primary text-white px-7 py-3 rounded-2xl flex items-center gap-2 shadow-xl shadow-primary/30 hover:scale-[1.03] active:scale-95 transition-all group font-black text-sm uppercase tracking-wider"
            >
              <Plus size={20} strokeWidth={3} />
              New Form
            </button>
          </div>
        </div>

        {/* Search & Action Bar */}
        <div className="px-10 py-8 bg-accent/30 border-b border-gray-100">
          <div className="flex items-center gap-4 w-full">
            <div className="relative flex-1 group max-w-2xl">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search through secure forms..." 
                className="pl-14 pr-6 py-4 bg-accent/30 border-2 border-transparent rounded-[24px] text-base focus:outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all w-full shadow-sm placeholder:text-gray-400"
              />
            </div>
            
            <div className="flex items-center gap-3">
              {/* Filter Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => { setShowFilterMenu(!showFilterMenu); setShowSortMenu(false); }}
                  className={`p-4 rounded-[20px] transition-all shrink-0 shadow-sm flex items-center gap-2 border ${filterStatus !== 'ALL' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-500 border-gray-200 hover:text-primary hover:border-primary'}`}
                >
                  <Filter size={20} />
                  <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">Filter</span>
                  <ChevronDown size={14} className={showFilterMenu ? 'rotate-180 transition-transform' : 'transition-transform'} />
                </button>
                {showFilterMenu && (
                  <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {(['ALL', FormStatus.LIVE, FormStatus.DRAFT, FormStatus.PAUSED, FormStatus.EXPIRED] as FilterOption[]).map(status => (
                      <button 
                        key={status}
                        onClick={() => { setFilterStatus(status); setShowFilterMenu(false); }}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent text-sm font-bold text-secondary transition-colors"
                      >
                        {status}
                        {filterStatus === status && <Check size={16} className="text-primary" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => { setShowSortMenu(!showSortMenu); setShowFilterMenu(false); }}
                  className="p-4 bg-white border border-gray-200 rounded-[20px] text-gray-500 hover:text-primary hover:border-primary transition-all shrink-0 shadow-sm flex items-center gap-2"
                >
                  <ArrowDownWideNarrow size={20} />
                  <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">Sort</span>
                  <ChevronDown size={14} className={showSortMenu ? 'rotate-180 transition-transform' : 'transition-transform'} />
                </button>
                {showSortMenu && (
                  <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <button 
                      onClick={() => { setSortBy('date'); setShowSortMenu(false); }}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent text-sm font-bold text-secondary transition-colors"
                    >
                      Recent First
                      {sortBy === 'date' && <Check size={16} className="text-primary" />}
                    </button>
                    <button 
                      onClick={() => { setSortBy('responses'); setShowSortMenu(false); }}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent text-sm font-bold text-secondary transition-colors"
                    >
                      Most Responses
                      {sortBy === 'responses' && <Check size={16} className="text-primary" />}
                    </button>
                    <button 
                      onClick={() => { setSortBy('title'); setShowSortMenu(false); }}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent text-sm font-bold text-secondary transition-colors"
                    >
                      Alphabetical
                      {sortBy === 'title' && <Check size={16} className="text-primary" />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 overflow-y-auto custom-scrollbar bg-white">
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-primary mb-6" size={48} />
              <p className="text-gray-500 font-bold uppercase tracking-[4px] text-xs">Accessing Encrypted Records...</p>
            </div>
          ) : activeTab === 'my-forms' ? (
            filteredAndSortedForms.length > 0 ? (
              filteredAndSortedForms.map(form => (
                <FormCard key={form.id} form={form} />
              ))
            ) : (
              <EmptyState 
                title={searchQuery || filterStatus !== 'ALL' ? "No matches found" : "No active forms found"} 
                subtitle={searchQuery || filterStatus !== 'ALL' ? "Try adjusting your search or filters." : "Begin your offensive security evaluation by creating a new form."} 
              />
            )
          ) : (
             <EmptyState title="No responses logged" subtitle="Incoming evaluation responses will be decrypted and displayed here." />
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-secondary/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[40px] overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl border border-white/20">
            <div className="p-10 text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                <Plus size={32} strokeWidth={3} />
              </div>
              <h3 className="text-3xl font-black text-secondary mb-3">Initialize Form</h3>
              <p className="text-gray-400 text-sm mb-10 font-medium">Select a methodology for your new security form evaluation.</p>
              
              <div className="grid grid-cols-1 gap-5">
                <button 
                  onClick={handleCreateBlank}
                  className="flex items-center justify-between p-6 bg-accent/50 hover:bg-primary/5 border-2 border-transparent hover:border-primary rounded-3xl transition-all group"
                >
                  <div className="text-left">
                    <p className="font-black text-secondary group-hover:text-primary uppercase tracking-wider">Blank Canvas</p>
                    <p className="text-xs text-gray-400 font-bold">Start from zero baseline</p>
                  </div>
                  <FileEdit className="text-gray-300 group-hover:text-primary" />
                </button>
                <button className="flex items-center justify-between p-6 bg-accent/50 border-2 border-transparent rounded-3xl opacity-40 cursor-not-allowed">
                  <div className="text-left">
                    <p className="font-black text-secondary uppercase tracking-wider">Predefined Template</p>
                    <p className="text-xs text-gray-400 font-bold">Standard industry rubrics</p>
                  </div>
                  <ArrowUpRight className="text-gray-300" />
                </button>
              </div>

              <button 
                onClick={() => setShowCreateModal(false)}
                className="mt-10 text-gray-400 hover:text-primary text-[10px] font-black uppercase tracking-[3px] transition-colors"
              >
                Close Connection
              </button>
            </div>
          </div>
        </div>
      )}

      {showRespondModal && (
        <div className="fixed inset-0 bg-secondary/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[40px] overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl border border-white/20">
            <form onSubmit={handleRespond} className="p-10">
              <div className="mb-8 text-center">
                <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                  <Link2 size={40} />
                </div>
                <h3 className="text-3xl font-black text-secondary mb-3">Access Portal</h3>
                <p className="text-gray-400 text-sm font-medium">Input the encrypted link or UUID of the evaluation target.</p>
              </div>

              <div className="relative mb-10">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                  <Key size={20} />
                </div>
                <input 
                  autoFocus
                  type="text"
                  value={respondInput}
                  onChange={(e) => setRespondInput(e.target.value)}
                  placeholder="ID or Secure URI..."
                  className="w-full pl-14 pr-6 py-5 bg-accent/30 border-2 border-transparent focus:border-primary rounded-[24px] text-secondary focus:outline-none transition-all font-bold text-lg placeholder:text-gray-300"
                />
              </div>

              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowRespondModal(false)}
                  className="flex-1 px-6 py-4 rounded-2xl font-black text-gray-400 hover:bg-gray-50 transition-colors uppercase tracking-widest text-xs"
                >
                  Back
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs"
                >
                  Locate Form
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const FormCard: React.FC<{ form: Form }> = ({ form }) => {
  const statusColor = {
    [FormStatus.LIVE]: 'text-green-600 bg-green-50 border-green-100',
    [FormStatus.DRAFT]: 'text-amber-600 bg-amber-50 border-amber-100',
    [FormStatus.PAUSED]: 'text-gray-500 bg-gray-50 border-gray-100',
    [FormStatus.EXPIRED]: 'text-primary bg-red-50 border-red-100',
  }[form.status as FormStatus];

  const StatusIcon = {
    [FormStatus.LIVE]: CheckCircle,
    [FormStatus.DRAFT]: FileEdit,
    [FormStatus.PAUSED]: PauseCircle,
    [FormStatus.EXPIRED]: Clock,
  }[form.status as FormStatus];

  const handleCardClick = () => {
    if (form.status === FormStatus.DRAFT) {
      useStore.getState().setCurrentForm(form);
      window.location.hash = '#/editor';
    } else {
      window.location.hash = `#/view/${form.id}`;
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}#/view/${form.id}`;
    navigator.clipboard.writeText(url);
    alert("Encrypted link copied to secure buffer.");
  };

  return (
    <div className="bg-white border-2 border-gray-50 rounded-[36px] p-8 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/10 transition-all group cursor-pointer relative flex flex-col" onClick={handleCardClick}>
      <div className="flex items-center justify-between mb-6">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${statusColor}`}>
          <StatusIcon size={14} />
          {form.status}
        </div>
        <button onClick={handleShare} className="text-gray-300 hover:text-primary p-2 transition-colors bg-accent/30 rounded-xl hover:bg-accent">
          <Copy size={20} />
        </button>
      </div>
      
      <h3 className="text-2xl font-black text-secondary mb-2 group-hover:text-primary transition-colors leading-tight">{form.title}</h3>
      <p className="text-sm text-gray-400 mb-8 font-medium line-clamp-2 leading-relaxed flex-1">{form.subtitle}</p>
      
      <div className="flex items-center justify-between pt-6 border-t-2 border-gray-50">
        <div>
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[2px] mb-1">Decrypted Log</p>
          <p className="text-xl font-black text-secondary">{form.responseCount || 0} <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-1">ENTRIES</span></p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[2px] mb-1">Expiry</p>
          <p className="text-sm font-black text-secondary uppercase tracking-tighter">{form.expiryDate ? new Date(form.expiryDate).toLocaleDateString() : 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ title, subtitle }: { title: string, subtitle: string }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-24 animate-in fade-in zoom-in duration-300">
    <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mb-6 text-primary ring-8 ring-white">
      <FileEdit size={40} />
    </div>
    <h3 className="text-2xl font-black text-secondary uppercase tracking-widest mb-2">{title}</h3>
    <p className="text-gray-400 font-medium max-w-xs text-center">{subtitle}</p>
  </div>
);

export default Dashboard;