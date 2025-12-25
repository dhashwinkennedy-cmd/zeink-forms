
import React, { useEffect } from 'react';
import { Trash2, GripVertical, Check, Plus, BrainCircuit, Zap, Database, ListChecks, Smartphone, Mail, Image as ImageIcon, X, Lock, Trophy, Copy, Calendar } from 'lucide-react';
import { FormField, FieldType, Option, AIApproveMode } from '../../types';
import { FIELD_TYPE_LABELS } from '../../constants';

interface FieldEditorProps {
  field: FormField;
  isPublic: boolean;
  onUpdate: (updates: Partial<FormField>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
}

const FieldEditor: React.FC<FieldEditorProps> = ({ field, isPublic, onUpdate, onRemove, onDuplicate }) => {
  // Logic to determine if points are applicable
  const isScoringActive = () => {
    if (isPublic) return false;
    if (field.type === FieldType.SHORT_TEXT) {
      return (field.correctAnswers && field.correctAnswers.length > 0) || (field.aiEvalMode && field.aiEvalMode !== AIApproveMode.NONE);
    }
    if (field.type === FieldType.LONG_TEXT) {
      return field.aiEvalMode && field.aiEvalMode !== AIApproveMode.NONE;
    }
    return false;
  };

  // Set default points when scoring is first activated
  useEffect(() => {
    if (isScoringActive() && (field.points === undefined || field.points === 0)) {
      const defaultPoints = field.type === FieldType.SHORT_TEXT ? 2 : 3;
      onUpdate({ points: defaultPoints });
    }
  }, [field.aiEvalMode, field.correctAnswers?.length, field.type]);

  const addOption = () => {
    const newOptions = [...(field.options || []), { id: `o${Date.now()}`, text: '', isCorrect: false, points: 0 }];
    onUpdate({ options: newOptions });
  };

  const updateOption = (id: string, updates: Partial<Option>) => {
    const newOptions = field.options?.map(o => o.id === id ? { ...o, ...updates } : o);
    onUpdate({ options: newOptions });
  };

  const removeOption = (id: string) => {
    onUpdate({ options: field.options?.filter(o => o.id !== id) });
  };

  const addCorrectAnswer = () => {
    const answers = [...(field.correctAnswers || []), ''];
    onUpdate({ correctAnswers: answers });
  };

  const updateCorrectAnswer = (idx: number, val: string) => {
    const answers = [...(field.correctAnswers || [])];
    answers[idx] = val;
    onUpdate({ correctAnswers: answers });
  };

  const removeCorrectAnswer = (idx: number) => {
    onUpdate({ correctAnswers: (field.correctAnswers || []).filter((_, i) => i !== idx) });
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const type = file.type.startsWith('video') ? 'video' : 'image';
      onUpdate({ 
        mediaUrl: URL.createObjectURL(file),
        mediaType: type
      });
    }
  };

  const getAicost = () => {
    let cost = 0;
    if (field.type === FieldType.MCQ && field.allowOther && field.autoAIEval) cost += 1;
    if (field.type === FieldType.SHORT_TEXT || field.type === FieldType.LONG_TEXT) {
      if (field.aiEvalMode === AIApproveMode.AUTO) cost += 1;
      if (field.aiEvalMode === AIApproveMode.PROMPT) cost += 2;
    }
    if (field.type === FieldType.LONG_TEXT && field.aiTagging) cost += 1;
    return cost;
  };

  const cost = getAicost();

  const getPlaceholder = () => {
    if (field.type === FieldType.HEADING) return "What is your heading?";
    if (field.type === FieldType.NORMAL_TEXT) return "What is your instruction?";
    if (field.type === FieldType.DATE) return "What is the date for?";
    return "What is your question?";
  };

  const scoringVisible = isScoringActive();

  return (
    <div className="space-y-4 group relative">
      {/* PRIMARY DATA BLOCK */}
      <div className="bg-white rounded-3xl border p-8 shadow-sm hover:border-[#ff1a1a] transition-all relative">
        <div className="flex items-start gap-6">
          <div className="cursor-grab text-gray-200 pt-2 group-hover:text-gray-400 transition-colors">
            <GripVertical size={24} />
          </div>
          
          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black text-gray-400 bg-white px-2.5 py-1.5 rounded-lg border tracking-widest flex items-center gap-2">
                  {field.type === FieldType.DATE ? <Calendar size={12} /> : <Database size={12} />} {FIELD_TYPE_LABELS[field.type]}
                </span>
                {cost > 0 && !isPublic && (
                  <div className="flex items-center gap-1 bg-white text-[#ff1a1a] px-2 py-1 rounded-lg text-[10px] font-black border border-[#ff1a1a]">
                    <Zap size={10} className="fill-[#ff1a1a]" /> ⚡{cost} AI
                  </div>
                )}
                {scoringVisible && (
                  <div className="flex items-center gap-2 bg-[#fdebeb] text-[#ff1a1a] px-3 py-1 rounded-xl border border-[#ff1a1a]/20">
                    <Trophy size={12} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Points</span>
                    <input 
                      type="number" 
                      className="w-10 bg-transparent text-center font-black focus:outline-none"
                      value={field.points || 0}
                      onChange={(e) => onUpdate({ points: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={onDuplicate}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Duplicate Field"
                >
                  <Copy size={20} />
                </button>
                <button 
                  onClick={() => document.getElementById(`media-input-${field.id}`)?.click()}
                  className="p-2 text-gray-400 hover:text-[#ff1a1a] transition-colors"
                  title="Add Image/Video"
                >
                  <ImageIcon size={20} />
                </button>
                <input id={`media-input-${field.id}`} type="file" className="hidden" accept="image/*,video/*" onChange={handleMediaUpload} />
                <label className="flex items-center gap-2 cursor-pointer group/req">
                  <input 
                    type="checkbox" 
                    checked={field.required} 
                    onChange={(e) => onUpdate({ required: e.target.checked })}
                    className="w-4 h-4 rounded-lg border-2 border-gray-200 text-[#ff1a1a] focus:ring-[#ff1a1a]"
                  />
                  <span className="text-[10px] font-black uppercase text-gray-400 group-hover/req:text-[#ff1a1a] transition-colors tracking-widest">Required</span>
                </label>
                <button onClick={onRemove} className="text-gray-200 hover:text-red-600 transition-colors p-2">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            {field.mediaUrl && (
              <div className="relative group/media rounded-2xl overflow-hidden border bg-gray-50 max-h-[300px] flex items-center justify-center">
                {field.mediaType === 'video' ? <video src={field.mediaUrl} className="max-h-[300px] w-full object-contain" controls /> : <img src={field.mediaUrl} alt="Field" className="max-h-[300px] w-full object-contain" />}
                <button onClick={() => onUpdate({ mediaUrl: undefined, mediaType: undefined })} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-red-600 opacity-0 group-hover/media:opacity-100 transition-all"><X size={16} /></button>
              </div>
            )}

            <input 
              type="text" 
              placeholder={getPlaceholder()}
              className="w-full text-2xl font-black bg-white focus:outline-none border-b-2 border-transparent focus:border-gray-100 pb-3"
              value={field.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
            />

            {field.type === FieldType.DATE && (
              <div className="p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 text-sm font-bold flex items-center gap-2">
                <Calendar size={18} /> Date Input Preview
              </div>
            )}

            {(field.type === FieldType.EMAIL || field.type === FieldType.PHONE) && (
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer group/otp">
                  <input type="checkbox" checked={field.otpVerification} onChange={(e) => onUpdate({ otpVerification: e.target.checked })} className="w-4 h-4 rounded-lg border-2 border-gray-200 text-[#ff1a1a] focus:ring-[#ff1a1a]" />
                  <span className="text-[10px] font-black uppercase text-gray-400 group-hover/otp:text-[#ff1a1a] transition-colors tracking-widest flex items-center gap-1">
                    {field.type === FieldType.EMAIL ? <Mail size={12} /> : <Smartphone size={12} />} Verify with OTP (Dummy)
                  </span>
                </label>
              </div>
            )}

            {field.type === FieldType.MCQ && (
              <div className="space-y-4">
                {field.options?.map((option, idx) => (
                  <div key={option.id} className="flex items-center gap-4">
                    <button 
                      onClick={() => !isPublic && updateOption(option.id, { isCorrect: !option.isCorrect })}
                      disabled={isPublic}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all ${option.isCorrect ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-200'} ${isPublic ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                      {option.isCorrect && <Check size={18} />}
                    </button>
                    <input type="text" placeholder={`Option ${idx + 1}`} className="flex-1 bg-white focus:outline-none border-b-2 border-gray-50 py-2 font-bold" value={option.text} onChange={(e) => updateOption(option.id, { text: e.target.value })} />
                    {!isPublic && (
                      <div className="flex items-center gap-2 bg-white rounded-xl p-2 border">
                        <span className="text-[10px] font-black text-gray-400">PTS</span>
                        <input type="number" className="w-12 bg-white text-center text-sm font-black focus:outline-none" value={option.points} onChange={(e) => updateOption(option.id, { points: parseFloat(e.target.value) || 0 })} />
                      </div>
                    )}
                    <button onClick={() => removeOption(option.id)} className="text-gray-200 hover:text-red-500 p-2"><Trash2 size={16} /></button>
                  </div>
                ))}
                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <button onClick={addOption} className="text-[#ff1a1a] text-xs font-black uppercase tracking-widest flex items-center gap-2 px-4 py-2 border border-transparent hover:border-[#ff1a1a] rounded-xl transition-all"><Plus size={14} /> Add Option</button>
                  {!isPublic && (
                    <button onClick={() => onUpdate({ allowOther: !field.allowOther })} className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 px-4 py-2 border rounded-xl transition-all ${field.allowOther ? 'bg-white text-blue-600 border-[#ff1a1a]' : 'text-gray-400 border-transparent hover:border-gray-200'}`}><Plus size={14} /> "Other" Answer</button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ACCEPTED ANSWERS BLOCK (SHORT TEXT ONLY) */}
      {field.type === FieldType.SHORT_TEXT && (
        <div className={`bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-4 relative ${isPublic ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
          {isPublic && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/10 backdrop-blur-[1px]">
               <div className="bg-white px-4 py-2 rounded-xl shadow-lg border-2 border-gray-100 flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-gray-400">
                 <Lock size={14} /> Disabled in Public Mode
               </div>
            </div>
          )}
          <h5 className="font-black text-xs uppercase tracking-widest flex items-center gap-2 text-gray-500">
            <ListChecks size={18} /> Accepted Answers
          </h5>
          <div className="space-y-2">
            {field.correctAnswers?.map((ans, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <input type="text" className="flex-1 bg-white border rounded-xl px-4 py-2 font-bold focus:outline-none focus:border-[#ff1a1a]" placeholder="Expected Answer Text" value={ans} onChange={(e) => updateCorrectAnswer(idx, e.target.value)} />
                <button onClick={() => removeCorrectAnswer(idx)} className="text-gray-200 hover:text-red-500 p-2"><Trash2 size={16} /></button>
              </div>
            ))}
            <button onClick={addCorrectAnswer} className="text-[#ff1a1a] text-xs font-black uppercase tracking-widest flex items-center gap-2 px-4 py-2 border border-dashed border-[#ff1a1a]/30 hover:border-[#ff1a1a] rounded-xl transition-all"><Plus size={14} /> Add Expected Answer</button>
          </div>
        </div>
      )}

      {/* AI EVALUATION BLOCK */}
      {((field.type === FieldType.MCQ && field.allowOther) || field.type === FieldType.SHORT_TEXT || field.type === FieldType.LONG_TEXT) && (
        <div className={`bg-white rounded-3xl border-2 border-dashed border-gray-100 p-8 shadow-sm space-y-6 relative ${isPublic ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
          {isPublic && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/10 backdrop-blur-[1px]">
               <div className="bg-white px-4 py-2 rounded-xl shadow-lg border-2 border-gray-100 flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-gray-400">
                 <Lock size={14} /> AI Eval Disabled in Surveys
               </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <h5 className="font-black text-xs uppercase tracking-widest flex items-center gap-2">
              <BrainCircuit size={18} className="text-[#ff1a1a]" /> AI Evaluation
            </h5>
            
            {(field.type === FieldType.SHORT_TEXT || field.type === FieldType.LONG_TEXT) && (
              <select className="bg-white border rounded-xl px-4 py-2 text-xs font-black uppercase tracking-tighter focus:outline-none focus:ring-2 focus:ring-[#ff1a1a]" value={field.aiEvalMode} onChange={(e) => onUpdate({ aiEvalMode: e.target.value as AIApproveMode })}>
                <option value={AIApproveMode.NONE}>No AI Evaluation</option>
                <option value={AIApproveMode.AUTO}>Auto Scoring (⚡1)</option>
                <option value={AIApproveMode.PROMPT}>Custom Logic (⚡2)</option>
              </select>
            )}

            {field.type === FieldType.MCQ && (
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase text-gray-400">AI Eval for "Other" (⚡1)</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={field.autoAIEval} onChange={(e) => onUpdate({ autoAIEval: e.target.checked })} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            )}
          </div>

          {field.aiEvalMode === AIApproveMode.PROMPT && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <p className="text-[10px] font-black uppercase text-[#ff1a1a] tracking-widest">Specific Evaluation Instructions</p>
              <textarea className="w-full bg-white border-2 border-gray-100 rounded-2xl p-4 text-sm font-medium focus:border-[#ff1a1a] focus:outline-none transition-all min-h-[100px]" placeholder="E.g., 'Grade strictly on technical vocabulary...'" value={field.aiPrompt} onChange={(e) => onUpdate({ aiPrompt: e.target.value })} />
            </div>
          )}

          {field.type === FieldType.LONG_TEXT && (
            <div className="flex items-center justify-between pt-4 border-t border-dashed">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Metadata Analysis (⚡1)</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase italic">Extract sentiment and key themes</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={field.aiTagging} onChange={(e) => onUpdate({ aiTagging: e.target.checked })} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff1a1a]"></div>
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FieldEditor;
