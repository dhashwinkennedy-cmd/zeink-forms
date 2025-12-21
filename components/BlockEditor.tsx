import React from 'react';
import { Trash2, GripVertical, Image as ImageIcon, Video, Settings2, Plus, Lock, Sparkles, AlertCircle, ToggleRight, ToggleLeft } from 'lucide-react';
import { Block, BlockType } from '../types';
import { useStore } from '../store';

interface BlockEditorProps {
  block: Block;
}

const BlockEditor: React.FC<BlockEditorProps> = ({ block }) => {
  const { updateBlock, removeBlock, addMCQOption, updateMCQOption, removeMCQOption } = useStore();

  const handleEqualSplit = () => {
    if (!block.options) return;
    const correctCount = block.options.filter(o => o.isCorrect).length;
    if (correctCount === 0) return;
    const splitPoints = (block.totalPoints || 0) / correctCount;
    block.options.forEach(o => {
      if (o.isCorrect) updateMCQOption(block.id, o.id, { points: splitPoints });
      else updateMCQOption(block.id, o.id, { points: 0 });
    });
  };

  const totalCorrectPoints = block.options?.reduce((acc, o) => acc + (o.isCorrect ? o.points : 0), 0) || 0;
  const validationError = block.type === BlockType.MCQ && 
    block.totalPoints !== undefined && 
    block.totalPoints > 0 && 
    Math.abs(totalCorrectPoints - block.totalPoints) > 0.001;

  const isInfoOnly = block.type === BlockType.INFO;
  const isMediaAttachment = block.type === BlockType.TEXT_MEDIA;
  const isTextType = block.type === BlockType.SHORT_TEXT || block.type === BlockType.LONG_TEXT;
  const isMCQ = block.type === BlockType.MCQ;
  const canBeRequired = !isInfoOnly && !isMediaAttachment;

  // Show AI section if it's text type OR if it's MCQ with "Other" enabled
  const showAIGrading = isTextType || (isMCQ && block.allowOther);

  return (
    <div className={`bg-white rounded-2xl border ${validationError ? 'border-primary shadow-lg shadow-primary/5' : 'border-gray-100'} p-6 group transition-all relative overflow-hidden`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <GripVertical className="text-gray-300 cursor-grab" />
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{block.type.replace('_', ' ')}</span>
        </div>
        <div className="flex items-center gap-2">
          {!isMediaAttachment && (
            <>
              <button className="p-2 text-gray-400 hover:text-primary transition-colors"><ImageIcon size={18} /></button>
              <button className="p-2 text-gray-400 hover:text-primary transition-colors"><Video size={18} /></button>
            </>
          )}
          <button onClick={() => removeBlock(block.id)} className="text-gray-400 hover:text-primary transition-colors ml-1">
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="mb-2">
        <input 
          type="text"
          value={block.title}
          onChange={(e) => updateBlock(block.id, { title: e.target.value })}
          className="w-full text-lg font-bold text-secondary focus:outline-none focus:border-b-2 focus:border-primary border-b border-transparent pb-1 bg-white"
          placeholder={isInfoOnly ? "Info Title" : isMediaAttachment ? "Upload Prompt (e.g. Upload ID Proof)" : "Question Title"}
        />
      </div>

      <div className="mb-4">
        <textarea 
          value={block.content}
          onChange={(e) => updateBlock(block.id, { content: e.target.value })}
          className="w-full text-gray-600 text-sm focus:outline-none bg-white rounded-xl p-3 resize-none border border-gray-100 focus:border-primary transition-colors"
          placeholder={isInfoOnly ? "Information or description..." : "Add more details or a prompt (Optional)"}
          rows={isInfoOnly ? 4 : 2}
        />
      </div>

      {isMCQ && (
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-secondary uppercase tracking-widest">OPTIONS</h4>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={block.allowOther} 
                onChange={e => updateBlock(block.id, { allowOther: e.target.checked })} 
                className="accent-primary w-4 h-4 rounded border-gray-300"
              />
              <span className="text-[10px] font-bold text-gray-400 group-hover:text-secondary uppercase tracking-tighter">Allow "Other"</span>
            </label>
          </div>
          
          {block.options?.map((option, idx) => (
            <div key={option.id} className="flex items-center gap-3">
              <input 
                type="text"
                value={option.text}
                onChange={(e) => updateMCQOption(block.id, option.id, { text: e.target.value })}
                className="flex-1 text-sm bg-white px-3 py-2 rounded-lg border border-gray-100 focus:border-primary focus:outline-none transition-colors"
                placeholder={`Option ${idx + 1}`}
              />
              
              <div className="flex items-center gap-4 ml-2">
                <label className="flex items-center gap-2 cursor-pointer group shrink-0">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      checked={option.isCorrect} 
                      onChange={(e) => updateMCQOption(block.id, option.id, { isCorrect: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-gray-200 rounded-full peer peer-checked:bg-green-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4"></div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 group-hover:text-secondary uppercase tracking-tighter">Correct</span>
                </label>

                <div className="flex items-center bg-white rounded-lg px-2 border border-gray-100 shrink-0">
                  <span className="text-[10px] font-bold text-gray-400 mr-2 uppercase tracking-tighter">Pts</span>
                  <input 
                    type="number"
                    step="0.5"
                    value={option.points}
                    onChange={(e) => updateMCQOption(block.id, option.id, { points: parseFloat(e.target.value) || 0 })}
                    className="w-12 bg-transparent text-sm font-bold text-center focus:outline-none text-secondary"
                  />
                </div>
                
                <button onClick={() => removeMCQOption(block.id, option.id)} className="text-gray-300 hover:text-primary transition-colors p-1">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          <button 
            onClick={() => addMCQOption(block.id)}
            className="w-full py-3 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 hover:border-primary hover:text-primary hover:bg-red-50/30 transition-all flex items-center justify-center gap-2 text-sm font-bold"
          >
            <Plus size={16} /> Add Option
          </button>

          {block.allowOther && (
            <div className="flex items-center gap-3 mt-4 p-4 border border-dashed border-gray-100 rounded-2xl bg-accent/20">
              <div className="flex-1 text-sm text-gray-400 italic">
                User defined "Other" answer...
              </div>
              <div className="flex items-center gap-4 ml-2">
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">AI SCORED</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={block.aiEnabled} onChange={e => updateBlock(block.id, { aiEnabled: e.target.checked })} className="sr-only peer" />
                      <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:start-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>
                <button onClick={() => updateBlock(block.id, { allowOther: false })} className="text-gray-300 hover:text-primary transition-colors p-1">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {isMediaAttachment && (
        <div className="mb-6 p-8 border-2 border-dashed border-gray-100 rounded-[32px] bg-accent/30 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-primary mb-3">
            <ImageIcon size={24} />
          </div>
          <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">Attachment Block</p>
          <p className="text-[10px] text-gray-400 font-medium">Allows users to upload images (10MB) or videos (25MB)</p>
        </div>
      )}

      {showAIGrading && (
        <div className={`mt-4 p-5 rounded-2xl border transition-all ${block.aiEnabled ? 'bg-white border-gray-100' : 'bg-white border-gray-100 opacity-50'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className={block.aiEnabled ? 'text-primary' : 'text-gray-400'} />
              <span className={`text-xs font-bold uppercase tracking-widest ${block.aiEnabled ? 'text-primary' : 'text-gray-500'}`}>
                {isMCQ ? 'AI EVAL FOR "OTHER"' : 'AI GRADING ENGINE'}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={block.aiEnabled} onChange={e => updateBlock(block.id, { aiEnabled: e.target.checked })} className="sr-only peer" />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {block.aiEnabled && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-300 pt-2 border-t border-gray-50 mt-2">
              {(block.type === BlockType.SHORT_TEXT || isMCQ) ? (
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Expected Answer/Context</label>
                  <input 
                    type="text" 
                    placeholder={isMCQ ? "Describe acceptable context for 'Other'..." : "e.g. 42 or 'The Great Gatsby'"}
                    value={block.correctAnswer || ''}
                    onChange={e => updateBlock(block.id, { correctAnswer: e.target.value })}
                    className="w-full bg-accent/30 border border-gray-100 rounded-lg px-3 py-2 text-sm text-secondary focus:outline-none focus:border-primary shadow-sm"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {(['context', 'prompt', 'tagging'] as const).map(m => (
                      <button 
                        key={m}
                        onClick={() => updateBlock(block.id, { gradingMode: m })}
                        className={`text-[10px] font-bold py-1.5 rounded-md border uppercase tracking-tighter transition-all ${block.gradingMode === m ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' : 'bg-white text-gray-500 border-gray-200 hover:border-primary'}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                  {block.gradingMode === 'prompt' && (
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Custom Rubric</label>
                      <textarea 
                        placeholder="Explain how the AI should score this answer..."
                        value={block.gradingPrompt || ''}
                        onChange={e => updateBlock(block.id, { gradingPrompt: e.target.value })}
                        className="w-full bg-accent/30 border border-gray-100 rounded-lg px-3 py-2 text-sm text-secondary focus:outline-none focus:border-primary h-24 resize-none shadow-sm"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {canBeRequired && (
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 cursor-pointer hover:text-secondary transition-colors">
              <input type="checkbox" checked={block.required} onChange={e => updateBlock(block.id, { required: e.target.checked })} className="accent-primary w-4 h-4 rounded border-gray-300" />
              Required
            </label>
          )}
          
          {isMCQ && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-accent/50 px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm">
                <span className="text-[10px] font-black text-secondary uppercase tracking-widest">MAX POINTS</span>
                <input 
                  type="number"
                  step="0.5"
                  value={block.totalPoints || 0}
                  onChange={(e) => updateBlock(block.id, { totalPoints: parseFloat(e.target.value) || 0 })}
                  className="w-12 bg-transparent text-xs font-black text-center focus:outline-none text-primary"
                />
              </div>
              <button 
                onClick={handleEqualSplit}
                className="text-[10px] bg-secondary text-white px-3 py-1.5 rounded-lg hover:bg-primary transition-colors font-bold uppercase tracking-wider shadow-sm"
              >
                SPLIT POINTS
              </button>
            </div>
          )}

          {isTextType && (
             <div className="flex items-center gap-2 bg-white px-2 py-1 rounded text-[10px] font-bold text-secondary border border-gray-100">
               LIMIT: 
               <input 
                type="number" 
                max={300} 
                value={block.charLimit} 
                onChange={e => updateBlock(block.id, { charLimit: Math.min(300, parseInt(e.target.value) || 255) })}
                className="w-8 bg-transparent text-center focus:outline-none"
               />
             </div>
          )}
        </div>
      </div>
      
      {validationError && (
        <div className="mt-4 p-3 bg-primary/5 border border-primary/10 rounded-xl animate-in slide-in-from-top-2 flex items-center gap-2">
          <AlertCircle size={14} className="text-primary" />
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest leading-relaxed">
            Validation Error: Correct options sum ({totalCorrectPoints}) doesn't match Max Points ({block.totalPoints})
          </span>
        </div>
      )}
    </div>
  );
};

export default BlockEditor;