
import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { BlockType, Form, Submission } from '../types';
import { ShieldCheck, Send, CheckCircle2, ChevronLeft, AlertCircle, Loader2 } from 'lucide-react';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc, updateDoc, increment, collection } from 'firebase/firestore';

interface ViewerProps {
  formId: string;
}

const Viewer: React.FC<ViewerProps> = ({ formId }) => {
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<{ current: number; total: number } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchForm = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "forms", formId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setForm(docSnap.data() as Form);
        }
      } catch (error) {
        console.error("Error fetching form:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [formId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-primary mb-4" size={48} />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Accessing Secure Form...</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold text-secondary mb-2">Form Not Found</h2>
        <p className="text-gray-500 mb-6">The form you are looking for does not exist or has been removed.</p>
        <button onClick={() => window.location.hash = '#/'} className="bg-secondary text-white px-6 py-3 rounded-2xl font-bold">Back to Dashboard</button>
      </div>
    );
  }

  const handleInputChange = (blockId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [blockId]: value }));
    if (errors[blockId]) {
      const newErrors = { ...errors };
      delete newErrors[blockId];
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Validation
    const newErrors: Record<string, string> = {};
    form.blocks.forEach(block => {
      if (block.required && !answers[block.id] && block.type !== BlockType.INFO) {
        newErrors[block.id] = "This field is required";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Scoring Logic (MCQ)
    let totalScore = 0;
    let maxPossible = 0;

    form.blocks.forEach(block => {
      if (block.type === BlockType.MCQ && block.options) {
        maxPossible += block.totalPoints || 0;
        const selectedId = answers[block.id];
        const option = block.options.find(o => o.id === selectedId);
        if (option && option.isCorrect) {
          totalScore += option.points;
        }
      }
    });

    try {
      // Store submission
      const submissionId = crypto.randomUUID();
      const submission = {
        id: submissionId,
        formId: form.id,
        formName: form.title,
        answers: answers,
        score: totalScore,
        totalPossible: maxPossible,
        submittedAt: new Date().toISOString()
      };
      
      await setDoc(doc(collection(db, "submissions"), submissionId), submission);
      
      // Update response count in form
      await updateDoc(doc(db, "forms", form.id), {
        responseCount: increment(1)
      });

      setScore({ current: totalScore, total: maxPossible });
      setIsSubmitted(true);
    } catch (error) {
      console.error("Submission error:", error);
      alert("Encryption link failed. Check your security connection.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center animate-in fade-in zoom-in-95 duration-500">
        <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl border border-gray-100 p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-primary" />
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-black text-secondary mb-2">Submission Secure</h2>
          <p className="text-gray-500 mb-8 font-medium">Your response has been successfully logged and encrypted.</p>
          
          {score && score.total > 0 && (
            <div className="bg-accent rounded-3xl p-6 mb-8 border border-primary/10">
              <p className="text-[10px] font-black text-primary uppercase tracking-[3px] mb-1">Final Evaluation</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-black text-secondary">{score.current}</span>
                <span className="text-xl font-bold text-gray-400">/ {score.total}</span>
              </div>
            </div>
          )}

          <button 
            onClick={() => window.location.hash = '#/'}
            className="w-full bg-secondary text-white py-4 rounded-2xl font-bold hover:bg-primary transition-all flex items-center justify-center gap-2"
          >
            <ChevronLeft size={18} /> Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-sm mb-8">
            <div className="h-48 bg-gray-100">
              <img src={form.bannerUrl || `https://picsum.photos/seed/${form.id}/1200/400`} className="w-full h-full object-cover" alt="Banner" />
            </div>
            <div className="p-10 border-b-8 border-primary">
              <h1 className="text-4xl font-black text-secondary mb-3">{form.title}</h1>
              <p className="text-gray-500 text-lg font-medium">{form.subtitle}</p>
            </div>
          </div>

          {/* Blocks */}
          {form.blocks.map((block, index) => (
            <div key={block.id} className={`bg-white rounded-[32px] p-8 border ${errors[block.id] ? 'border-primary shadow-lg shadow-primary/5' : 'border-gray-100'} shadow-sm transition-all`}>
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-secondary">
                  {block.type !== BlockType.INFO && <span className="text-primary mr-2">{index + 1}.</span>}
                  {block.title}
                  {block.required && <span className="text-primary ml-1">*</span>}
                </h3>
              </div>
              {block.content && <p className="text-gray-500 mb-6 whitespace-pre-wrap">{block.content}</p>}

              <div className="mt-4">
                {block.type === BlockType.SHORT_TEXT && (
                  <input 
                    type="text"
                    maxLength={block.charLimit || 255}
                    onChange={(e) => handleInputChange(block.id, e.target.value)}
                    className="w-full bg-accent/50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary focus:bg-white transition-all font-medium text-secondary"
                    placeholder="Enter your answer..."
                  />
                )}
                {block.type === BlockType.LONG_TEXT && (
                  <textarea 
                    rows={5}
                    maxLength={block.charLimit || 300}
                    onChange={(e) => handleInputChange(block.id, e.target.value)}
                    className="w-full bg-accent/50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary focus:bg-white transition-all font-medium text-secondary resize-none"
                    placeholder="Provide a detailed response..."
                  />
                )}
                {block.type === BlockType.MCQ && block.options && (
                  <div className="space-y-3">
                    {block.options.map(option => (
                      <label key={option.id} className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${answers[block.id] === option.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-50 bg-gray-50/30 hover:bg-white hover:border-gray-200'}`}>
                        <input 
                          type="radio" 
                          name={block.id} 
                          className="accent-primary w-5 h-5" 
                          onChange={() => handleInputChange(block.id, option.id)}
                          checked={answers[block.id] === option.id}
                        />
                        <span className={`font-bold ${answers[block.id] === option.id ? 'text-primary' : 'text-secondary'}`}>
                          {option.text}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
                {block.type === BlockType.TEXT_MEDIA && (
                   <div className="border-2 border-dashed border-gray-100 rounded-[32px] p-10 flex flex-col items-center justify-center text-center bg-accent/30 hover:bg-accent/50 transition-colors cursor-pointer group">
                      <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                        <ShieldCheck size={32} />
                      </div>
                      <p className="font-bold text-secondary mb-1">Click to Upload Securely</p>
                      <p className="text-xs text-gray-400 font-medium">Maximum file size: {block.mediaType === 'video' ? '25MB' : '10MB'}</p>
                   </div>
                )}
              </div>

              {errors[block.id] && (
                <div className="mt-4 flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest animate-in slide-in-from-top-1">
                  <AlertCircle size={14} /> {errors[block.id]}
                </div>
              )}
            </div>
          ))}

          <div className="pt-8 flex flex-col items-center">
            <button 
              type="submit"
              disabled={submitting}
              className="w-full max-w-sm bg-primary text-white py-5 rounded-[32px] font-black text-xl shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin" size={24} /> : <>SUBMIT FORM <Send size={24} /></>}
            </button>
            <p className="mt-6 text-[10px] text-gray-400 font-black uppercase tracking-[4px] flex items-center gap-2">
              <ShieldCheck size={12} className="text-primary" /> Encrypted by Zienk Protocol
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Viewer;
