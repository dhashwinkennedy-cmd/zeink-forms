
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle2, User as UserIcon, Zap, ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';
import { FormSchema, FieldType, FormStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { doc, getDoc, addDoc, collection, updateDoc, increment } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

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
        const data = docSnap.data() as FormSchema;
        if (data.status === FormStatus.DRAFT && user?.id !== data.creatorId) {
           setError("This form is currently in Draft mode and cannot be accessed.");
        } else {
           setForm(data);
        }
      } else {
        setError("Form not found. Please check the ID or Link.");
      }
    } catch (err) {
      console.error(err);
      setError("Connectivity Error: Could not reach Zienk Cloud.");
    }
    setIsLoading(false);
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#fdebeb] gap-6">
      <div className="relative">
        <div className="w-24 h-24 rounded-full border-4 border-[#ff1a1a]/10 border-t-[#ff1a1a] animate-spin"></div>
        <Zap className="absolute inset-0 m-auto text-[#ff1a1a] animate-pulse" size={32} />
      </div>
      <p className="font-black uppercase tracking-widest text-[#ff1a1a] text-xs">Decrypting Cloud Assets...</p>
    </div>
  );

  if (error) return (
    <div className="max-w-2xl mx-auto py-20 px-6 text-center space-y-8 animate-in fade-in duration-500">
      <div className="w-24 h-24 bg-red-100 text-red-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl">
        <ShieldAlert size={48} />
      </div>
      <h1 className="text-3xl font-black uppercase tracking-tighter text-[#0a0b10] italic">{error}</h1>
      <button onClick={() => navigate('/')} className="px-8 py-4 bg-[#0a0b10] text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2 mx-auto hover:bg-black transition-all">
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
          <h1 className="text-4xl font-black text-[#0a0b10] italic uppercase tracking-tighter">Session Suspended</h1>
          <p className="text-gray-500 font-bold max-w-sm mx-auto leading-relaxed">
            The creator has paused responses for <span className="text-[#0a0b10] underline decoration-[#ff1a1a] decoration-2">{form.title}</span>.
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
      // 1. Save Response
      await addDoc(collection(db, 'submissions'), {
        formId: id,
        userId: user?.id || 'anonymous',
        userEmail: user?.email || 'anonymous',
        userName: user?.name || 'Guest User',
        answers,
        submittedAt: Date.now(),
        status: 'pending'
      });
      
      // 2. Increment Response Count on Form
      await updateDoc(doc(db, 'forms', id!), {
        responseCount: increment(1)
      });

      setIsSubmitted(true);
    } catch (err) {
      alert("Submission Failed: Cloud persistence error. Please check your connection.");
    }
    setIsSubmitting(false);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <div className="bg-white rounded-[3.5rem] shadow-2xl border-4 border-white p-16 space-y-10 animate-in zoom-in-95 duration-500">
          <div className="w-28 h-28 bg-green-50 text-green-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl shadow-green-50 border-2 border-green-100">
            <CheckCircle2 size={56} />
          </div>
          <div className="space-y-3">
            <h1 className="text-5xl font-black text-[#0a0b10] italic tracking-tighter uppercase">Secured.</h1>
            <p className="text-gray-500 font-bold text-lg">Your response is safely stored in the Zienk Cloud.</p>
          </div>
          <button onClick={() => navigate('/')} className="px-12 py-5 bg-[#ff1a1a] text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-2xl shadow-red-200">Go back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto space-y-8 pb-32 ${!form.settings.allowCopyPaste ? 'select-none' : ''}`}>
      <div className="bg-[#0a0b10] rounded-2xl p-4 flex items-center justify-between text-white shadow-xl border-2 border-[#1a1c24]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ff1a1a] flex items-center justify-center shadow-lg shadow-red-500/20">
            <UserIcon size={18} />
          </div>
          <div className="text-xs">
            <p className="text-white/40 font-black uppercase tracking-widest text-[8px]">Participating Identity</p>
            <p className="font-bold text-sm tracking-tight">{user ? user.name : 'Anonymous Guest'}</p>
          </div>
        </div>
        {!user && (
           <button onClick={() => navigate('/login')} className="text-[10px] font-black uppercase tracking-widest bg-white/10 hover:bg-[#ff1a1a] px-4 py-2 rounded-xl transition-all border border-white/5">
            Identify for Record
          </button>
        )}
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border overflow-hidden">
        {form.bannerUrl && <img src={form.bannerUrl} alt="Banner" className="w-full h-64 object-cover" />}
        <div className="p-16 space-y-4 text-center">
          <h1 className="text-5xl font-black text-[#0a0b10] italic uppercase tracking-tighter">{form.title}</h1>
          <p className="text-gray-400 font-bold text-lg max-w-2xl mx-auto leading-relaxed">{form.subtitle}</p>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border p-16 shadow-sm space-y-16">
        <div className="space-y-20">
          {activePage.fields.map((field) => (
            <div key={field.id} className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              {field.mediaUrl && (
                <div className="rounded-[2.5rem] overflow-hidden border shadow-sm bg-gray-50 max-h-[500px] flex items-center justify-center border-4 border-white">
                  {field.mediaType === 'video' ? <video src={field.mediaUrl} className="w-full max-h-[500px] object-contain" controls /> : <img src={field.mediaUrl} alt="Media" className="w-full max-h-[500px] object-contain" />}
                </div>
              )}

              <h3 className="text-2xl font-black flex gap-3 tracking-tight text-[#0a0b10]">
                {field.title} {field.required && <span className="text-[#ff1a1a]">*</span>}
              </h3>
              
              <div className="pl-2 border-l-4 border-gray-50">
                {field.type === FieldType.MCQ && (
                  <div className="grid grid-cols-1 gap-4">
                    {field.options?.map((opt) => (
                      <label key={opt.id} className={`flex items-center gap-5 p-6 rounded-3xl border-2 transition-all cursor-pointer bg-white group ${answers[field.id] === opt.id ? 'border-[#ff1a1a] bg-[#fdebeb]/30' : 'border-gray-50 hover:border-gray-100'}`}>
                        <div className={`w-6 h-6 rounded-full border-4 flex items-center justify-center transition-all ${answers[field.id] === opt.id ? 'border-[#ff1a1a] bg-[#ff1a1a]' : 'border-gray-200 bg-white'}`}>
                          {answers[field.id] === opt.id && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <input type="radio" name={field.id} className="hidden" checked={answers[field.id] === opt.id} onChange={() => setAnswers({...answers, [field.id]: opt.id})} />
                        <span className="font-black text-gray-700 text-lg group-hover:text-[#0a0b10]">{opt.text}</span>
                      </label>
                    ))}
                  </div>
                )}

                {(field.type === FieldType.LONG_TEXT || field.type === FieldType.SHORT_TEXT) && (
                  <div className="space-y-4">
                    {field.type === FieldType.LONG_TEXT ? (
                      <textarea 
                        className="w-full p-8 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[#ff1a1a] rounded-[2.5rem] focus:outline-none min-h-[250px] text-xl font-medium transition-all shadow-inner"
                        placeholder="Type your response here..."
                        value={answers[field.id] || ''}
                        onChange={(e) => setAnswers(prev => ({ ...prev, [field.id]: e.target.value }))}
                      />
                    ) : (
                      <input 
                        type="text" 
                        className="w-full p-8 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[#ff1a1a] rounded-2xl focus:outline-none font-bold text-xl transition-all"
                        placeholder="Enter answer..."
                        value={answers[field.id] || ''}
                        onChange={(e) => setAnswers(prev => ({ ...prev, [field.id]: e.target.value }))}
                      />
                    )}
                  </div>
                )}

                {field.type === FieldType.DATE && (
                  <input 
                    type="date" 
                    className="w-full p-6 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[#ff1a1a] rounded-2xl focus:outline-none font-black text-lg"
                    value={answers[field.id] || ''}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [field.id]: e.target.value }))}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={handlePrev} disabled={currentPageIdx === 0} className="px-10 py-5 bg-white border-2 border-gray-100 text-[#0a0b10] rounded-2xl font-black uppercase text-xs tracking-widest hover:border-[#ff1a1a] disabled:opacity-20 transition-all flex items-center gap-2">
          <ChevronLeft size={18} /> Previous
        </button>
        {isLastPage ? (
          <button onClick={handleSubmit} disabled={isSubmitting} className="px-14 py-5 bg-[#0a0b10] text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-2xl flex items-center gap-3 active:scale-95">
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Finalize & Submit'}
          </button>
        ) : (
          <button onClick={handleNext} className="px-14 py-5 bg-[#ff1a1a] text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-2xl flex items-center gap-2 shadow-red-200">
            Next Page <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default FormRunner;
