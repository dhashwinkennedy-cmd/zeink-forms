
import React from 'react';
import { X, Lock, Shield, Eye, Settings, Users, Ban, CheckCircle } from 'lucide-react';
import { FormSettings } from '../../types';

interface SettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  settings: FormSettings;
  onUpdate: (updates: Partial<FormSettings>) => void;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ isOpen, onClose, settings, onUpdate }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl border-l z-50 flex flex-col">
      <div className="p-6 border-b flex items-center justify-between bg-gray-50">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Settings size={20} className="text-[#ff1a1a]" /> Form Settings
        </h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <section className="space-y-4">
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Lock size={14} /> Security & Control
          </h4>
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium">Allow Copy/Paste</span>
              <input 
                type="checkbox" 
                checked={settings.allowCopyPaste} 
                onChange={(e) => onUpdate({ allowCopyPaste: e.target.checked })}
                className="w-4 h-4 text-[#ff1a1a]"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium">Allow Revisit Pages</span>
              <input 
                type="checkbox" 
                checked={settings.allowRevisit} 
                onChange={(e) => onUpdate({ allowRevisit: e.target.checked })}
                className="w-4 h-4 text-[#ff1a1a]"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="space-y-0.5">
                <span className="text-sm font-bold text-[#ff1a1a]">Public Survey Mode</span>
                <p className="text-[10px] text-gray-400 font-medium">Disables restrictions</p>
              </div>
              <input 
                type="checkbox" 
                checked={settings.isPublicSurvey} 
                onChange={(e) => onUpdate({ isPublicSurvey: e.target.checked })}
                className="w-4 h-4 text-[#ff1a1a]"
              />
            </label>
          </div>
        </section>

        <section className={`space-y-4 ${settings.isPublicSurvey ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Shield size={14} /> Access Restrictions
          </h4>
          
          <div className="bg-gray-50 p-2 rounded-xl flex gap-1">
            <button 
              onClick={() => onUpdate({ accessMode: 'blacklist' })}
              className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all flex items-center justify-center gap-2 ${settings.accessMode === 'blacklist' ? 'bg-[#0a0b10] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Ban size={12} /> Blacklist
            </button>
            <button 
              onClick={() => onUpdate({ accessMode: 'whitelist' })}
              className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all flex items-center justify-center gap-2 ${settings.accessMode === 'whitelist' ? 'bg-[#ff1a1a] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <CheckCircle size={12} /> Whitelist
            </button>
          </div>

          <div>
            <label className="text-xs font-bold block mb-1 uppercase tracking-tighter">
              {settings.accessMode === 'blacklist' ? 'Email Blacklist (CSV)' : 'Email Whitelist (CSV)'}
            </label>
            <textarea 
              className="w-full bg-gray-50 border rounded-xl p-3 text-sm focus:outline-none min-h-[100px] font-medium"
              placeholder={settings.accessMode === 'blacklist' ? "Block spam@org.com, @competitor.com..." : "Allow internal@org.com, partner@co.com..."}
              value={settings.accessMode === 'blacklist' ? settings.blacklist.join(', ') : settings.whitelist.join(', ')}
              onChange={(e) => {
                const list = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                if (settings.accessMode === 'blacklist') {
                  onUpdate({ blacklist: list });
                } else {
                  onUpdate({ whitelist: list });
                }
              }}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Eye size={14} /> Result Visibility
          </h4>
          <div className="space-y-2">
            <select 
              className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm focus:outline-none font-bold"
              value={settings.resultReveal}
              onChange={(e) => onUpdate({ resultReveal: e.target.value as any })}
            >
              <option value="instant">Reveal Instantly</option>
              <option value="scheduled">Scheduled Reveal</option>
              <option value="approval">After Creator Approval</option>
            </select>
            {settings.resultReveal === 'scheduled' && (
              <input 
                type="datetime-local" 
                className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm focus:outline-none"
                value={settings.revealDate}
                onChange={(e) => onUpdate({ revealDate: e.target.value })}
              />
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Users size={14} /> Admins
          </h4>
          <div className="space-y-2">
            {settings.admins.map((admin, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-xs border border-gray-100">
                <span className="truncate font-medium">{admin.email}</span>
                <span className="text-[#ff1a1a] font-black uppercase text-[8px] tracking-widest">Editor</span>
              </div>
            ))}
            <button className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#ff1a1a] hover:border-[#ff1a1a] transition-all">
              + Add Admin
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsSidebar;
