import React, { useEffect, useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import {
  ShareIcon,
  RestartIcon,
  LocationIcon,
  TravelIcon,
  TipIcon,
  CostIcon,
  TimeIcon,
  CalendarIcon,
  WeatherIcon,
  DownloadIcon,
  MapItIcon,
  PicnicIcon,
  RatingStarIcon,
  DressCodeIcon,
  NoiseLevelIcon,
  SeatingIcon,
  VibeIcon,
  UberIcon,
  BoltIcon
} from './Icons';
import type { SavedPlan, Vibe } from '../types';
import {
  getPlanField,
  getRecommendedPlanTitle,
  parsePlans,
  parseTravelDetails,
  splitFinalPlan,
  type ParsedPlan,
  type ParsedTravelDetails,
} from '../domain/planner/planParser';
import { getDurationHours, parseSpecificDateTime } from '../utils/dateTime';
import { LOCAL_STORAGE_KEYS } from '../config/appConfig';
import { trackEvent } from '../lib/analytics/tracker';

const defaultImages: Record<Vibe, string> = {
  'Relax & Unwind': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
  'Food & Nightlife': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
  'Sports & Games': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
  'Active & Adventure': 'https://images.unsplash.com/photo-1533692328991-08159ff19fca?auto=format&fit=crop&w=800&q=80',
  'Movies & Plays': 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
  'Romantic Date': 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=800&q=80',
  'Picnic & Parks': 'https://images.unsplash.com/photo-1561502444-2f22b8f84cb1?auto=format&fit=crop&w=800&q=80',
  '': 'https://images.unsplash.com/photo-1493032585255-aed2b4447477?auto=format&fit=crop&w=800&q=80',
};

type ImagePhase = 'idle' | 'loading-external' | 'external-ok' | 'external-failed' | 'fallback-local';

const isHttpUrl = (value?: string): boolean => !!value && /^https?:\/\//i.test(value);

const weakFieldTips = [
  'Call ahead to confirm hours and availability before leaving.',
  'Check current traffic 20 minutes before departure.',
  'Reserve a table if you are going during peak evening hours.',
  'Save this location in Maps before leaving to avoid signal issues.',
];

interface PlanCardProps {
  plan: ParsedPlan;
  onSelect?: () => void;
  onRegenerate?: () => void;
  onSave?: () => void;
  onFindSimilar?: () => void;
  cardRef: React.RefObject<HTMLDivElement>;
  isFinal?: boolean;
  travelDetails?: ParsedTravelDetails | null;
  intendedTime?: string;
  isRecommended?: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  onSelect,
  onRegenerate,
  onSave,
  onFindSimilar,
  cardRef,
  isFinal,
  travelDetails,
  intendedTime,
  isRecommended,
}) => {
  const [proTipOverride, setProTipOverride] = useState<string | null>(null);
  const activeImageSrc = defaultImages[plan.category] || defaultImages[''];
  const effectiveProTip = proTipOverride || plan.proTip;

  const ratingMatch = plan.rating.match(/(\d\.\d|\d)/);
  const ratingValue = ratingMatch ? ratingMatch[0] : null;
  const locationShort = plan.location.split(',')[0];
  const encodedLocation = encodeURIComponent(`${plan.location}, Accra, Ghana`);
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
  const uberUrl = `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=${encodedLocation}`;
  // Bolt doesn't have a reliable simple web deep link struct like Uber, but we can launch the app search
  const boltUrl = `https://bolt.eu/`;

  const openingConfidence = (openingHours: string): 'High' | 'Medium' | 'Low' => {
    if (openingHours.includes('Not available') || openingHours === 'N/A') return 'Low';
    if (openingHours.includes('-')) return 'High';
    return 'Medium';
  };

  const DetailItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
    <div className="flex items-start space-x-2">
      <div className="text-xl text-[var(--accent-primary)] dark:text-[var(--accent-primary)] pt-0.5">{icon}</div>
      <div className="flex-1">
        <p className="text-xs font-bold text-gray-500 dark:text-slate-400">{label}</p>
        <div className="text-sm font-semibold text-[var(--text-primary)] dark:text-slate-200 mt-0.5">{value}</div>
      </div>
    </div>
  );

  const locationValue = (
    <div className="flex flex-col gap-y-2 mt-1">
      <p className="leading-tight">{locationShort}</p>
      <div className="flex items-center gap-x-2 mt-1">
        <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-700 px-2 py-1.5 rounded-md transition-colors"><MapItIcon /><span className="ml-1">Maps</span></a>
        <a href={uberUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-[10px] font-bold text-white bg-black hover:bg-gray-800 px-2 py-1.5 rounded-md transition-colors"><UberIcon /><span className="ml-1">Uber</span></a>
      </div>
    </div>
  );

  const openLikelihood = openingConfidence(plan.openingHours);
  const openLikelihoodTone =
    openLikelihood === 'High'
      ? 'text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30'
      : openLikelihood === 'Medium'
        ? 'text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/30'
        : 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30';

  return (
    <div ref={cardRef} className="relative w-full bg-white dark:bg-slate-800 rounded-3xl shadow-lg overflow-hidden flex flex-col">
      {isRecommended && (
        <div className="absolute top-0 left-0 z-10 text-white text-xs font-bold px-4 py-1 rounded-br-xl rounded-tl-2xl shadow-lg flex items-center gap-x-1.5" style={{ backgroundColor: 'var(--accent-primary)' }}>
          <RatingStarIcon className="h-4 w-4" />
          <span>Recommended</span>
        </div>
      )}
      <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-slate-900/80 text-[11px] font-bold px-2 py-1 rounded-full text-[var(--accent-primary-hover)] dark:text-slate-200 shadow-md">
        Representative image
      </div>
      {ratingValue && (
        <div className="absolute top-4 right-4 z-10 flex items-center bg-black/60 text-white text-sm font-bold px-3 py-1.5 rounded-full">
          <RatingStarIcon className="h-4 w-4 text-yellow-300" />
          <span className="ml-1.5">{ratingValue} / 5</span>
        </div>
      )}

      <div className="relative h-48 w-full bg-gray-200 dark:bg-slate-700">
        <img
          src={activeImageSrc}
          alt={plan.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/35"></div>
        <div className="absolute bottom-0 left-0 p-4">
          <h3 className="text-2xl font-bold text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.7)' }}>{plan.title}</h3>
          {isRecommended && (
            <p className="text-xs text-white/90 mt-1">Why recommended: best match for your vibe, budget, and timing.</p>
          )}
        </div>
      </div>

      <div className="p-6 flex-grow flex flex-col">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-4 border-b border-gray-200 dark:border-slate-700 pb-4">
          <DetailItem icon={<LocationIcon />} label="Location" value={locationValue} />
          <DetailItem icon={<TimeIcon />} label="Opening Hours" value={
            <div>
              <p>{plan.openingHours}</p>
              <span className={`inline-flex mt-1 text-[11px] px-2 py-0.5 rounded-full font-bold ${openLikelihoodTone}`}>Likely open: {openLikelihood}</span>
            </div>
          } />
          <DetailItem icon={<NoiseLevelIcon />} label="Noise Level" value={<p>{plan.noiseLevel && plan.noiseLevel !== 'N/A' ? plan.noiseLevel : 'Unknown'}</p>} />
        </div>

        <p className="text-sm text-[var(--text-primary)] dark:text-slate-300 font-medium leading-relaxed mb-4">{plan.description}</p>

        <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-4">
          {(plan.seating && plan.seating !== 'N/A' && plan.seating.trim() !== '') && <DetailItem icon={<SeatingIcon />} label="Seating" value={<p>{plan.seating}</p>} />}
          {(plan.dressCode && plan.dressCode !== 'N/A' && plan.dressCode.trim() !== '') && <DetailItem icon={<DressCodeIcon />} label="Dress Code" value={<p>{plan.dressCode}</p>} />}
          {isFinal && intendedTime && (
            <DetailItem icon={<CalendarIcon className="h-6 w-6" />} label="Date of Going" value={<p>{intendedTime}</p>} />
          )}
        </div>

        <div className="flex items-start space-x-3 text-[var(--text-primary)] dark:text-slate-200 p-3 bg-yellow-50 dark:bg-slate-700/50 rounded-lg mb-4">
          <div className="text-xl text-yellow-600 dark:text-yellow-400 mt-0.5"><TipIcon /></div>
          <div>
            <p className="text-xs font-bold text-yellow-700 dark:text-yellow-300">Pro-Tip</p>
            <p className="text-sm font-semibold">{effectiveProTip}</p>
          </div>
        </div>

        <div className="flex gap-4 mb-4" style={{ color: 'var(--text-secondary)' }}>
          {plan.cost && plan.cost !== 'N/A' && (
            <div className="flex items-center gap-1.5 p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-soft)' }}>
              <svg className="w-5 h-5" style={{ color: 'var(--success)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-semibold">{plan.cost}</span>
            </div>
          )}

          {isFinal && plan.weather && plan.weather !== 'N/A' && (
            <div className="flex items-center gap-1.5 p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-soft)' }}>
              <svg className="w-4 h-4" style={{ color: 'var(--info)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path></svg>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{plan.weather}</span>
            </div>
          )}
        </div>

        {plan.picnicEssentials && (
          <div className="flex items-start space-x-3 text-[var(--text-primary)] dark:text-slate-200 p-3 bg-green-50 dark:bg-slate-700/50 rounded-lg mb-4">
            <div className="text-xl text-green-600 dark:text-green-400 mt-0.5"><PicnicIcon /></div>
            <div>
              <p className="text-xs font-bold text-green-700 dark:text-green-300">Picnic Essentials</p>
              <ul className="list-disc list-inside mt-1">
                {plan.picnicEssentials.map(item => <li key={item} className="text-sm font-semibold">{item}</li>)}
              </ul>
            </div>
          </div>
        )}

        {isFinal && travelDetails && (
          <div className="mt-2 border-t border-gray-200 dark:border-slate-700 pt-4">
            <h4 className="text-lg font-bold text-[var(--text-primary)] dark:text-slate-200 mb-3">Travel & Weather Forecast</h4>
            <div className="flex flex-col space-y-3">
              <DetailItem icon={<TravelIcon />} label="Distance" value={<p>{travelDetails.distance}</p>} />
              <DetailItem icon={<TimeIcon />} label="Travel Time" value={<p>{travelDetails.travelTime}</p>} />
              <DetailItem icon={<VibeIcon />} label="Traffic" value={<p>{travelDetails.traffic}</p>} />
              <DetailItem icon={<WeatherIcon />} label="Weather" value={<p>{travelDetails.weather}</p>} />
            </div>
          </div>
        )}
      </div>

      <div className="p-6 pt-0 mt-auto space-y-3">
        {!isFinal && (
          <div className="flex items-center space-x-2">
            <button
              onClick={onSelect}
              className="w-full py-3 px-4 bg-[var(--accent-primary)] text-white font-bold rounded-xl shadow-md hover:bg-[var(--accent-primary-hover)] transition-all duration-300 transform hover:scale-105"
            >
              Select this plan
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-2">
          {onSave && <button onClick={onSave} className="text-xs py-2 rounded-lg bg-[var(--accent-primary)]/10 dark:bg-[var(--accent-primary)]/20 text-[var(--accent-primary-hover)] dark:text-slate-200 font-semibold">Save</button>}
        </div>
      </div>
    </div>
  );
};

interface PlanDisplayProps {
  planContent: string;
  onRestart: () => void;
  onSelectPlan?: (planContent: string) => void;
  onFindCloser?: () => void;
  onRegenerate?: () => void;
  isFinalPlan?: boolean;
  isRequestingLocation?: boolean;
  intendedTime?: string;
  specificDateTime?: string;
  timeWindow?: string;
  selectedBudget?: string;
}

const PlanDisplay: React.FC<PlanDisplayProps> = ({ planContent, onRestart, onSelectPlan, onFindCloser, onRegenerate, isFinalPlan, isRequestingLocation, intendedTime, specificDateTime, timeWindow, selectedBudget }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [historyMedianByCategory, setHistoryMedianByCategory] = useState<Record<string, number>>({});

  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const finalPlanRef = useRef<HTMLDivElement>(null);

  const { plans, recommendation } = useMemo(() => parsePlans(planContent), [planContent]);
  const recommendedPlanTitle = getRecommendedPlanTitle(recommendation);

  const { finalPlans, travelDetails } = useMemo(() => {
    if (!isFinalPlan) return { finalPlans: [], travelDetails: null };
    const { planSection: planString, travelSection: travelString } = splitFinalPlan(planContent);
    return {
      finalPlans: parsePlans(planString).plans,
      travelDetails: parseTravelDetails(travelString),
    };
  }, [isFinalPlan, planContent]);

  useEffect(() => {
    console.log('[DEBUG] Parsed Plans:', plans);
    if (isFinalPlan) console.log('[DEBUG] Final Parsed Plans:', finalPlans);
  }, [plans, finalPlans, isFinalPlan]);

  const costToNumber = (costText: string): number | null => {
    const match = costText.match(/(\d+[\,\d]*)/);
    if (!match) return null;
    return parseInt(match[1].replace(/,/g, ''), 10);
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.planHistory);
      if (!raw) return;
      const history = JSON.parse(raw) as SavedPlan[];
      const grouped: Record<string, number[]> = {};
      history.forEach((entry) => {
        const parsed = parsePlans(entry.planContent).plans[0];
        if (!parsed) return;
        const cost = costToNumber(parsed.cost);
        if (cost === null) return;
        if (!grouped[parsed.category]) grouped[parsed.category] = [];
        grouped[parsed.category].push(cost);
      });
      const medians: Record<string, number> = {};
      Object.entries(grouped).forEach(([category, costs]) => {
        const sorted = [...costs].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        medians[category] = sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid];
      });
      setHistoryMedianByCategory(medians);
    } catch (error) {
      console.error('Failed to compute history median costs', error);
    }
  }, [planContent]);

  const openingConfidence = (openingHours: string): 'High' | 'Medium' | 'Low' => {
    if (openingHours.includes('Not available') || openingHours === 'N/A') return 'Low';
    if (openingHours.includes('-')) return 'High';
    return 'Medium';
  };


  const savePlan = (rawPlan: string) => {
    const existing = localStorage.getItem(LOCAL_STORAGE_KEYS.planHistory);
    const parsed: SavedPlan[] = existing ? JSON.parse(existing) : [];
    const saved: SavedPlan = {
      id: new Date().toISOString(),
      planContent: rawPlan,
      savedAt: new Date().toISOString(),
      rating: null,
    };
    localStorage.setItem(LOCAL_STORAGE_KEYS.planHistory, JSON.stringify([saved, ...parsed]));
    alert('Saved to your vibe history.');
  };

  const handleDownload = async (elementRef: React.RefObject<HTMLDivElement>, filename: string) => {
    if (isDownloading) return;
    const elementToCapture = elementRef.current;
    if (!elementToCapture) return;

    setIsDownloading(true);
    elementToCapture.classList.add('capturing');

    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      const canvas = await html2canvas(elementToCapture, { backgroundColor: null, scale: 2, useCORS: true });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${filename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download plan:', error);
    } finally {
      elementToCapture.classList.remove('capturing');
      setIsDownloading(false);
    }
  };

  const handleAddToCalendar = () => {
    const mainPlanContent = plans.length > 0 ? plans[0].rawContent : '';
    if (!mainPlanContent) return;

    const title = `Vibe Plan: ${getPlanField(mainPlanContent, 'Title')}`;
    const location = getPlanField(mainPlanContent, 'Location');
    const description = [
      getPlanField(mainPlanContent, 'Description'),
      `\nCost: ${getPlanField(mainPlanContent, 'Cost')}`,
      `Rating: ${getPlanField(mainPlanContent, 'Rating')}`,
      `Pro-Tip: ${getPlanField(mainPlanContent, 'Pro-Tip')}`,
    ].join('\n');

    const startDate = parseSpecificDateTime(specificDateTime);
    const durationHours = getDurationHours(timeWindow);
    const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);

    const formatDateForGoogle = (date: Date): string => {
      return date.toISOString().replace(/-|:|\.\d{3}/g, '');
    };

    const calendarDates = `${formatDateForGoogle(startDate)}/${formatDateForGoogle(endDate)}`;

    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${calendarDates}&location=${encodeURIComponent(location)}&details=${encodeURIComponent(description)}`;

    window.open(googleCalendarUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSendToGC = () => {
    if (isFinalPlan) {
      const { planSection: planString } = splitFinalPlan(planContent);
      const { plans: finalPlans } = parsePlans(planString);
      const plan = finalPlans.length > 0 ? finalPlans[0] : null;

      if (!plan) return;

      const text = `Hey guys, I planned our hangout! 🥳\n\n📌 *${plan.title}*\n📍 ${plan.location}\n💰 Est. ${plan.cost}\n🚗 ${plan.estimatedRideCost ? `Ride: ${plan.estimatedRideCost}` : 'Ride info unavailable'}\n☁️ ${plan.weather ? plan.weather : 'Weather unavailable'}\n\nWhat time works best for everyone?`;
      navigator.clipboard.writeText(text);
      alert("Plan copied to clipboard! Paste it into your Group Chat.");
    } else {
      if (plans.length < 2) return;
      const text = `Help me decide where we should go! 🗳️\n\n*Option 1: ${plans[0].title}*\n📍 ${plans[0].location}\n💰 Est. ${plans[0].cost}\n🚗 Ride: ${plans[0].estimatedRideCost || 'N/A'}\n\n*Option 2: ${plans[1].title}*\n📍 ${plans[1].location}\n💰 Est. ${plans[1].cost}\n🚗 Ride: ${plans[1].estimatedRideCost || 'N/A'}\n\nReply with 1 or 2!`;
      navigator.clipboard.writeText(text);
      alert("Poll copied to clipboard! Paste it into your Group Chat.");
    }
  };

  if (isFinalPlan) {
    const finalPlanData = finalPlans.length > 0 ? finalPlans[0] : null;

    if (!finalPlanData) {
      return (
        <div className="text-center p-8">
          <p className="text-red-500">Could not display the final plan.</p>
        </div>
      );
    }

    return (
      <div className="w-full flex flex-col items-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-lg animate-slide-in">
          <PlanCard
            cardRef={finalPlanRef}
            plan={finalPlanData}
            isFinal={true}
            travelDetails={travelDetails}
            intendedTime={intendedTime}
            onSave={() => savePlan(planContent)}
          />
        </div>
        <div className="mt-8 flex justify-center items-center flex-wrap w-full max-w-3xl gap-4">
          <button onClick={handleAddToCalendar} className="flex items-center px-4 py-2 bg-white/60 dark:bg-slate-800/60 text-[var(--text-primary)] dark:text-slate-200 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-all shadow-md border border-white/50 dark:border-slate-700/50"><CalendarIcon className="h-5 w-5" /><span className="ml-2">Add to Calendar</span></button>
          <button onClick={() => handleDownload(finalPlanRef, 'accra-vibe-plan')} disabled={isDownloading} className="flex items-center px-4 py-2 bg-white/60 dark:bg-slate-800/60 text-[var(--text-primary)] dark:text-slate-200 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-all shadow-md border border-white/50 dark:border-slate-700/50 disabled:opacity-50"><DownloadIcon /><span className="ml-2">{isDownloading ? 'Saving...' : 'Download'}</span></button>
          <button onClick={handleSendToGC} className="flex items-center px-4 py-2 bg-white/60 dark:bg-slate-800/60 text-[var(--text-primary)] dark:text-slate-200 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-all shadow-md border border-white/50 dark:border-slate-700/50"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg><span className="ml-2">Send to Group Chat</span></button>
          <button onClick={onRestart} className="flex items-center px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-[var(--accent-primary-hover)] transition-colors shadow-md"><RestartIcon /><span className="ml-2">Start Over</span></button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="text-center mb-8 animate-slide-in">
        <h1 className="text-5xl font-bold text-[var(--accent-primary)] dark:text-[var(--accent-primary)] mt-2">Here is your plan</h1>
        <p className="text-lg text-[var(--accent-primary-hover)] dark:text-slate-300 mt-2">Based on your answers, we've found a couple of spots we think you'll love.</p>
      </div>

      {recommendation && (
        <div className="w-full max-w-3xl mx-auto mb-8 animate-slide-in" style={{ animationDelay: '100ms' }}>
          <div className="bg-yellow-50 dark:bg-slate-700/50 p-4 rounded-xl shadow-md border border-yellow-200 dark:border-slate-600">
            <p className="text-base font-semibold text-[var(--text-primary)] dark:text-slate-200">
              {recommendation.replace(/Recommendation:\s*/i, '').trim()}
            </p>
            {recommendedPlanTitle && (
              <p className="text-sm mt-1 text-[var(--accent-primary-hover)] dark:text-slate-300">
                Recommended based on your timing and budget.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 items-stretch animate-slide-in">
        {plans.map((plan, index) => (
          <div key={plan.id || index} className="w-full md:w-1/2 flex-shrink-0">
            <PlanCard
              cardRef={index === 0 ? card1Ref : card2Ref}
              plan={plan}
              onSelect={() => onSelectPlan && onSelectPlan(plan.rawContent)}
              onRegenerate={onRegenerate}
              onSave={() => savePlan(plan.rawContent)}
              onFindSimilar={onFindCloser}
              isRecommended={plan.title === recommendedPlanTitle}
            />
          </div>
        ))}
      </div>


      <div className="mt-8 text-center animate-slide-in">
        <button
          onClick={onFindCloser}
          disabled={isRequestingLocation}
          className="py-3 px-8 bg-yellow-400 text-yellow-900 font-bold rounded-full shadow-lg hover:bg-yellow-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait text-lg"
        >
          {isRequestingLocation ? 'Getting Location...' : 'Not feeling it? Find something closer!'}
        </button>
      </div>
    </div>
  );
};

export default PlanDisplay;
