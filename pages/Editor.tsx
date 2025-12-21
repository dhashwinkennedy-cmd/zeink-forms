
import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, Save, Play, Plus, Type, CheckSquare, 
  AlignLeft, ShieldCheck, Mail, Phone, Settings, 
  Share2, Image as ImageIcon, Video, X, TextCursorInput,
  FileText, Loader2
} from 'lucide-react';
import { useStore } from '../store';
import BlockEditor from '../components/BlockEditor';
import { BlockType } from '../types';

const Editor: React.FC = () => {
  const { currentForm, updateForm, addBlock, saveCurrentForm, isLoading } = useStore();
  const [activeSidebar, setActiveSidebar] = useState<'blocks' | 'settings'>('blocks');
  const [showAddMenu, setShowAddMenu] = useState(false);
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

  if (!currentForm) {
    window.location.hash = '#/';
    return null;
  }

  const handleSave = async () => {
    try {
      await saveCurrentForm();
      alert("Encryption Complete. Form Saved to Cloud.");
    } catch (e) {
      alert("Sync Error. Please check your network connection.");
    }
  };

  const handleAddBlock = (type: BlockType) => {
    addBlock(type);
    setShowAddMenu(false);
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-accent pt-16 flex">
      {/* Editor Main Canvas */}
      <main className="flex-1 overflow-y-auto custom-scrollbar h-[calc(100vh-64px)]">
        <div className="max-w-3xl mx-auto py-12 px-6 pb-32">
          <button 
            onClick={() => window.location.hash = '#/'}
            className="flex items-center gap-2 text-gray-400 hover:text-primary font-bold text-[10px] uppercase tracking-widest mb-8 transition-colors"
          >
            <ChevronLeft size={16} /> Exit Editor
          </button>

          {/* Form Header */}
          <div className="bg-white rounded-3xl overflow-hidden mb-8 border border-gray-100 shadow-sm">
            <div className="h-40 bg-gray-200 relative group cursor-pointer overflow-hidden">
               <img src={currentForm.bannerUrl || `https://picsum.photos/seed/${currentForm.id}/1200/400`} alt="Banner" className="w-full h-full object-cover" />
               <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                 <button className="bg-white text-secondary px-4 py-2 rounded-xl font-bold text-xs">CHANGE BANNER</button>
               </div>
            </div>
            <div className="p-8 bg-white">
              <input 
                type="text"
                value={currentForm.title}
                onChange={e => updateForm({ title: e.target.value })}
                placeholder="Form Title"
                className="w-full text-4xl font-black text-secondary mb-2 focus:outline-none placeholder:opacity-30 bg-white"
              />
              <input 
                type="text"
                value={currentForm.subtitle}
                onChange={e => updateForm({ subtitle: e.target.value })}
                placeholder="Add a description..."
                className="w-full text-lg text-gray-400 focus:outline-none placeholder:opacity-30 bg-white"
              />
            </div>
          </div>

          {/* Blocks List */}
          <div className="space-y-6">
            {currentForm.blocks.map((block) => (
              <BlockEditor key={block.id} block={block} />
            ))}
          </div>

          {/* Centered Add Button with Popup */}
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center">
             {showAddMenu && (
               <div 
                ref={addMenuRef}
                className="mb-4 bg-white/95 backdrop-blur-md rounded-[32px] shadow-2xl border border-gray-100 p-2 flex items-center gap-1 animate-in slide-in-from-bottom-4 fade-in duration-200 overflow-hidden"
               >
                 <MenuOption icon={<TextCursorInput size={20}/>} label="TEXT" onClick={() => handleAddBlock(BlockType.SHORT_TEXT)} />
                 <MenuOption icon={<AlignLeft size={20}/>} label="LONG" onClick={() => handleAddBlock(BlockType.LONG_TEXT)} />
                 <MenuOption icon={<CheckSquare size={20}/>} label="MCQ" onClick={() => handleAddBlock(BlockType.MCQ)} />
                 <MenuOption icon={<FileText size={20}/>} label="NORMAL" onClick={() => handleAddBlock(BlockType.INFO)} />
                 <MenuOption icon={<ImageIcon size={20}/>} label="IMAGE" onClick={() => handleAddBlock(BlockType.TEXT_MEDIA)} />
                 <MenuOption icon={<Video size={20}/>} label="VIDEO" onClick={() => handleAddBlock(BlockType.TEXT_MEDIA)} />
               </div>
             )}
             
             <button 
              onClick={() => setShowAddMenu(!showAddMenu)}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${showAddMenu ? 'bg-secondary' : 'bg-primary hover:scale-110 active:scale-95 shadow-primary/30'}`}
             >
               {showAddMenu ? (
                 <X size={32} className="text-white animate-in fade-in zoom-in duration-200" strokeWidth={3} />
               ) : (
                 <Plus size={32} className="text-white" strokeWidth={3} />
               )}
             </button>
          </div>
        </div>
      </main>

      {/* Editor Actions Sidebar */}
      <aside className="w-80 bg-white border-l border-gray-100 p-6 hidden lg:flex flex-col">
        <div className="flex bg-accent p-1 rounded-xl mb-8">
          <button 
            onClick={() => setActiveSidebar('blocks')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${activeSidebar === 'blocks' ? 'bg-white shadow-sm text-primary' : 'text-gray-400'}`}
          >
            <Plus size={14} /> BLOCKS
          </button>
          <button 
            onClick={() => setActiveSidebar('settings')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${activeSidebar === 'settings' ? 'bg-white shadow-sm text-primary' : 'text-gray-400'}`}
          >
            <Settings size={14} /> SETTINGS
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          {activeSidebar === 'blocks' ? (
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[2px] mb-4">Quick Add</h4>
              <SideTool icon={<TextCursorInput size={18}/>} label="Short Answer" sub="Single line text" onClick={() => handleAddBlock(BlockType.SHORT_TEXT)} />
              <SideTool icon={<AlignLeft size={18}/>} label="Long Answer" sub="Multiple lines" onClick={() => handleAddBlock(BlockType.LONG_TEXT)} />
              <SideTool icon={<CheckSquare size={18}/>} label="Choices" sub="Multiple choice questions" onClick={() => handleAddBlock(BlockType.MCQ)} />
              <SideTool icon={<FileText size={18}/>} label="Normal Text" sub="Static content/Description" onClick={() => handleAddBlock(BlockType.INFO)} />
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-secondary uppercase block mb-3">Behavior</label>
                <div className="space-y-3">
                  <label className="flex items-center justify-between text-sm bg-white border border-gray-100 p-3 rounded-xl cursor-pointer hover:border-primary transition-colors">
                      <span>Allow Edit After Submit</span>
                      <input type="checkbox" checked={currentForm.settings.allowRevisit} onChange={e => updateForm({ settings: { ...currentForm.settings, allowRevisit: e.target.checked } })} className="accent-primary" />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto space-y-3 pt-6">
           <button 
            disabled={isLoading}
            onClick={handleSave} 
            className="w-full flex items-center justify-center gap-2 bg-secondary text-white py-3 rounded-2xl font-bold hover:bg-primary transition-all disabled:opacity-50"
           >
             {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} SAVE
           </button>
           <button 
            onClick={() => window.location.hash = `#/view/${currentForm.id}`}
            className="w-full flex items-center justify-center gap-2 border-2 border-secondary text-secondary py-3 rounded-2xl font-bold hover:bg-secondary hover:text-white transition-all"
           >
             <Play size={18} /> PREVIEW
           </button>
        </div>
      </aside>
    </div>
  );
};

// MenuOption and SideTool remain the same
const MenuOption = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center gap-1.5 p-3 rounded-2xl hover:bg-accent group transition-all min-w-[72px]"
  >
    <div className="text-gray-400 group-hover:text-primary transition-colors">
      {icon}
    </div>
    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter group-hover:text-secondary">{label}</span>
  </button>
);

const SideTool = ({ icon, label, sub, onClick }: { icon: React.ReactNode, label: string, sub: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gray-50 bg-white hover:border-primary/20 hover:shadow-md transition-all group text-left"
  >
    <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400 group-hover:text-primary transition-colors">
      {icon}
    </div>
    <div>
      <p className="text-sm font-bold text-secondary group-hover:text-primary transition-colors">{label}</p>
      <p className="text-[10px] text-gray-400 font-medium leading-tight">{sub}</p>
    </div>
  </button>
);

export default Editor;
