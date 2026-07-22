import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Flame, Calendar, BarChart2, Quote, Award } from 'lucide-react';

export const Features: React.FC = () => {
  const featuresList = [
    {
      icon: CheckCircle2,
      title: 'Habit Tracking',
      description: 'Custom frequencies, target metrics, color coding, and daily logging tailored to your routine.'
    },
    {
      icon: Flame,
      title: 'Streak System',
      description: 'Track current and longest streaks, best months, and milestone achievements as you stay consistent.'
    },
    {
      icon: Calendar,
      title: 'Beautiful Calendar',
      description: 'Month-by-month calendar breakdowns and interactive consistency heatmaps for effortless clarity.'
    },
    {
      icon: BarChart2,
      title: 'Rich Analytics',
      description: 'Deep visual trends, category distribution, and comprehensive routine completion statistics.'
    },
    {
      icon: Quote,
      title: 'Daily Quotes',
      description: 'Mindful daily quotes to keep you inspired, grounded, and focused on intentional growth.'
    },
    {
      icon: Award,
      title: 'Daily Challenges',
      description: 'Fresh daily micro-challenges designed to build momentum and foster continuous progress.'
    }
  ];

  return (
    <section id="features" className="py-24 sm:py-32 px-6 sm:px-8 bg-[#F8FAFC]/60 dark:bg-slate-900/60 relative">
      <div className="max-w-7xl mx-auto space-y-16 sm:space-y-20">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto space-y-4"
        >
          <span className="text-xs font-semibold tracking-widest uppercase text-[#00A8B5] block">
            FEATURES
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#0F172A] dark:text-slate-100 leading-tight">
            Everything you need to build calmly
          </h2>
          <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
            A complete toolkit for consistent progress, designed to feel calm, focused, and intentional.
          </p>
        </motion.div>

        {/* 3x2 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresList.map((feat, idx) => {
            const IconComp = feat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="group relative p-8 sm:p-9 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs hover:shadow-xl hover:shadow-[#DCEFF5]/60 hover:-translate-y-2.5 hover:scale-[1.015] transition-all duration-350 ease-out space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Icon Circle */}
                  <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 flex items-center justify-center transition-all duration-300 ease-out group-hover:bg-gradient-to-br group-hover:from-[#00A8B5] group-hover:to-[#22B8CF] group-hover:border-transparent group-hover:shadow-lg group-hover:shadow-[#00A8B5]/25 group-hover:scale-110">
                    <IconComp className="w-6 h-6 text-[#00A8B5] transition-colors duration-300 group-hover:text-white" />
                  </div>

                  {/* Title in Elegant Editorial Style */}
                  <h3 className="text-2xl font-serif-editorial font-semibold tracking-tight text-[#0F172A] dark:text-slate-100 pt-1">
                    {feat.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                    {feat.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
