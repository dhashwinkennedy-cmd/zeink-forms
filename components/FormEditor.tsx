
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Plus, ImageIcon, Type, Mail, Phone, ListChecks, AlignLeft, Layout, ChevronRight, X, Trash2, Check, Info, RotateCcw, Menu, Globe, Lock } from 'lucide-react';
import { Form, Field, FieldType, Page } from '../types.ts';
import { FieldEditor } from './FieldEditor.tsx';

interface FormEditorProps {
  form: Form;
  onBack: () => void;
  onUpdateForm: (form: Form) => void;
}

export const FormEditor: React.FC<FormEditorProps> = ({ form, onBack, onUpdateForm }) => {
  const [currentForm, setCurrentForm] = useState<Form>(form);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setShowAddMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setCurrentForm(form);
  }, [form.id]);

  const handleStateUpdate = (updated: Form) => {
    setCurrentForm(updated);
    onUpdateForm(updated);
  };

  const toggleStatus = () => {
    const newStatus = currentForm.status === 'published' ? 'draft' : 'published';
    handleStateUpdate({ ...currentForm, status: newStatus });
  };

  const addPage = () => {
    const newPage: Page = {
      id: Math.random().toString(36).substr(2, 9),
      title: `Page ${currentForm.pages.length + 1}`,
      fields: [],
      navigationControl: { allowRevisiting: true },
      redirectionLogics: []
    };
    handleStateUpdate({ ...currentForm, pages: [...currentForm.pages, newPage] });
    setActivePageIndex(currentForm.pages.length);
    setShowSidebar(false);
  };

  const deletePage = (idx: number) => {
    if (currentForm.pages.length <= 1) return;
    const newPages = currentForm.pages.filter((_, i) => i !== idx);
    handleStateUpdate({ ...currentForm, pages: newPages });
    if (activePageIndex >= newPages.length) {
      setActivePageIndex(Math.max(0, newPages.length - 1));
    }
  };

  const addField = (type: FieldType) => {
    const newField: Field = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      label: type === 'TEXT' ? '' : `Question ${activePage.fields.length + 1}`,
      required: false,
      points: 0,
      negativeMarking: false,
      negativeMarkingValue: 0.5,
      aiSettings: { mode: 'NONE' },
      options: type === 'MCQ' ? [] : undefined
    };

    const updatedPages = [...currentForm.pages];
    updatedPages[activePageIndex] = {
      ...updatedPages[activePageIndex],
      fields: [...updatedPages[activePageIndex].fields, newField]
    };
    handleStateUpdate({ ...currentForm, pages: updatedPages });
    setShowAddMenu(false);
  };

  const updateField = (fieldId: string, updatedField: Field) => {
    const updatedPages = [...currentForm.pages];
    updatedPages[activePageIndex] = {
      ...updatedPages[activePageIndex],
      fields: updatedPages[activePageIndex].fields.map(f => f.id === fieldId ? updatedField : f)
    };
    handleStateUpdate({ ...currentForm, pages: updatedPages });
  };

  const deleteField = (fieldId: string) => {
    const updatedPages = [...currentForm.pages];
    updatedPages[activePageIndex] = {
      ...updatedPages[activePageIndex],
      fields: updatedPages[activePageIndex].fields.filter(f => f.id !== fieldId)
    };
    handleStateUpdate({ ...currentForm, pages: updatedPages });
  };

  const activePage = currentForm.pages[activePageIndex] || currentForm.pages[0];

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#FDF0F0] overflow-hidden pt-16">
      <input 
        type="file" 
        ref={bannerInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setIsUploadingBanner(true);
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            handleStateUpdate({ ...currentForm, bannerUrl: reader.result as string });
            setIsUploadingBanner(false);
          };
        }} 
      />

      {/* MOBILE PAGE BAR */}
      <div className="lg:hidden bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between z-50">
        <button onClick={() => setShowSidebar(true)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#0a0b10]">
          <Menu className="w-4 h-4 text-[#ff1a1a]" />
          Page {activePageIndex + 1}: {activePage?.title}
        </button>
        <button onClick={addPage} className="p-1.5 bg-red-50 text-[#ff1a1a] rounded-lg"><Plus className="w-4 h-4" /></button>
      </div>

      {/* SIDEBAR: PAGES */}
      <div className={`fixed inset-0 z-[110] lg:relative lg:inset-auto lg:w-64 bg-white border-r border-gray-100 flex flex-col p-6 transition-transform lg:translate-x-0 ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff1a1a]">Pages</h3>
          <button onClick={() => setShowSidebar(false)} className="lg:hidden p-2"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar">
          {currentForm.pages.map((page, idx) => (
            <div 
              key={page.id}
              onClick={() => { setActivePageIndex(idx); setShowSidebar(false); }}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all border-2 ${activePageIndex === idx ? 'bg-[#ff1a1a] border-[#ff1a1a] text-white shadow-lg shadow-red-100' : 'bg-transparent border-gray-50 text-gray-400 hover:border-gray-200'}`}
            >
              <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-black ${activePageIndex === idx ? 'bg-white/20' : 'bg-gray-100'}`}>{idx + 1}</span>
              <span className="font-black text-[10px] uppercase tracking-widest truncate flex-1">{page.title}</span>
              {currentForm.pages.length > 1 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); deletePage(idx); }} 
                  className={`opacity-0 group-hover:opacity-100 p-1 rounded-md transition-all ${activePageIndex === idx ? 'hover:bg-white/20 text-white' : 'hover:bg-gray-100 text-gray-300'}`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          <button onClick={addPage} className="w-full mt-2 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-100 rounded-xl text-[9px] font-black uppercase text-gray-300 hover:text-[#ff1a1a] hover:border-[#ff1a1a]/20 transition-all">
            <Plus className="w-3.5 h-3.5" /> Add Page
          </button>
        </div>
      </div>

      {/* CENTER: EDITOR */}
      <div className="flex-1 overflow-y-auto pb-48 custom-scrollbar flex flex-col items-center">
        <div className="w-full max-w-3xl px-4 sm:px-8 py-6 sm:py-10">
          <div className="flex items-center justify-between mb-8">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-[#0a0b10] font-black text-[9px] uppercase tracking-widest transition-all group">
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Exit Architect
            </button>
            
            <button 
              onClick={toggleStatus}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${currentForm.status === 'published' ? 'bg-green-500 text-white shadow-lg shadow-green-100' : 'bg-gray-100 text-gray-400'}`}
            >
              {currentForm.status === 'published' ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              {currentForm.status === 'published' ? 'Published' : 'Draft'}
            </button>
          </div>

          <div className="space-y-6 sm:space-y-10">
            {/* Header Card */}
            <div className="bg-white rounded-[1.5rem] sm:rounded-[3rem] overflow-hidden shadow-sm border border-gray-50">
              <div className="h-40 sm:h-64 bg-gray-50 relative group flex items-center justify-center overflow-hidden">
                {currentForm.bannerUrl ? (
                  <img src={currentForm.bannerUrl} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 opacity-20">
                    <ImageIcon className="w-8 h-8 text-[#ff1a1a]" />
                    <p className="text-[8px] font-black uppercase">Standard Banner Empty</p>
                  </div>
                )}
                <div className={`absolute inset-0 bg-[#0a0b10]/40 ${isUploadingBanner ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} flex items-center justify-center transition-all duration-300 backdrop-blur-sm`}>
                  <button onClick={() => bannerInputRef.current?.click()} className="bg-white text-[#0a0b10] px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all">
                    {currentForm.bannerUrl ? 'Change Asset' : 'Inject Banner'}
                  </button>
                </div>
              </div>
              <div className="px-6 sm:px-12 py-8 sm:py-12 text-left bg-gradient-to-b from-white to-gray-50/30">
                <input 
                  type="text" 
                  className="w-full text-2xl sm:text-4xl font-black text-[#0a0b10] bg-transparent border-none outline-none mb-3 placeholder-gray-100 tracking-tighter"
                  value={currentForm.title}
                  onChange={(e) => handleStateUpdate({ ...currentForm, title: e.target.value })}
                  placeholder="Form Descriptor"
                />
                <textarea 
                  className="w-full text-xs sm:text-sm text-gray-400 font-bold bg-transparent border-none outline-none placeholder-gray-100 resize-none h-12 leading-relaxed"
                  value={currentForm.subtitle}
                  onChange={(e) => handleStateUpdate({ ...currentForm, subtitle: e.target.value })}
                  placeholder="Page Metadata / Secondary Title..."
                />
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6 flex flex-col items-center w-full">
              {activePage?.fields.length === 0 ? (
                <div className="w-full py-20 flex flex-col items-center text-gray-300 border-4 border-dashed border-gray-100 rounded-[2rem] sm:rounded-[3rem] bg-white/50 cursor-pointer group hover:border-[#ff1a1a]/20 transition-all" onClick={() => setShowAddMenu(true)}>
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 transition-colors group-hover:bg-red-50">
                    <Plus className="w-6 h-6 text-gray-200 group-hover:text-[#ff1a1a]" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">Deploy First Module</p>
                </div>
              ) : (
                activePage?.fields.map((field) => (
                  <div key={field.id} className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <FieldEditor 
                      field={field}
                      onUpdate={(f) => updateField(field.id, f)}
                      onDelete={() => deleteField(field.id)}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING ACTION BUTTON */}
      <div className="fixed bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-[120]" ref={addMenuRef}>
        <div className="relative">
          {showAddMenu && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-6 bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] p-4 sm:p-8 w-[320px] sm:w-[480px] border border-gray-100 grid grid-cols-3 gap-3 sm:gap-6 animate-in slide-in-from-bottom-4 zoom-in-95 duration-300">
              {[
                { type: 'TEXT', icon: Type, label: 'Text Block' },
                { type: 'EMAIL', icon: Mail, label: 'Email' },
                { type: 'PHONE', icon: Phone, label: 'Phone' },
                { type: 'MCQ', icon: ListChecks, label: 'Choices' },
                { type: 'ONE_LINE', icon: AlignLeft, label: 'Short Form' },
                { type: 'LONG_TEXT', icon: Layout, label: 'Long Form' },
              ].map((item) => (
                <button 
                  key={item.type} 
                  onClick={() => addField(item.type as FieldType)} 
                  className="flex flex-col items-center gap-3 p-4 hover:bg-red-50 rounded-[1.5rem] transition-all group"
                >
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-[#0a0b10] group-hover:bg-[#ff1a1a] group-hover:text-white transition-all shadow-sm">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-[#ff1a1a] transition-colors">{item.label}</span>
                </button>
              ))}
            </div>
          )}
          <button 
            onClick={() => setShowAddMenu(!showAddMenu)} 
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-90 ${showAddMenu ? 'bg-[#0a0b10] rotate-45' : 'bg-[#ff1a1a] shadow-red-200'}`}
          >
            <Plus className="w-8 h-8 sm:w-10 h-10 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};
