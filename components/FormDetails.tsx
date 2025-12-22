
import React, { useState, useMemo } from 'react';
import { ChevronLeft, BarChart3, Users, Clock, Share2, Edit3, X, FileText, ChevronRight, UserCheck, TrendingUp, CheckCircle, Sparkles, Info } from 'lucide-react';
import { Form } from '../types.ts';

interface FormDetailsProps {
  form: Form;
  responses: any[];
  onBack: () => void;
  onEdit: () => void;
}

export const FormDetails: React.FC<FormDetailsProps> = ({ form, responses, onBack, onEdit }) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'responses'>('analytics');
  const [selectedResponse, setSelectedResponse] = useState<any | null>(null);

  const stats = useMemo(() => {
    const total = responses.length;
    const avgScore = total > 0 ? responses.reduce((acc, curr) => acc + (curr.totalScore || 0), 0) / total : 0;
    const maxScore = total > 0 ? Math.max(...responses.map(r => r.totalScore || 0)) : 0;
    return { total, avgScore: avgScore.toFixed(1), maxScore };
  }, [responses]);

  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-20 px-4 sm:px-6 flex flex-col items-center animate-in fade-in duration-500">
      <div className="w-full max-w-6xl space-y-6 sm:space-y-8">
        <div className="bg-white rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-12 shadow-sm border border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <button onClick={onBack} className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 hover:text-[#ff1a1a] transition-all"><ChevronLeft className="w-6 h-6" /></button>
            <div>
              <div className="flex items-center gap-3 justify-center sm:justify-start mb-1">
                <h2 className="text-2xl sm:text-4xl font-black text-[#0a0b10] tracking-tight truncate max-w-[200px] sm:max-w-none">{form.title}</h2>
                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${form.status === 'published' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>{form.status}</span>
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dashboard & Insights</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={onEdit} className="bg-[#0a0b10] text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-gray-200"><Edit3 className="w-4 h-4" /> Edit</button>
             <button className="p-3.5 sm:p-4 bg-gray-50 text-gray-400 rounded-xl sm:rounded-2xl"><Share2 className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {[
            { label: 'Submissions', value: stats.total, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'Avg Score', value: stats.avgScore, icon: BarChart3, color: 'text-[#ff1a1a]', bg: 'bg-red-50' },
            { label: 'Top Score', value: stats.maxScore, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' }
          ].map((s, i) => (
            <div key={i} className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-gray-50 flex items-center gap-5 shadow-sm">
              <div className={`w-12 h-12 sm:w-16 sm:h-16 ${s.bg} ${s.color} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm`}><s.icon className="w-6 h-6 sm:w-8 h-8" /></div>
              <div><p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">{s.label}</p><p className="text-xl sm:text-3xl font-black text-[#0a0b10]">{s.value}</p></div>
            </div>
          ))}
        </div>

        <div className="flex gap-6 sm:gap-10 border-b border-gray-100 mb-4 px-2">
           <button onClick={() => setActiveTab('analytics')} className={`pb-4 text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'analytics' ? 'text-[#ff1a1a]' : 'text-gray-300'}`}>Insights {activeTab === 'analytics' && <div className="absolute bottom-[-1px] left-0 w-full h-1 bg-[#ff1a1a] rounded-t-full" />}</button>
           <button onClick={() => setActiveTab('responses')} className={`pb-4 text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'responses' ? 'text-[#ff1a1a]' : 'text-gray-300'}`}>Responses {activeTab === 'responses' && <div className="absolute bottom-[-1px] left-0 w-full h-1 bg-[#ff1a1a] rounded-t-full" />}</button>
        </div>

        {activeTab === 'analytics' ? (
          <div className="py-12 sm:py-24 text-center bg-white rounded-[2rem] sm:rounded-[3.5rem] border border-dashed border-gray-200">
            <BarChart3 className="w-12 h-12 text-gray-100 mx-auto mb-4" />
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Aggregate Insights will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {responses.map((resp, i) => (
              <div key={resp.id} onClick={() => setSelectedResponse(resp)} className="bg-white p-5 sm:p-8 rounded-2xl border border-gray-50 flex items-center justify-between cursor-pointer hover:shadow-lg transition-all">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 bg-gray-50 text-gray-300 rounded-lg flex items-center justify-center"><FileText className="w-5 h-5" /></div>
                  <div className="truncate"><h4 className="font-black text-[#0a0b10] text-xs sm:text-sm uppercase truncate">{resp.respondentEmail || `User #${i+1}`}</h4><p className="text-[8px] text-gray-400 font-bold uppercase">{new Date(resp.submittedAt).toLocaleDateString()}</p></div>
                </div>
                <div className="flex items-center gap-6 sm:gap-10">
                  <div className="text-right"><p className="text-xl font-black text-[#ff1a1a]">{resp.totalScore || 0}</p><p className="text-[8px] font-black text-gray-300 uppercase">Pts</p></div>
                  <ChevronRight className="w-5 h-5 text-gray-100" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedResponse && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-[#0a0b10]/95 backdrop-blur-3xl" onClick={() => setSelectedResponse(null)} />
          <div className="relative w-full max-w-2xl h-[85vh] bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-8 sm:p-12 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#ff1a1a] shadow-sm"><UserCheck className="w-6 h-6" /></div>
                  <div className="min-w-0"><p className="text-[8px] font-black text-[#ff1a1a] uppercase mb-1">Report</p><h3 className="text-lg sm:text-2xl font-black text-[#0a0b10] truncate max-w-[150px] sm:max-w-none">{selectedResponse.respondentEmail || 'Anonymous'}</h3></div>
               </div>
               <button onClick={() => setSelectedResponse(null)} className="p-3 text-gray-400 hover:text-red-500"><X className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 sm:p-12 space-y-8 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-red-50 p-6 rounded-2xl border border-red-50"><p className="text-[8px] font-black text-red-400 uppercase mb-1">Score</p><p className="text-3xl font-black text-[#ff1a1a]">{selectedResponse.totalScore}</p></div>
                 <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100"><p className="text-[8px] font-black text-gray-400 uppercase mb-1">Status</p><div className="flex items-center gap-2 text-green-500 mt-1"><CheckCircle className="w-4 h-4" /><span className="text-[10px] font-black uppercase">Verified</span></div></div>
              </div>
              <div className="space-y-4">
                 <h5 className="text-[10px] font-black text-[#0a0b10] uppercase tracking-widest">Transcript & AI Logic</h5>
                 {selectedResponse.answers.map((ans: any, idx: number) => (
                   <div key={idx} className="p-6 bg-white border border-gray-100 rounded-[1.5rem] shadow-sm">
                     <p className="text-[8px] font-black text-gray-300 uppercase mb-1">Question {idx + 1}</p>
                     <div className="p-4 bg-gray-50 rounded-xl mt-3"><p className="text-xs font-bold text-gray-600 leading-relaxed">{ans.value}</p></div>
                     {ans.aiEvaluation && (
                       <div className="mt-4 p-4 bg-[#0a0b10] text-white rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#ff1a1a]" /><span className="text-[8px] font-black uppercase text-[#ff1a1a]">AI Insights</span></div>
                            <span className="text-[7px] font-black uppercase bg-[#ff1a1a] px-2 py-0.5 rounded-md">{ans.aiEvaluation.tag}</span>
                          </div>
                          <p className="text-[10px] font-medium text-white/70 italic">"{ans.aiEvaluation.reason}"</p>
                       </div>
                     )}
                   </div>
                 ))}
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-center"><button onClick={() => setSelectedResponse(null)} className="px-10 py-4 bg-[#0a0b10] text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95">Close Report</button></div>
          </div>
        </div>
      )}
    </div>
  );
};
