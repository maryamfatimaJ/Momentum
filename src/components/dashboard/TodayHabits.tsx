import React, { useState } from 'react';
import { useHabitContext } from '../../context/HabitContext';
import { HabitItem } from './HabitItem';
import { HabitCategory } from '../../types';
import { Sparkles, Plus, Layers, Filter, ChevronDown } from 'lucide-react';
import { getTodayKey } from '../../utils/habitUtils';

interface TodayHabitsProps {
  onOpenCreate: () => void;
  onOpenMagicAI: () => void;
}

type StatusFilter = 'All' | 'Today' | 'Completed';

const ALL_CATEGORIES: (HabitCategory | 'All')[] = [
  'All',
  'Fitness',
  'Mindset',
  'Health',
  'Focus',
  'Growth',
  'Wellness'
];

export const TodayHabits: React.FC<TodayHabitsProps> = ({ onOpenCreate, onOpenMagicAI }) => {
  const { habits, logs } = useHabitContext();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [selectedCat, setSelectedCat] = useState<HabitCategory | 'All'>('All');
  const todayKey = getTodayKey();

  const activeHabits = habits.filter(h => !h.isArchived && !h.isPaused);

  // Filter logic
  const filteredHabits = activeHabits.filter(h => {
    // 1. Category filter
    if (selectedCat !== 'All' && h.category !== selectedCat) return false;

    // 2. Status filter
    const log = logs.find(l => l.habitId === h.id && l.date === todayKey);
    const isCompleted = log?.completed || false;

    if (statusFilter === 'Today') {
      return h.frequency === 'Daily' || true;
    }
    if (statusFilter === 'Completed') {
      return isCompleted;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[#0F172A] dark:text-slate-100">
            Today's Habits
          </h2>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
            {filteredHabits.length} routines scheduled for today
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenMagicAI}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-[#0F172A] dark:text-slate-100 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#00A8B5]" />
            <span>AI Magic Habit</span>
          </button>

          <button
            onClick={onOpenCreate}
            className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-medium hover:bg-[#1E293B] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4 text-[#00A8B5]" />
            <span>New Habit</span>
          </button>
        </div>
      </div>

      {/* Filter Row: Only 3 primary pills + Category Dropdown Menu */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        
        {/* 3 Main Status Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#EEF2F6] dark:border-slate-700">
          {(['All', 'Today', 'Completed'] as StatusFilter[]).map(status => {
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-[#0F172A] dark:text-slate-100 shadow-xs'
                    : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>

        {/* Category Filter Dropdown */}
        <div className="relative flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#94A3B8] dark:text-slate-500" />
          <div className="relative">
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value as any)}
              className="appearance-none bg-white dark:bg-slate-800 border border-[#EEF2F6] dark:border-slate-700 hover:border-slate-300 rounded-xl px-3.5 py-1.5 pr-8 text-xs font-medium text-[#0F172A] dark:text-slate-100 cursor-pointer focus:outline-none focus:border-[#00A8B5] transition-all"
            >
              {ALL_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] dark:text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

      </div>

      {/* Habits List with Increased Vertical Spacing */}
      {filteredHabits.length > 0 ? (
        <div className="space-y-4">
          {filteredHabits.map(habit => (
            <HabitItem key={habit.id} habit={habit} />
          ))}
        </div>
      ) : (
        <div className="p-10 text-center rounded-2xl bg-white dark:bg-slate-800 border border-dashed border-[#EEF2F6] dark:border-slate-700 space-y-3">
          <div className="w-10 h-10 mx-auto rounded-xl bg-[#F8FAFC] dark:bg-slate-800/60 flex items-center justify-center text-[#94A3B8] dark:text-slate-500">
            <Layers className="w-5 h-5 text-[#00A8B5]" />
          </div>
          <h3 className="text-sm font-semibold text-[#0F172A] dark:text-slate-100">
            {habits.length === 0 ? 'Create your first habit' : 'No routines match these filters'}
          </h3>
          <p className="text-xs text-[#64748B] dark:text-slate-400 max-w-xs mx-auto">
            {habits.length === 0
              ? 'Start building momentum by adding a habit you want to track daily.'
              : 'Try switching filters or add a new habit to start your routine.'}
          </p>
          <button
            onClick={onOpenCreate}
            className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-medium hover:bg-[#1E293B] transition-all inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#00A8B5]" />
            <span>Create Habit</span>
          </button>
        </div>
      )}

    </div>
  );
};
