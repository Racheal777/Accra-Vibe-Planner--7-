import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import type { HangoutParams, SavedPlan, Location, AppState } from '../types';
import { generatePlanOptions, getTravelDetails } from '../services/geminiService';
import { initiatePayment } from '../services/paystackService';
import { verifyPayment } from '../api/verify-payment';
import { BILLING, LOCAL_STORAGE_KEYS, RATE_LIMIT } from '../config/appConfig';
import { getDestinationFromPlan } from '../domain/planner/planParser';
import { normalizeTimeInput } from '../utils/dateTime';

const MICRO_BOOST_PLAN = BILLING.microBoost.code;
const POWER_PLANNER_PLAN = BILLING.powerPlanner.code;


interface UseVibePlannerProps {
  setPlanHistory: Dispatch<SetStateAction<SavedPlan[]>>;
}

export const useVibePlanner = ({ setPlanHistory }: UseVibePlannerProps) => {
  const [appState, setAppState] = useState<AppState>('WELCOME');
  const [params, setParams] = useState<HangoutParams>({
    planningMode: '',
    vibe: '',
    timeWindow: '',
    budget: '',
    audience: '',
    timing: '',
    location: null,
    proximity: 'any',
    dateMeal: '',
    specificDateTime: '',
    groupSize: undefined,
    travelPreference: '',
    mustHaves: [],
    openNowOnly: false,
  });
  const [planOptions, setPlanOptions] = useState<string | null>(null);
  const [finalPlan, setFinalPlan] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [rateLimitTimeLeft, setRateLimitTimeLeft] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  useEffect(() => {
     if (!process.env.API_KEY) {
        setError("This application is not configured correctly. An API key is required.");
        setAppState('ERROR');
     }
  }, []);

  useEffect(() => {
    // Fix: Replaced NodeJS.Timeout with ReturnType<typeof setTimeout> to resolve a type error in browser environments. This ensures compatibility with web APIs for setInterval/clearInterval.
    let timer: ReturnType<typeof setTimeout>;
    if (appState === 'RATE_LIMITED' && rateLimitTimeLeft > 0) {
      timer = setInterval(() => {
        setRateLimitTimeLeft(prev => Math.max(0, prev - 1000));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [appState, rateLimitTimeLeft]);
  
  const savePlanToHistory = (planContent: string) => {
    const newPlan: SavedPlan = {
        id: new Date().toISOString(),
        planContent,
        savedAt: new Date().toISOString(),
        rating: null,
    };
    setPlanHistory(prevHistory => {
            const updatedHistory = [newPlan, ...prevHistory];
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.planHistory, JSON.stringify(updatedHistory));
        } catch (error) {
            console.error("Failed to save plan history to localStorage", error);
        }
        return updatedHistory;
    });
  };

  const handleSubmit = async (finalParams: HangoutParams) => {
    setAppState('LOADING');
    try {
      const result = await generatePlanOptions(finalParams);
      setPlanOptions(result);
      setAppState('SHOWING_OPTIONS');
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
      setAppState('ERROR');
    }
  };

  const handleOptionSelect = (key: keyof HangoutParams, value: any) => {
    setIsTransitioning(true);
    setTimeout(() => {
        const newParams = { ...params, [key]: value };
        setParams(newParams);
        setCurrentStep(prev => prev + 1);
        setIsTransitioning(false);
    }, 300);
  };
  
  const handleBack = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      if (currentStep > 0) {
        setCurrentStep(prev => prev - 1);
      }
      setIsTransitioning(false);
    }, 300);
  };

  const handleJumpToStep = (step: number) => {
    setCurrentStep(Math.max(0, step));
  };

  const handleSurpriseMe = (key: keyof HangoutParams, options: readonly {name: string, value: any}[]) => {
    const randomIndex = Math.floor(Math.random() * options.length);
    const randomOption = options[randomIndex].value;
    handleOptionSelect(key, randomOption);
  };
  
  const handleStartPlanning = (planningMode: 'quick' | 'detailed') => {
    const defaultsForMode: Partial<HangoutParams> = planningMode === 'quick'
      ? { planningMode, timeWindow: 'Quickie (1-2 hours)', audience: 'With the Crew', openNowOnly: false }
      : { planningMode, openNowOnly: false };
    const subStatus = localStorage.getItem(LOCAL_STORAGE_KEYS.subscriptionStatus);
    const subExpiry = localStorage.getItem(LOCAL_STORAGE_KEYS.subscriptionExpiry);
    
    if (subStatus && subExpiry && Date.now() < parseInt(subExpiry, 10)) {
        const planCount = parseInt(localStorage.getItem(LOCAL_STORAGE_KEYS.planCount) || '0', 10);
        
        if (subStatus === MICRO_BOOST_PLAN && planCount < BILLING.microBoost.planLimit) {
            setParams(prev => ({ ...prev, ...defaultsForMode }));
            setAppState('GATHERING_INPUT');
            return;
        }
        if (subStatus === POWER_PLANNER_PLAN && planCount < BILLING.powerPlanner.planLimit) {
            setParams(prev => ({ ...prev, ...defaultsForMode }));
            setAppState('GATHERING_INPUT');
            return;
        }
    } else if (subStatus || subExpiry) {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.subscriptionStatus);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.subscriptionExpiry);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.planCount);
    }

    const lastPlanTimestamp = localStorage.getItem(LOCAL_STORAGE_KEYS.rateLimitTimestamp);
    if (lastPlanTimestamp) {
        const timeSinceLastPlan = Date.now() - parseInt(lastPlanTimestamp, 10);
        if (timeSinceLastPlan < RATE_LIMIT.freePlanCooldownMs) {
            setRateLimitTimeLeft(RATE_LIMIT.freePlanCooldownMs - timeSinceLastPlan);
            setAppState('RATE_LIMITED');
            return;
        } else {
             localStorage.removeItem(LOCAL_STORAGE_KEYS.rateLimitTimestamp);
        }
    }

    localStorage.setItem(LOCAL_STORAGE_KEYS.planCount, '0');
    setParams(prev => ({ ...prev, ...defaultsForMode }));
    setAppState('GATHERING_INPUT');
  };

  const activateSubscription = (plan: typeof MICRO_BOOST_PLAN | typeof POWER_PLANNER_PLAN) => {
    let expiry: number;
    const lastPlanTimestamp = localStorage.getItem(LOCAL_STORAGE_KEYS.rateLimitTimestamp);
    const initialPlanCount = lastPlanTimestamp ? 1 : 0;

    if (plan === MICRO_BOOST_PLAN) {
        expiry = Date.now() + BILLING.microBoost.validityMs;
        localStorage.setItem(LOCAL_STORAGE_KEYS.subscriptionStatus, MICRO_BOOST_PLAN);
    } else {
        expiry = Date.now() + BILLING.powerPlanner.validityMs;
        localStorage.setItem(LOCAL_STORAGE_KEYS.subscriptionStatus, POWER_PLANNER_PLAN);
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.subscriptionExpiry, expiry.toString());
    localStorage.setItem(LOCAL_STORAGE_KEYS.planCount, initialPlanCount.toString());

    // Transition to the main app after successful activation
    setAppState('GATHERING_INPUT');
    setCurrentStep(0);
  };

  const handlePaymentInitiation = (plan: typeof MICRO_BOOST_PLAN | typeof POWER_PLANNER_PLAN, email: string) => {
    const planDetails = {
      [MICRO_BOOST_PLAN]: { amount: BILLING.microBoost.amountGhs },
      [POWER_PLANNER_PLAN]: { amount: BILLING.powerPlanner.amountGhs },
    };

    initiatePayment({
      email,
      amount: planDetails[plan].amount,
      onSuccess: async (response) => {
        // Payment modal was successful, now verify on the (mock) backend
        alert("Payment successful! Verifying your transaction...");
        const verification = await verifyPayment(response.reference);
        if (verification.success) {
          alert("Verification successful! Your plan is activated.");
          activateSubscription(plan);
        } else {
          setError("Payment verification failed. Please contact support.");
          setAppState('ERROR');
        }
      },
      onClose: () => {
        // User closed the modal
        alert("Payment was not completed.");
      }
    });
  };

  const handleRegenerate = () => {
      handleSubmit(params);
  };

  const handleSpecificTimeSubmit = (date: string, hour: string, minute: string, ampm: string) => {
    let hour24 = parseInt(hour, 10);
    if (ampm === 'PM' && hour24 < 12) hour24 += 12;
    if (ampm === 'AM' && hour24 === 12) hour24 = 0;
    
    const formattedTime = `${String(hour24).padStart(2, '0')}:${minute}`;
    
    const finalDateTime = date
      ? `${date}T${formattedTime}`
      : `${new Date().toISOString().split('T')[0]}T${formattedTime}`;
    
    setIsTransitioning(true);
    setTimeout(() => {
      const newParams = { ...params, specificDateTime: finalDateTime };
      setParams(newParams);
      setCurrentStep(prev => prev + 1);
      setIsTransitioning(false);
    }, 300);
  };
  
  const handleFindCloser = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setAppState('ERROR');
      return;
    }
    
    setIsRequestingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsRequestingLocation(false);
        setAppState('LOADING');
        const newLocation = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        const closerParams = { ...params, location: newLocation, proximity: 'close' as const };
        setParams(closerParams);
        handleSubmit(closerParams);
      },
      (err: GeolocationPositionError) => {
        setIsRequestingLocation(false);
        let userMessage = "Couldn't get your location.";
        if (err.code === err.PERMISSION_DENIED) {
          userMessage = "Please enable location access in your browser settings to find closer vibes.";
        }
        setError(userMessage);
        setAppState('ERROR');
      }
    );
  };

  const handlePlanSelect = (plan: string) => {
    setSelectedPlan(plan);
    setAppState('ASKING_LOCATION');
  };

  const handleLocationSubmit = async (origin: string, originCoords: Location | null, intendedTime: string) => {
      if (!origin || !intendedTime || !selectedPlan) return;
      
      setAppState('LOADING');
      const normalizedIntendedTime = normalizeTimeInput(intendedTime);
      
      const destination = getDestinationFromPlan(selectedPlan);

      if (!destination) {
          setError('Could not find a destination in the selected plan.');
          setAppState('ERROR');
          return;
      }
      
      const finalParams = { ...params, specificDateTime: normalizedIntendedTime };
      setParams(finalParams);

      try {
          const travelInfo = await getTravelDetails(origin, destination, normalizedIntendedTime, originCoords);
          const fullPlan = `${selectedPlan}\n\n---\n${travelInfo}`;
          setFinalPlan(fullPlan);
          savePlanToHistory(fullPlan);

          const subStatus = localStorage.getItem(LOCAL_STORAGE_KEYS.subscriptionStatus);
          const subExpiry = localStorage.getItem(LOCAL_STORAGE_KEYS.subscriptionExpiry);

          if (subStatus && subExpiry && Date.now() < parseInt(subExpiry, 10)) {
              const currentCount = parseInt(localStorage.getItem(LOCAL_STORAGE_KEYS.planCount) || '0', 10);
              localStorage.setItem(LOCAL_STORAGE_KEYS.planCount, (currentCount + 1).toString());
          } else {
              localStorage.setItem(LOCAL_STORAGE_KEYS.rateLimitTimestamp, Date.now().toString());
              localStorage.setItem(LOCAL_STORAGE_KEYS.planCount, '1');
          }

          setAppState('SHOWING_FINAL_PLAN');
      } catch (e: any) {
          setError(e.message || 'An unexpected error occurred.');
          setAppState('ERROR');
      }
  };
  
  const handleLocationBack = () => {
    setAppState('SHOWING_OPTIONS');
    setSelectedPlan(null);
  };

  const handleRestart = () => {
    setParams({
      planningMode: '',
      vibe: '',
      timeWindow: '',
      budget: '',
      audience: '',
      timing: '',
      location: null,
      proximity: 'any',
      dateMeal: '',
      specificDateTime: '',
      groupSize: undefined,
      travelPreference: '',
      mustHaves: [],
      openNowOnly: false,
    });
    setCurrentStep(0);
    setPlanOptions(null);
    setFinalPlan(null);
    setSelectedPlan(null);
    setError(null);
    setAppState('WELCOME');
  };

  return {
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
    handleSubmit,
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
  };
};
