
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle2, User as UserIcon, Zap, ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';
import { FormSchema, FieldType, FormStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { doc, getDoc, addDoc, collection } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const FormRunner: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [form, setForm] = useState<FormSchema | null>(null);
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchForm();
    }
  }, [id]);

  const fetchForm = async () => {
    setIsLoading(true);
    try {
      const docRef = doc(db, 'forms', id!);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setForm(docSnap.data() as FormSchema);
      } else {
        setError("Form not found. Please check the ID or Link.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load form. Check your internet connection.");
    }
    setIsLoading(false);
  };

  if (isLoading) return <div className="flex flex-col items-center justify-center h-screen bg-[#fdebeb] gap-4">
    <Zap className="animate-pulse text-[#ff1a1a]" size={64} />
    <p className="font-black uppercase tracking-widest text-[#ff1a1a] text-xs">Decrypting Form...</p>
  </div>;

  if (error) return (
    <div className="max-w-2xl mx-auto py-20 px-6 text-center space-y-8">
      <div className="w-24 h-24 bg-red-100 text-red-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl">
        <ShieldAlert size={48} />
      </div>
      <h1 className="text-3xl font-black uppercase tracking-tighter">{error}</h1>
      <button onClick={() => navigate('/')} className="px-8 py-4 bg-[#0a0b10] text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2 mx-auto">
        <ArrowLeft size={16} /> Return to Dashboard
      </button>
    </div>
  );

  if (!form) return null;

  if (form.status === FormStatus.PAUSED) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-6 text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-orange-100 text-orange-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-orange-100">
          <ShieldAlert size={48} />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-black text-[#0a0b10] italic uppercase tracking-tighter">Form Paused</h1>
          <p className="text-gray-500 font-bold max-sm mx-auto leading-relaxed">
            The creator has temporarily suspended responses for <span className="text-[#0a0b10] underline decoration-[#ff1a1a] decoration-2">{form.title}</span>.
          </p>
        </div>
        <button onClick={() => navigate('/')} className="px-10 py-4 bg-[#0a0b10] text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-xl flex items-center gap-2 mx-auto">
          <ArrowLeft size={16} /> Back to HQ
        </button>
      </div>
    );
  }

  const activePage = form.pages[currentPageIdx];
  const isLastPage = currentPageIdx === form.pages.length - 1;

  const handleNext = () => currentPageIdx < form.pages.length - 1 && setCurrentPageIdx(currentPageIdx + 1);
  const handlePrev = () => currentPageIdx > 0 && form.settings.allowRevisit && setCurrentPageIdx(currentPageIdx - 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'submissions'), {
        formId: id,
        userId: user?.id || 'anonymous',
        userEmail: user?.email || 'anonymous',
        userName: user?.name || 'Anonymous Guest',
        answers,
        submittedAt: Date.now(),
        score: 0, // AI evaluation would trigger here in a real scenario
        status: 'pending'
      });
      setIsSubmitted(true);
    } catch (err) {
      alert("Error submitting form. Please try again.");
    }
    setIsSubmitting(false);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <div className="bg-white rounded-[3rem] shadow-2xl border p-16 space-y-10">
          <div className="w-28 h-28 bg-green-100 text-green-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl shadow-green-100">
            <CheckCircle2 size={56} />
          </div>
          <div className="space-y-3">
            <h1 className="text-5xl font-black text-[#0a0b10] italic tracking-tighter uppercase">Submitted.</h1>
            <p className="text-gray-500 font-bold text-lg">Your response has been secured by Zienk AI.</p>
          </div>
          <button onClick={() => navigate('/')} className="px-12 py-5 bg-[#ff1a1a] text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-2xl shadow-red-200">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto space-y-8 ${!form.settings.allowCopyPaste ? 'select-none' : ''}`}>
      <div className="bg-[#0a0b10] rounded-2xl p-4 flex items-center justify-between text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#ff1a1a] flex items-center justify-center">
            <UserIcon size={16} />
          </div>
          <div className="text-xs">
            <p className="text-white/40 font-black uppercase tracking-widest text-[8px]">Participating As</p>
            <p className="font-bold">{user ? user.name : 'Anonymous Guest'}</p>
          </div>
        </div>
        <button onClick={() => navigate('/login')} className="text-[10px] font-black uppercase tracking-widest bg-white/10 hover:bg-[#ff1a1a] px-3 py-1.5 rounded-lg transition-all">
          {user ? 'Signed In' : 'Sign In for Record'}
        </button>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border overflow-hidden">
        {form.bannerUrl && <img src={form.bannerUrl} alt="Banner" className="w-full h-56 object-cover" />}
        <div className="p-16 space-y-4 text-center">
          <h1 className="text-5xl font-black text-[#0a0b10] italic uppercase tracking-tighter">{form.title}</h1>
          <p className="text-gray-400 font-bold text-lg max-w-2xl mx-auto">{form.subtitle}</p>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border p-16 shadow-sm space-y-16">
        <div className="space-y-20">
          {activePage.fields.map((field) => (
            <div key={field.id} className="space-y-8">
              {field.mediaUrl && (
                <div className="rounded-3xl overflow-hidden border shadow-sm bg-gray-50 max-h-[450px] flex items-center justify-center">
                  {field.mediaType === 'video' ? <video src={field.mediaUrl} className="w-full max-h-[450px] object-contain" controls /> : <img src={field.mediaUrl} alt="Media" className="w-full max-h-[450px] object-contain" />}
                </div>
              )}

              <h3 className="text-2xl font-black flex gap-2 tracking-tight">
                {field.title} {field.required && <span className="text-[#ff1a1a]">*</span>}
              </h3>
              
              {field.type === FieldType.MCQ && (
                <div className="space-y-4">
                  {field.options?.map((opt) => (
                    <label key={opt.id} className={`flex items-center gap-5 p-6 rounded-3xl border-2 transition-all cursor-pointer bg-white group ${answers[field.id] === opt.id ? 'border-[#ff1a1a]' : 'border-gray-100 hover:border-gray-200'}`}>
                      <input type="radio" name={field.id} className="w-6 h-6 accent-[#ff1a1a]" checked={answers[field.id] === opt.id} onChange={() => setAnswers({...answers, [field.id]: opt.id})} />
                      <span className="font-black text-gray-700 text-lg group-hover:text-[#0a0b10]">{opt.text}</span>
                    </label>
                  ))}
                </div>
              )}

              {(field.type === FieldType.LONG_TEXT || field.type === FieldType.SHORT_TEXT) && (
                <div className="space-y-4">
                  {field.type === FieldType.LONG_TEXT ? (
                    <textarea 
                      className="w-full p-8 bg-white border-2 border-gray-100 focus:border-[#ff1a1a] rounded-[2rem] focus:outline-none min-h-[200px] text-xl font-medium transition-all shadow-sm"
                      placeholder="Type your response..."
                      value={answers[field.id] || ''}
                      onChange={(e) => setAnswers(prev => ({ ...prev, [field.id]: e.target.value }))}
                    />
                  ) : (
                    <input 
                      type="text" 
                      className="w-full p-6 bg-white border-2 border-gray-100 focus:border-[#ff1a1a] rounded-2xl focus:outline-none font-bold text-lg"
                      placeholder="Short answer..."
                      value={answers[field.id] || ''}
                      onChange={(e) => setAnswers(prev => ({ ...prev, [field.id]: e.target.value }))}
                    />
                  )}
                </div>
              )}

              {field.type === FieldType.DATE && (
                <input 
                  type="date" 
                  className="w-full p-6 bg-white border-2 border-gray-100 focus:border-[#ff1a1a] rounded-2xl focus:outline-none font-bold text-lg"
                  value={answers[field.id] || ''}
                  onChange={(e) => setAnswers(prev => ({ ...prev, [field.id]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pb-24">
        <button onClick={handlePrev} disabled={currentPageIdx === 0} className="px-10 py-5 bg-white border-2 text-[#0a0b10] rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-50 disabled:opacity-20 transition-all flex items-center gap-2">
          <ChevronLeft size={18} /> Previous
        </button>
        {isLastPage ? (
          <button onClick={handleSubmit} disabled={isSubmitting} className="px-14 py-5 bg-[#0a0b10] text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-2xl flex items-center gap-3">
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Submit Response'}
          </button>
        ) : (
          <button onClick={handleNext} className="px-14 py-5 bg-[#ff1a1a] text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-2xl flex items-center gap-2">
            Next Page <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default FormRunner;
