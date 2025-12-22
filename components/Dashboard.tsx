
import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, FileText, CheckCircle, ChevronRight, SortAsc, Share2, ClipboardList, UserCheck, X, Copy, Check } from 'lucide-react';
import { Form } from '../types.ts';

interface DashboardProps {
  forms: Form[];
  responses: any[];
  onCreateClick: () => void;
  onFormClick: (form: Form) => void;
  onResponseClick: (response: any) => void;
  onRespondClick: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ forms, responses, onCreateClick, onFormClick, onResponseClick, onRespondClick }) => {
  const [activeTab, setActiveTab] = useState<'forms' | 'responses'>('forms');
  const [searchQuery, setSearchQuery] = useState('');
  const [shareForm, setShareForm] = useState<Form | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const processedForms = useMemo(() => {
    let result = [...forms];
    if (searchQuery) result = result.filter(f => f.title.toLowerCase().includes(searchQuery.toLowerCase()));
    return result;
  }, [forms, searchQuery]);

  return (
    <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 mt-16 sm:mt-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 shadow-xl border border-gray-50 min-h-[500px]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 sm:mb-12 gap-6">
          <div className="text-left">
            <h2 className="text-2xl sm:text-3xl font-black text-[#0a0b10] tracking-tight">Dashboard</h2>
            <p className="text-[10px] sm:text-[11px] text-gray-400 font-black uppercase tracking-widest mt-1">Managing {forms.length} forms</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button onClick={onRespondClick} className="flex-1 sm:flex-none bg-white text-[#0a0b10] border-2 border-gray-50 px-4 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] sm:text-xs uppercase tracking-widest"><ClipboardList className="w-4 h-4 text-[#ff1a1a]" />Open</button>
            <button onClick={onCreateClick} className="flex-1 sm:flex-none bg-[#ff1a1a] text-white px-4 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] sm:text-xs shadow-xl shadow-red-100 uppercase tracking-widest"><Plus className="w-4 h-4" />Create</button>
          </div>
        </div>
        
        <div className="flex gap-6 sm:gap-10 border-b-2 border-gray-50 mb-8 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('forms')} className={`pb-4 px-1 text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === 'forms' ? 'text-[#ff1a1a]' : 'text-gray-300'}`}>My Forms {activeTab === 'forms' && <div className="absolute bottom-[-2px] left-0 w-full h-1 bg-[#ff1a1a] rounded-t-full" />}</button>
          <button onClick={() => setActiveTab('responses')} className={`pb-4 px-1 text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === 'responses' ? 'text-[#ff1a1a]' : 'text-gray-300'}`}>Submissions {activeTab === 'responses' && <div className="absolute bottom-[-2px] left-0 w-full h-1 bg-[#ff1a1a] rounded-t-full" />}</button>
        </div>

        {activeTab === 'forms' ? (
          <div className="space-y-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
              <input type="text" placeholder="Search forms..." className="w-full pl-11 pr-4 py-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 gap-3">
              {processedForms.map(form => (
                <div key={form.id} onClick={() => onFormClick(form)} className="flex items-center justify-between p-5 rounded-2xl border border-gray-50 hover:bg-red-50/20 cursor-pointer transition-all bg-white shadow-sm">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300"><FileText className="w-5 h-5" /></div>
                    <div className="truncate"><h3 className="font-black text-sm text-[#0a0b10] truncate">{form.title}</h3><p className="text-[8px] font-black text-gray-400 uppercase mt-0.5">{form.responsesCount} responses</p></div>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    {form.status === 'published' && <button onClick={(e) => { e.stopPropagation(); setShareForm(form); }} className="p-2 text-gray-300 hover:text-[#ff1a1a]"><Share2 className="w-4 h-4" /></button>}
                    <ChevronRight className="w-5 h-5 text-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {responses.map(resp => (
              <div key={resp.id} onClick={() => onResponseClick(resp)} className="flex items-center justify-between p-5 rounded-2xl border border-gray-50 bg-white hover:border-red-100 transition-all cursor-pointer shadow-sm">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center"><CheckCircle className="w-5 h-5" /></div>
                  <div className="truncate"><h4 className="font-black text-sm text-[#0a0b10] truncate">Submission Report</h4><p className="text-[8px] font-black text-gray-400 uppercase mt-0.5">{new Date(resp.submittedAt).toLocaleDateString()}</p></div>
                </div>
                <div className="text-right ml-4"><p className="text-xl font-black text-[#ff1a1a] leading-none">{resp.totalScore}</p><p className="text-[8px] font-black text-gray-300 uppercase mt-1">Pts</p></div>
              </div>
            ))}
            {responses.length === 0 && <div className="py-20 flex flex-col items-center opacity-30 text-center"><UserCheck className="w-12 h-12 mb-2" /><p className="text-[10px] font-black uppercase tracking-widest">No submissions yet</p></div>}
          </div>
        )}
      </div>

      {shareForm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-[#0a0b10]/95 backdrop-blur-xl" onClick={() => setShareForm(null)} />
          <div className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-black text-[#0a0b10] mb-6">Share Form</h3>
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 mb-6">
              <p className="text-[9px] font-black uppercase text-gray-400 mb-2">Form ID</p>
              <div className="flex gap-2">
                <input type="text" readOnly value={shareForm.id} className="flex-1 bg-white border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold outline-none" />
                <button onClick={() => { navigator.clipboard.writeText(shareForm.id); setCopiedId(true); setTimeout(() => setCopiedId(false), 2000); }} className="p-2.5 bg-[#0a0b10] text-white rounded-xl">
                  {copiedId ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button onClick={() => setShareForm(null)} className="w-full py-4 bg-[#ff1a1a] text-white rounded-xl font-black text-[10px] uppercase tracking-widest">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};
