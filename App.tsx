import React, { useState, useEffect, Suspense, lazy } from 'react';
import type { SavedPlan } from './types';
import PlanDisplay from './components/PlanDisplay';
import DynamicLoading from './components/DynamicLoading';
import { HistoryIcon, SunIcon, MoonIcon, HeartIcon } from './components/Icons';
import { Logo } from './components/Logo';
import WelcomeScreen from './components/screens/WelcomeScreen';
import RateLimitScreen from './components/screens/RateLimitScreen';
import Questionnaire from './components/screens/Questionnaire';
import LocationInput from './components/screens/LocationInput';
import ErrorScreen from './components/screens/ErrorScreen';
import { useVibePlanner } from './hooks/useVibePlanner';
import { LOCAL_STORAGE_KEYS } from './config/appConfig';

const HistoryPanel = lazy(() => import('./components/HistoryPanel'));
const Confetti = lazy(() => import('./components/Confetti'));

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [planHistory, setPlanHistory] = useState<SavedPlan[]>([]);

  const {
    appState,
    params,
    planOptions,
    finalPlan,
    error,
    isRequestingLocation,
    rateLimitTimeLeft,
    currentStep,
    isTransitioning,
    handleStartPlanning,
    handlePaymentInitiation,
    handleOptionSelect,
    handleBack,
    handleJumpToStep,
    handleSurpriseMe,
    handleSpecificTimeSubmit,
    handleFindCloser,
    handlePlanSelect,
    handleLocationSubmit,
    handleLocationBack,
    handleRestart,
    handleRegenerate,
    handleSubmit,
  } = useVibePlanner({ setPlanHistory });

  useEffect(() => {
    const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEYS.theme);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    try {
      const storedHistory = localStorage.getItem(LOCAL_STORAGE_KEYS.planHistory);
      if (storedHistory) {
        setPlanHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load plan history from localStorage", error);
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => {
      const newMode = !prevMode;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem(LOCAL_STORAGE_KEYS.theme, 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem(LOCAL_STORAGE_KEYS.theme, 'light');
      }
      return newMode;
    });
  };

  const handleRatePlan = (id: string, rating: number) => {
    setPlanHistory(prevHistory => {
      const updatedHistory = prevHistory.map(plan =>
        plan.id === id ? { ...plan, rating } : plan
      );
      try {
        localStorage.setItem(LOCAL_STORAGE_KEYS.planHistory, JSON.stringify(updatedHistory));
      } catch (error) {
        console.error("Failed to update plan rating in localStorage", error);
      }
      return updatedHistory;
    });
  };

  const mainContent = () => {
    switch (appState) {
      case 'WELCOME':
        return <WelcomeScreen onStart={handleStartPlanning} />;
      case 'RATE_LIMITED':
        return <RateLimitScreen timeLeft={rateLimitTimeLeft} onInitiatePayment={handlePaymentInitiation} />;
      case 'GATHERING_INPUT':
        return (
          <Questionnaire
            params={params}
            currentStep={currentStep}
            isTransitioning={isTransitioning}
            onOptionSelect={handleOptionSelect}
            onBack={handleBack}
            onJumpToStep={handleJumpToStep}
            onBackToWelcome={handleRestart}
            onSurpriseMe={handleSurpriseMe}
            onSpecificTimeSubmit={handleSpecificTimeSubmit}
            isDarkMode={isDarkMode}
            handleSubmit={handleSubmit}
          />
        );
      case 'LOADING':
        return (
          <div className="flex flex-col justify-center items-center text-center p-4 h-full z-10">
            <DynamicLoading />
          </div>
        );
      case 'SHOWING_OPTIONS':
        return planOptions ? (
          <PlanDisplay
            planContent={planOptions}
            onRestart={handleRestart}
            onSelectPlan={handlePlanSelect}
            onFindCloser={handleFindCloser}
            onRegenerate={handleRegenerate}
            isRequestingLocation={isRequestingLocation}
            selectedBudget={params.budget}
          />
        ) : null;
      case 'ASKING_LOCATION':
        return (
          <LocationInput
            initialIntendedTime={params.specificDateTime}
            timing={params.timing}
            onSubmit={handleLocationSubmit}
            onBack={handleLocationBack}
          />
        );
      case 'SHOWING_FINAL_PLAN':
        return finalPlan ? (
          <PlanDisplay
            planContent={finalPlan}
            onRestart={handleRestart}
            isFinalPlan={true}
            intendedTime={params.specificDateTime}
            specificDateTime={params.specificDateTime}
            timeWindow={params.timeWindow}
            selectedBudget={params.budget}
          />
        ) : null;
      case 'ERROR':
        return <ErrorScreen error={error} onRestart={handleRestart} />;
      default:
        return <WelcomeScreen onStart={handleStartPlanning} />;
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden pb-10" style={{ backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)' }}>
      <Suspense fallback={null}>
        {appState === 'SHOWING_FINAL_PLAN' && <Confetti />}
      </Suspense>
      <header className="fixed top-0 left-0 right-0 z-30 px-4 py-3 bg-[var(--bg-canvas)]/80 backdrop-blur-md border-b border-[var(--border-soft)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo
            variant="full"
            size={32}
            className="focus-ring logo-hover"
            style={{ color: 'var(--accent-primary)', cursor: 'pointer' }}
            onClick={handleRestart}
          />

          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="focus-ring p-2 rounded-full transition-all hover:bg-[var(--bg-surface)]"
              style={{ color: 'var(--text-primary)' }}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <SunIcon /> : <MoonIcon />}
            </button>
            <button
              onClick={() => setIsHistoryPanelOpen(!isHistoryPanelOpen)}
              className="focus-ring p-2 rounded-full transition-all hover:bg-[var(--bg-surface)]"
              style={{ color: 'var(--text-primary)' }}
              aria-label="View history"
            >
              <HistoryIcon />
            </button>
          </div>
        </div>
      </header>

      <main id="main-content" className={`transition-all duration-500 ease-in-out w-full min-h-screen ${isHistoryPanelOpen ? 'pl-0 md:pl-80' : 'pl-0'}`}>
        <div className="min-h-screen flex flex-col justify-center">
          {mainContent()}
        </div>
      </main>

      <Suspense fallback={null}>
        <HistoryPanel
          history={planHistory}
          isOpen={isHistoryPanelOpen}
          onClose={() => setIsHistoryPanelOpen(false)}
          onRatePlan={handleRatePlan}
        />
      </Suspense>
      <footer className="fixed bottom-0 left-0 right-0 p-3 text-center text-xs z-20" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-canvas)', borderTop: '1px solid var(--border-soft)' }}>
        Developed by Racheal Kuranchie, kuranchieracheal35@gmail.com, with love <HeartIcon />
      </footer>
    </div>
  );
};

export default App;
