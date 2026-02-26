import React from 'react';
import LandingTrotro from '../LandingTrotro';

interface WelcomeScreenProps {
  onStart: (mode: 'quick' | 'detailed') => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-4 z-10 animate-slide-in">
      <div className="relative w-full h-36">
        <LandingTrotro />
      </div>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-extrabold text-[#3E0703] dark:text-slate-100 mb-4">
          Accra Vibe Planner
        </h1>
        <p className="text-[#660B05] dark:text-slate-300 text-xl mb-8 max-w-lg mx-auto">
          Don't search for a spot, Chale. We already mapped the vibe and the bailout plan.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => onStart('quick')}
            className="px-8 py-4 rounded-lg text-xl font-bold transition-all duration-300 transform hover:scale-105 bg-[#8C1007] dark:bg-[#E18C44] text-white dark:text-slate-900 border-[#8C1007] dark:border-[#E18C44] shadow-lg animate-pulse-subtle"
          >
            Quick Plan
          </button>
          <button
            onClick={() => onStart('detailed')}
            className="px-8 py-4 rounded-lg text-xl font-bold transition-all duration-300 transform hover:scale-105 bg-white/80 dark:bg-slate-700 text-[#3E0703] dark:text-slate-100 border-2 border-[#8C1007]/30 dark:border-[#E18C44]/40 shadow-lg"
          >
            Detailed Plan
          </button>
        </div>
        <p className="text-sm mt-4 text-[#660B05]/80 dark:text-slate-400">
          Quick: 3 taps, ready in under 20s. Detailed: deeper matching + travel filters.
        </p>
        <div className="flex justify-center gap-2 mt-4 flex-wrap">
          {['Open now', 'Budget-fit', 'Close-by'].map((badge) => (
            <span
              key={badge}
              className="text-xs px-3 py-1 rounded-full bg-[#8C1007]/10 dark:bg-[#E18C44]/20 text-[#660B05] dark:text-slate-300 border border-[#8C1007]/20 dark:border-[#E18C44]/30"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
