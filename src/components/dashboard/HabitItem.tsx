import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Habit } from '../../types';
import { useHabitContext } from '../../context/HabitContext';
import { getTodayKey, parseProgressEntry, getProgressSummary } from '../../utils/habitUtils';
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
  X,
  Check,
  Undo2
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
  const [isLogging, setIsLogging] = useState(false);
  const [entry, setEntry] = useState('');
  const [entryError, setEntryError] = useState<string | null>(null);
  // Last successful change, kept briefly so a typo can be undone in one tap
  const [lastChange, setLastChange] = useState<{ message: string; previousValue: number } | null>(null);
  const todayKey = getTodayKey();

  const currentLog = logs.find(l => l.habitId === habit.id && l.date === todayKey);
  const isCompleted = currentLog?.completed || false;
  const currentValue = currentLog?.currentValue || 0;
  const unit = habit.targetUnit || 'units';
  // "1 page" rather than "1 pages" for the common plural units (pages, mins, steps...)
  const formatAmount = (n: number) => `${n} ${n === 1 && /[a-z]s$/.test(unit) ? unit.slice(0, -1) : unit}`;

  const IconComponent = ICON_MAP[habit.iconName] || Zap;

  useEffect(() => {
    if (!lastChange) return;
    const timer = window.setTimeout(() => setLastChange(null), 6000);
    return () => window.clearTimeout(timer);
  }, [lastChange]);

  const closeLogger = () => {
    setIsLogging(false);
    setEntry('');
    setEntryError(null);
    setLastChange(null);
  };

  const handleToggleLogger = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLogging) closeLogger();
    else setIsLogging(true);
  };

  // Adds exactly what the user typed to today's total. The total is never clamped
  // to the target, so pages read beyond the goal are kept; only the % display caps.
  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = parseProgressEntry(entry, unit);
    if (result.ok === false) {
      setEntryError(result.error);
      return;
    }
    updateHabitProgress(habit.id, currentValue + result.amount, todayKey);
    setLastChange({ message: `Logged ${formatAmount(result.amount)}`, previousValue: currentValue });
    setEntry('');
    setEntryError(null);
  };

  const handleUndo = () => {
    if (!lastChange) return;
    updateHabitProgress(habit.id, lastChange.previousValue, todayKey);
    setLastChange(null);
  };

  const handleReset = () => {
    updateHabitProgress(habit.id, 0, todayKey);
    setLastChange({ message: "Reset today's progress", previousValue: currentValue });
  };

  const { percent, remaining, extra } = getProgressSummary(currentValue, habit.targetValue);
  const statusText = remaining > 0
    ? `${formatAmount(remaining)} left`
    : extra > 0 ? `Goal reached · ${formatAmount(extra)} extra` : 'Goal reached';

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
          <div className={`flex items-center gap-2 transition-opacity duration-200 focus-within:opacity-100 ${
            isSelected || isLogging ? 'opacity-100' : 'opacity-80 sm:opacity-0 group-hover:opacity-100'
          }`}>
            {habit.targetValue > 1 && (
              <button
                type="button"
                onClick={handleToggleLogger}
                aria-expanded={isLogging}
                aria-label={isLogging ? 'Close progress logger' : `Log ${unit} for ${habit.title}`}
                title={isLogging ? 'Close' : `Log ${unit}`}
                className="flex items-center gap-1 bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#EEF2F6] dark:border-slate-700 hover:border-[#00A8B5]/40 rounded-xl py-1 pl-2 pr-1 cursor-pointer transition-colors"
              >
                <span className="text-xs font-semibold text-[#0F172A] dark:text-slate-100 min-w-[28px] text-center">
                  {currentValue}/{habit.targetValue}
                </span>
                <span className="p-1 rounded-lg text-[#64748B] dark:text-slate-400">
                  {isLogging ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                </span>
              </button>
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

      {/* Inline exact-amount logger */}
      <AnimatePresence initial={false}>
        {isLogging && habit.targetValue > 1 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="overflow-hidden cursor-default"
          >
            <form
              onSubmit={handleLogSubmit}
              noValidate
              onKeyDown={(e) => { if (e.key === 'Escape') closeLogger(); }}
              className="pt-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3"
            >
              <div className={`flex items-center gap-2 flex-1 sm:max-w-[260px] bg-[#F8FAFC] dark:bg-slate-900 border rounded-xl p-1.5 transition-colors ${
                entryError ? 'border-rose-300 dark:border-rose-900' : 'border-[#EEF2F6] dark:border-slate-700 focus-within:border-[#00A8B5]'
              }`}>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoFocus
                  value={entry}
                  onChange={(e) => {
                    setEntry(e.target.value);
                    if (entryError) setEntryError(null);
                  }}
                  placeholder={`${unit.charAt(0).toUpperCase()}${unit.slice(1)} to add`}
                  aria-label={`${unit} to add to ${habit.title}`}
                  aria-invalid={Boolean(entryError)}
                  aria-describedby={`log-status-${habit.id}`}
                  className="flex-1 min-w-0 bg-transparent px-2 text-base sm:text-xs text-[#0F172A] dark:text-slate-100 placeholder-[#94A3B8] dark:placeholder-slate-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-[#0F172A] dark:bg-[#00A8B5] text-white text-xs font-semibold hover:bg-[#1E293B] dark:hover:bg-[#0097A3] transition-colors cursor-pointer shrink-0"
                >
                  Log
                </button>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-3 min-w-0">
                <span className={`text-xs ${remaining > 0 ? 'text-[#64748B] dark:text-slate-400' : 'text-[#00A8B5] font-medium'}`}>
                  {statusText}
                </span>
                {currentValue > 0 && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-[11px] text-[#94A3B8] dark:text-slate-500 hover:text-rose-500 transition-colors cursor-pointer shrink-0"
                  >
                    Reset
                  </button>
                )}
              </div>
            </form>

            <div id={`log-status-${habit.id}`} aria-live="polite" className="min-h-[18px] mt-1.5 text-xs">
              {entryError ? (
                <p className="text-rose-500 dark:text-rose-400">{entryError}</p>
              ) : lastChange ? (
                <p className="flex items-center gap-1.5 text-[#00A8B5]">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>{lastChange.message} · {currentValue}/{habit.targetValue} {unit}</span>
                  <button
                    type="button"
                    onClick={handleUndo}
                    className="ml-1 inline-flex items-center gap-1 text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white font-medium cursor-pointer"
                  >
                    <Undo2 className="w-3 h-3" />
                    Undo
                  </button>
                </p>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};
