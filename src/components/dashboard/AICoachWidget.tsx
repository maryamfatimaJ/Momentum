import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useHabitContext } from '../../context/HabitContext';
import { Sparkles, RefreshCw, AlertCircle, Quote, Compass, X, Send, Bot } from 'lucide-react';

export const AICoachWidget: React.FC = () => {
  const { aiInsight, fetchAICoachInsight, chatHistory, sendCoachMessage } = useHabitContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userQuery, setUserQuery] = useState('');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAICoachInsight();
    setIsRefreshing(false);
  };

  const handleAskCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim()) return;

    const q = userQuery.trim();
    setUserQuery('');
    await sendCoachMessage(q);
  };

  return (
    <>
      {/* Floating AI Assistant Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-full bg-[#0F172A] text-white shadow-xl hover:bg-[#1E293B] hover:shadow-2xl transition-all duration-300 flex items-center gap-2.5 cursor-pointer group border border-slate-700/50"
      >
        <div className="w-6 h-6 rounded-full bg-[#00A8B5]/20 flex items-center justify-center text-[#00A8B5]">
          <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
        </div>
        <span className="text-xs font-semibold tracking-wide">AI Coach</span>
        <span className="w-2 h-2 rounded-full bg-[#00A8B5] animate-pulse" />
      </button>

      {/* Backdrop & Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50"
            />

            {/* Slide-Over Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-slate-800 z-50 shadow-2xl border-l border-[#EEF2F6] dark:border-slate-700 flex flex-col justify-between overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-[#EEF2F6] dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#00A8B5]/10 flex items-center justify-center text-[#00A8B5]">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#0F172A] dark:text-slate-100">AI Habit Coach</h3>
                    <p className="text-xs text-[#64748B] dark:text-slate-400">Personalized Behavioral Guidance</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="p-2 rounded-xl hover:bg-[#F8FAFC] dark:hover:bg-slate-700 text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer"
                    title="Refresh Insights"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#00A8B5]' : ''}`} />
                  </button>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl hover:bg-[#F8FAFC] dark:hover:bg-slate-700 text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Drawer Content Body */}
              <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                {aiInsight && (
                  <>
                    {/* Headline Box */}
                    <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#EEF2F6] dark:border-slate-700 space-y-2">
                      <h4 className="text-xs font-semibold text-[#0F172A] dark:text-slate-100 flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-[#00A8B5]" />
                        <span>{aiInsight.headline}</span>
                      </h4>
                      <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
                        {aiInsight.insight}
                      </p>
                    </div>

                    {/* Tactical Tip */}
                    <div className="p-4 rounded-xl bg-[#E6F7F9] dark:bg-[#00A8B5]/10 border border-[#00A8B5]/20 dark:border-[#00A8B5]/30 text-xs text-[#0F172A] dark:text-slate-100 space-y-1">
                      <span className="font-semibold text-[#00A8B5]">Today's Tactical Tip:</span>
                      <p className="text-[#0F172A] dark:text-slate-100 text-xs leading-relaxed">{aiInsight.tip}</p>
                    </div>

                    {/* Recovery Strategy */}
                    {aiInsight.recoveryPlan && (
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs text-[#0F172A] dark:text-slate-100 space-y-1">
                        <span className="font-semibold text-[#0F172A] dark:text-slate-100 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-[#00A8B5]" /> Recovery Strategy:
                        </span>
                        <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">{aiInsight.recoveryPlan}</p>
                      </div>
                    )}

                    {/* Quote */}
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-[#EEF2F6] dark:border-slate-700 flex items-start gap-2.5">
                      <Quote className="w-4 h-4 text-[#00A8B5] shrink-0 mt-0.5" />
                      <p className="text-xs text-[#64748B] dark:text-slate-400 italic leading-relaxed">
                        "{aiInsight.motivationalQuote}"
                      </p>
                    </div>
                  </>
                )}

                {!aiInsight && chatHistory.length === 0 && (
                  <div className="p-6 text-center rounded-2xl border border-dashed border-[#EEF2F6] dark:border-slate-700 space-y-2">
                    <Bot className="w-6 h-6 mx-auto text-[#00A8B5]" />
                    <p className="text-xs text-[#64748B] dark:text-slate-400">
                      Ask a question below or refresh for personalized insights.
                    </p>
                  </div>
                )}

                {/* Conversation History */}
                {chatHistory.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-semibold text-[#94A3B8] dark:text-slate-500 uppercase tracking-wider">Conversation</p>
                    {chatHistory.map((msg, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-xl text-xs leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-[#0F172A] text-white ml-6'
                            : 'bg-[#F8FAFC] dark:bg-slate-800/60 text-[#0F172A] dark:text-slate-100 border border-[#EEF2F6] dark:border-slate-700 mr-6'
                        }`}
                      >
                        {msg.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Drawer Footer Input */}
              <form onSubmit={handleAskCoach} className="p-4 border-t border-[#EEF2F6] dark:border-slate-700 bg-white dark:bg-slate-800">
                <div className="flex items-center gap-2 bg-[#F8FAFC] dark:bg-slate-900 border border-[#EEF2F6] dark:border-slate-700 rounded-xl p-1.5 focus-within:border-[#00A8B5] transition-colors">
                  <input
                    type="text"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="Ask AI Coach for advice..."
                    className="flex-1 bg-transparent px-3 text-xs text-[#0F172A] dark:text-slate-100 placeholder-[#94A3B8] dark:placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-lg bg-[#0F172A] text-white hover:bg-[#1E293B] transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
