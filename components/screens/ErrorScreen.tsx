import React from 'react';

interface ErrorScreenProps {
  error: string | null;
  onRestart: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ error, onRestart }) => {
  return (
    <div className="flex flex-col justify-center items-center text-center p-4 h-full z-10">
      <div className="w-full max-w-md bg-white/80 dark:bg-red-900/40 backdrop-blur-sm p-8 rounded-lg shadow-xl border border-red-200/50" role="alert">
        <h2 className="text-2xl font-bold text-[#8C1007] dark:text-red-300 mb-4">Oops! Something went wrong.</h2>
        <p className="text-[#3E0703] dark:text-red-200 mb-6" aria-live="polite">{error}</p>
        <button onClick={onRestart} className="px-6 py-2 bg-[#3E0703] dark:bg-red-800 text-white rounded-lg">Try Again</button>
      </div>
    </div>
  );
};

export default ErrorScreen;
