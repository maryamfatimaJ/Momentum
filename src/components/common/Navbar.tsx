import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Logo } from './Logo';
import { useHabitContext } from '../../context/HabitContext';
import { Sparkles, ArrowRight, User } from 'lucide-react';

interface NavbarProps {
  onOpenAuth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { isLandingPage, setIsLandingPage, setActiveTab } = useHabitContext();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    if (!isLandingPage) {
      setIsLandingPage(true);
      setTimeout(() => {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.header
      id="momentum-navbar"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-700 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.03)] py-3.5'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
        <button 
          onClick={() => setIsLandingPage(true)} 
          className="cursor-pointer focus:outline-none"
        >
          <Logo size="md" />
        </button>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#64748B] dark:text-slate-400">
          <button
            onClick={() => scrollToSection('features')}
            className="hover:text-[#1E293B] dark:hover:text-white transition-colors cursor-pointer"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection('ai-section')}
            className="hover:text-[#1E293B] dark:hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#63C7D8]" />
            AI Coach
          </button>
          <button
            onClick={() => scrollToSection('statistics')}
            className="hover:text-[#1E293B] dark:hover:text-white transition-colors cursor-pointer"
          >
            Milestones
          </button>
          <button
            onClick={() => scrollToSection('faq')}
            className="hover:text-[#1E293B] dark:hover:text-white transition-colors cursor-pointer"
          >
            FAQ
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {isLandingPage ? (
            <>
              <button
                onClick={onOpenAuth}
                className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-[#1E293B] dark:text-slate-100 hover:text-[#63C7D8] transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setIsLandingPage(false);
                  setActiveTab('dashboard');
                }}
                className="px-5 py-2.5 rounded-full text-sm font-medium bg-[#1E293B] text-white hover:bg-[#334155] shadow-xs hover:shadow-md transition-all duration-200 flex items-center gap-2 group cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 text-[#63C7D8] group-hover:translate-x-0.5 transition-transform" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsLandingPage(true)}
              className="px-4 py-2 rounded-full text-sm font-medium text-[#64748B] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-white bg-white dark:bg-slate-800 border border-[#E5EEF2] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer flex items-center gap-2"
            >
              <User className="w-4 h-4 text-[#63C7D8]" />
              <span>Back to Overview</span>
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
};
