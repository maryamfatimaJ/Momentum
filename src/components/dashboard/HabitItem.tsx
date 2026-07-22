import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Habit } from '../../types';
import { useHabitContext } from '../../context/HabitContext';
import { getTodayKey } from '../../utils/habitUtils';
import { 
  CheckCircle2, 
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
  Plus,
  Minus,
  Target
} from 'lucide-react';

interface HabitItemProps {
  habit: Habit;
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

export const HabitItem: React.FC<HabitItemProps> = ({ habit }) => {
  const { logs, toggleHabitCompletion, updateHabitProgress } = useHabitContext();
  const [isSelected, setIsSelected] = useState(false);
  const todayKey = getTodayKey();

  const currentLog = logs.find(l => l.habitId === habit.id && l.date === todayKey);
  const isCompleted = currentLog?.completed || false;
  const currentValue = currentLog?.currentValue || 0;

  const IconComponent = ICON_MAP[habit.iconName] || Zap;

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextVal = Math.min(habit.targetValue, currentValue + (habit.targetValue > 10 ? 5 : 1));
    updateHabitProgress(habit.id, nextVal, todayKey);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    const prevVal = Math.max(0, currentValue - (habit.targetValue > 10 ? 5 : 1));
    updateHabitProgress(habit.id, prevVal, todayKey);
  };

  const percent = Math.min(100, Math.round((currentValue / habit.targetValue) * 100));

  // Duration • Time text formatting
  const durationText = habit.targetValue > 1 
    ? `${habit.targetValue} ${habit.targetUnit}`
    : habit.targetUnit || 'Daily';
  const timeText = habit.reminderTime ? ` • ${habit.reminderTime}` : '';
  const metaText = `${durationText}${timeText}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      onClick={() => setIsSelected(!isSelected)}
      className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden group ${
        isCompleted
          ? 'bg-slate-50/50 dark:bg-slate-800/60 border-[#EEF2F6] dark:border-slate-700'
          : 'bg-white dark:bg-slate-800 border-[#EEF2F6] dark:border-slate-700 hover:border-[#00A8B5]/30'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        
        {/* Left: Checkbox + Habit Name + Meta info */}
        <div className="flex items-center gap-3.5 min-w-0">
          
          {/* Minimal Checkbox Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleHabitCompletion(habit.id, todayKey);
            }}
            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${
              isCompleted
                ? 'bg-[#00A8B5] text-white'
                : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:border-[#00A8B5] text-transparent'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Title & Duration • Time */}
          <div className="min-w-0 space-y-0.5">
            <h3 className={`text-sm font-semibold truncate ${isCompleted ? 'line-through text-[#94A3B8] dark:text-slate-500' : 'text-[#0F172A] dark:text-slate-100'}`}>
              {habit.title}
            </h3>

            <p className="text-xs text-[#64748B] dark:text-slate-400 font-normal flex items-center gap-1.5">
              <span>{metaText}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-slate-800/60 text-[#64748B] dark:text-slate-400 font-medium hidden sm:inline-block">
                {habit.category}
              </span>
            </p>
          </div>

        </div>

        {/* Right: Hover / Selected Revealed Controls */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Target / Progress controls (Revealed on hover or when selected) */}
          <div className={`flex items-center gap-2 transition-opacity duration-200 ${
            isSelected ? 'opacity-100' : 'opacity-80 sm:opacity-0 group-hover:opacity-100'
          }`}>
            {habit.targetValue > 1 && (
              <div className="flex items-center gap-1 bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#EEF2F6] dark:border-slate-700 rounded-xl p-1">
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="p-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white cursor-pointer"
                  title="Decrease progress"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-xs font-semibold px-1.5 text-[#0F172A] dark:text-slate-100 min-w-[28px] text-center">
                  {currentValue}/{habit.targetValue}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="p-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white cursor-pointer"
                  title="Increase progress"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )}

            <span className={`text-xs font-medium ${isCompleted ? 'text-[#00A8B5]' : 'text-[#64748B] dark:text-slate-400'}`}>
              {percent}%
            </span>
          </div>

          <IconComponent className="w-4 h-4 text-[#94A3B8] dark:text-slate-500 group-hover:text-[#00A8B5] transition-colors" />
        </div>

      </div>

      {/* Subtle Progress Bar */}
      <div className="w-full bg-[#F1F5F9] dark:bg-slate-800/60 h-1 rounded-full mt-3 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: isCompleted ? '#00A8B5' : '#3FB7CB' }}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

    </motion.div>
  );
};
