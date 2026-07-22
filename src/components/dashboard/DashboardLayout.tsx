import React, { useState } from 'react';
import { useHabitContext } from '../../context/HabitContext';
import { HeaderGreeting } from './HeaderGreeting';
import { TodayHabits } from './TodayHabits';
import { DailyChallengeWidget } from './DailyChallengeWidget';
import { AICoachWidget } from './AICoachWidget';
import { HabitStackView } from '../habits/HabitStackView';
import { CalendarView } from '../calendar/CalendarView';
import { StreakView } from '../streaks/StreakView';
import { AnalyticsView } from '../analytics/AnalyticsView';
import { SettingsView } from '../settings/SettingsView';
import { CreateHabitModal } from '../habits/CreateHabitModal';
import { NaturalLanguageHabitModal } from '../habits/NaturalLanguageHabitModal';
import { OnboardingTour } from '../onboarding/OnboardingTour';
import { 
  LayoutDashboard, 
  Layers, 
  Calendar, 
  Flame, 
  BarChart2, 
  Settings, 
  Plus, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { activeTab, setActiveTab, setIsLandingPage, session, authLoading, dataLoading } = useHabitContext();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isMagicAIOpen, setIsMagicAIOpen] = useState(false);

  // While we're still determining auth state, or pulling a signed-in user's real
  // data down from Supabase, hold off on rendering habit/profile-derived content --
  // otherwise a reload would briefly flash last session's local cache (or the
  // default demo data) before the real data replaces it.
  const isResolvingAccount = authLoading || (Boolean(session) && dataLoading);

  if (isResolvingAccount) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#EEF2F6] dark:border-slate-700 border-t-[#00A8B5] rounded-full animate-spin" />
          <p className="text-xs text-[#64748B] dark:text-slate-400 font-medium">Loading your account...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'habits', label: 'Habit Stack', icon: Layers },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'streaks', label: 'Milestones', icon: Flame },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ] as const;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-[#0F172A] dark:text-slate-100 pb-24 selection:bg-[#00A8B5]/20">

      {/* Minimal Top Navigation Bar */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-[#EEF2F6] dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-4 flex items-center justify-between">

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsLandingPage(true)}
              className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 border border-[#EEF2F6] dark:border-slate-700 text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
              title="Return to Landing Page"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Landing Page</span>
            </button>

            <span className="text-sm font-black tracking-tight text-[#0F172A] dark:text-slate-100">MOMENTUM</span>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsMagicAIOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-[#0F172A] dark:text-slate-100 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00A8B5]" />
              <span className="hidden sm:inline">Magic Habit</span>
            </button>

            <button
              data-tour="create-habit"
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-medium hover:bg-[#1E293B] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4 text-[#00A8B5]" />
              <span className="hidden sm:inline">New Habit</span>
            </button>
          </div>

        </div>

        {/* Tab Navigation Menu */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
          {navItems.map(item => {
            const IconComp = item.icon;
            const isActive = activeTab === item.id;
            const tourAttr =
              item.id === 'dashboard' ? 'nav-dashboard' :
              item.id === 'calendar' ? 'nav-calendar' :
              item.id === 'streaks' ? 'nav-milestones' : undefined;
            return (
              <button
                key={item.id}
                data-tour={tourAttr}
                onClick={() => setActiveTab(item.id)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-[#00A8B5]' : 'text-[#64748B] dark:text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 pt-10 space-y-12">
        
        {activeTab === 'dashboard' && (
          <div className="space-y-12">
            <HeaderGreeting />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Left Column: Today's Active Habits */}
              <div className="lg:col-span-8">
                <TodayHabits
                  onOpenCreate={() => setIsCreateOpen(true)}
                  onOpenMagicAI={() => setIsMagicAIOpen(true)}
                />
              </div>

              {/* Right Sidebar Column: Compact Daily Challenge */}
              <div className="lg:col-span-4 space-y-6">
                <DailyChallengeWidget />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'habits' && (
          <HabitStackView
            onOpenCreate={() => setIsCreateOpen(true)}
            onOpenMagicAI={() => setIsMagicAIOpen(true)}
          />
        )}

        {activeTab === 'calendar' && <CalendarView />}

        {activeTab === 'streaks' && <StreakView />}

        {activeTab === 'analytics' && <AnalyticsView />}

        {activeTab === 'settings' && <SettingsView />}

      </main>

      {/* Floating AI Coach Drawer Button */}
      <AICoachWidget />

      {/* Modals */}
      <CreateHabitModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <NaturalLanguageHabitModal
        isOpen={isMagicAIOpen}
        onClose={() => setIsMagicAIOpen(false)}
      />

      <OnboardingTour />

    </div>
  );
};
