
import React, { useReducer, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Settings as SettingsIcon, Image as ImageIcon, Save, Play, Layout, Trash2, Zap, Info, ShieldAlert, Copy, Check, X, Share2 } from 'lucide-react';
import { FormSchema, FieldType, FormField, FormStatus, UserTier, AIApproveMode } from '../../types';
import { FIELD_TYPE_LABELS } from '../../constants';
import FieldEditor from './FieldEditor';
import SettingsSidebar from './SettingsSidebar';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

type FormAction = 
  | { type: 'LOAD_FORM'; payload: FormSchema }
  | { type: 'SET_TITLE'; payload: string }
  | { type: 'SET_SUBTITLE'; payload: string }
  | { type: 'ADD_PAGE' }
  | { type: 'REMOVE_PAGE'; pageId: string }
  | { type: 'ADD_FIELD'; pageId: string; fieldType: FieldType }
  | { type: 'DUPLICATE_FIELD'; pageId: string; fieldId: string }
  | { type: 'UPDATE_FIELD'; pageId: string; fieldId: string; updates: Partial<FormField> }
  | { type: 'REMOVE_FIELD'; pageId: string; fieldId: string }
  | { type: 'UPDATE_SETTINGS'; payload: any };

const initialFormState = (id: string, creatorId: string): FormSchema => ({
  id,
  creatorId,
  title: 'Untitled Form',
  subtitle: 'Please fill out this form.',
  bannerUrl: '',
  status: FormStatus.DRAFT,
  pages: [{ id: 'p1', title: 'Page 1', fields: [] }],
  settings: {
    allowCopyPaste: true,
    isPublicSurvey: false,
    whitelist: [],
    blacklist: [],
    accessMode: 'blacklist',
    resultReveal: 'instant',
    allowRevisit: true,
    admins: [{ email: '', canEdit: true }]
  },
  createdAt: Date.now(),
  responseCount: 0,
  cost_per_response: 0
});

const calculateCost = (form: FormSchema) => {
  let cost = 0;
  form.pages.forEach(p => {
    p.fields.forEach(f => {
      if (f.type === FieldType.MCQ && f.allowOther && f.autoAIEval) cost += 1;
      if (f.type === FieldType.SHORT_TEXT || f.type === FieldType.LONG_TEXT) {
        if (f.aiEvalMode === AIApproveMode.AUTO) cost += 1;
        if (f.aiEvalMode === AIApproveMode.PROMPT) cost += 2;
      }
      if (f.type === FieldType.LONG_TEXT && f.aiTagging) cost += 1;
    });
  });
  return cost;
};

const formReducer = (state: FormSchema, action: FormAction): FormSchema => {
  let newState = { ...state };
  switch (action.type) {
    case 'LOAD_FORM': return action.payload;
    case 'SET_TITLE': newState = { ...state, title: action.payload }; break;
    case 'SET_SUBTITLE': newState = { ...state, subtitle: action.payload }; break;
    case 'ADD_PAGE':
      newState = { ...state, pages: [...state.pages, { id: `p${Date.now()}`, title: `Page ${state.pages.length + 1}`, fields: [] }] };
      break;
    case 'REMOVE_PAGE':
      if (state.pages.length <= 1) return state;
      newState = { ...state, pages: state.pages.filter(p => p.id !== action.pageId) };
      break;
    case 'ADD_FIELD':
      newState = {
        ...state,
        pages: state.pages.map(p => p.id === action.pageId ? {
          ...p,
          fields: [...p.fields, {
            id: `f${Date.now()}`,
            type: action.fieldType,
            title: '',
            required: false,
            points: 0,
            options: action.fieldType === FieldType.MCQ ? [{ id: 'o1', text: 'Option 1', isCorrect: false, points: 0 }] : undefined,
            aiEvalMode: AIApproveMode.NONE
          }]
        } : p)
      };
      break;
    case 'DUPLICATE_FIELD':
      const sourcePage = state.pages.find(p => p.id === action.pageId);
      const sourceField = sourcePage?.fields.find(f => f.id === action.fieldId);
      if (sourceField) {
        const clonedField = { ...sourceField, id: `f${Date.now()}` };
        newState = {
          ...state,
          pages: state.pages.map(p => p.id === action.pageId ? {
            ...p,
            fields: [...p.fields, clonedField]
          } : p)
        };
      }
      break;
    case 'UPDATE_FIELD':
      newState = {
        ...state,
        pages: state.pages.map(p => p.id === action.pageId ? {
          ...p,
          fields: p.fields.map(f => f.id === action.fieldId ? { ...f, ...action.updates } : f)
        } : p)
      };
      break;
    case 'REMOVE_FIELD':
      newState = {
        ...state,
        pages: state.pages.map(p => p.id === action.pageId ? {
          ...p,
          fields: p.fields.filter(f => f.id !== action.fieldId)
        } : p)
      };
      break;
    case 'UPDATE_SETTINGS':
      newState = { ...state, settings: { ...state.settings, ...action.payload } };
      break;
    default: return state;
  }
  newState.cost_per_response = calculateCost(newState);
  return newState;
};

const FormEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, dispatch] = useReducer(formReducer, initialFormState(id || 'new', user?.id || ''));
  const [activePageId, setActivePageId] = useState(form.pages[0]?.id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showFieldPicker, setShowFieldPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id && user) {
      loadForm();
    }
  }, [id, user]);

  const loadForm = async () => {
    const docRef = doc(db, 'forms', id!);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      dispatch({ type: 'LOAD_FORM', payload: docSnap.data() as FormSchema });
      setActivePageId(docSnap.data().pages[0]?.id);
    }
  };

  const handlePublish = async () => {
    if (!user) return;
    setIsSaving(true);
    const updatedForm = { ...form, status: FormStatus.LIVE, creatorId: user.id };
    await setDoc(doc(db, 'forms', id!), updatedForm);
    setIsSaving(false);
    setShowShareModal(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activePage = form.pages.find(p => p.id === activePageId) || form.pages[0];
  const isLimitExceeded = user?.tier === UserTier.FREE && form.cost_per_response > 15;

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto items-start min-h-[calc(100vh-120px)]">
      <div className="w-full md:w-64 bg-white rounded-2xl border p-4 shadow-sm sticky top-24">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black uppercase text-xs tracking-widest text-gray-400">Structure</h3>
          <button onClick={() => dispatch({ type: 'ADD_PAGE' })} className="p-1 hover:bg-[#fdebeb] text-[#ff1a1a] rounded-lg">
            <Plus size={18} />
          </button>
        </div>
        <div className="space-y-1">
          {form.pages.map((page, idx) => (
            <div 
              key={page.id}
              onClick={() => setActivePageId(page.id)}
              className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border-2 ${
                activePageId === page.id ? 'border-[#ff1a1a] bg-[#fdebeb] text-[#ff1a1a] font-black' : 'hover:bg-gray-50 border-transparent text-gray-600 font-bold'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-[10px] opacity-40">{idx + 1}</span>
                <span className="text-sm truncate">{page.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-6 w-full pb-32">
        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
          <div className="h-40 bg-white relative group cursor-pointer flex items-center justify-center border-b border-dashed">
            {form.bannerUrl ? (
              <img src={form.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-gray-400 font-bold">
                <ImageIcon size={32} className="mx-auto mb-1 opacity-20" />
                <p className="text-xs">Upload Banner</p>
              </div>
            )}
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => dispatch({ type: 'UPDATE_SETTINGS', payload: { bannerUrl: reader.result } });
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>
          <div className="p-8 space-y-2">
            <input 
              type="text" 
              className="text-4xl font-black w-full bg-white focus:outline-none placeholder-gray-200"
              placeholder="Form Title"
              value={form.title}
              onChange={(e) => dispatch({ type: 'SET_TITLE', payload: e.target.value })}
            />
            <textarea 
              className="w-full focus:outline-none bg-white text-gray-400 font-medium text-lg resize-none"
              placeholder="Description..."
              value={form.subtitle}
              onChange={(e) => dispatch({ type: 'SET_SUBTITLE', payload: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-4">
          {activePage?.fields.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-20 text-center space-y-4">
               <Layout size={48} className="mx-auto text-gray-200" />
               <p className="text-gray-400 font-bold">Add your first field.</p>
            </div>
          ) : (
            activePage?.fields.map((field) => (
              <FieldEditor 
                key={field.id} 
                field={field} 
                isPublic={form.settings.isPublicSurvey}
                onUpdate={(updates) => dispatch({ type: 'UPDATE_FIELD', pageId: activePage.id, fieldId: field.id, updates })}
                onRemove={() => dispatch({ type: 'REMOVE_FIELD', pageId: activePage.id, fieldId: field.id })}
                onDuplicate={() => dispatch({ type: 'DUPLICATE_FIELD', pageId: activePage.id, fieldId: field.id })}
              />
            ))
          )}
        </div>
      </div>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 z-40">
        <div className="relative">
          <button 
            onClick={() => setShowFieldPicker(!showFieldPicker)}
            className="w-16 h-16 bg-[#ff1a1a] text-white rounded-2xl shadow-2xl hover:scale-105 transition-all flex items-center justify-center border-4 border-white"
          >
            <Plus size={32} className={showFieldPicker ? 'rotate-45' : ''} />
          </button>
          {showFieldPicker && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-72 bg-white rounded-3xl shadow-2xl border p-2 grid grid-cols-2 gap-1 animate-in slide-in-from-bottom-4 overflow-y-auto max-h-[60vh]">
              {Object.values(FieldType).map((type) => (
                <button 
                  key={type}
                  onClick={() => {
                    dispatch({ type: 'ADD_FIELD', pageId: activePage.id, fieldType: type });
                    setShowFieldPicker(false);
                  }}
                  className="flex flex-col items-center gap-2 p-4 hover:bg-[#fdebeb] hover:text-[#ff1a1a] rounded-2xl transition-all text-xs font-black uppercase tracking-tight"
                >
                  <Layout size={18} />
                  {FIELD_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#0a0b10] rounded-3xl shadow-2xl border-2 border-[#1a1c24] p-2 flex items-center gap-2">
          <button className="px-6 py-3 text-white/50 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
            {form.status}
          </button>
          <div className="w-px h-6 bg-white/10" />
          <button onClick={() => setIsSidebarOpen(true)} className="p-3 text-white/50 hover:text-white rounded-2xl">
            <SettingsIcon size={20} />
          </button>
          <button 
            onClick={handlePublish}
            disabled={isSaving || isLimitExceeded}
            className={`px-8 py-3 bg-[#ff1a1a] text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-red-200 transition-all ${isLimitExceeded ? 'opacity-30 grayscale cursor-not-allowed' : 'hover:scale-105'}`}
          >
            {isSaving ? <Zap className="animate-spin" size={14}/> : 'Publish'}
          </button>
        </div>
      </div>

      {showShareModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="fixed inset-0 bg-[#0a0b10]/60 backdrop-blur-md" onClick={() => setShowShareModal(false)} />
          <div className="relative bg-white rounded-[2.5rem] p-10 max-w-lg w-full space-y-8 shadow-2xl animate-in zoom-in-95 duration-300 border-2 border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-black text-[#0a0b10] tracking-tight italic uppercase">Form Published!</h3>
              <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all"><X size={24}/></button>
            </div>
            <div className="space-y-6">
              <div className="p-4 bg-green-50 text-green-700 font-bold rounded-2xl border border-green-100">Your form is now live and secure.</div>
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Share Link</p>
                <div className="flex gap-2">
                  <input readOnly className="flex-1 bg-gray-50 p-4 rounded-2xl font-bold text-sm" value={`${window.location.origin}/#/run/${form.id}`} />
                  <button onClick={() => copyToClipboard(`${window.location.origin}/#/run/${form.id}`)} className="p-4 bg-[#ff1a1a] text-white rounded-2xl shadow-lg">{copied ? <Check size={20}/> : <Copy size={20}/>}</button>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Form ID</p>
                <div className="flex gap-2">
                  <input readOnly className="flex-1 bg-gray-50 p-4 rounded-2xl font-bold text-sm" value={form.id} />
                  <button onClick={() => copyToClipboard(form.id)} className="p-4 bg-[#0a0b10] text-white rounded-2xl shadow-lg">{copied ? <Check size={20}/> : <Copy size={20}/>}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <SettingsSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} settings={form.settings} onUpdate={(updates) => dispatch({ type: 'UPDATE_SETTINGS', payload: updates })} />
    </div>
  );
};

export default FormEditor;
