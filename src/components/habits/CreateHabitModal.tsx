import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Plus, Sparkles } from 'lucide-react';
import { useHabitContext } from '../../context/HabitContext';
import { PRESET_HABITS } from '../../data/initialData';
import { HabitCategory, HabitFrequency } from '../../types';

interface CreateHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: HabitCategory[] = ['Fitness', 'Mindset', 'Health', 'Focus', 'Growth', 'Wellness'];
const ICONS = ['Dumbbell', 'Droplets', 'Sun', 'BookOpen', 'Brain', 'Smile', 'Heart', 'Code', 'Moon', 'Apple', 'Activity', 'Compass', 'Zap'];
const COLORS = ['#63C7D8', '#3FB7CB', '#A8E6CF', '#7ED6A7', '#C7B8FF', '#FFD78C', '#F4A7A7'];

export const CreateHabitModal: React.FC<CreateHabitModalProps> = ({ isOpen, onClose }) => {
  const { addHabit } = useHabitContext();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<HabitCategory>('Fitness');
  const [iconName, setIconName] = useState('Dumbbell');
  const [color, setColor] = useState('#63C7D8');
  const [frequency, setFrequency] = useState<HabitFrequency>('Daily');
  const [targetValue, setTargetValue] = useState(1);
  const [targetUnit, setTargetUnit] = useState('time');
  const [reminderTime, setReminderTime] = useState('08:00');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addHabit({
      title,
      category,
      iconName,
      color,
      frequency,
      targetValue: Number(targetValue) || 1,
      targetUnit,
      reminderTime,
      notes
    });

    onClose();
    // Reset
    setTitle('');
  };

  const handleSelectPreset = (preset: typeof PRESET_HABITS[0]) => {
    setTitle(preset.title);
    setCategory(preset.category);
    setIconName(preset.iconName);
    setColor(preset.color);
    setFrequency(preset.frequency);
    setTargetValue(preset.targetValue);
    setTargetUnit(preset.targetUnit);
    if (preset.reminderTime) setReminderTime(preset.reminderTime);
    if (preset.notes) setNotes(preset.notes);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-[#E5EEF2] dark:border-slate-700 overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#E5EEF2] dark:border-slate-700 flex items-center justify-between bg-[#F8FAFC] dark:bg-slate-800/60">
          <div>
            <h3 className="text-base font-bold text-[#1E293B] dark:text-slate-100">Create New Routine</h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400">Design a long-term daily habit</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-700 text-[#64748B] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
          
          {/* Quick Presets Carousel */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#1E293B] dark:text-slate-100 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#63C7D8]" /> Suggested Habits Presets:
            </span>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {PRESET_HABITS.slice(0, 6).map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#E5EEF2] dark:border-slate-700 hover:border-[#63C7D8] text-xs font-medium text-[#1E293B] dark:text-slate-100 shrink-0 transition-all cursor-pointer text-left"
                >
                  <span className="font-bold block">{preset.title}</span>
                  <span className="text-[10px] text-[#64748B] dark:text-slate-400">{preset.targetValue} {preset.targetUnit}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#1E293B] dark:text-slate-100 mb-1">Habit Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Morning Workout, Hydrate, Read 15 Pages"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-900 border border-[#E5EEF2] dark:border-slate-700 text-xs text-[#1E293B] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#63C7D8]"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1E293B] dark:text-slate-100 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as HabitCategory)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-900 border border-[#E5EEF2] dark:border-slate-700 text-xs text-[#1E293B] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#63C7D8]"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] dark:text-slate-100 mb-1">Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as HabitFrequency)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-900 border border-[#E5EEF2] dark:border-slate-700 text-xs text-[#1E293B] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#63C7D8]"
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1E293B] dark:text-slate-100 mb-1">Target Value</label>
                <input
                  type="number"
                  min="1"
                  value={targetValue}
                  onChange={(e) => setTargetValue(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-900 border border-[#E5EEF2] dark:border-slate-700 text-xs text-[#1E293B] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#63C7D8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] dark:text-slate-100 mb-1">Target Unit</label>
                <input
                  type="text"
                  value={targetUnit}
                  onChange={(e) => setTargetUnit(e.target.value)}
                  placeholder="e.g. mins, Liters, pages, steps"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-900 border border-[#E5EEF2] dark:border-slate-700 text-xs text-[#1E293B] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#63C7D8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] dark:text-slate-100 mb-1">Reminder Time</label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-900 border border-[#E5EEF2] dark:border-slate-700 text-xs text-[#1E293B] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#63C7D8]"
                />
              </div>
            </div>

            {/* Choose Color */}
            <div>
              <label className="block text-xs font-bold text-[#1E293B] dark:text-slate-100 mb-1.5">Accent Color</label>
              <div className="flex items-center gap-3">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                      color === c ? 'ring-2 ring-offset-2 ring-[#1E293B] scale-110' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E293B] dark:text-slate-100 mb-1">Notes / Tip</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Micro-tip to keep yourself motivated..."
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-900 border border-[#E5EEF2] dark:border-slate-700 text-xs text-[#1E293B] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#63C7D8]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#1E293B] text-white text-xs font-bold hover:bg-[#334155] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4 text-[#63C7D8]" />
              <span>Save Routine</span>
            </button>
          </form>

        </div>
      </motion.div>
    </div>
  );
};
