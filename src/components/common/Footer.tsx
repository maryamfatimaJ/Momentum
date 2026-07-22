import React from 'react';
import { Logo } from './Logo';
import { useHabitContext } from '../../context/HabitContext';

export const Footer: React.FC = () => {
  const { setIsLandingPage, setActiveTab } = useHabitContext();

  const scrollToSection = (id: string) => {
    setIsLandingPage(true);
    setTimeout(() => {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-[#EEF2F6] dark:border-slate-700 pt-16 pb-12 px-6 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          
          {/* Logo + Short Brand Description */}
          <div className="md:col-span-6 space-y-4">
            <Logo size="md" />
            <p className="text-sm text-[#64748B] dark:text-slate-400 max-w-sm leading-relaxed font-normal">
              Build Momentum. One Habit at a Time. <br />
              Become the Best Version of You through calm, consistent daily routines and intelligent AI insights.
            </p>
          </div>

          {/* Navigation Links & Features Links */}
          <div className="md:col-span-6 grid grid-cols-2 gap-8 text-xs text-[#64748B] dark:text-slate-400">
            <div className="space-y-3">
              <h4 className="font-semibold text-[#0F172A] dark:text-slate-100 uppercase tracking-wider text-[11px]">Navigation</h4>
              <ul className="space-y-2.5">
                <li>
                  <button
                    onClick={() => { setIsLandingPage(false); setActiveTab('dashboard'); }}
                    className="hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer"
                  >
                    Dashboard
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { setIsLandingPage(false); setActiveTab('habits'); }}
                    className="hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer"
                  >
                    Habit Stack
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { setIsLandingPage(false); setActiveTab('calendar'); }}
                    className="hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer"
                  >
                    Consistency Heatmap
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { setIsLandingPage(false); setActiveTab('analytics'); }}
                    className="hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer"
                  >
                    Trend Analytics
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-[#0F172A] dark:text-slate-100 uppercase tracking-wider text-[11px]">Features</h4>
              <ul className="space-y-2.5">
                <li>
                  <button
                    onClick={() => scrollToSection('features')}
                    className="hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Habit Tracking
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('features')}
                    className="hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Streak System
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('ai-section')}
                    className="hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer text-left"
                  >
                    AI Habit Coach
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('statistics')}
                    className="hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Daily Challenges
                  </button>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#EEF2F6] dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B] dark:text-slate-400">
          <p>© {new Date().getFullYear()} MOMENTUM. All rights reserved.</p>
          <p className="font-normal text-[#64748B] dark:text-slate-400">Designed and built with intention by Maryam.</p>
        </div>

      </div>
    </footer>
  );
};
