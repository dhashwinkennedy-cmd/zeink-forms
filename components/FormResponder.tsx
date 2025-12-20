
import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronLeft, Send, CheckCircle, Loader2, Clock, Mail, Phone, Check, Lock, Sparkles } from 'lucide-react';
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
  const [aiStatus, setAiStatus] = useState<string>('');

  const existingSubmission = useMemo(() => {
    const currentUid = auth.currentUser?.uid;
    return userResponses.find(r => r.formId === form.id && r.respondentUid === currentUid);
  }, [userResponses, form.id]);

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
    return currentPage.fields.every(field => {
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
    if (!canGoNext) return;
    setIsSubmitting(true);
    
    const updatedAnswers = [...answers];
    for (let i = 0; i < updatedAnswers.length; i++) {
      const field = findFieldById(updatedAnswers[i].fieldId);
      if (field && (field.type === 'LONG_TEXT' || field.type === 'ONE_LINE' || field.type === 'TEXT') && field.aiSettings?.mode !== 'NONE') {
        setAiStatus(`AI Evaluating: ${field.label}...`);
        const evalResult = await evaluateLongText(field.label, updatedAnswers[i].value, field.aiSettings?.prompt);
        updatedAnswers[i].aiEvaluation = evalResult;
        updatedAnswers[i].pointsEarned += evalResult.marks;
      }
    }

    const total = updatedAnswers.reduce((sum, a) => sum + a.pointsEarned, 0);
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
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
        <CheckCircle className="w-16 h-16 text-green-500 mb-6" />
        <h2 className="text-2xl sm:text-3xl font-black text-[#0a0b10] mb-4">Done!</h2>
        <p className="text-gray-400 font-bold mb-8 text-sm sm:text-base">Your response has been securely recorded.</p>
        
        {form.settings.results.showAfterSubmission && (
          <div className="bg-[#F8F9FA] p-8 rounded-3xl border border-gray-100 mb-8 w-full max-w-xs">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Score</p>
            <p className="text-4xl sm:text-5xl font-black text-[#ff1a1a]">{finalScore}</p>
          </div>
        )}

        <button onClick={onExit} className="bg-[#0a0b10] text-white px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest">Exit Form</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center py-10 sm:py-20 px-4 sm:px-6">
      <div className="w-full max-w-3xl space-y-6 sm:space-y-8">
        {/* Progress Bar */}
        <div className="w-full bg-white h-2 sm:h-4 rounded-full overflow-hidden shadow-sm p-0.5 sm:p-1">
          <div 
            className="h-full bg-[#ff1a1a] rounded-full transition-all duration-500"
            style={{ width: `${((currentPageIndex + 1) / form.pages.length) * 100}%` }}
          />
        </div>

        {/* Page Card */}
        <div className="bg-white rounded-[2rem] sm:rounded-[3.5rem] shadow-xl overflow-hidden border border-gray-50">
          <div className="p-8 sm:p-16">
            <div className="mb-8 sm:mb-12">
              <span className="text-[9px] sm:text-[11px] font-black text-[#ff1a1a] uppercase tracking-widest block mb-2">Page {currentPageIndex + 1} of {form.pages.length}</span>
              <h2 className="text-2xl sm:text-4xl font-black text-[#0a0b10] tracking-tight">{currentPage.title}</h2>
              <p className="text-xs sm:text-base text-gray-400 font-bold mt-2">{form.subtitle}</p>
            </div>

            <div className="space-y-8 sm:space-y-12">
              {currentPage.fields.map((field) => (
                <div key={field.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-base sm:text-lg font-black text-[#0a0b10]">
                      {field.label}
                      {field.required && <span className="text-[#ff1a1a] ml-1">*</span>}
                    </label>
                  </div>

                  {field.type === 'MCQ' ? (
                    <div className="grid gap-2 sm:gap-3">
                      {field.options?.map((opt) => (
                        <button 
                          key={opt.id}
                          onClick={() => handleUpdateAnswer(field.id, opt.id, opt.points)}
                          className={`flex items-center justify-between p-4 sm:p-6 rounded-xl sm:rounded-[1.5rem] border-2 transition-all text-left ${getAnswerValue(field.id) === opt.id ? 'bg-red-50 border-[#ff1a1a]' : 'bg-[#F8F9FA] border-transparent'}`}
                        >
                          <span className="font-black text-xs sm:text-sm uppercase tracking-widest text-gray-600">{opt.label}</span>
                          <Check className={`w-4 h-4 text-[#ff1a1a] ${getAnswerValue(field.id) === opt.id ? 'opacity-100' : 'opacity-0'}`} />
                        </button>
                      ))}
                    </div>
                  ) : field.type === 'LONG_TEXT' ? (
                    <textarea 
                      className="w-full px-5 sm:px-8 py-4 sm:py-6 bg-[#F8F9FA] rounded-xl sm:rounded-[1.5rem] outline-none font-bold text-sm sm:text-base min-h-[120px] sm:min-h-[150px] resize-none"
                      value={getAnswerValue(field.id)}
                      onChange={(e) => handleUpdateAnswer(field.id, e.target.value, 0)}
                    />
                  ) : (
                    <input 
                      type="text"
                      className="w-full px-5 sm:px-8 py-3.5 sm:py-5 bg-[#F8F9FA] rounded-xl sm:rounded-[1.5rem] outline-none font-bold text-sm sm:text-base"
                      value={getAnswerValue(field.id)}
                      onChange={(e) => handleUpdateAnswer(field.id, e.target.value, 0)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="px-8 sm:px-12 py-6 sm:py-10 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <button 
              onClick={() => setCurrentPageIndex(prev => Math.max(0, prev - 1))}
              disabled={currentPageIndex === 0}
              className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 disabled:opacity-0"
            >
              Previous
            </button>

            {currentPageIndex === form.pages.length - 1 ? (
              <button 
                onClick={handleSubmit}
                disabled={!canGoNext || isSubmitting}
                className="bg-[#ff1a1a] text-white px-8 sm:px-10 py-3.5 sm:py-5 rounded-xl sm:rounded-[1.2rem] font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-lg shadow-red-100 disabled:opacity-50"
              >
                {isSubmitting ? 'Processing...' : 'Finish'}
              </button>
            ) : (
              <button 
                onClick={() => setCurrentPageIndex(prev => prev + 1)}
                disabled={!canGoNext}
                className="bg-[#0a0b10] text-white px-8 sm:px-10 py-3.5 sm:py-5 rounded-xl sm:rounded-[1.2rem] font-black text-[10px] sm:text-xs uppercase tracking-widest disabled:opacity-50"
              >
                Next
              </button>
            )}
          </div>
        </div>
        <button onClick={onExit} className="w-full text-center text-gray-300 font-black text-[9px] sm:text-[10px] uppercase tracking-widest">Exit Form</button>
      </div>
    </div>
  );
};
