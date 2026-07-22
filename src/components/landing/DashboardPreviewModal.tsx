import React from 'react';
import { motion } from 'motion/react';
import { X, CheckCircle2, Flame, Sparkles, TrendingUp, Trophy, BarChart2 } from 'lucide-react';
import { useHabitContext } from '../../context/HabitContext';

interface DashboardPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DashboardPreviewModal: React.FC<DashboardPreviewModalProps> = ({ isOpen, onClose }) => {
  const { setIsLandingPage, setActiveTab } = useHabitContext();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-4xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-[#E5EEF2] dark:border-slate-700 overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Top Bar */}
        <div className="p-6 border-b border-[#E5EEF2] dark:border-slate-700 flex items-center justify-between bg-[#F8FAFC] dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#63C7D8]/20 flex items-center justify-center text-[#1E293B] dark:text-slate-100">
              <Sparkles className="w-5 h-5 text-[#3FB7CB]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1E293B] dark:text-slate-100">Momentum Live Experience</h3>
              <p className="text-xs text-[#64748B] dark:text-slate-400">Interactive App Architecture Preview</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-700 text-[#64748B] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto bg-[#F8FAFC] dark:bg-slate-800/60">
          
          {/* Header Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-[#E5EEF2] dark:border-slate-700">
              <p className="text-xs text-[#64748B] dark:text-slate-400">Current Streak</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Flame className="w-5 h-5 text-[#FFD78C]" />
                <span className="text-xl font-bold text-[#1E293B] dark:text-slate-100">21 Days</span>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-[#E5EEF2] dark:border-slate-700">
              <p className="text-xs text-[#64748B] dark:text-slate-400">Longest Streak</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Trophy className="w-5 h-5 text-[#C7B8FF]" />
                <span className="text-xl font-bold text-[#1E293B] dark:text-slate-100">50 Days</span>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-[#E5EEF2] dark:border-slate-700">
              <p className="text-xs text-[#64748B] dark:text-slate-400">Today's Rate</p>
              <div className="flex items-center gap-1.5 mt-1">
                <TrendingUp className="w-5 h-5 text-[#7ED6A7]" />
                <span className="text-xl font-bold text-[#1E293B] dark:text-slate-100">88%</span>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-[#E5EEF2] dark:border-slate-700">
              <p className="text-xs text-[#64748B] dark:text-slate-400">Consistency</p>
              <div className="flex items-center gap-1.5 mt-1">
                <BarChart2 className="w-5 h-5 text-[#63C7D8]" />
                <span className="text-xl font-bold text-[#1E293B] dark:text-slate-100">94%</span>
              </div>
            </div>
          </div>

          {/* AI Coach Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#63C7D8]/15 via-[#A8E6CF]/15 to-[#C7B8FF]/15 border border-[#63C7D8]/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1E293B] dark:text-slate-100">
              <Sparkles className="w-4 h-4 text-[#63C7D8]" />
              <span>AI HABIT COACH INSIGHT</span>
            </div>
            <p className="text-sm font-semibold text-[#1E293B] dark:text-slate-100">"Consistency in hydration & morning exercise is driving peak daily focus."</p>
            <p className="text-xs text-[#64748B] dark:text-slate-400">Tip: Complete your evening reading habit right after dinner to reach 100% daily compliance.</p>
          </div>

          {/* Active Habit List Demo */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-[#E5EEF2] dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#1E293B] dark:text-slate-100">Active Habit Stack</h4>
              <span className="text-xs text-[#64748B] dark:text-slate-400">4 Habits Configured</span>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Workout & Exercise', target: '30 / 30 mins', done: true, color: '#63C7D8' },
                { name: 'Hydrate (Drink Water)', target: '3 / 3 Liters', done: true, color: '#3FB7CB' },
                { name: 'Read 15 Pages', target: '10 / 15 pages', done: false, color: '#C7B8FF' },
                { name: 'Mindful Meditation', target: '10 / 10 mins', done: true, color: '#A8E6CF' }
              ].map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#E5EEF2] dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                        item.done ? 'bg-[#7ED6A7]' : 'border-2 border-slate-300'
                      }`}
                    >
                      {item.done && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#1E293B] dark:text-slate-100">{item.name}</p>
                      <p className="text-[10px] text-[#64748B] dark:text-slate-400">{item.target}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold ${item.done ? 'text-[#7ED6A7]' : 'text-[#64748B] dark:text-slate-400'}`}>
                    {item.done ? 'Completed' : 'In Progress'}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer CTA inside Modal */}
        <div className="p-6 border-t border-[#E5EEF2] dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between">
          <span className="text-xs text-[#64748B] dark:text-slate-400">Ready to start building your own routines?</span>
          <button
            onClick={() => {
              onClose();
              setIsLandingPage(false);
              setActiveTab('dashboard');
            }}
            className="px-6 py-2.5 rounded-full bg-[#1E293B] text-white text-xs font-bold hover:bg-[#334155] transition-all cursor-pointer shadow-xs"
          >
            Launch Full Application
          </button>
        </div>
      </motion.div>
    </div>
  );
};
