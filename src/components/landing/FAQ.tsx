import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does the Natural Language Habit Creation work?',
      a: 'Simply type a goal in plain English like "Read 20 pages every night at 9pm" or "Drink 3 liters of water". Momentum\'s server-side Gemini AI parses your intent, assigns the right icon, selects color palette codes, and establishes target metrics instantly.'
    },
    {
      q: 'What happens if I miss a habit streak?',
      a: 'Momentum is built around Headspace-style calm principles rather than punitive shame. When a streak breaks, our AI Habit Coach analyzes your log and provides a gentle, low-friction recovery plan to help you resume momentum immediately.'
    },
    {
      q: 'Is my data private and secure?',
      a: 'Yes. All habit tracking data is stored securely in local browser storage and authenticated cloud state. We never share or sell personal user routines.'
    },
    {
      q: 'Can I track habits with custom numeric targets?',
      a: 'Absolutely! Momentum supports boolean completion (Done / Not Done) as well as numerical targets like liters of water, pages read, minutes exercised, or steps walked.'
    },
    {
      q: 'Can I export my habit history?',
      a: 'Yes. You can export your full habit history and completion matrix as JSON anytime from the Settings panel.'
    }
  ];

  return (
    <section id="faq" className="py-24 px-6 sm:px-8 bg-[#F8FAFC] dark:bg-slate-900">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <span className="text-xs font-semibold tracking-wider uppercase text-[#63C7D8]">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1E293B] dark:text-slate-100">
            Everything You Need to Know
          </h2>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-[#E5EEF2] dark:border-slate-700 overflow-hidden transition-all shadow-xs"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between font-semibold text-base text-[#1E293B] dark:text-slate-100 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#64748B] dark:text-slate-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#63C7D8]' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-6 pb-6 text-sm text-[#64748B] dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-700 pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
