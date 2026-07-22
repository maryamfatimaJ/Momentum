import React from 'react';
import { motion } from 'motion/react';
import { useHabitContext } from '../../context/HabitContext';
import { Flame, TrendingUp, CheckCircle2, Calendar as CalendarIcon } from 'lucide-react';

export const HeaderGreeting: React.FC = () => {
  const { userProfile, streakStats, todayCompletionPercent, dailyQuote, habits, logs } = useHabitContext();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  const activeHabitsCount = habits.filter(h => !h.isArchived && !h.isPaused).length;
  const todayKey = new Date().toISOString().split('T')[0];
  const completedTodayCount = habits.filter(h => {
    const log = logs.find(l => l.habitId === h.id && l.date === todayKey);
    return log?.completed;
  }).length;

  return (
    <div className="space-y-10">
      
      {/* Spacious Top Greeting Block */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-medium text-[#00A8B5] tracking-wide">
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>{todayFormatted}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#0F172A] dark:text-slate-100">
          {getGreeting()},{' '}
          <span className="font-serif-editorial italic font-normal text-[#1E293B] dark:text-slate-100">
            {(userProfile?.name || 'Alex').split(' ')[0]}
          </span>
        </h1>

        <p className="text-sm sm:text-base text-[#64748B] dark:text-slate-400 max-w-2xl font-normal leading-relaxed pt-1">
          "{dailyQuote.text}"
          <span className="text-xs text-[#94A3B8] dark:text-slate-500 font-medium ml-2">— {dailyQuote.author}</span>
        </p>
      </div>

      {/* 3 Primary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* 1. Current Streak */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-[#EEF2F6] dark:border-slate-700 hover:border-[#00A8B5]/30 transition-all duration-200 flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-[#64748B] dark:text-slate-400">Current Streak</p>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-slate-100">
              {streakStats.currentStreak} <span className="text-base font-normal text-[#64748B] dark:text-slate-400">Days</span>
            </p>
            <p className="text-[11px] text-[#94A3B8] dark:text-slate-500 font-normal pt-1">
              Active daily momentum
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#00A8B5]/10 flex items-center justify-center text-[#00A8B5] shrink-0">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        {/* 2. Completion Rate */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-[#EEF2F6] dark:border-slate-700 hover:border-[#00A8B5]/30 transition-all duration-200 flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-[#64748B] dark:text-slate-400">Completion Rate</p>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-slate-100">
              {streakStats.completionRate}%
            </p>
            <p className="text-[11px] text-[#94A3B8] dark:text-slate-500 font-normal pt-1">
              30-day routine consistency
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#00A8B5]/10 flex items-center justify-center text-[#00A8B5] shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* 3. Today's Progress */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-[#EEF2F6] dark:border-slate-700 hover:border-[#00A8B5]/30 transition-all duration-200 flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-[#64748B] dark:text-slate-400">Today's Progress</p>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-slate-100">
              {todayCompletionPercent}%
            </p>
            <p className="text-[11px] text-[#94A3B8] dark:text-slate-500 font-normal pt-1">
              {completedTodayCount} of {activeHabitsCount} habits completed
            </p>
          </div>

          <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <motion.path
                className="text-[#00A8B5]"
                strokeDasharray={`${todayCompletionPercent}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                initial={{ strokeDasharray: '0, 100' }}
                animate={{ strokeDasharray: `${todayCompletionPercent}, 100` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <CheckCircle2 className="w-4 h-4 text-[#00A8B5] absolute" />
          </div>
        </div>

      </div>

    </div>
  );
};
