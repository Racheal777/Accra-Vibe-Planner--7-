import React, { useState, useRef, useMemo, useEffect } from 'react';
import html2canvas from 'html2canvas';
import {
    ShareIcon, RestartIcon, LocationIcon, TravelIcon, TipIcon, MissionIcon,
    CostIcon, TimeIcon, CalendarIcon, WeatherIcon, DownloadIcon, MapItIcon,
    ChecklistIcon, PicnicIcon, VoilaSunIcon, RatingStarIcon, DressCodeIcon,
    NoiseLevelIcon, SeatingIcon, VibeIcon,
} from './Icons';
import type { Vibe } from '../types';
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


const PlanCard = ({ plan, onSelect, onRegenerate, cardRef, isFinal, travelDetails, intendedTime, isRecommended }: {
  plan: ParsedPlan;
  onSelect?: () => void;
  onRegenerate?: () => void;
  cardRef: React.RefObject<HTMLDivElement>;
  isFinal?: boolean;
  travelDetails?: ParsedTravelDetails | null;
  intendedTime?: string;
  isRecommended?: boolean;
}) => {
    const [hasImageError, setHasImageError] = useState(false);

    useEffect(() => {
        setHasImageError(false);
    }, [plan.imageUrl]);

    const handleImageError = () => {
        setHasImageError(true);
    };
    
    const fallbackSrc = defaultImages[plan.category] || defaultImages[''];
    const displaySrc = !plan.imageUrl || hasImageError ? fallbackSrc : plan.imageUrl;

    const ratingMatch = plan.rating.match(/(\d\.\d|\d)/);
    const ratingValue = ratingMatch ? ratingMatch[0] : null;
    const locationShort = plan.location.split(',')[0];
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${plan.location}, Accra, Ghana`)}`;

    const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) => (
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
            {ratingValue && (
                <div className="absolute top-4 right-4 z-10 flex items-center bg-black/60 text-white text-sm font-bold px-3 py-1.5 rounded-full">
                    <RatingStarIcon className="h-4 w-4 text-yellow-300" />
                    <span className="ml-1.5">{ratingValue} / 5</span>
                </div>
            )}

            <div className="relative h-48 w-full">
                <img 
                    src={displaySrc} 
                    alt={plan.title} 
                    className="w-full h-full object-cover" 
                    crossOrigin="anonymous"
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
                         <DetailItem icon={<CalendarIcon className="h-6 w-6"/>} label="Date of Going" value={<p>{intendedTime}</p>} />
                    )}
                </div>

                <div className="flex items-start space-x-3 text-[#3E0703] dark:text-slate-200 p-3 bg-yellow-50 dark:bg-slate-700/50 rounded-lg mb-4">
                    <div className="text-xl text-yellow-600 dark:text-yellow-400 mt-0.5"><TipIcon /></div>
                    <div>
                        <p className="text-xs font-bold text-yellow-700 dark:text-yellow-300">Pro-Tip</p>
                        <p className="text-sm font-semibold">{plan.proTip}</p>
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
            
            {!isFinal && (
                 <div className="p-6 pt-0 mt-auto">
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
                </div>
            )}
        </div>
    );
};


// Main PlanDisplay Component
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
  
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const finalPlanRef = useRef<HTMLDivElement>(null);

  const { plans, recommendation } = useMemo(() => parsePlans(planContent), [planContent]);
  const costToNumber = (costText: string) => {
    const match = costText.match(/(\d+[,\d]*)/);
    if (!match) return null;
    return parseInt(match[1].replace(/,/g, ''), 10);
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
      } catch (error) {
        // Ignore abort errors
      } finally {
        setIsSharing(false);
      }
    } else {
      navigator.clipboard.writeText(contentToShare);
      alert('Plan copied to clipboard!');
    }
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

  const recommendedPlanTitle = getRecommendedPlanTitle(recommendation);

  return (
    <div className="w-full flex flex-col items-center p-4 sm:p-6 md:p-8">
        <div className="text-center mb-8 animate-slide-in">
            <h1 className="text-5xl font-bold text-[#8C1007] dark:text-[#E18C44] mt-2">Here is your plan</h1>
            <p className="text-lg text-[#660B05] dark:text-slate-300 mt-2">Based on your answers, we've found a couple of spots we think you'll love.</p>
        </div>

        {recommendation && (
            <div className="w-full max-w-3xl mx-auto mb-8 animate-slide-in" style={{ animationDelay: '100ms' }}>
                <div className="bg-yellow-50 dark:bg-slate-700/50 p-4 rounded-xl shadow-md flex items-center gap-x-4 border border-yellow-200 dark:border-slate-600">
                    <div className="text-2xl text-yellow-500 dark:text-yellow-400 flex-shrink-0">
                        <TipIcon />
                    </div>
                    <p className="text-base font-semibold text-[#3E0703] dark:text-slate-200">
                        {recommendation.replace('Recommendation:', '').trim()}
                    </p>
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
                                    {plan.openingHours !== 'N/A' ? 'Open hours listed' : 'Hours unclear'}
                                </span>
                                {budgetFit !== null && (
                                    <span className={`text-xs px-2 py-1 rounded-full ${budgetFit ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                                        {budgetFit ? 'Budget fit' : 'Above budget'}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div className="bg-yellow-50 dark:bg-slate-700/50 rounded-xl p-3 border border-yellow-200 dark:border-slate-600">
                    <p className="text-xs uppercase text-[#660B05]/80 dark:text-slate-400">Quick Compare</p>
                    <p className="text-sm font-semibold text-[#3E0703] dark:text-slate-200">
                        Pick by: price fit, location convenience, and opening hours confidence.
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
                {isRequestingLocation ? 'Getting Location...' : "Not feeling it? Find something closer!"}
            </button>
        </div>
    </div>
  );
};

export default PlanDisplay;
