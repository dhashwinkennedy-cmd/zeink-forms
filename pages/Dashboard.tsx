
import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, ArrowUpRight, Copy, CheckCircle, Clock, PauseCircle, FileEdit, Link2, Key, Loader2 } from 'lucide-react';
import { useStore } from '../store';
import { FormStatus, Form } from '../types';

const Dashboard: React.FC = () => {
  const { forms, fetchForms, setCurrentForm, isLoading } = useStore();
  const [activeTab, setActiveTab] = useState<'my-forms' | 'submissions'>('my-forms');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRespondModal, setShowRespondModal] = useState(false);
  const [respondInput, setRespondInput] = useState('');

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

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
        {/* Header Row */}
        <div className="px-10 pt-8 pb-4 flex items-center justify-between border-b border-gray-50">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setActiveTab('my-forms')}
              className={`text-lg font-bold pb-2 transition-all relative ${activeTab === 'my-forms' ? 'text-primary' : 'text-gray-400'}`}
            >
              My Forms
              {activeTab === 'my-forms' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('submissions')}
              className={`text-lg font-bold pb-2 transition-all relative ${activeTab === 'submissions' ? 'text-primary' : 'text-gray-400'}`}
            >
              My Responses
              {activeTab === 'submissions' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowRespondModal(true)}
              className="text-secondary hover:text-primary px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all font-bold text-sm hover:bg-accent border border-transparent hover:border-primary/10"
            >
              Respond to Form
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-primary text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all group font-bold text-sm"
            >
              <Plus size={18} strokeWidth={3} />
              New Form
            </button>
          </div>
        </div>

        {/* Search & Filter Row */}
        <div className="px-10 py-6 border-b border-gray-100 bg-[#F9FAFB]">
          <div className="flex items-center gap-3 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search forms..." 
                className="pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all w-full shadow-sm"
              />
            </div>
            <button className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-500 hover:text-primary transition-all shrink-0 shadow-sm">
              <Filter size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-primary mb-4" size={40} />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Decrypting Records...</p>
            </div>
          ) : activeTab === 'my-forms' ? (
            forms.length > 0 ? (
              forms.map(form => (
                <FormCard key={form.id} form={form} />
              ))
            ) : (
              <EmptyState title="No forms yet" subtitle="Start by creating a new blank form." />
            )
          ) : (
             <EmptyState title="No responses yet" subtitle="Responses will show up here once people fill your form." />
          )}
        </div>
      </div>

      {/* Modals remain the same */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-secondary/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[32px] overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="p-8 text-center">
              <h3 className="text-2xl font-bold text-secondary mb-2">Create Form</h3>
              <p className="text-gray-500 text-sm mb-8">How would you like to start?</p>
              
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={handleCreateBlank}
                  className="flex items-center justify-between p-4 bg-accent hover:bg-primary/5 border border-transparent hover:border-primary rounded-2xl transition-all group"
                >
                  <div className="text-left">
                    <p className="font-bold text-secondary group-hover:text-primary">Blank Form</p>
                    <p className="text-xs text-gray-500">Start from scratch</p>
                  </div>
                  <FileEdit className="text-gray-400 group-hover:text-primary" />
                </button>
                <button className="flex items-center justify-between p-4 bg-accent hover:bg-primary/5 border border-transparent hover:border-primary rounded-2xl transition-all group opacity-50 cursor-not-allowed">
                  <div className="text-left">
                    <p className="font-bold text-secondary">Use Template</p>
                    <p className="text-xs text-gray-500">Choose a ready-made form</p>
                  </div>
                  <ArrowUpRight className="text-gray-400" />
                </button>
              </div>

              <button 
                onClick={() => setShowCreateModal(false)}
                className="mt-8 text-gray-400 hover:text-secondary text-sm font-bold uppercase tracking-widest"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showRespondModal && (
        <div className="fixed inset-0 bg-secondary/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[32px] overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl">
            <form onSubmit={handleRespond} className="p-8">
              <div className="mb-6 text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                  <Link2 size={32} />
                </div>
                <h3 className="text-2xl font-bold text-secondary mb-2">Respond to Form</h3>
                <p className="text-gray-500 text-sm">Enter the unique ID or link of the form you wish to fill.</p>
              </div>

              <div className="relative mb-6">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Key size={18} />
                </div>
                <input 
                  autoFocus
                  type="text"
                  value={respondInput}
                  onChange={(e) => setRespondInput(e.target.value)}
                  placeholder="e.g. form_xyz123 or https://..."
                  className="w-full pl-12 pr-4 py-4 bg-accent border border-gray-100 rounded-2xl text-secondary focus:outline-none focus:border-primary transition-all font-medium"
                />
              </div>

              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowRespondModal(false)}
                  className="flex-1 px-4 py-3 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                >
                  Find Form
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
    alert("Share link copied to clipboard!");
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[32px] p-6 hover:shadow-lg hover:shadow-gray-100 transition-all group cursor-pointer" onClick={handleCardClick}>
      <div className="flex items-center justify-between mb-4">
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${statusColor}`}>
          <StatusIcon size={12} />
          {form.status}
        </div>
        <button onClick={handleShare} className="text-gray-400 hover:text-primary p-2 transition-colors">
          <Copy size={18} />
        </button>
      </div>
      
      <h3 className="text-lg font-bold text-secondary mb-1 group-hover:text-primary transition-colors">{form.title}</h3>
      <p className="text-sm text-gray-500 mb-6 line-clamp-2">{form.subtitle}</p>
      
      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Responses</p>
          <p className="text-lg font-bold text-secondary">{form.responseCount || 0}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Expiry</p>
          <p className="text-sm font-bold text-secondary text-right">{form.expiryDate ? new Date(form.expiryDate).toLocaleDateString() : 'None'}</p>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ title, subtitle }: { title: string, subtitle: string }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-40">
    <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mb-4 text-primary">
      <FileEdit size={32} />
    </div>
    <h3 className="text-xl font-bold text-secondary">{title}</h3>
    <p className="text-gray-500">{subtitle}</p>
  </div>
);

export default Dashboard;
