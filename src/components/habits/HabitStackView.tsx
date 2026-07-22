import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useHabitContext } from '../../context/HabitContext';
import { Habit, HabitCategory } from '../../types';
import { PRESET_HABITS } from '../../data/initialData';
import { 
  Plus, 
  Sparkles, 
  Pause, 
  Play, 
  Archive,
  Trash2,
  Clock,
  Dumbbell, 
  Droplets, 
  Sun, 
  BookOpen, 
  Brain, 
  Smile, 
  Heart, 
  Code, 
  Moon, 
  Apple, 
  Activity, 
  Compass, 
  Zap,
  Filter
} from 'lucide-react';

interface HabitStackViewProps {
  onOpenCreate: () => void;
  onOpenMagicAI: () => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Dumbbell,
  Droplets,
  Sun,
  BookOpen,
  Brain,
  Smile,
  Heart,
  Code,
  Moon,
  Apple,
  Activity,
  Compass,
  Zap
};

export const HabitStackView: React.FC<HabitStackViewProps> = ({ onOpenCreate, onOpenMagicAI }) => {
  const { habits, addHabit, deleteHabit, togglePauseHabit, toggleArchiveHabit } = useHabitContext();
  const [filterMode, setFilterMode] = useState<'active' | 'paused' | 'archived'>('active');
  const [selectedCat, setSelectedCat] = useState<HabitCategory | 'All'>('All');

  const displayedHabits = habits.filter(h => {
    if (filterMode === 'active') return !h.isPaused && !h.isArchived;
    if (filterMode === 'paused') return h.isPaused && !h.isArchived;
    return h.isArchived;
  }).filter(h => selectedCat === 'All' || h.category === selectedCat);

  const handleAddPreset = (preset: typeof PRESET_HABITS[0]) => {
    addHabit({
      ...preset,
      notes: preset.notes || 'Added from Momentum Suggested Stack'
    });
  };

  return (
    <div className="space-y-8">
      
      {/* Top Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1E293B] dark:text-slate-100">
            Habit Stack Management
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400">
            Organize, configure, pause, or archive your daily routines
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenMagicAI}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#63C7D8]/20 to-[#C7B8FF]/20 border border-[#63C7D8]/30 text-[#1E293B] dark:text-slate-100 text-xs font-bold hover:bg-[#63C7D8]/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-[#3FB7CB]" />
            <span>AI Habit Architect</span>
          </button>

          <button
            onClick={onOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-[#1E293B] text-white text-xs font-bold hover:bg-[#334155] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#63C7D8]" />
            <span>Custom Habit</span>
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5EEF2] dark:border-slate-700 pb-4">
        
        {/* Active / Paused / Archived */}
        <div className="flex items-center gap-2">
          {(['active', 'paused', 'archived'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilterMode(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                filterMode === tab
                  ? 'bg-[#1E293B] text-white shadow-xs'
                  : 'bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#E5EEF2] dark:border-slate-700 text-[#64748B] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-white'
              }`}
            >
              {tab} ({habits.filter(h => {
                if (tab === 'active') return !h.isPaused && !h.isArchived;
                if (tab === 'paused') return h.isPaused && !h.isArchived;
                return h.isArchived;
              }).length})
            </button>
          ))}
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['All', 'Fitness', 'Mindset', 'Health', 'Focus', 'Growth', 'Wellness'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat as any)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                selectedCat === cat
                  ? 'bg-[#63C7D8]/20 border border-[#63C7D8] text-[#1E293B] dark:text-slate-100'
                  : 'text-[#64748B] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Main Habit Cards Grid */}
      {displayedHabits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedHabits.map(habit => {
            const IconComp = ICON_MAP[habit.iconName] || Zap;
            return (
              <motion.div
                key={habit.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-[#E5EEF2] dark:border-slate-700 shadow-xs space-y-4 flex flex-col justify-between hover:border-[#63C7D8]/40 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: `${habit.color}20`, color: habit.color }}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>
                    <span
                      className="text-[10px] px-2.5 py-1 rounded-full font-bold"
                      style={{ backgroundColor: `${habit.color}18`, color: habit.color }}
                    >
                      {habit.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#1E293B] dark:text-slate-100">{habit.title}</h3>
                    <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
                      Target: {habit.targetValue} {habit.targetUnit} ({habit.frequency})
                    </p>
                  </div>

                  {habit.notes && (
                    <p className="text-xs text-[#64748B] dark:text-slate-400 bg-[#F8FAFC] dark:bg-slate-800/60 p-3 rounded-xl border border-[#E5EEF2] dark:border-slate-700 italic">
                      "{habit.notes}"
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-[#64748B] dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-[#64748B] dark:text-slate-400" />
                    <span>{habit.reminderTime || '08:00'}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => togglePauseHabit(habit.id)}
                      className="p-2 rounded-xl hover:bg-[#F8FAFC] dark:hover:bg-slate-700 text-[#64748B] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-white transition-colors cursor-pointer"
                      title={habit.isPaused ? 'Resume Habit' : 'Pause Habit'}
                    >
                      {habit.isPaused ? <Play className="w-4 h-4 text-[#7ED6A7]" /> : <Pause className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => toggleArchiveHabit(habit.id)}
                      className="p-2 rounded-xl hover:bg-[#F8FAFC] dark:hover:bg-slate-700 text-[#64748B] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-white transition-colors cursor-pointer"
                      title={habit.isArchived ? 'Unarchive' : 'Archive'}
                    >
                      <Archive className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete Habit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-800 border border-[#E5EEF2] dark:border-slate-700 space-y-3">
          <p className="text-sm font-bold text-[#1E293B] dark:text-slate-100">No habits in this filter state.</p>
          <p className="text-xs text-[#64748B] dark:text-slate-400">Switch tabs or create a new routine below.</p>
        </div>
      )}

      {/* Suggested Habits Presets Section */}
      <div className="pt-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[#1E293B] dark:text-slate-100">Suggested High-Impact Habits</h2>
          <p className="text-xs text-[#64748B] dark:text-slate-400">Click any preset to immediately add it to your active stack</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRESET_HABITS.map((preset, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-[#E5EEF2] dark:border-slate-700 hover:border-[#63C7D8]/40 transition-all flex items-center justify-between gap-4 shadow-xs"
            >
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-[#63C7D8] uppercase tracking-wider">{preset.category}</span>
                <h4 className="text-sm font-bold text-[#1E293B] dark:text-slate-100 truncate">{preset.title}</h4>
                <p className="text-xs text-[#64748B] dark:text-slate-400">{preset.targetValue} {preset.targetUnit} daily</p>
              </div>

              <button
                onClick={() => handleAddPreset(preset)}
                className="px-3.5 py-2 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/60 hover:bg-[#1E293B] hover:text-white border border-[#E5EEF2] dark:border-slate-700 text-xs font-bold text-[#1E293B] dark:text-slate-100 transition-all cursor-pointer shrink-0 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 text-[#63C7D8]" />
                <span>Add</span>
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
