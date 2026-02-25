import React, { useState } from 'react';
import type { SavedPlan } from '../types';
import { CloseIcon, MissionIcon, StarIcon, TimeIcon } from './Icons';
import { getTitleFromPlan } from '../domain/planner/planParser';

const StarRating = ({ rating, onRate }: { rating: number | null, onRate: (rating: number) => void }) => {
    const [hoverRating, setHoverRating] = useState(0);

    return (
        <div className="flex items-center" onMouseLeave={() => setHoverRating(0)}>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    onClick={() => onRate(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    className="text-[#E18C44] dark:text-slate-400 transition-transform duration-150 hover:scale-125"
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                    <StarIcon filled={(hoverRating || rating || 0) >= star} />
                </button>
            ))}
        </div>
    );
};


interface HistoryPanelProps {
  history: SavedPlan[];
  isOpen: boolean;
  onClose: () => void;
  onRatePlan: (id: string, rating: number) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, isOpen, onClose, onRatePlan }) => {
  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-[#FFFCF5]/80 dark:bg-slate-900/90 backdrop-blur-md border-r border-[#8C1007]/10 dark:border-slate-700/50 shadow-2xl transition-transform duration-500 ease-in-out z-40 w-full md:w-80 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="p-4 flex justify-between items-center border-b border-[#8C1007]/20 dark:border-slate-700">
        <h2 className="text-xl font-bold text-[#3E0703] dark:text-slate-100">My Vibe History</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full text-[#3E0703] dark:text-slate-200 hover:bg-[#8C1007]/10 dark:hover:bg-slate-700"
          aria-label="Close history panel"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-65px)]">
        {history.length === 0 ? (
          <div className="text-center mt-12 text-[#660B05] dark:text-slate-400 opacity-70">
            <div className="flex justify-center mb-4">
                <MissionIcon />
            </div>
            <p className="font-semibold">No Saved Vibes Yet</p>
            <p className="text-sm">Choose a plan, and it will be saved here for you to look back on and rate!</p>
          </div>
        ) : (
          history.map(item => (
            <div key={item.id} className="bg-white/50 dark:bg-slate-800/50 p-4 rounded-lg border border-[#8C1007]/20 dark:border-slate-700 animate-slide-in">
              <h3 className="font-bold text-lg text-[#3E0703] dark:text-slate-200">{getTitleFromPlan(item.planContent)}</h3>
              <div className="flex items-center text-xs text-[#660B05] dark:text-slate-400 opacity-80 my-2">
                <TimeIcon />
                <span className="ml-2">Saved on {new Date(item.savedAt).toLocaleDateString()}</span>
              </div>
              <p className="text-[#660B05] dark:text-slate-300 text-sm whitespace-pre-wrap my-3 p-3 bg-[#8C1007]/5 dark:bg-slate-700/50 rounded-md max-h-48 overflow-y-auto">
                {item.planContent}
              </p>
              <div className="mt-3 pt-3 border-t border-[#8C1007]/10 dark:border-slate-700">
                <p className="text-sm font-semibold text-[#3E0703] dark:text-slate-200 mb-1">Rate this vibe:</p>
                <StarRating rating={item.rating} onRate={(rating) => onRatePlan(item.id, rating)} />
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

export default HistoryPanel;
