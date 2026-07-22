import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Sparkles, Zap, CheckCircle2 } from 'lucide-react';
import { useHabitContext } from '../../context/HabitContext';

interface NaturalLanguageHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NaturalLanguageHabitModal: React.FC<NaturalLanguageHabitModalProps> = ({ isOpen, onClose }) => {
  const { parseHabitWithAI } = useHabitContext();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    const habit = await parseHabitWithAI(prompt);
    setIsLoading(false);

    if (habit) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setPrompt('');
        onClose();
      }, 1200);
    }
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
        className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-[#E5EEF2] dark:border-slate-700 overflow-hidden p-6 sm:p-8 space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#63C7D8]/20 flex items-center justify-center text-[#1E293B] dark:text-slate-100">
              <Sparkles className="w-5 h-5 text-[#3FB7CB]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1E293B] dark:text-slate-100">AI Habit Architect</h3>
              <p className="text-xs text-[#64748B] dark:text-slate-400">Natural Language Routine Creation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-[#64748B] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-6 rounded-2xl bg-[#A8E6CF]/30 border border-[#7ED6A7] text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#7ED6A7] mx-auto" />
            <h4 className="text-sm font-bold text-[#1E293B] dark:text-slate-100">Habit Successfully Configured!</h4>
            <p className="text-xs text-[#64748B] dark:text-slate-400">Added to your active Momentum routines.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1E293B] dark:text-slate-100 mb-2">
                Describe your desired habit:
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder='e.g., "I want to exercise 30 minutes every morning at 7am"'
                rows={3}
                className="w-full p-4 rounded-2xl bg-[#F8FAFC] dark:bg-slate-900 border border-[#E5EEF2] dark:border-slate-700 text-xs text-[#1E293B] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#63C7D8]"
                required
              />
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#64748B] dark:text-slate-400">
              <span>Try:</span>
              <button 
                type="button" 
                onClick={() => setPrompt('Read 15 pages of non-fiction every night before bed')}
                className="hover:text-[#63C7D8] underline cursor-pointer"
              >
                "Read 15 pages every night..."
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-[#1E293B] text-white text-xs font-bold hover:bg-[#334155] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {isLoading ? (
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <Zap className="w-4 h-4 text-[#63C7D8]" />
                  <span>Generate Routine</span>
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
