import React, { useState } from 'react';
import { formatTimeLeft } from '../../utils/formatters';
import { CrownIcon } from '../Icons';

interface RateLimitScreenProps {
  timeLeft: number;
  onInitiatePayment: (plan: 'micro-boost' | 'power-planner', email: string) => void;
}

const RateLimitScreen: React.FC<RateLimitScreenProps> = ({ timeLeft, onInitiatePayment }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = () => {
    if (!email) {
      setEmailError('Email is required to proceed with payment.');
      return false;
    }
    // Simple regex for email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address.');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handlePayment = (plan: 'micro-boost' | 'power-planner') => {
    if (validateEmail()) {
      setIsLoading(true);
      onInitiatePayment(plan, email);
      // Note: The loading state will persist until the payment modal closes or succeeds,
      // and the app state changes, unmounting this component.
    }
  };

  return (
    <div className="flex flex-col justify-center items-center text-center p-4 h-full z-10 animate-slide-in">
      <div className="w-full max-w-3xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-8 rounded-lg shadow-lg border border-white/50 dark:border-slate-700/50">
        <h2 className="text-3xl font-bold text-[#3E0703] dark:text-slate-100 mb-2">You've used your Free Recharge!</h2>
        <p className="text-[#660B05] dark:text-slate-300 mb-4 text-lg">Showing you the quality of the Vibe! You get one free plan every 24 hours.</p>
        
        <div className="my-6 p-4 bg-[#8C1007]/10 dark:bg-[#E18C44]/10 rounded-lg">
          <p className="text-lg font-semibold text-[#3E0703] dark:text-slate-200">Wait it out! Your next free plan is in:</p>
          <p className="text-4xl font-bold text-[#8C1007] dark:text-[#E18C44] tracking-wider">{formatTimeLeft(timeLeft)}</p>
        </div>
        
        {/* Temporarily hidden per user request */}
        {/*
        <p className="text-[#660B05] dark:text-slate-300 mb-4 text-lg">Or choose a plan to continue planning now:</p>
        
        <div className="w-full max-w-md mx-auto mb-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email for payment receipt"
            className="w-full px-4 py-3 text-center border-2 border-[#8C1007]/50 dark:border-[#E18C44]/50 bg-transparent dark:bg-slate-700/50 rounded-lg focus:ring-2 focus:ring-[#8C1007] dark:focus:ring-[#E18C44] focus:border-[#8C1007] dark:focus:border-[#E18C44] outline-none transition text-[#3E0703] dark:text-slate-100 placeholder:text-[#660B05]/70 dark:placeholder:text-slate-400"
          />
          {emailError && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{emailError}</p>}
        </div>

        <div className="flex flex-col md:flex-row justify-center gap-6">
          <div className="flex-1 p-6 bg-white/80 dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 text-center flex flex-col">
            <CrownIcon className="mx-auto mb-2 text-yellow-500 h-8 w-8" />
            <h3 className="text-2xl font-bold text-[#3E0703] dark:text-slate-100">The Micro-Boost</h3>
            <p className="text-4xl font-bold text-[#8C1007] dark:text-[#E18C44] my-2">GH₵ 3.00</p>
            <div className="text-[#660B05] dark:text-slate-400 text-sm mb-4 flex-grow">
              <p className="font-semibold">4 additional plans (Total 5).</p>
              <p>Valid for 48 hours.</p>
              <p className="mt-2 italic">For spontaneous weekends, group decision-making, and quick fun.</p>
            </div>
            <button
              onClick={() => handlePayment('micro-boost')}
              disabled={isLoading}
              className="w-full mt-auto py-2 px-4 bg-[#8C1007] dark:bg-[#E18C44] text-white dark:text-slate-900 font-bold rounded-lg shadow-md hover:bg-[#660B05] dark:hover:bg-[#f3a469] transition-all disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Pay GH₵3.00 via MoMo'}
            </button>
          </div>
          
          <div className="flex-1 p-6 bg-white/80 dark:bg-slate-800 rounded-xl shadow-lg border-2 border-[#8C1007] dark:border-[#E18C44] flex flex-col">
            <CrownIcon className="mx-auto mb-2 text-yellow-500 h-8 w-8" />
            <h3 className="text-2xl font-bold text-[#3E0703] dark:text-slate-100">The Power Planner</h3>
            <p className="text-4xl font-bold text-[#8C1007] dark:text-[#E18C44] my-2">GH₵ 60.00</p>
            <div className="text-[#660B05] dark:text-slate-400 text-sm mb-4 flex-grow">
               <p className="font-semibold">150 plans per month.</p>
               <p>Includes Vibe History access.</p>
               <p className="mt-2 italic">The frequent planner, ultimate convenience, and never hitting a limit again!</p>
            </div>
            <button
              onClick={() => handlePayment('power-planner')}
              disabled={isLoading}
              className="w-full mt-auto py-2 px-4 bg-[#8C1007] dark:bg-[#E18C44] text-white dark:text-slate-900 font-bold rounded-lg shadow-md hover:bg-[#660B05] dark:hover:bg-[#f3a469] transition-all disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Subscribe for GH₵60.00/Month'}
            </button>
          </div>
        </div>
        */}
      </div>
    </div>
  );
};

export default RateLimitScreen;