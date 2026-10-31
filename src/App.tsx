/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { HomePage } from './pages/HomePage';
import { GoalTrackerPage } from './pages/GoalTrackerPage';
import { DailyReflectionPage } from './pages/DailyReflectionPage';
import { AnalyzerPage } from './pages/AnalyzerPage';
import { ProgressPage } from './pages/ProgressPage';
import { BlurtPage } from './pages/BlurtPage';
import { ExplorePage } from './pages/ExplorePage';
import { PortfolioPage } from './pages/PortfolioPage';
import { InsightsPage } from './pages/InsightsPage';
import { SettingsPage } from './pages/SettingsPage';
import { BloomAssistantModal } from './components/common/BloomAssistantModal';
import { BloomOrb } from './components/common/BloomOrb';
import { RescheduleModal } from './components/schedule/RescheduleModal';

const AppContent: React.FC = () => {
  const { user, profile, isLoading, activePage } = useAuth();
  const [isBloomGuideOpen, setIsBloomGuideOpen] = useState(false);

  // 1. Loading State
  if (isLoading) {
    return (
      <div 
        className="min-h-screen w-full flex flex-col items-center justify-center p-6 space-y-4"
        style={{
          backgroundColor: 'var(--bg-app)',
          color: 'var(--text-primary)'
        }}
      >
        <BloomOrb size="md" interactive={false} />
        <div className="text-center space-y-1">
          <div className="font-extrabold text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Bloom
          </div>
          <p className="text-xs text-[var(--text-muted)] animate-pulse">
            Connecting your personal growth space...
          </p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated: Auth Modal
  if (!user) {
    return <AuthModal />;
  }

  // 3. Authenticated but Onboarding not complete
  if (!profile?.onboardingCompleted) {
    return <OnboardingFlow />;
  }

  // 4. Authenticated & Onboarding complete: Main Application Layout
  const renderActivePage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage />;
      case 'goals':
        return <GoalTrackerPage />;
      case 'reflection':
        return <DailyReflectionPage />;
      case 'analyzer':
        return <AnalyzerPage />;
      case 'progress':
        return <ProgressPage />;
      case 'blurt':
        return <BlurtPage />;
      case 'explore':
        return <ExplorePage />;
      case 'portfolio':
        return <PortfolioPage />;
      case 'insights':
        return <InsightsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col md:flex-row transition-colors"
      style={{
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-primary)'
      }}
    >
      {/* Desktop Sidebar */}
      <Sidebar onOpenBloomGuide={() => setIsBloomGuideOpen(true)} />

      {/* Mobile Top & Bottom Navigation */}
      <MobileNav onOpenBloomGuide={() => setIsBloomGuideOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8 pb-24 md:pb-8 overflow-y-auto">
        {renderActivePage()}
      </main>

      {/* Global Intelligent Reschedule Modal */}
      <RescheduleModal />

      {/* Global Bloom Companion Modal */}
      <BloomAssistantModal 
        isOpen={isBloomGuideOpen}
        onClose={() => setIsBloomGuideOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
