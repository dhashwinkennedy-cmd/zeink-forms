
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Plus, ImageIcon, Type, Mail, Phone, ListChecks, AlignLeft, Layout, ChevronRight, X, Trash2, Check, Info, RotateCcw, Loader2, Menu } from 'lucide-react';
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
  }, [form.id, form.updatedAt]);

  const handleStateUpdate = (updated: Form) => {
    setCurrentForm(updated);
    onUpdateForm(updated);
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

  const activePage = currentForm.pages[activePageIndex];

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
          Page {activePageIndex + 1}: {activePage.title}
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
              className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all border-2 ${activePageIndex === idx ? 'bg-[#ff1a1a] border-[#ff1a1a] text-white' : 'bg-transparent border-gray-50 text-gray-400'}`}
            >
              <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-black ${activePageIndex === idx ? 'bg-white/20' : 'bg-gray-100'}`}>{idx + 1}</span>
              <span className="font-black text-[10px] uppercase tracking-widest truncate">{page.title}</span>
            </div>
          ))}
          <button onClick={addPage} className="w-full mt-2 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-100 rounded-xl text-[9px] font-black uppercase text-gray-300 hover:text-[#ff1a1a] transition-all">
            <Plus className="w-3.5 h-3.5" /> Add Page
          </button>
        </div>
      </div>

      {/* CENTER: EDITOR */}
      <div className="flex-1 overflow-y-auto pb-48 custom-scrollbar flex flex-col items-center">
        <div className="w-full max-w-3xl px-4 sm:px-8 py-6 sm:py-10">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-[#0a0b10] mb-8 font-black text-[9px] uppercase tracking-widest transition-all">
            <ChevronLeft className="w-4 h-4" />
            Exit Editor
          </button>

          <div className="space-y-6 sm:space-y-10">
            {/* Header Card */}
            <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-50">
              <div className="h-40 sm:h-64 bg-gray-50 relative group flex items-center justify-center overflow-hidden">
                {currentForm.bannerUrl ? (
                  <img src={currentForm.bannerUrl} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 opacity-20">
                    <ImageIcon className="w-8 h-8 text-[#ff1a1a]" />
                    <p className="text-[8px] font-black uppercase">No Banner</p>
                  </div>
                )}
                <div className={`absolute inset-0 bg-black/40 ${isUploadingBanner ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} flex items-center justify-center transition-all duration-300`}>
                  <button onClick={() => bannerInputRef.current?.click()} className="bg-white text-[#0a0b10] px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest">
                    {currentForm.bannerUrl ? 'Change' : 'Upload'}
                  </button>
                </div>
              </div>
              <div className="px-6 sm:px-10 py-6 sm:py-10 text-left">
                <input 
                  type="text" 
                  className="w-full text-xl sm:text-3xl font-black text-[#0a0b10] bg-transparent border-none outline-none mb-2 placeholder-gray-100"
                  value={currentForm.title}
                  onChange={(e) => handleStateUpdate({ ...currentForm, title: e.target.value })}
                  placeholder="Form Name"
                />
                <textarea 
                  className="w-full text-xs sm:text-sm text-gray-400 font-bold bg-transparent border-none outline-none placeholder-gray-100 resize-none h-10"
                  value={currentForm.subtitle}
                  onChange={(e) => handleStateUpdate({ ...currentForm, subtitle: e.target.value })}
                  placeholder="Description..."
                />
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6 flex flex-col items-center w-full">
              {activePage.fields.length === 0 ? (
                <div className="w-full py-16 flex flex-col items-center text-gray-300 border-2 border-dashed border-gray-100 rounded-[1.5rem] sm:rounded-[2.5rem] bg-white/50 cursor-pointer" onClick={() => setShowAddMenu(true)}>
                  <Plus className="w-6 h-6 text-[#ff1a1a] mb-2" />
                  <p className="text-[9px] font-black uppercase tracking-widest">Add a question</p>
                </div>
              ) : (
                activePage.fields.map((field) => (
                  <div key={field.id} className="w-full">
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
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl p-4 sm:p-6 w-[280px] sm:w-[380px] border border-gray-100 grid grid-cols-3 gap-2 sm:gap-4 animate-in slide-in-from-bottom-2">
              {[
                { type: 'TEXT', icon: Type, label: 'Text' },
                { type: 'EMAIL', icon: Mail, label: 'Email' },
                { type: 'PHONE', icon: Phone, label: 'Phone' },
                { type: 'MCQ', icon: ListChecks, label: 'Choices' },
                { type: 'ONE_LINE', icon: AlignLeft, label: 'Short' },
                { type: 'LONG_TEXT', icon: Layout, label: 'Long' },
              ].map((item) => (
                <button key={item.type} onClick={() => addField(item.type as FieldType)} className="flex flex-col items-center gap-1.5 p-3 hover:bg-red-50 rounded-xl transition-all">
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-[#0a0b10] group-hover:bg-[#ff1a1a] transition-all"><item.icon className="w-4 h-4" /></div>
                  <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest text-gray-500">{item.label}</span>
                </button>
              ))}
            </div>
          )}
          <button onClick={() => setShowAddMenu(!showAddMenu)} className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-2xl transition-all ${showAddMenu ? 'bg-[#0a0b10] rotate-45' : 'bg-[#ff1a1a]'}`}>
            <Plus className="w-6 h-6 sm:w-8 h-8 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};
