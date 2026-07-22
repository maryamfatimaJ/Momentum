import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useHabitContext } from '../../context/HabitContext';
import { Award, CheckCircle2, Zap, Sparkles, ChevronDown } from 'lucide-react';

export const DailyChallengeWidget: React.FC = () => {
  const { todayChallenge, completeChallenge } = useHabitContext();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      onClick={() => setIsExpanded(!isExpanded)}
      className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-[#EEF2F6] dark:border-slate-700 hover:border-[#00A8B5]/30 transition-all cursor-pointer space-y-3 relative overflow-hidden group shadow-2xs"
    >
      {/* Compact Main Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#00A8B5]/10 flex items-center justify-center text-[#00A8B5] shrink-0">
            <Award className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-[#00A8B5] uppercase tracking-wider">
                Daily Challenge
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#F1F5F9] dark:bg-slate-800/60 text-[#0F172A] dark:text-slate-100 text-[10px] font-medium flex items-center gap-0.5 shrink-0">
                <Zap className="w-2.5 h-2.5 text-[#00A8B5]" />
                <span>+{todayChallenge.xpReward} XP</span>
              </span>
            </div>
            <h3 className="text-sm font-semibold text-[#0F172A] dark:text-slate-100 truncate mt-0.5">
              {todayChallenge.title}
            </h3>
          </div>
        </div>

        <button
          type="button"
          aria-label="Toggle challenge details"
          className="p-1 rounded-lg text-[#94A3B8] dark:text-slate-500 group-hover:text-[#0F172A] dark:group-hover:text-white transition-colors shrink-0"
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="pt-3 border-t border-[#F1F5F9] dark:border-slate-700 space-y-3 overflow-hidden"
          >
            <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
              {todayChallenge.description}
            </p>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-medium text-[#94A3B8] dark:text-slate-500">
                Category: {todayChallenge.category}
              </span>

              {todayChallenge.completed ? (
                <div className="px-3 py-1.5 rounded-xl bg-[#00A8B5]/10 text-[#00A8B5] text-xs font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Completed (+{todayChallenge.xpReward} XP)</span>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    completeChallenge();
                  }}
                  className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-medium hover:bg-[#1E293B] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#00A8B5]" />
                  <span>Complete</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
