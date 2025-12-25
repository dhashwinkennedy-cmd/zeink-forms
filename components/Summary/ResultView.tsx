
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, CheckCircle2, Award, ArrowLeft } from 'lucide-react';

const ResultView: React.FC = () => {
  const { responseId } = useParams<{ responseId: string }>();
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gray-500 hover:text-[#ff1a1a] transition-colors font-bold"
      >
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
        <div className="bg-[#ff1a1a] p-12 text-center text-white space-y-4">
          <Award size={64} className="mx-auto opacity-50" />
          <h1 className="text-4xl font-black italic uppercase">Results Released</h1>
          <p className="opacity-80 font-medium">Form: Weekly System Quality Assessment</p>
        </div>
        
        <div className="p-12 space-y-12">
          <div className="flex items-center justify-between p-8 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <div>
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Your Performance</p>
              <h2 className="text-5xl font-black text-[#0a0b10] mt-2">18.5 <span className="text-2xl text-gray-400">/ 20.0</span></h2>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Percentile</p>
              <h2 className="text-4xl font-black text-green-600 mt-2 tracking-tighter">Top 5%</h2>
            </div>
          </div>

          <div className="space-y-8">
            <h3 className="text-xl font-bold flex items-center gap-2 border-b pb-4">
              <CheckCircle2 className="text-green-500" /> Detailed Breakdown
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="font-bold text-gray-800">Q1: How would you rate the system latency?</p>
                <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex justify-between items-center">
                  <span className="font-medium">Excellent (Chosen)</span>
                  <span className="font-black text-green-700">+1.0 PTS</span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="font-bold text-gray-800">Q2: Suggest one improvement for the dashboard.</p>
                <div className="p-4 bg-gray-50 border rounded-2xl">
                  <p className="italic text-gray-600">"The navigation bar should collapse on mobile devices to save vertical space."</p>
                  <div className="mt-4 p-4 bg-white border rounded-xl">
                    <h5 className="text-[10px] font-black text-blue-500 uppercase mb-2">AI EVALUATION FEEDBACK</h5>
                    <p className="text-sm text-gray-700">"Highly relevant suggestion. The respondent identified a specific UX pain point (mobile real estate) and provided a valid solution. Excellent reasoning."</p>
                    <div className="mt-3 flex gap-2">
                       <span className="text-[10px] font-black text-[#ff1a1a]">+2.5 / 2.5 PTS</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultView;
