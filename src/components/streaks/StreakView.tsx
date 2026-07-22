import React from 'react';
import { motion } from 'motion/react';
import { useHabitContext } from '../../context/HabitContext';
import { Flame, Trophy, Award, Crown, Zap, Shield, CheckCircle2 } from 'lucide-react';

const MILESTONE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  Zap,
  Flame,
  Shield,
  Award,
  Crown
};

export const StreakView: React.FC = () => {
  const { streakStats, milestones } = useHabitContext();

  return (
    <div className="space-y-10">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1E293B] dark:text-slate-100">
          Streak Engine & Milestones
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400">
          Fuel long-term behavior transformation through progressive milestones
        </p>
      </div>

      {/* Top 4 Key Streak Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-[#E5EEF2] dark:border-slate-700 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-[#FFD78C]/25 flex items-center justify-center text-[#1E293B]">
            <Flame className="w-5 h-5 text-[#FFD78C]" />
          </div>
          <p className="text-xs text-[#64748B] dark:text-slate-400">Current Streak</p>
          <p className="text-2xl font-extrabold text-[#1E293B] dark:text-slate-100">{streakStats.currentStreak} Days</p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-[#E5EEF2] dark:border-slate-700 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-[#C7B8FF]/25 flex items-center justify-center text-[#1E293B]">
            <Trophy className="w-5 h-5 text-[#1E293B] dark:text-slate-200" />
          </div>
          <p className="text-xs text-[#64748B] dark:text-slate-400">Longest Streak</p>
          <p className="text-2xl font-extrabold text-[#1E293B] dark:text-slate-100">{streakStats.longestStreak} Days</p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-[#E5EEF2] dark:border-slate-700 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-[#A8E6CF]/30 flex items-center justify-center text-[#1E293B]">
            <Award className="w-5 h-5 text-[#7ED6A7]" />
          </div>
          <p className="text-xs text-[#64748B] dark:text-slate-400">Consistency %</p>
          <p className="text-2xl font-extrabold text-[#1E293B] dark:text-slate-100">{streakStats.completionRate}%</p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-[#E5EEF2] dark:border-slate-700 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-[#63C7D8]/20 flex items-center justify-center text-[#1E293B]">
            <Crown className="w-5 h-5 text-[#3FB7CB]" />
          </div>
          <p className="text-xs text-[#64748B] dark:text-slate-400">Best Month</p>
          <p className="text-2xl font-extrabold text-[#1E293B] dark:text-slate-100">{streakStats.bestMonth}</p>
        </div>
      </div>

      {/* Milestones Unlock System */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-[#E5EEF2] dark:border-slate-700 shadow-xs space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-700 pb-4">
          <h2 className="text-lg font-bold text-[#1E293B] dark:text-slate-100">Progressive Streak Milestones</h2>
          <p className="text-xs text-[#64748B] dark:text-slate-400">Unlock badges as your consecutive daily streak grows</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {milestones.map((m, idx) => {
            const IconComp = MILESTONE_ICONS[m.iconName] || Zap;
            const progressPercent = Math.min(100, Math.round((streakStats.currentStreak / m.days) * 100));

            return (
              <div
                key={idx}
                className={`p-6 rounded-2xl border text-center space-y-4 transition-all ${
                  m.unlocked
                    ? 'bg-gradient-to-b from-white to-[#A8E6CF]/10 dark:from-slate-800 dark:to-[#A8E6CF]/10 border-[#7ED6A7] shadow-xs'
                    : 'bg-[#F8FAFC] dark:bg-slate-800/60 border-[#E5EEF2] dark:border-slate-700 opacity-70'
                }`}
              >
                <div
                  className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center ${
                    m.unlocked ? 'bg-[#7ED6A7]/25 text-[#1E293B]' : 'bg-slate-200 dark:bg-slate-700 text-[#64748B] dark:text-slate-400'
                  }`}
                >
                  <IconComp className="w-6 h-6" />
                </div>

                <div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-[#E5EEF2] dark:border-slate-700 text-[#1E293B] dark:text-slate-100">
                    {m.days} Days
                  </span>
                  <h3 className="text-sm font-bold text-[#1E293B] dark:text-slate-100 mt-1.5">{m.title}</h3>
                  <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-1 leading-snug">{m.description}</p>
                </div>

                <div className="space-y-1">
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#63C7D8] h-full rounded-full"
                      style={{ width: `${m.unlocked ? 100 : progressPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-[#64748B] dark:text-slate-400">
                    {m.unlocked ? 'Unlocked!' : `${streakStats.currentStreak} / ${m.days} Days`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Streak Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-[#E5EEF2] dark:border-slate-700 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-[#1E293B] dark:text-slate-100">Weekly Consistency Log</h3>
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-[#1E293B] dark:text-slate-100">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#E5EEF2] dark:border-slate-700 space-y-2">
              <span className="text-[#64748B] dark:text-slate-400 block">{day}</span>
              <CheckCircle2 className="w-5 h-5 text-[#7ED6A7] mx-auto" />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
