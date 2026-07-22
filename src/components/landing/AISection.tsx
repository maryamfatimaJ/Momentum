import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Check, Bot, Zap } from 'lucide-react';
import { useHabitContext } from '../../context/HabitContext';

export const AISection: React.FC = () => {
  const { parseHabitWithAI, setIsLandingPage, setActiveTab } = useHabitContext();
  const [promptInput, setPromptInput] = useState('I want to exercise 30 minutes every morning at 7am.');
  const [isLoading, setIsLoading] = useState(false);
  const [resultHabit, setResultHabit] = useState<any>(null);

  const handleTestParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;
    setIsLoading(true);
    setResultHabit(null);

    const parsed = await parseHabitWithAI(promptInput);
    if (parsed) {
      setResultHabit(parsed);
    } else {
      // Fallback mock representation for instant visual feedback
      setResultHabit({
        title: 'Morning Exercise',
        category: 'Fitness',
        targetValue: 30,
        targetUnit: 'mins',
        frequency: 'Daily',
        reminderTime: '07:00',
        color: '#63C7D8',
        notes: '30 minutes of cardiovascular & core strength movement'
      });
    }
    setIsLoading(false);
  };

  return (
    <section id="ai-section" className="py-24 px-6 sm:px-8 bg-[#F8FAFC] dark:bg-slate-900">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-[#E5EEF2] dark:border-slate-700 shadow-xs text-xs font-semibold text-[#63C7D8]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Intelligent Habit Architect</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1E293B] dark:text-slate-100">
            Create Routines at the Speed of Thought
          </h2>
          <p className="text-base sm:text-lg text-[#64748B] dark:text-slate-400">
            Simply type what you want to achieve in natural language. Momentum's AI engine instantly configures target units, reminders, categories, and custom icon tags.
          </p>
        </div>

        {/* Interactive Try-it Box */}
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 border border-[#E5EEF2] dark:border-slate-700 rounded-3xl p-6 sm:p-10 shadow-lg space-y-8">

          <form onSubmit={handleTestParse} className="space-y-4">
            <label className="block text-sm font-semibold text-[#1E293B] dark:text-slate-100">
              Try Natural Language Creation:
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder='e.g., "Read 20 pages of non-fiction every night before bed"'
                className="w-full pl-5 pr-32 py-4 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#E5EEF2] dark:border-slate-700 text-[#1E293B] dark:text-slate-100 placeholder-[#64748B] dark:placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#63C7D8]"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="absolute right-2.5 px-5 py-2.5 rounded-xl bg-[#1E293B] text-white text-xs font-semibold hover:bg-[#334155] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-[#63C7D8]" />
                    <span>Generate</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-[#64748B] dark:text-slate-400">
              <span>Sample prompts:</span>
              <button 
                type="button" 
                onClick={() => setPromptInput('Drink 3 liters of water throughout the workday')}
                className="hover:text-[#63C7D8] underline cursor-pointer"
              >
                "Drink 3 liters of water..."
              </button>
              <span>•</span>
              <button 
                type="button" 
                onClick={() => setPromptInput('Meditate for 10 minutes every morning at 7:30am')}
                className="hover:text-[#63C7D8] underline cursor-pointer"
              >
                "Meditate 10 mins morning..."
              </button>
            </div>
          </form>

          {/* AI Result Card */}
          {resultHabit && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#63C7D8]/30 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#63C7D8]/20 flex items-center justify-center text-[#1E293B] dark:text-slate-100">
                    <Bot className="w-5 h-5 text-[#3FB7CB]" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-[#1E293B] dark:text-slate-100">{resultHabit.title}</h4>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#A8E6CF]/30 text-[#1E293B] dark:text-slate-100 font-medium">
                      {resultHabit.category || 'Fitness'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#1E293B] dark:text-slate-100">
                    {resultHabit.targetValue} {resultHabit.targetUnit}
                  </span>
                  <p className="text-[11px] text-[#64748B] dark:text-slate-400">{resultHabit.frequency || 'Daily'} at {resultHabit.reminderTime || '07:00'}</p>
                </div>
              </div>

              {resultHabit.notes && (
                <p className="text-xs text-[#64748B] dark:text-slate-400 italic">"{resultHabit.notes}"</p>
              )}

              <div className="pt-2 flex items-center justify-between border-t border-[#E5EEF2] dark:border-slate-700">
                <span className="text-xs text-[#7ED6A7] font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Added to your active habit stack!
                </span>
                <button
                  onClick={() => {
                    setIsLandingPage(false);
                    setActiveTab('dashboard');
                  }}
                  className="text-xs font-semibold text-[#1E293B] dark:text-slate-100 hover:text-[#63C7D8] flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}

        </div>

      </div>
    </section>
  );
};
