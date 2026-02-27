import React, { useState, useEffect } from 'react';
import type { Location, Timing } from '../../types';
import { CurrentLocationIcon } from '../Icons';
import { formatIntendedTime, formatPlanningDateTime, normalizeTimeInput, TIME_SHORTCUTS } from '../../utils/dateTime';

interface LocationInputProps {
  initialIntendedTime?: string;
  timing?: Timing;
  onSubmit: (origin: string, originCoords: Location | null, intendedTime: string) => void;
  onBack: () => void;
}

const LocationInput: React.FC<LocationInputProps> = ({ initialIntendedTime, timing, onSubmit, onBack }) => {
    const [userOrigin, setUserOrigin] = useState<string>('');
    const [originCoords, setOriginCoords] = useState<Location>(null);
    const [intendedTime, setIntendedTime] = useState<string>('');
    const [userOriginError, setUserOriginError] = useState<string | null>(null);
    const [timeError, setTimeError] = useState<string | null>(null);
    const [isGettingCurrentLocation, setIsGettingCurrentLocation] = useState(false);

    useEffect(() => {
        if (initialIntendedTime) {
          setIntendedTime(initialIntendedTime);
        } else {
          setIntendedTime(formatIntendedTime(initialIntendedTime, timing));
        }
    }, [initialIntendedTime, timing]);

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
          setUserOriginError("Geolocation is not supported by your browser.");
          return;
        }
        setIsGettingCurrentLocation(true);
        setUserOriginError(null);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setOriginCoords({ latitude, longitude });
            setUserOrigin(`My current location (lat: ${latitude.toFixed(5)}, long: ${longitude.toFixed(5)})`);
            setIsGettingCurrentLocation(false);
          },
          (err) => {
            let message = "Could not get your location.";
            if (err.code === err.PERMISSION_DENIED) {
              message = "Please enable location access in your browser settings.";
            }
            setUserOriginError(message);
            setIsGettingCurrentLocation(false);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleSubmit = () => {
        if (!intendedTime.trim()) {
          setTimeError('Pick a time to continue.');
          return;
        }
        setTimeError(null);
        const fallbackOrigin = originCoords ? 'My current location' : '';
        onSubmit((userOrigin.trim() || fallbackOrigin), originCoords, normalizeTimeInput(intendedTime.trim()));
    }

    return (
        <div className="flex flex-col justify-center items-center p-4 h-full z-10">
            <div className="w-full max-w-md p-8 rounded-lg shadow-lg text-left animate-slide-in relative" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-soft)' }}>
                <button 
                    onClick={onBack} 
                    className="absolute top-2 left-3 sm:top-3 sm:left-4 text-[#3E0703] dark:text-slate-200 hover:text-[#8C1007] dark:hover:text-white font-bold transition-all flex items-center text-lg py-3 px-4 sm:py-4 rounded-lg hover:bg-[#8C1007]/10 dark:hover:bg-[#E18C44]/20"
                    aria-label="Go back to plan options"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>
                <h2 className="text-2xl font-bold mb-2 text-center pt-10 sm:pt-0" style={{ color: 'var(--text-primary)' }}>One Last Step...</h2>
                <p className="mb-6 text-lg text-center" style={{ color: 'var(--text-secondary)' }}>Let's check the route. Share your start point for traffic and weather confidence.</p>
                <div className="space-y-6">
                    <div>
                        <label htmlFor="userOrigin" className="block text-lg font-semibold text-[#3E0703] dark:text-slate-200 mb-2">Where will you be coming from?</label>
                        <div className="relative">
                            <input
                               id="userOrigin"
                               type="text"
                               value={userOrigin}
                               onChange={(e) => {
                                 setUserOrigin(e.target.value);
                                 setOriginCoords(null);
                               }}
                               placeholder="e.g., A&C Mall, East Legon"
                               className="w-full px-4 py-3 border-2 border-[#8C1007]/50 dark:border-[#E18C44]/50 bg-transparent dark:bg-slate-700/50 rounded-lg focus:ring-2 focus:ring-[#8C1007] dark:focus:ring-[#E18C44] focus:border-[#8C1007] dark:focus:border-[#E18C44] outline-none transition text-[#3E0703] dark:text-slate-100 placeholder:text-[#660B05]/70 dark:placeholder:text-slate-400"
                            />
                            <button 
                             onClick={handleUseCurrentLocation}
                             disabled={isGettingCurrentLocation}
                             className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#3E0703] dark:text-slate-200 hover:bg-[#8C1007]/10 dark:hover:bg-[#E18C44]/20 rounded-full transition-colors disabled:opacity-50"
                             aria-label="Use my current location"
                            >
                             <CurrentLocationIcon spinning={isGettingCurrentLocation} />
                            </button>
                        </div>
                        <p className="text-xs text-[#660B05]/80 dark:text-slate-400 mt-1.5 px-1">For best results, enter a specific landmark or full address.</p>
                        {originCoords && (
                          <p className="text-xs mt-1.5 px-1 font-semibold" style={{ color: 'var(--success)' }}>
                            Using GPS location. Origin text is optional.
                          </p>
                        )}
                        {userOriginError && <p className="text-sm text-red-600 dark:text-red-400 mt-1.5 px-1">{userOriginError}</p>}
                    </div>
                    <div>
                         <label htmlFor="intendedTime" className="block text-lg font-semibold text-[#3E0703] dark:text-slate-200 mb-2">What time do you plan to go?</label>
                        <input
                           id="intendedTime"
                           type="text"
                           value={intendedTime}
                           onChange={(e) => setIntendedTime(e.target.value)}
                           placeholder="e.g., Now, 5 PM Today"
                           className="w-full px-4 py-3 border-2 border-[#8C1007]/50 dark:border-[#E18C44]/50 bg-transparent dark:bg-slate-700/50 rounded-lg focus:ring-2 focus:ring-[#8C1007] dark:focus:ring-[#E18C44] focus:border-[#8C1007] dark:focus:border-[#E18C44] outline-none transition text-[#3E0703] dark:text-slate-100 placeholder:text-[#660B05]/70 dark:placeholder:text-slate-400"
                        />
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {TIME_SHORTCUTS.map((label) => (
                            <button
                              key={label}
                              onClick={() => {
                                setIntendedTime(label);
                                setTimeError(null);
                              }}
                              className="text-xs px-3 py-1 rounded-full bg-[#8C1007]/10 dark:bg-[#E18C44]/20 text-[#660B05] dark:text-slate-300 border border-[#8C1007]/20 dark:border-[#E18C44]/30 hover:bg-[#8C1007]/20 dark:hover:bg-[#E18C44]/30"
                            >
                              {label}
                            </button>
                          ))}
                          {initialIntendedTime && (
                            <button
                              onClick={() => {
                                setIntendedTime(initialIntendedTime);
                                setTimeError(null);
                              }}
                              className="text-xs px-3 py-1 rounded-full bg-white dark:bg-slate-700 text-[#660B05] dark:text-slate-300 border border-[#8C1007]/20 dark:border-[#E18C44]/30 hover:bg-[#8C1007]/10 dark:hover:bg-[#E18C44]/20"
                            >
                              Use plan time
                            </button>
                          )}
                        </div>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                          Planning for: {formatPlanningDateTime(normalizeTimeInput(intendedTime)) || 'Not selected'}
                        </p>
                        {timeError && <p className="text-sm text-red-600 dark:text-red-400 mt-1.5 px-1">{timeError}</p>}
                    </div>
                </div>
                <button
                   onClick={handleSubmit}
                   disabled={(!userOrigin.trim() && !originCoords)}
                   className="w-full mt-8 py-3 px-6 text-white font-bold rounded-lg shadow-md transition-all disabled:opacity-50"
                   style={{ backgroundColor: 'var(--accent-primary)' }}
                >
                   Check Route & Weather
                </button>
            </div>
       </div>
    );
};

export default LocationInput;
