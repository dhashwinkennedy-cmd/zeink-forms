
import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronLeft, Send, CheckCircle, Clock, Mail, Phone, Check, Lock, Sparkles, BrainCircuit, Loader2 } from 'lucide-react';
import { Form, Answer, FormResponse, Field } from '../types.ts';
import { submitResponse, auth } from '../services/firebase.ts';
import { evaluateLongText } from '../services/gemini.ts';

interface FormResponderProps {
  form: Form;
  userResponses: any[];
  onExit: () => void;
}

export const FormResponder: React.FC<FormResponderProps> = ({ form, userResponses, onExit }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [aiStatus, setAiStatus] = useState<string | null>(null);

  const currentPage = form.pages[currentPageIndex];

  const handleUpdateAnswer = (fieldId: string, value: any, points: number) => {
    setAnswers(prev => {
      const existing = prev.find(a => a.fieldId === fieldId);
      if (existing) {
        return prev.map(a => a.fieldId === fieldId ? { ...a, value, pointsEarned: points } : a);
      }
      return [...prev, { fieldId, value, pointsEarned: points }];
    });
  };

  const getAnswerValue = (fieldId: string) => {
    return answers.find(a => a.fieldId === fieldId)?.value || '';
  };

  const canGoNext = useMemo(() => {
    return currentPage?.fields.every(field => {
      if (field.required && !getAnswerValue(field.id)) return false;
      return true;
    });
  }, [currentPage, answers]);

  const findFieldById = (id: string): Field | undefined => {
    for (const page of form.pages) {
      const field = page.fields.find(f => f.id === id);
      if (field) return field;
    }
    return undefined;
  };

  const handleSubmit = async () => {
    if (!canGoNext || isSubmitting) return;
    setIsSubmitting(true);
    
    const updatedAnswers = [...answers];

    // Evaluate AI-enabled responses before finalizing
    for (let i = 0; i < updatedAnswers.length; i++) {
      const field = findFieldById(updatedAnswers[i].fieldId);
      const isGradable = field && (field.type === 'LONG_TEXT' || field.type === 'ONE_LINE' || field.type === 'TEXT' || field.type === 'SHORT_TEXT');
      
      if (isGradable && field?.aiSettings?.mode === 'EVALUATE') {
        setAiStatus(`AI Analysis: ${field.label.substring(0, 15)}...`);
        try {
          const evalResult = await evaluateLongText(field.label, updatedAnswers[i].value, field.aiSettings?.prompt);
          updatedAnswers[i].aiEvaluation = evalResult;
          updatedAnswers[i].pointsEarned += (evalResult?.marks || 0);
        } catch (err) {
          console.error("AI grading failed for field:", field.id, err);
        }
      }
    }

    setAiStatus('Securing submission...');
    const total = updatedAnswers.reduce((sum, a) => sum + (a.pointsEarned || 0), 0);
    const response: FormResponse = {
      id: Math.random().toString(36).substr(2, 9),
      formId: form.id,
      respondentUid: auth.currentUser?.uid || 'anon',
      submittedAt: Date.now(),
      answers: updatedAnswers,
      totalScore: total,
    };

    const success = await submitResponse(response);
    if (success) {
      setFinalScore(total);
      setSubmitted(true);
    }
    setIsSubmitting(false);
    setAiStatus(null);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
        <div className="w-20 h-20 bg-green-50 rounded-[2rem] flex items-center justify-center mb-8">
           <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-4xl font-black text-[#0a0b10] mb-4 tracking-tighter">Verified Submission</h2>
        <p className="text-gray-400 font-bold mb-10 text-sm sm:text-base max-w-sm">Your data has been processed and securely stored in the cloud engine.</p>
        
        {form.settings?.results?.showAfterSubmission && (
          <div className="bg-[#F8F9FA] p-10 rounded-[2.5rem] border border-gray-100 mb-10 w-full max-w-xs shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Aggregate Points</p>
            <p className="text-6xl font-black text-[#ff1a1a] tracking-tighter">{finalScore}</p>
          </div>
        )}

        <button onClick={onExit} className="bg-[#0a0b10] text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Terminate Session</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center py-10 sm:py-20 px-4 sm:px-6 w-full">
      <div className="w-full max-w-3xl space-y-6 sm:space-y-8">
        {/* Progress Bar */}
        <div className="w-full bg-white h-3 rounded-full overflow-hidden shadow-sm p-1">
          <div 
            className="h-full bg-[#ff1a1a] rounded-full transition-all duration-700 ease-out"
            style={{ width: `${((currentPageIndex + 1) / form.pages.length) * 100}%` }}
          />
        </div>

        {/* Page Card */}
        <div className="bg-white rounded-[2.5rem] sm:rounded-[4rem] shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-50 animate-in slide-in-from-bottom-4 duration-500">
          <div className="p-8 sm:p-20">
            <div className="mb-10 sm:mb-16">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-red-50 text-[#ff1a1a] px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">Step {currentPageIndex + 1}</span>
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">of {form.pages.length}</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-[#0a0b10] tracking-tighter leading-tight">{currentPage?.title}</h2>
              {form.subtitle && <p className="text-sm sm:text-lg text-gray-400 font-bold mt-4 leading-relaxed">{form.subtitle}</p>}
            </div>

            <div className="space-y-10 sm:space-y-16">
              {currentPage?.fields.map((field) => (
                <div key={field.id} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="text-lg sm:text-2xl font-black text-[#0a0b10] tracking-tight">
                      {field.label}
                      {field.required && <span className="text-[#ff1a1a] ml-2">*</span>}
                    </label>
                  </div>

                  {field.type === 'MCQ' ? (
                    <div className="grid gap-3 sm:gap-4">
                      {field.options?.map((opt) => (
                        <button 
                          key={opt.id}
                          onClick={() => handleUpdateAnswer(field.id, opt.id, opt.points)}
                          className={`group flex items-center justify-between p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border-2 transition-all text-left ${getAnswerValue(field.id) === opt.id ? 'bg-[#ff1a1a] border-[#ff1a1a] shadow-xl shadow-red-100' : 'bg-[#F8F9FA] border-transparent hover:bg-gray-100'}`}
                        >
                          <span className={`font-black text-xs sm:text-sm uppercase tracking-widest ${getAnswerValue(field.id) === opt.id ? 'text-white' : 'text-gray-500'}`}>{opt.label}</span>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${getAnswerValue(field.id) === opt.id ? 'bg-white border-white' : 'border-gray-200'}`}>
                             {getAnswerValue(field.id) === opt.id && <Check className="w-3.5 h-3.5 text-[#ff1a1a]" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (field.type === 'LONG_TEXT') ? (
                    <textarea 
                      className="w-full px-6 sm:px-10 py-6 sm:py-8 bg-[#F8F9FA] rounded-[1.5rem] sm:rounded-[2.5rem] outline-none font-bold text-base sm:text-lg min-h-[150px] sm:min-h-[220px] resize-none border-4 border-transparent focus:border-[#ff1a1a]/5 focus:bg-white transition-all shadow-inner"
                      value={getAnswerValue(field.id)}
                      onChange={(e) => handleUpdateAnswer(field.id, e.target.value, field.points || 0)}
                      placeholder="Input comprehensive response..."
                    />
                  ) : (
                    <input 
                      type="text"
                      className="w-full px-6 sm:px-10 py-5 sm:py-7 bg-[#F8F9FA] rounded-[1.5rem] sm:rounded-[2.5rem] outline-none font-bold text-base sm:text-xl border-4 border-transparent focus:border-[#ff1a1a]/5 focus:bg-white transition-all shadow-inner"
                      value={getAnswerValue(field.id)}
                      onChange={(e) => handleUpdateAnswer(field.id, e.target.value, field.points || 0)}
                      placeholder="Input value..."
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="px-8 sm:px-20 py-8 sm:py-12 bg-[#F8F9FA] border-t border-gray-50 flex flex-col items-center gap-6">
            {aiStatus && (
              <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-sm border border-gray-100 animate-pulse">
                <Sparkles className="w-4 h-4 text-[#ff1a1a]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#0a0b10]">{aiStatus}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between w-full">
              <button 
                onClick={() => setCurrentPageIndex(prev => Math.max(0, prev - 1))}
                disabled={currentPageIndex === 0 || isSubmitting}
                className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#0a0b10] transition-colors disabled:opacity-0"
              >
                Backtrack
              </button>

              {currentPageIndex === form.pages.length - 1 ? (
                <button 
                  onClick={handleSubmit}
                  disabled={!canGoNext || isSubmitting}
                  className="bg-[#ff1a1a] text-white px-10 sm:px-16 py-4 sm:py-6 rounded-2xl sm:rounded-[1.8rem] font-black text-xs sm:text-sm uppercase tracking-[0.2em] shadow-2xl shadow-red-200 disabled:opacity-50 hover:scale-105 active:scale-95 transition-all"
                >
                  {isSubmitting ? 'Syncing...' : 'Finalize'}
                </button>
              ) : (
                <button 
                  onClick={() => setCurrentPageIndex(prev => prev + 1)}
                  disabled={!canGoNext}
                  className="bg-[#0a0b10] text-white px-10 sm:px-16 py-4 sm:py-6 rounded-2xl sm:rounded-[1.8rem] font-black text-xs sm:text-sm uppercase tracking-[0.2em] disabled:opacity-50 hover:scale-105 active:scale-95 transition-all"
                >
                  Proceed
                </button>
              )}
            </div>
          </div>
        </div>
        <button onClick={onExit} className="w-full text-center text-gray-300 font-black text-[9px] uppercase tracking-[0.3em] hover:text-red-500 transition-colors">Abort Session</button>
      </div>
    </div>
  );
};
