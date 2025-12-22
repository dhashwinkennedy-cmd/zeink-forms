
import React, { useRef, useState } from 'react';
import { Trash2, Plus, Check, Info, PlusCircle, Image as ImageIcon, Film, ShieldCheck, Upload, Loader2, X } from 'lucide-react';
import { Field, MCQOption, Media } from '../types.ts';

interface FieldEditorProps {
  field: Field;
  onUpdate: (field: Field) => void;
  onDelete: () => void;
}

export const FieldEditor: React.FC<FieldEditorProps> = ({ field, onUpdate, onDelete }) => {
  const [isProcessingMedia, setIsProcessingMedia] = useState<string | null>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const optionMediaInputRef = useRef<HTMLInputElement>(null);
  const [activeOptionId, setActiveOptionId] = useState<string | null>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'field' | string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500000) { // Keep field images smaller for performance
      alert("Image is a bit large. Try an image under 500KB.");
      return;
    }

    setIsProcessingMedia(target);
    try {
      const base64 = await fileToBase64(file);
      const media: Media = { type: 'image', url: base64, title: file.name };
      
      if (target === 'field') {
        onUpdate({ ...field, media });
      } else {
        const newOptions = field.options?.map(opt => opt.id === target ? { ...opt, media } : opt);
        onUpdate({ ...field, options: newOptions });
      }
    } catch (err) {
      console.error("Media upload failed", err);
    } finally {
      setIsProcessingMedia(null);
      setActiveOptionId(null);
    }
  };

  const updateOption = (optionId: string, updates: Partial<MCQOption>) => {
    const newOptions = field.options?.map(opt => opt.id === optionId ? { ...opt, ...updates } : opt);
    onUpdate({ ...field, options: newOptions });
  };

  const addOption = (isOther: boolean = false) => {
    if (isOther && field.options?.some(o => o.isOther)) return;
    const newOption: MCQOption = {
      id: Math.random().toString(36).substr(2, 9),
      label: isOther ? 'Other...' : '', 
      isCorrect: false,
      points: 0,
      isOther
    };
    onUpdate({ ...field, options: [...(field.options || []), newOption] });
  };

  const removeOption = (optionId: string) => {
    onUpdate({ ...field, options: field.options?.filter(o => o.id !== optionId) });
  };

  const hasOther = field.options?.some(o => o.isOther);
  const isPureTextOrMedia = field.type === 'TEXT';
  const supportsOTP = field.type === 'PHONE' || field.type === 'EMAIL';

  return (
    <div className="bg-white p-6 rounded-[1.8rem] shadow-sm border-l-4 border-[#ff1a1a] space-y-5 transition-all w-full relative group/editor">
      {/* Hidden inputs */}
      <input type="file" ref={mediaInputRef} className="hidden" accept="image/*" onChange={(e) => handleMediaUpload(e, 'field')} />
      <input type="file" ref={optionMediaInputRef} className="hidden" accept="image/*" onChange={(e) => handleMediaUpload(e, activeOptionId || '')} />

      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 space-y-3">
          <input 
            type="text"
            className={`w-full font-black text-[#0a0b10] bg-transparent outline-none placeholder-gray-300 ${field.type === 'TEXT' ? 'text-2xl' : 'text-xl'}`}
            value={field.label}
            onChange={(e) => onUpdate({ ...field, label: e.target.value })}
            placeholder={field.type === 'TEXT' ? "Enter text block here..." : "Question / Label"}
          />
          
          {field.type !== 'TEXT' && (
            <input 
              type="text"
              className="w-full text-[#0a0b10] bg-transparent outline-none placeholder-gray-400 font-medium text-xs"
              value={field.subtitle || ''}
              onChange={(e) => onUpdate({ ...field, subtitle: e.target.value })}
              placeholder="Help text (optional)..."
            />
          )}

          {!field.media ? (
            <div className="flex gap-4 pt-1">
              <button 
                onClick={() => mediaInputRef.current?.click()} 
                className="text-[10px] font-black flex items-center gap-1.5 text-gray-500 hover:text-[#ff1a1a] transition-all"
              >
                {isProcessingMedia === 'field' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />} 
                Add Media
              </button>
            </div>
          ) : (
            <div className="relative group rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 p-3 inline-block">
              <img src={field.media.url} alt="Media" className="rounded-xl object-contain max-h-[250px] w-full" />
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => onUpdate({ ...field, media: undefined })} 
                  className="p-2 bg-white text-red-500 rounded-lg shadow-xl hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
        <button onClick={onDelete} className="text-gray-200 hover:text-red-500 transition-all p-2"><Trash2 className="w-5 h-5" /></button>
      </div>

      {field.type === 'MCQ' && (
        <div className="space-y-4 pt-4 border-t border-gray-50">
          <div className="space-y-3">
            {field.options?.map((option) => (
              <div key={option.id} className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl transition-all border border-transparent hover:border-red-50">
                  <input 
                    type="text"
                    readOnly={option.isOther}
                    className={`flex-1 bg-transparent border-none outline-none font-bold text-xs text-[#0a0b10] placeholder-gray-400 ${option.isOther ? 'text-gray-400 italic' : ''}`}
                    value={option.label}
                    onChange={(e) => updateOption(option.id, { label: e.target.value })}
                    placeholder={option.isOther ? "Other..." : "Choice label..."}
                  />
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => { setActiveOptionId(option.id); optionMediaInputRef.current?.click(); }}
                      className={`p-2 rounded-lg transition-all ${option.media ? 'bg-red-50 text-[#ff1a1a]' : 'text-gray-300 hover:text-[#ff1a1a] hover:bg-red-50'}`}
                    >
                      {isProcessingMedia === option.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
                    </button>
                    
                    <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                      <input type="number" step="0.5" className="w-10 bg-transparent border-none text-[10px] font-black text-[#0a0b10] outline-none text-center" value={option.points} onChange={(e) => updateOption(option.id, { points: parseFloat(e.target.value) || 0 })} />
                      <div 
                        onClick={() => updateOption(option.id, { isCorrect: !option.isCorrect })}
                        className={`w-8 h-4 rounded-full p-0.5 transition-colors cursor-pointer ${option.isCorrect ? 'bg-green-500' : 'bg-gray-200'}`}
                      >
                        <div className={`w-3 h-3 bg-white rounded-full shadow-md transition-all ${option.isCorrect ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                    </div>
                    
                    <button onClick={() => removeOption(option.id)} className="p-1.5 text-gray-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>

                {option.media && (
                  <div className="relative group ml-12 rounded-xl overflow-hidden border border-gray-100 bg-white p-2 inline-block">
                    <img src={option.media.url} alt="Option Media" className="h-16 rounded-lg object-contain" />
                    <button 
                      onClick={() => updateOption(option.id, { media: undefined })}
                      className="absolute -top-1 -right-1 p-1 bg-white text-red-500 rounded-full shadow-lg border border-gray-50 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => addOption(false)} className="text-[10px] text-[#ff1a1a] font-black uppercase tracking-widest flex items-center gap-1.5 hover:scale-105 transition-transform"><Plus className="w-3.5 h-3.5" /> Add choice</button>
            {!hasOther && <button onClick={() => addOption(true)} className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-1.5 hover:scale-105 transition-transform"><PlusCircle className="w-3.5 h-3.5" /> Add other</button>}
          </div>
        </div>
      )}

      {!isPureTextOrMedia && (
        <div className="pt-4 border-t border-gray-50 flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-3 cursor-pointer group select-none">
            <div className="relative">
              <input 
                type="checkbox" 
                checked={field.required} 
                onChange={(e) => onUpdate({ ...field, required: e.target.checked })} 
                className="peer h-5 w-5 cursor-pointer appearance-none rounded-lg border-2 border-gray-200 bg-white checked:border-[#ff1a1a] checked:bg-[#ff1a1a] transition-all" 
              />
              <Check className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
            </div>
            <span className="text-[10px] font-black text-[#0a0b10] uppercase tracking-widest">Required</span>
          </label>
          
          <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#0a0b10]">Default Points</span>
            <input 
              type="number" 
              step="0.5" 
              className="w-16 bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none text-[#0a0b10] font-black text-center" 
              value={field.points} 
              onChange={(e) => onUpdate({ ...field, points: parseFloat(e.target.value) || 0 })} 
            />
          </div>
        </div>
      )}
    </div>
  );
};
