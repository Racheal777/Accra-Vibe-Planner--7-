import React, { useState, useEffect } from 'react';
import type { SavedPlan } from './types';
import PlanDisplay from './components/PlanDisplay';
import DynamicLoading from './components/DynamicLoading';
import HistoryPanel from './components/HistoryPanel';
import Confetti from './components/Confetti';
import { HistoryIcon, SunIcon, MoonIcon, HeartIcon } from './components/Icons';
import WelcomeScreen from './components/screens/WelcomeScreen';
import RateLimitScreen from './components/screens/RateLimitScreen';
import Questionnaire from './components/screens/Questionnaire';
import LocationInput from './components/screens/LocationInput';
import ErrorScreen from './components/screens/ErrorScreen';
import { useVibePlanner } from './hooks/useVibePlanner';
import { LOCAL_STORAGE_KEYS } from './config/appConfig';

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
    switch(appState) {
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
    <div className="relative min-h-screen bg-[#FFFCF5] dark:bg-slate-900 overflow-hidden pb-10">
        {appState === 'SHOWING_FINAL_PLAN' && <Confetti />}
        <div className="fixed top-4 right-4 z-30 flex items-center gap-2">
            <button
                onClick={toggleDarkMode}
                className="p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white dark:hover:bg-slate-700 transition-all text-[#3E0703] dark:text-slate-200"
                aria-label="Toggle dark mode"
            >
                {isDarkMode ? <SunIcon /> : <MoonIcon />}
            </button>
            <button
                onClick={() => setIsHistoryPanelOpen(!isHistoryPanelOpen)}
                className="p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white dark:hover:bg-slate-700 transition-all text-[#3E0703] dark:text-slate-200"
                aria-label="Toggle history panel"
            >
                <HistoryIcon />
            </button>
        </div>

        <main className={`transition-all duration-500 ease-in-out w-full min-h-screen ${isHistoryPanelOpen ? 'pl-0 md:pl-80' : 'pl-0'}`}>
            <div className="min-h-screen flex flex-col justify-center">
              {mainContent()}
            </div>
        </main>

        <HistoryPanel
            history={planHistory}
            isOpen={isHistoryPanelOpen}
            onClose={() => setIsHistoryPanelOpen(false)}
            onRatePlan={handleRatePlan}
        />
        <footer className="fixed bottom-0 left-0 right-0 p-3 text-center text-xs text-[#660B05]/80 dark:text-slate-400 bg-[#FFFCF5]/50 dark:bg-slate-900/50 backdrop-blur-sm z-20">
            Developed by Racheal Kuranchie, kuranchieracheal35@gmail.com, with love <HeartIcon />
        </footer>
    </div>
  );
};

export default App;
