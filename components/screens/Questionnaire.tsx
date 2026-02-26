import React, { useState, useEffect, useMemo } from 'react';
import { getQuestions } from '../../utils/questions';
import type { HangoutParams } from '../../types';
import { TIME_SHORTCUTS, formatPlanningDateTime, getDateTimeFromShortcut } from '../../utils/dateTime';

interface QuestionnaireProps {
    params: HangoutParams;
    currentStep: number;
    isTransitioning: boolean;
    onOptionSelect: (key: keyof HangoutParams | 'specificDateTime', value: any) => void;
    onBack: () => void;
    onJumpToStep: (step: number) => void;
    onBackToWelcome: () => void;
    onSurpriseMe: (key: keyof HangoutParams, options: readonly {name: string, value: any}[]) => void;
    onSpecificTimeSubmit: (date: string, hour: string, minute: string, ampm: string) => void;
    isDarkMode: boolean;
    handleSubmit: (params: HangoutParams) => void;
}

type SummaryRow = { key: keyof HangoutParams | 'specificDateTime'; label: string; value: string };

const summaryPairs = (params: HangoutParams): SummaryRow[] => {
    const mustHaves = (params.mustHaves || []).filter(Boolean).join(', ');

    return [
        { key: 'planningMode', label: 'Mode', value: params.planningMode || 'detailed' },
        { key: 'vibe', label: 'Vibe', value: params.vibe || 'Not set' },
        { key: 'budget', label: 'Budget', value: params.budget || 'Not set' },
        { key: 'audience', label: 'Audience', value: params.audience || 'Not set' },
        { key: 'timing', label: 'Timing', value: params.timing || 'Not set' },
        { key: 'specificDateTime', label: 'When', value: params.specificDateTime ? formatPlanningDateTime(params.specificDateTime) : 'Flexible' },
        { key: 'travelPreference', label: 'Travel', value: params.travelPreference || 'Any distance' },
        { key: 'mustHaves', label: 'Must-haves', value: mustHaves || 'None selected' },
    ];
};

const Questionnaire: React.FC<QuestionnaireProps> = ({
    params,
    currentStep,
    isTransitioning,
    onOptionSelect,
    onBack,
    onJumpToStep,
    onBackToWelcome,
    onSurpriseMe,
    onSpecificTimeSubmit,
    isDarkMode,
    handleSubmit,
}) => {
    const [specificDateInput, setSpecificDateInput] = useState('');
    const [specificHourInput, setSpecificHourInput] = useState('5');
    const [specificMinuteInput, setSpecificMinuteInput] = useState('00');
    const [specificAmPmInput, setSpecificAmPmInput] = useState('PM');
    const [groupSizeInput, setGroupSizeInput] = useState('2');
    const [selectedMustHaves, setSelectedMustHaves] = useState<string[]>(params.mustHaves || []);
    const [showAdvancedTime, setShowAdvancedTime] = useState(false);

    const questions = useMemo(() => getQuestions(params), [params]);
    const isReviewStep = currentStep >= questions.length;
    const progress = isReviewStep ? 100 : ((currentStep + 1) / (questions.length + 1)) * 100;
    const currentQuestion = questions[currentStep];

    useEffect(() => {
        if (isReviewStep && !isTransitioning) {
            setSpecificDateInput(params.specificDateTime || '');
        }
    }, [isReviewStep, isTransitioning, params.specificDateTime]);

    useEffect(() => {
        setSelectedMustHaves(params.mustHaves || []);
    }, [params.mustHaves]);

    if (!currentQuestion && !isReviewStep) {
        return null;
    }

    const handleInternalSpecificTimeSubmit = () => {
        onSpecificTimeSubmit(specificDateInput, specificHourInput, specificMinuteInput, specificAmPmInput);
    };

    const toggleMultiSelect = (value: string) => {
        const existing = selectedMustHaves;
        const next = existing.includes(value as any)
            ? existing.filter(item => item !== value)
            : [...existing, value as any];
        setSelectedMustHaves(next);
    };

    const previewDateTime = useMemo(() => {
        if (!showAdvancedTime) {
            return params.specificDateTime ? formatPlanningDateTime(params.specificDateTime) : '';
        }
        const hour24 = specificAmPmInput === 'PM' && Number(specificHourInput) < 12
            ? Number(specificHourInput) + 12
            : specificAmPmInput === 'AM' && Number(specificHourInput) === 12
            ? 0
            : Number(specificHourInput);
        const day = specificDateInput || new Date().toISOString().split('T')[0];
        const asIso = `${day}T${String(hour24).padStart(2, '0')}:${specificMinuteInput}`;
        return formatPlanningDateTime(asIso);
    }, [showAdvancedTime, params.specificDateTime, specificAmPmInput, specificHourInput, specificDateInput, specificMinuteInput]);

    const vibeSummaryChips = [params.vibe, params.budget, params.timing].filter(Boolean);
    const reviewSummary = summaryPairs(params);

    return (
        <div className="flex flex-col items-center justify-center p-4 z-10">
            <div className="w-full max-w-2xl mx-auto">
                <div className="bg-[#8C1007]/20 dark:bg-slate-700 rounded-full h-2.5 w-full mb-4">
                    <div className="bg-[#8C1007] dark:bg-[#E18C44] h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
                {!isReviewStep && currentQuestion?.section && (
                    <p className="text-xs uppercase tracking-wider mb-2 text-center font-bold text-[#660B05]/80 dark:text-slate-400">
                        {currentQuestion.section} • Step {currentStep + 1} of {questions.length + 1}
                    </p>
                )}
                {!isReviewStep && vibeSummaryChips.length > 0 && (
                    <div className="flex justify-center flex-wrap gap-2 mb-4">
                        {vibeSummaryChips.map(chip => (
                            <span key={chip} className="text-xs px-3 py-1 rounded-full bg-[#8C1007]/10 dark:bg-[#E18C44]/20 text-[#660B05] dark:text-slate-300 border border-[#8C1007]/20 dark:border-[#E18C44]/30">
                                {chip}
                            </span>
                        ))}
                    </div>
                )}
                {isReviewStep && (
                    <p className="text-xs uppercase tracking-wider mb-4 text-center font-bold text-[#660B05]/80 dark:text-slate-400">
                        Review • Final Step
                    </p>
                )}
                <div className={`bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-xl p-8 pt-16 sm:p-8 sm:pt-12 transition-all duration-500 relative ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                    <button 
                        onClick={currentStep === 0 ? onBackToWelcome : onBack} 
                        className="absolute top-2 left-3 sm:top-3 sm:left-4 text-[#3E0703] dark:text-slate-200 hover:text-[#8C1007] dark:hover:text-white font-bold transition-all flex items-center text-lg py-3 px-4 sm:py-4 rounded-lg hover:bg-[#8C1007]/10 dark:hover:bg-[#E18C44]/20"
                        aria-label={currentStep === 0 ? 'Go back to welcome screen' : 'Go back to previous question'}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                    {!isReviewStep && (
                        <div className="text-center animate-slide-in" key={currentStep}>
                            <h2 className="text-2xl sm:text-3xl font-bold text-[#3E0703] dark:text-slate-100 mb-2 sm:mt-4">{currentQuestion?.prompt}</h2>
                            {currentQuestion?.helperText && (
                                <p className="text-sm mb-6 text-[#660B05]/80 dark:text-slate-400">{currentQuestion.helperText}</p>
                            )}

                            {currentQuestion?.type === 'options' && currentQuestion.options && (
                                <>
                                    <div className="flex flex-wrap justify-center gap-3">
                                        {currentQuestion.options.map((option) => {
                                            const isSelected = currentQuestion.multiSelect
                                                ? selectedMustHaves.includes(option.value)
                                                : false;

                                            return (
                                                <div key={option.value} className="flex flex-col items-center">
                                                    <button
                                                        onClick={() => currentQuestion.multiSelect
                                                            ? toggleMultiSelect(option.value)
                                                            : onOptionSelect(currentQuestion.key as keyof HangoutParams, option.value)
                                                        }
                                                        className={`min-h-[44px] px-5 py-3 rounded-lg border-2 text-base font-bold transition-all duration-200 transform hover:scale-105 active:scale-100 ${isSelected
                                                            ? 'bg-[#660B05] dark:bg-[#f3a469] text-white dark:text-slate-900 border-[#660B05] dark:border-[#f3a469]'
                                                            : 'bg-[#8C1007] dark:bg-[#E18C44] text-white dark:text-slate-900 border-[#8C1007] dark:border-[#E18C44] hover:bg-[#660B05] dark:hover:bg-[#f3a469]'
                                                        }`}
                                                    >
                                                        {isSelected ? '✓ ' : ''}{option.name}
                                                    </button>
                                                    {currentQuestion.key === 'budget' && (
                                                        <span className="text-xs text-[#660B05] dark:text-slate-400 mt-1.5 px-2 text-center w-44 h-8">
                                                            {option.name === 'Basically Free' ? '(Street food, parks, etc.)' :
                                                             option.name === 'Mid-Range' ? '(Approx. GH₵80 - GH₵200 pp)' :
                                                             option.name === 'Feeling Fancy' ? '(Approx. GH₵250+ pp)' : ''}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {(currentQuestion.key === 'vibe' || currentQuestion.key === 'timeWindow') && (
                                        <>
                                            <div className="my-6 flex items-center">
                                                <div className="flex-grow border-t border-[#8C1007]/30 dark:border-slate-600"></div>
                                                <span className="flex-shrink mx-4 text-[#660B05] dark:text-slate-400 font-semibold">or</span>
                                                <div className="flex-grow border-t border-[#8C1007]/30 dark:border-slate-600"></div>
                                            </div>
                                            <button
                                                onClick={() => onSurpriseMe(currentQuestion.key as keyof HangoutParams, currentQuestion.options!)}
                                                className="min-h-[44px] px-6 py-4 rounded-lg border-2 text-base font-bold transition-all duration-200 transform hover:scale-105 active:scale-100 bg-[#660B05] dark:bg-[#e18b44] text-white dark:text-slate-900 border-[#8C1007] dark:border-[#E18C44] shadow-lg animate-pulse-subtle"
                                            >
                                                Surprise Me
                                            </button>
                                        </>
                                    )}

                                    {currentQuestion.multiSelect && (
                                        <button
                                            onClick={() => onOptionSelect('mustHaves', selectedMustHaves)}
                                            className="min-h-[44px] mt-6 px-8 py-3 rounded-lg text-lg font-bold transition-all duration-300 transform hover:scale-105 bg-[#8C1007] dark:bg-[#E18C44] text-white dark:text-slate-900"
                                        >
                                            Continue
                                        </button>
                                    )}
                                </>
                            )}

                            {(currentQuestion?.type === 'time' || currentQuestion?.type === 'date-and-time') && (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="flex gap-2 flex-wrap justify-center">
                                        {TIME_SHORTCUTS.map((shortcut) => (
                                            <button
                                                key={shortcut}
                                                onClick={() => onOptionSelect('specificDateTime', getDateTimeFromShortcut(shortcut))}
                                                className="min-h-[44px] px-4 py-2 rounded-full bg-[#8C1007]/10 dark:bg-[#E18C44]/20 text-[#660B05] dark:text-slate-300 border border-[#8C1007]/20 dark:border-[#E18C44]/30 hover:bg-[#8C1007]/20 dark:hover:bg-[#E18C44]/30 font-semibold"
                                            >
                                                {shortcut}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setShowAdvancedTime(prev => !prev)}
                                        className="text-sm font-semibold text-[#8C1007] dark:text-[#E18C44] underline"
                                    >
                                        {showAdvancedTime ? 'Hide exact date & time' : 'Pick exact date & time'}
                                    </button>
                                    {showAdvancedTime && (
                                      <>
                                        <div className="flex flex-wrap justify-center gap-4">
                                            {currentQuestion.type === 'date-and-time' && (
                                                <input
                                                    type="date"
                                                    value={specificDateInput}
                                                    onChange={(e) => setSpecificDateInput(e.target.value)}
                                                    className="w-full sm:w-auto px-4 py-3 border-2 border-[#8C1007]/50 dark:border-[#E18C44]/50 bg-transparent dark:bg-slate-700/50 rounded-lg focus:ring-2 focus:ring-[#8C1007] dark:focus:ring-[#E18C44] focus:border-[#8C1007] dark:focus:border-[#E18C44] outline-none transition text-[#3E0703] dark:text-slate-100"
                                                    style={{ colorScheme: isDarkMode ? 'dark' : 'light' }}
                                                    min={new Date().toISOString().split('T')[0]}
                                                />
                                            )}
                                            <div className="flex items-center justify-center gap-2 bg-transparent dark:bg-slate-700/50 border-2 border-[#8C1007]/50 dark:border-[#E18C44]/50 rounded-lg p-2 text-xl font-semibold text-[#3E0703] dark:text-slate-100">
                                                <select value={specificHourInput} onChange={e => setSpecificHourInput(e.target.value)} className="bg-transparent focus:outline-none cursor-pointer" aria-label="Hour">
                                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(h => <option key={h} value={h} className="bg-[#FFFCF5] dark:bg-slate-800 text-base">{h}</option>)}
                                                </select>
                                                <span>:</span>
                                                <select value={specificMinuteInput} onChange={e => setSpecificMinuteInput(e.target.value)} className="bg-transparent focus:outline-none cursor-pointer" aria-label="Minute">
                                                    {['00', '15', '30', '45'].map(m => <option key={m} value={m} className="bg-[#FFFCF5] dark:bg-slate-800 text-base">{m}</option>)}
                                                </select>
                                                <select value={specificAmPmInput} onChange={e => setSpecificAmPmInput(e.target.value)} className="bg-transparent focus:outline-none cursor-pointer" aria-label="AM or PM">
                                                    <option value="AM" className="bg-[#FFFCF5] dark:bg-slate-800 text-base">AM</option>
                                                    <option value="PM" className="bg-[#FFFCF5] dark:bg-slate-800 text-base">PM</option>
                                                </select>
                                            </div>
                                        </div>
                                        {previewDateTime && (
                                          <p className="text-sm text-[#660B05] dark:text-slate-300 font-semibold">
                                            Planning for: {previewDateTime}
                                          </p>
                                        )}
                                        <button
                                            onClick={handleInternalSpecificTimeSubmit}
                                            disabled={currentQuestion.type === 'date-and-time' && !specificDateInput}
                                            className="min-h-[44px] px-8 mt-2 py-3 rounded-lg text-lg font-bold transition-all duration-300 transform hover:scale-105 bg-[#8C1007] dark:bg-[#E18C44] text-white dark:text-slate-900 border-[#8C1007] dark:border-[#E18C44] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Continue
                                        </button>
                                      </>
                                    )}
                                </div>
                            )}

                            {currentQuestion?.type === 'number' && (
                               <div className="flex flex-col items-center gap-4">
                                    <input
                                        type="number"
                                        value={groupSizeInput}
                                        onChange={(e) => setGroupSizeInput(e.target.value)}
                                        min="2"
                                        placeholder="e.g., 4"
                                        className="w-32 px-4 py-3 text-center border-2 border-[#8C1007]/50 dark:border-[#E18C44]/50 bg-transparent dark:bg-slate-700/50 rounded-lg focus:ring-2 focus:ring-[#8C1007] dark:focus:ring-[#E18C44] focus:border-[#8C1007] dark:focus:border-[#E18C44] outline-none transition text-[#3E0703] dark:text-slate-100 text-2xl font-bold"
                                    />
                                    <button
                                        onClick={() => onOptionSelect('groupSize', parseInt(groupSizeInput, 10))}
                                        disabled={!groupSizeInput || parseInt(groupSizeInput, 10) < 2}
                                        className="min-h-[44px] px-8 mt-2 py-3 rounded-lg text-lg font-bold transition-all duration-300 transform hover:scale-105 bg-[#8C1007] dark:bg-[#E18C44] text-white dark:text-slate-900 border-[#8C1007] dark:border-[#E18C44] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Continue
                                    </button>
                               </div>
                            )}
                        </div>
                    )}

                    {isReviewStep && (
                        <div className="animate-slide-in">
                            <h2 className="text-2xl sm:text-3xl font-bold text-[#3E0703] dark:text-slate-100 mb-3 sm:mt-4 text-center">Review Your Vibe</h2>
                            <p className="text-center text-[#660B05] dark:text-slate-300 mb-6">You can edit any answer before generating.</p>
                            <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-[#8C1007]/10 dark:bg-[#E18C44]/10">
                              <span className="font-semibold text-[#3E0703] dark:text-slate-100">Open now only</span>
                              <button
                                onClick={() => onOptionSelect('openNowOnly', !params.openNowOnly)}
                                className={`px-3 py-1 rounded-full text-xs font-bold ${params.openNowOnly ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-white text-[#660B05] dark:bg-slate-700 dark:text-slate-300'}`}
                              >
                                {params.openNowOnly ? 'ON' : 'OFF'}
                              </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                                {reviewSummary.map(({ key, label, value }) => {
                                    const targetStep = questions.findIndex(q => q.key === key);
                                    return (
                                      <div key={label} className="bg-white/80 dark:bg-slate-700/60 rounded-lg p-3 border border-[#8C1007]/10 dark:border-slate-600">
                                          <div className="flex items-center justify-between gap-2">
                                            <p className="text-xs font-bold text-[#660B05]/80 dark:text-slate-400 uppercase">{label}</p>
                                            {targetStep >= 0 && (
                                              <button
                                                onClick={() => onJumpToStep(targetStep)}
                                                className="text-xs font-semibold underline text-[#8C1007] dark:text-[#E18C44]"
                                              >
                                                Edit
                                              </button>
                                            )}
                                          </div>
                                          <p className="text-sm font-semibold text-[#3E0703] dark:text-slate-100">{value}</p>
                                      </div>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => handleSubmit(params)}
                                className="min-h-[44px] w-full px-8 py-4 rounded-lg text-lg font-bold transition-all duration-300 transform hover:scale-[1.01] bg-[#8C1007] dark:bg-[#E18C44] text-white dark:text-slate-900 shadow-lg"
                            >
                                Generate My Plan
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Questionnaire;
