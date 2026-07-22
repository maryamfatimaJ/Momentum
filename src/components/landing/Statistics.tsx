import React from 'react';
import { motion } from 'motion/react';
import { Zap, Flame, Shield, Award, Crown } from 'lucide-react';

export const Statistics: React.FC = () => {
  const milestoneCards = [
    { days: '7 Days', title: 'Spark of Momentum', desc: 'Routine initialization & initial momentum building.', icon: Zap, color: 'bg-[#63C7D8]/20 text-[#3FB7CB]' },
    { days: '21 Days', title: 'Habit Formation', desc: 'Neurological habit pathway threshold unlocked.', icon: Flame, color: 'bg-[#FFD78C]/30 text-[#1E293B]' },
    { days: '50 Days', title: 'Unstoppable Force', desc: '50 unbroken days of dedication & discipline.', icon: Shield, color: 'bg-[#C7B8FF]/25 text-[#1E293B]' },
    { days: '100 Days', title: 'Master of Consistency', desc: '100 days of sustained personal transformation.', icon: Award, color: 'bg-[#A8E6CF]/30 text-[#7ED6A7]' },
    { days: '365 Days', title: 'Legendary Lifestyle', desc: 'A full year of relentless momentum & purpose.', icon: Crown, color: 'bg-[#F4A7A7]/25 text-[#1E293B]' }
  ];

  return (
    <section id="statistics" className="py-24 px-6 sm:px-8 bg-white dark:bg-slate-900 border-y border-[#E5EEF2] dark:border-slate-700">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-xs font-semibold tracking-wider uppercase text-[#63C7D8]">
            Progressive Achievement System
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1E293B] dark:text-slate-100">
            Celebrate Every Milestone
          </h2>
          <p className="text-base sm:text-lg text-[#64748B] dark:text-slate-400">
            Consistency compounds over time. Unlock milestone badges as your streak grows from 7 days to a full year of transformation.
          </p>
        </div>

        {/* Milestone Badge Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {milestoneCards.map((card, idx) => {
            const IconComp = card.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="p-6 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#E5EEF2] dark:border-slate-700 hover:border-[#63C7D8]/40 transition-all text-center space-y-3"
              >
                <div className={`w-12 h-12 mx-auto rounded-2xl ${card.color} flex items-center justify-center`}>
                  <IconComp className="w-6 h-6" />
                </div>
                <span className="inline-block px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-[#E5EEF2] dark:border-slate-700 text-xs font-bold text-[#1E293B] dark:text-slate-100">
                  {card.days}
                </span>
                <h3 className="text-base font-bold text-[#1E293B] dark:text-slate-100">{card.title}</h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">{card.desc}</p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
