import React, { useState } from 'react';
import { HabitProvider, useHabitContext } from './context/HabitContext';
import { Navbar } from './components/common/Navbar';
import { SpotlightHero } from './components/landing/SpotlightHero';
import { Features } from './components/landing/Features';
import { AISection } from './components/landing/AISection';
import { Statistics } from './components/landing/Statistics';
import { FAQ } from './components/landing/FAQ';
import { Footer } from './components/common/Footer';
import { DashboardPreviewModal } from './components/landing/DashboardPreviewModal';
import { AuthModal } from './components/auth/AuthModal';
import { DashboardLayout } from './components/dashboard/DashboardLayout';

function AppContent() {
  const { isLandingPage, setIsLandingPage, setActiveTab, isAuthModalOpen, openAuthModal, closeAuthModal } = useHabitContext();

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleLaunchApp = () => {
    setIsLandingPage(false);
    setActiveTab('dashboard');
  };

  return (
    <>
      {!isLandingPage ? (
        // Application view: full DashboardLayout
        <DashboardLayout />
      ) : (
        // Startup Landing Page experience
        <div className="min-h-screen bg-white dark:bg-slate-900 text-[#1E293B] dark:text-slate-100 flex flex-col font-sans selection:bg-[#63C7D8]/30">

          {/* Top Glassmorphic Navigation */}
          <Navbar
            onOpenAuth={openAuthModal}
          />

          {/* Main Landing Page Flow */}
          <main className="flex-1">
            <SpotlightHero
              onGetStarted={handleLaunchApp}
              onWatchDemo={() => setIsPreviewOpen(true)}
            />

            <Features />

            <AISection />

            <Statistics />

            <FAQ />
          </main>

          {/* Footer */}
          <Footer />

          {/* Interactive Modals */}
          <DashboardPreviewModal
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
          />

        </div>
      )}

      {/* Auth modal is available from both the landing page and the dashboard
          (e.g. Settings lets a guest sign in to sync their data) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
      />
    </>
  );
}

export function App() {
  return (
    <HabitProvider>
      <AppContent />
    </HabitProvider>
  );
}

export default App;
