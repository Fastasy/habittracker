import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { Bell, Save, CheckCircle2, AlertCircle, LogOut, Plus, Trash2, Edit2, Target, Zap, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../hooks/useSettings';
import { emojiToIcon } from '../../utils/iconMap';

const COLOR_OPTIONS = [
  '#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
  '#d946ef', '#f43f5e', '#ef4444', '#f97316', '#f59e0b', '#eab308'
];

const EMOJI_OPTIONS = [
  '🏃', '💪', '📚', '🧘', '💧', '🥗', '😴', '🎯', '✍️', '🎵',
  '🌿', '🚴', '🧹', '💊', '🫁', '🧠', '🌅', '🙏', '🎨', '💻',
];

const SettingsView: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const { signOut, user } = useAuth();
  
  const {
    pillars, addPillar, updatePillar, deletePillar,
    valueConfig, setValueConfig,
    disciplineConfig, setDisciplineConfig,
    exportConfig, setExportConfig
  } = useSettings();

  const [newPillar, setNewPillar] = useState({ name: '', color: '#10b981', icon: '🎯' });

  const handleAddPillar = () => {
    if (!newPillar.name.trim()) return;
    addPillar(newPillar);
    setNewPillar({ name: '', color: '#10b981', icon: '🎯' });
    showMessage('Pillar added successfully.');
  };

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pt-4 pb-20">
      <div className="mb-8 border-b border-zinc-200 dark:border-zinc-800/80 pb-6">
        <h2 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">System Configuration</h2>
        <p className="text-sm text-zinc-500 tracking-wide mt-1">Manage pillars, telemetry values, accountability, and export settings.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border shadow-sm ${
          message.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400' 
            : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-semibold tracking-wide">{message.text}</span>
        </div>
      )}

      {/* 1. Dynamic Pillars Manager */}
      <section className="bg-white dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 tracking-wide">Pillars Manager</h3>
          </div>
          <p className="text-xs text-zinc-500 mt-2 tracking-wide">Define the core focus areas of your life. Routines must map to these pillars.</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pillars.map(pillar => (
              <div key={pillar.id} className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-zinc-200 dark:border-zinc-700/50" style={{ backgroundColor: `${pillar.color}20`, color: pillar.color }}>
                  {emojiToIcon(pillar.icon, "w-5 h-5")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{pillar.name}</p>
                </div>
                <button onClick={() => deletePillar(pillar.id)} className="p-2 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Add New Pillar</h4>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Pillar Name (e.g. Deep Work, Cardio)"
                value={newPillar.name}
                onChange={e => setNewPillar({ ...newPillar, name: e.target.value })}
                className="w-full max-w-sm px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map(c => (
                  <button
                    key={c}
                    onClick={() => setNewPillar({ ...newPillar, color: c })}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${newPillar.color === c ? 'border-zinc-900 dark:border-white scale-110 shadow-md' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-2 max-w-2xl bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800">
                {EMOJI_OPTIONS.map(e => (
                  <button
                    key={e}
                    onClick={() => setNewPillar({ ...newPillar, icon: e })}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                      newPillar.icon === e ? 'bg-zinc-200 dark:bg-zinc-700 shadow-sm' : 'hover:bg-zinc-200/50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {emojiToIcon(e, "w-5 h-5")}
                  </button>
                ))}
              </div>
              <button
                onClick={handleAddPillar}
                className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg text-sm font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Pillar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Value Metrics Setup */}
      <section className="bg-white dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 tracking-wide">Value Metrics</h3>
            </div>
            <p className="text-xs text-zinc-500 mt-2 tracking-wide">Track abstract value units, currency, or points associated with habits.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={valueConfig.active}
              onChange={e => setValueConfig({ ...valueConfig, active: e.target.checked })}
            />
            <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-500"></div>
          </label>
        </div>
        {valueConfig.active && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Metric Symbol</label>
                <input
                  type="text"
                  value={valueConfig.symbol}
                  onChange={e => setValueConfig({ ...valueConfig, symbol: e.target.value })}
                  placeholder="e.g. $, pts, hrs"
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Global Target (Weekly)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">{valueConfig.symbol}</span>
                  <input
                    type="number"
                    value={valueConfig.target}
                    onChange={e => setValueConfig({ ...valueConfig, target: Number(e.target.value) })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 3. Discipline Threshold */}
      <section className="bg-white dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 tracking-wide">High-Stakes Discipline</h3>
          </div>
          <p className="text-xs text-zinc-500 mt-2 tracking-wide">Set a strict baseline for a 14-day rolling window.</p>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Threshold Percentage</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="50" max="100" step="1"
                value={disciplineConfig.threshold}
                onChange={e => setDisciplineConfig({ ...disciplineConfig, threshold: Number(e.target.value) })}
                className="flex-1 h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700 accent-red-500"
              />
              <span className="text-sm font-bold w-12 text-right text-red-600 dark:text-red-400">{disciplineConfig.threshold}%</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Accountability Protocol (Warning Text)</label>
            <textarea
              value={disciplineConfig.message}
              onChange={e => setDisciplineConfig({ ...disciplineConfig, message: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-red-500 outline-none min-h-[100px] resize-y"
              placeholder="Enter your high-stakes warning message..."
            />
          </div>
        </div>
      </section>

      {/* 4. Markdown Exporter Template */}
      <section className="bg-white dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 tracking-wide">Export Engine</h3>
          </div>
          <p className="text-xs text-zinc-500 mt-2 tracking-wide">Design your daily log markdown layout using merge variables.</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Custom Template</label>
            <textarea
              value={exportConfig.template}
              onChange={e => setExportConfig({ ...exportConfig, template: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm font-mono text-zinc-800 dark:text-zinc-300 focus:ring-1 focus:ring-emerald-500 outline-none min-h-[250px] resize-y whitespace-pre"
            />
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Available Variables</p>
            <div className="flex flex-wrap gap-2 text-xs font-mono text-emerald-600 dark:text-emerald-400">
              <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded">{'{{date}}'}</span>
              <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded">{'{{discipline_status}}'}</span>
              <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded">{'{{pillar_stats}}'}</span>
              <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded">{'{{completed_habits}}'}</span>
              <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded">{'{{missed_habits}}'}</span>
              <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded">{'{{value_accumulated}}'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Account Section */}
      <section className="bg-white dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl p-6 border border-red-200 dark:border-red-900/30 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0 border border-red-200 dark:border-red-900/50">
              <LogOut className="w-4 h-4 text-red-600 dark:text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-wide">Terminate Session</h3>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1 max-w-sm">
                Active connection: <span className="font-bold text-zinc-700 dark:text-zinc-400">{user?.email || 'Unknown'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 transition-all border border-red-200 dark:border-red-800/50"
          >
            Sign Out
          </button>
        </div>
      </section>
    </div>
  );
};

export default SettingsView;
