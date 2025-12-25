
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Users, TrendingUp, Clock, Check, X, Eye, Pause, Play, Send, Zap, ShieldAlert } from 'lucide-react';
import { FormSchema, FormStatus } from '../../types';

const SummaryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);
  const [form, setForm] = useState<FormSchema | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching form data
    setTimeout(() => {
      setForm({
        id: id || 'demo',
        creatorId: 'c1',
        title: 'Product Feedback Survey',
        subtitle: 'Analyzing user experience for Zienk V2.',
        status: FormStatus.LIVE,
        pages: [],
        settings: {
          allowCopyPaste: true,
          isPublicSurvey: true,
          whitelist: [],
          blacklist: [],
          accessMode: 'none',
          resultReveal: 'approval', // Enabled approval mode for testing
          allowRevisit: true,
          admins: []
        },
        createdAt: Date.now(),
        responseCount: 57,
        cost_per_response: 2,
        resultsReleased: false
      });
      setIsLoading(false);
    }, 600);
  }, [id]);

  if (isLoading || !form) return <div className="flex items-center justify-center h-screen"><Zap className="animate-pulse text-[#ff1a1a]" size={48} /></div>;

  const toggleFormStatus = () => {
    const newStatus = form.status === FormStatus.LIVE ? FormStatus.PAUSED : FormStatus.LIVE;
    setForm({ ...form, status: newStatus });
  };

  const publishResults = () => {
    if (confirm("Are you sure you want to release all results to respondents?")) {
      setForm({ ...form, resultsReleased: true });
    }
  };

  const stats = [
    { label: 'Total Responses', value: form.responseCount.toString(), icon: <Users />, color: 'bg-blue-500' },
    { label: 'Avg. Score', value: '14.5/20', icon: <TrendingUp />, color: 'bg-green-500' },
    { label: 'Status', value: form.status.toUpperCase(), icon: form.status === FormStatus.LIVE ? <Play /> : <Pause />, color: form.status === FormStatus.LIVE ? 'bg-[#ff1a1a]' : 'bg-orange-500' },
  ];

  const responses = [
    { id: 'r1', user: 'alice@example.com', score: 18, date: '2023-11-25 14:30', status: 'approved' },
    { id: 'r2', user: 'bob@tech.io', score: 12, date: '2023-11-25 15:12', status: 'pending' },
    { id: 'r3', user: 'charlie@web.com', score: 15, date: '2023-11-25 16:05', status: 'rejected' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-[#0a0b10]">{form.title}</h1>
            <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg border ${form.status === FormStatus.LIVE ? 'bg-green-50 text-green-600 border-green-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
              {form.status}
            </span>
          </div>
          <p className="text-gray-500 font-medium">ID: {form.id} • Real-time response tracking</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {form.settings.resultReveal === 'approval' && !form.resultsReleased && (
            <button 
              onClick={publishResults}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#0a0b10] text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-200"
            >
              <Send size={16} /> Publish Results
            </button>
          )}
          
          <button 
            onClick={toggleFormStatus}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 border-2 font-black text-xs uppercase tracking-widest rounded-2xl transition-all ${
              form.status === FormStatus.LIVE 
                ? 'bg-white border-orange-200 text-orange-600 hover:bg-orange-50' 
                : 'bg-[#ff1a1a] border-[#ff1a1a] text-white hover:opacity-90 shadow-lg shadow-red-200'
            }`}
          >
            {form.status === FormStatus.LIVE ? (
              <><Pause size={16} /> Pause Form</>
            ) : (
              <><Play size={16} /> Publish Form</>
            )}
          </button>

          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-100 text-[#0a0b10] font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-all">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {form.status === FormStatus.PAUSED && (
        <div className="bg-orange-50 border-2 border-orange-100 p-4 rounded-3xl flex items-center gap-4 text-orange-700 font-bold animate-in fade-in slide-in-from-top-4">
          <ShieldAlert size={20} />
          <p className="text-sm">This form is currently PAUSED. New respondents will not be able to access the form runner.</p>
        </div>
      )}

      {form.resultsReleased && (
        <div className="bg-green-50 border-2 border-green-100 p-4 rounded-3xl flex items-center gap-4 text-green-700 font-bold">
          <Check size={20} />
          <p className="text-sm">Results have been published! Respondents can now see their scores and AI feedback.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-3xl p-8 border shadow-sm flex items-center gap-6">
            <div className={`w-16 h-16 ${stat.color} text-white rounded-2xl flex items-center justify-center shadow-lg shadow-gray-100`}>
              {React.cloneElement(stat.icon as React.ReactElement, { size: 28 })}
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-3xl font-black text-[#0a0b10]">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="p-8 border-b flex items-center justify-between bg-gray-50/50">
          <h2 className="font-black text-lg uppercase tracking-tight">Individual Responses</h2>
          <div className="flex gap-2">
            <button className="px-4 py-1.5 bg-[#ff1a1a] text-white text-[10px] font-black uppercase tracking-widest rounded-full">All</button>
            <button className="px-4 py-1.5 bg-white border text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-full">Pending</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b">
              <tr>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">User Email</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Score</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {responses.map((res) => (
                <React.Fragment key={res.id}>
                  <tr 
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedResponse === res.id ? 'bg-[#fdebeb]' : ''}`} 
                    onClick={() => setSelectedResponse(selectedResponse === res.id ? null : res.id)}
                  >
                    <td className="px-8 py-5 font-bold text-[#0a0b10]">{res.user}</td>
                    <td className="px-8 py-5 font-black text-[#ff1a1a]">{res.score}/20</td>
                    <td className="px-8 py-5 text-sm text-gray-500">{res.date}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        res.status === 'approved' ? 'bg-green-100 text-green-700' :
                        res.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {res.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-gray-400 hover:text-green-600 bg-white border rounded-lg hover:bg-green-50 transition-all"><Check size={16} /></button>
                        <button className="p-2 text-gray-400 hover:text-blue-600 bg-white border rounded-lg hover:bg-blue-50 transition-all"><Eye size={16} /></button>
                      </div>
                    </td>
                  </tr>
                  {selectedResponse === res.id && (
                    <tr className="bg-gray-50/30">
                      <td colSpan={5} className="px-12 py-10">
                        <div className="space-y-6 max-w-4xl">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="p-6 bg-white border rounded-2xl space-y-3 shadow-sm">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Question 1: Overall Satisfaction</h4>
                                <p className="font-bold text-lg text-[#0a0b10]">Very Satisfied</p>
                                <div className="text-[10px] text-green-600 font-black bg-green-50 px-2.5 py-1 rounded-lg border border-green-100 inline-block">POINTS: 1/1</div>
                              </div>
                              <div className="p-6 bg-white border rounded-2xl space-y-3 shadow-sm">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">AI Assessment Detail</h4>
                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-2">
                                  <p className="text-sm font-medium text-blue-800 leading-relaxed italic">"The service was fast, although UI felt cluttered at first. Gemini's AI helper was a game changer."</p>
                                  <div className="pt-2 border-t border-blue-100">
                                    <p className="text-[10px] font-black text-blue-600 uppercase mb-1">Feedback</p>
                                    <p className="text-xs text-blue-700">Detailed constructive feedback provided.</p>
                                  </div>
                                </div>
                              </div>
                           </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SummaryPage;
