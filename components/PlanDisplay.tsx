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

const defaultImages: Record<Vibe, string> = {
  'Relax & Unwind': '/assets/relax.jpg',
  'Food & Nightlife': '/assets/food.jpg',
  'Rich Kids Sports': '/assets/sports.jpg',
  'Active & Adventure': '/assets/adventure.jpg',
  'Movies & Plays': '/assets/theatre.jpg',
  'Romantic Date': '/assets/romantic.jpg',
  'Picnic & Parks': '/assets/picnic.jpg',
  '': '/assets/default.jpg',
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
  onShare?: () => void;
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
  onShare,
  onSave,
  onFindSimilar,
  cardRef,
  isFinal,
  travelDetails,
  intendedTime,
  isRecommended,
}) => {
  const [imagePhase, setImagePhase] = useState<ImagePhase>('idle');
  const [imageAttempt, setImageAttempt] = useState(0);
  const [useMapImage, setUseMapImage] = useState(false);
  const [proTipOverride, setProTipOverride] = useState<string | null>(null);

  const fallbackSrc = defaultImages[plan.category] || defaultImages[''];
  const baseExternalSrc = isHttpUrl(plan.imageUrl) ? plan.imageUrl : '';
  const externalSrc = baseExternalSrc ? `${baseExternalSrc}${baseExternalSrc.includes('?') ? '&' : '?'}v=${imageAttempt}` : '';
  const mapThumbnailSrc = `https://staticmap.openstreetmap.de/staticmap.php?center=${encodeURIComponent(`${plan.location}, Accra, Ghana`)}&zoom=14&size=800x400&markers=${encodeURIComponent(`${plan.location}, Accra, Ghana`)},red-pushpin`;

  useEffect(() => {
    if (useMapImage) {
      setImagePhase('external-ok');
      return;
    }

    if (externalSrc) {
      setImagePhase('loading-external');
    } else {
      setImagePhase('fallback-local');
    }
  }, [externalSrc, useMapImage]);

  const handleExternalLoad = () => {
    setImagePhase('external-ok');
  };

  const handleImageError = () => {
    if (useMapImage) {
      setUseMapImage(false);
    }
    setImagePhase('external-failed');
    setTimeout(() => setImagePhase('fallback-local'), 0);
  };

  const activeImageSrc = useMapImage
    ? mapThumbnailSrc
    : (imagePhase === 'external-ok' || imagePhase === 'loading-external') && externalSrc
    ? externalSrc
    : fallbackSrc;

  const showRepresentativeBadge = useMapImage || imagePhase === 'fallback-local' || plan.imageStatus === 'fallback';
  const effectiveProTip = proTipOverride || plan.proTip;

  const ratingMatch = plan.rating.match(/(\d\.\d|\d)/);
  const ratingValue = ratingMatch ? ratingMatch[0] : null;
  const locationShort = plan.location.split(',')[0];
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${plan.location}, Accra, Ghana`)}`;

  const DetailItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
    <div className="flex items-start space-x-2">
      <div className="text-xl text-[#8C1007] dark:text-[#E18C44] pt-0.5">{icon}</div>
      <div>
        <p className="text-xs font-bold text-gray-500 dark:text-slate-400">{label}</p>
        <div className="text-sm font-semibold text-[#3E0703] dark:text-slate-200">{value}</div>
      </div>
    </div>
  );

  const locationValue = (
    <div className="flex items-center gap-x-2 flex-wrap">
      <p>{locationShort}</p>
      {isFinal && (
        <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs font-bold text-[#8C1007] dark:text-[#E18C44] hover:text-[#660B05] dark:hover:text-[#ffc58a] bg-[#8C1007]/10 dark:bg-[#E18C44]/10 px-2 py-1 rounded-full shadow-sm border border-[#8C1007]/20 dark:border-[#E18C44]/20"><MapItIcon /><span className="ml-1">Map It</span></a>
      )}
    </div>
  );

  return (
    <div ref={cardRef} className="relative w-full bg-white dark:bg-slate-800 rounded-3xl shadow-lg overflow-hidden flex flex-col">
      {isRecommended && (
        <div className="absolute top-0 left-0 z-10 bg-gradient-to-br from-[#8C1007] to-[#E18C44] text-white text-xs font-bold px-4 py-1 rounded-br-xl rounded-tl-2xl shadow-lg flex items-center gap-x-1.5">
          <RatingStarIcon className="h-4 w-4" />
          <span>Recommended</span>
        </div>
      )}
      {showRepresentativeBadge && (
        <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-slate-900/80 text-[11px] font-bold px-2 py-1 rounded-full text-[#660B05] dark:text-slate-200">
          {useMapImage ? 'Map preview' : 'Representative image'}
        </div>
      )}
      {ratingValue && (
        <div className="absolute top-4 right-4 z-10 flex items-center bg-black/60 text-white text-sm font-bold px-3 py-1.5 rounded-full">
          <RatingStarIcon className="h-4 w-4 text-yellow-300" />
          <span className="ml-1.5">{ratingValue} / 5</span>
        </div>
      )}

      <div className="relative h-48 w-full bg-gray-200 dark:bg-slate-700">
        {imagePhase === 'loading-external' && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700" />
        )}
        <img
          src={activeImageSrc}
          alt={plan.title}
          className="w-full h-full object-cover"
          crossOrigin="anonymous"
          onLoad={handleExternalLoad}
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4">
          <h3 className="text-2xl font-bold text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.7)' }}>{plan.title}</h3>
        </div>
      </div>

      <div className="p-6 flex-grow flex flex-col">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-4 border-b border-gray-200 dark:border-slate-700 pb-4">
          <DetailItem icon={<CostIcon />} label="Cost" value={<p>{plan.cost}</p>} />
          <DetailItem icon={<TimeIcon />} label="Opening Hours" value={<p>{plan.openingHours}</p>} />
          <DetailItem icon={<LocationIcon />} label="Location" value={locationValue} />
          <DetailItem icon={<NoiseLevelIcon />} label="Noise Level" value={<p>{plan.noiseLevel}</p>} />
        </div>

        <p className="text-sm text-[#3E0703] dark:text-slate-300 font-medium leading-relaxed mb-4">{plan.description}</p>

        <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-4">
          <DetailItem icon={<SeatingIcon />} label="Seating" value={<p>{plan.seating}</p>} />
          <DetailItem icon={<DressCodeIcon />} label="Dress Code" value={<p>{plan.dressCode}</p>} />
          {isFinal && intendedTime && (
            <DetailItem icon={<CalendarIcon className="h-6 w-6" />} label="Date of Going" value={<p>{intendedTime}</p>} />
          )}
        </div>

        <div className="flex items-start space-x-3 text-[#3E0703] dark:text-slate-200 p-3 bg-yellow-50 dark:bg-slate-700/50 rounded-lg mb-4">
          <div className="text-xl text-yellow-600 dark:text-yellow-400 mt-0.5"><TipIcon /></div>
          <div>
            <p className="text-xs font-bold text-yellow-700 dark:text-yellow-300">Pro-Tip</p>
            <p className="text-sm font-semibold">{effectiveProTip}</p>
          </div>
        </div>

        {plan.picnicEssentials && (
          <div className="flex items-start space-x-3 text-[#3E0703] dark:text-slate-200 p-3 bg-green-50 dark:bg-slate-700/50 rounded-lg mb-4">
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
            <h4 className="text-lg font-bold text-[#3E0703] dark:text-slate-200 mb-3">Travel & Weather Forecast</h4>
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
              className="flex-grow py-3 px-4 bg-[#8C1007] text-white font-bold rounded-xl shadow-md hover:bg-[#660B05] transition-all duration-300 transform hover:scale-105"
            >
              Select this plan
            </button>
            {onRegenerate && (
              <button onClick={onRegenerate} aria-label="Get new suggestion" className="p-3 bg-gray-100 dark:bg-slate-700 rounded-xl text-[#3E0703] dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                <RestartIcon />
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {onSave && <button onClick={onSave} className="text-xs py-2 rounded-lg bg-[#8C1007]/10 dark:bg-[#E18C44]/20 text-[#660B05] dark:text-slate-200 font-semibold">Save</button>}
          {onShare && <button onClick={onShare} className="text-xs py-2 rounded-lg bg-[#8C1007]/10 dark:bg-[#E18C44]/20 text-[#660B05] dark:text-slate-200 font-semibold">Share</button>}
          <button onClick={() => setImageAttempt(prev => prev + 1)} className="text-xs py-2 rounded-lg bg-[#8C1007]/10 dark:bg-[#E18C44]/20 text-[#660B05] dark:text-slate-200 font-semibold">Try another photo</button>
          <button onClick={() => setUseMapImage(true)} className="text-xs py-2 rounded-lg bg-[#8C1007]/10 dark:bg-[#E18C44]/20 text-[#660B05] dark:text-slate-200 font-semibold">Use venue map image</button>
        </div>

        <button
          onClick={() => {
            setImageAttempt(prev => prev + 1);
            const randomTip = weakFieldTips[Math.floor(Math.random() * weakFieldTips.length)];
            setProTipOverride(randomTip);
          }}
          className="w-full text-xs py-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold"
        >
          Retry weak fields (image/pro-tip)
        </button>

        {onFindSimilar && (
          <button onClick={onFindSimilar} className="w-full text-xs py-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 font-semibold">
            Find similar nearby
          </button>
        )}
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

  const handleShare = async (contentToShare: string) => {
    if (isSharing) return;

    if (navigator.share) {
      try {
        setIsSharing(true);
        await navigator.share({
          title: 'Accra Vibe Planner has a plan for us!',
          text: contentToShare,
        });
      } catch (_) {
        // ignored
      } finally {
        setIsSharing(false);
      }
    } else {
      navigator.clipboard.writeText(contentToShare);
      alert('Plan copied to clipboard!');
    }
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

  if (isFinalPlan) {
    const { planSection: planString, travelSection: travelString } = splitFinalPlan(planContent);

    const { plans: finalPlans } = useMemo(() => parsePlans(planString), [planString]);
    const travelDetails = useMemo(() => parseTravelDetails(travelString), [travelString]);
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
            onShare={() => handleShare(planContent)}
            onSave={() => savePlan(planContent)}
          />
        </div>
        <div className="mt-8 flex justify-center items-center flex-wrap w-full max-w-3xl gap-4">
          <button onClick={handleAddToCalendar} className="flex items-center px-4 py-2 bg-white/60 dark:bg-slate-800/60 text-[#3E0703] dark:text-slate-200 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-all shadow-md border border-white/50 dark:border-slate-700/50"><CalendarIcon className="h-5 w-5"/><span className="ml-2">Add to Calendar</span></button>
          <button onClick={() => handleDownload(finalPlanRef, 'accra-vibe-plan')} disabled={isDownloading} className="flex items-center px-4 py-2 bg-white/60 dark:bg-slate-800/60 text-[#3E0703] dark:text-slate-200 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-all shadow-md border border-white/50 dark:border-slate-700/50 disabled:opacity-50"><DownloadIcon /><span className="ml-2">{isDownloading ? 'Saving...' : 'Download'}</span></button>
          <button onClick={() => handleShare(planContent)} disabled={isSharing} className="flex items-center px-4 py-2 bg-white/60 dark:bg-slate-800/60 text-[#3E0703] dark:text-slate-200 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-all shadow-md border border-white/50 dark:border-slate-700/50 disabled:opacity-50"><ShareIcon /><span className="ml-2">{isSharing ? 'Sharing...' : 'Share'}</span></button>
          <button onClick={onRestart} className="flex items-center px-4 py-2 bg-[#8C1007] text-white rounded-lg hover:bg-[#660B05] transition-colors shadow-md"><RestartIcon /><span className="ml-2">Start Over</span></button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="text-center mb-8 animate-slide-in">
        <h1 className="text-5xl font-bold text-[#8C1007] dark:text-[#E18C44] mt-2">Here is your plan</h1>
        <p className="text-lg text-[#660B05] dark:text-slate-300 mt-2">Based on your answers, we've found a couple of spots we think you'll love.</p>
      </div>

      {recommendation && (
        <div className="w-full max-w-3xl mx-auto mb-8 animate-slide-in" style={{ animationDelay: '100ms' }}>
          <div className="bg-yellow-50 dark:bg-slate-700/50 p-4 rounded-xl shadow-md border border-yellow-200 dark:border-slate-600">
            <p className="text-base font-semibold text-[#3E0703] dark:text-slate-200">
              {recommendation.replace('Recommendation:', '').trim()}
            </p>
            {recommendedPlanTitle && (
              <p className="text-sm mt-1 text-[#660B05] dark:text-slate-300">
                Why recommended: {recommendedPlanTitle} best matches your vibe and selected constraints.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 items-stretch animate-slide-in">
        {plans.map((plan, index) => (
          <div key={index} className="w-full md:w-1/2 flex-shrink-0">
            <PlanCard
              cardRef={index === 0 ? card1Ref : card2Ref}
              plan={plan}
              onSelect={() => onSelectPlan && onSelectPlan(plan.rawContent)}
              onRegenerate={onRegenerate}
              onShare={() => handleShare(plan.rawContent)}
              onSave={() => savePlan(plan.rawContent)}
              onFindSimilar={onFindCloser}
              isRecommended={plan.title === recommendedPlanTitle}
            />
          </div>
        ))}
      </div>

      {plans.length === 2 && (
        <div className="w-full max-w-5xl mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          {[0, 1].map((idx) => {
            const plan = plans[idx];
            const cost = costToNumber(plan.cost);
            const budgetFit = selectedBudget === 'Basically Free'
              ? (cost !== null && cost <= 80)
              : selectedBudget === 'Mid-Range'
              ? (cost !== null && cost <= 200)
              : selectedBudget === 'Feeling Fancy'
              ? true
              : null;
            return (
              <div key={plan.title} className="bg-white/70 dark:bg-slate-800/70 rounded-xl p-3 border border-[#8C1007]/10 dark:border-slate-700">
                <p className="text-xs uppercase text-[#660B05]/80 dark:text-slate-400">Option {idx + 1}</p>
                <p className="font-bold text-[#3E0703] dark:text-slate-100">{plan.title}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className="text-xs px-2 py-1 rounded-full bg-[#8C1007]/10 dark:bg-[#E18C44]/20 text-[#660B05] dark:text-slate-300">
                    Open confidence: {openingConfidence(plan.openingHours)}
                  </span>
                  {budgetFit !== null && (
                    <span className={`text-xs px-2 py-1 rounded-full ${budgetFit ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                      {budgetFit ? 'Budget fit' : 'Above budget'}
                    </span>
                  )}
                  {historyMedianByCategory[plan.category] && (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      Typical: ~GH₵{historyMedianByCategory[plan.category]}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          <div className="bg-yellow-50 dark:bg-slate-700/50 rounded-xl p-3 border border-yellow-200 dark:border-slate-600">
            <p className="text-xs uppercase text-[#660B05]/80 dark:text-slate-400">Quick Compare</p>
            <p className="text-sm font-semibold text-[#3E0703] dark:text-slate-200">
              Decide by budget fit, open confidence, and location convenience.
            </p>
          </div>
        </div>
      )}

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
