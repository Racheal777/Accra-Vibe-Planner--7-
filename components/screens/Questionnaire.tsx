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
    onSurpriseMe: (key: keyof HangoutParams, options: readonly { name: string, value: any }[]) => void;
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
                <div className="rounded-full h-2.5 w-full mb-4" style={{ backgroundColor: 'var(--border-strong)' }}>
                    <div className="h-2.5 rounded-full transition-all duration-500" style={{ backgroundColor: 'var(--accent-primary)', width: `${progress}%` }}></div>
                </div>
                {!isReviewStep && currentQuestion?.section && (
                    <p className="text-xs uppercase tracking-wider mb-2 text-center font-bold" style={{ color: 'var(--text-secondary)' }}>
                        {currentQuestion.section} • Step {currentStep + 1} of {questions.length + 1}
                    </p>
                )}
                {!isReviewStep && vibeSummaryChips.length > 0 && (
                    <div className="flex justify-center flex-wrap gap-2 mb-4">
                        {vibeSummaryChips.map(chip => (
                            <span key={chip} className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-soft)' }}>
                                {chip}
                            </span>
                        ))}
                    </div>
                )}
                {isReviewStep && (
                    <p className="text-xs uppercase tracking-wider mb-4 text-center font-bold" style={{ color: 'var(--text-secondary)' }}>
                        Review • Final Step
                    </p>
                )}
                <div className={`rounded-2xl shadow-xl p-8 pt-16 sm:p-8 sm:pt-12 transition-all duration-500 relative ${isTransitioning ? 'opacity-0' : 'opacity-100'}`} style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-soft)' }}>
                    <button
                        onClick={currentStep === 0 ? onBackToWelcome : onBack}
                        className="absolute top-2 left-3 sm:top-3 sm:left-4 font-bold transition-all flex items-center text-lg py-3 px-4 sm:py-4 rounded-lg hover:bg-black/5"
                        style={{ color: 'var(--text-primary)' }}
                        aria-label={currentStep === 0 ? 'Go back to welcome screen' : 'Go back to previous question'}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                    {!isReviewStep && (
                        <div className="text-center animate-slide-in" key={currentStep}>
                            <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mt-4" style={{ color: 'var(--text-primary)' }}>{currentQuestion?.prompt}</h2>
                            {currentQuestion?.helperText && (
                                <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>{currentQuestion.helperText}</p>
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
                                                        className="min-h-[44px] px-5 py-3 rounded-lg border-2 text-base font-bold transition-all duration-200 transform hover:scale-105 active:scale-100"
                                                        style={isSelected ? {
                                                            backgroundColor: 'var(--text-primary)',
                                                            color: 'var(--bg-surface)',
                                                            borderColor: 'var(--text-primary)'
                                                        } : {
                                                            backgroundColor: 'var(--bg-surface)',
                                                            color: 'var(--text-primary)',
                                                            borderColor: 'var(--border-strong)'
                                                        }}
                                                    >
                                                        {isSelected ? '✓ ' : ''}{option.name}
                                                    </button>
                                                    {currentQuestion.key === 'budget' && (
                                                        <span className="text-xs mt-1.5 px-2 text-center w-44 h-8" style={{ color: 'var(--text-muted)' }}>
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
                                                <div className="flex-grow border-t" style={{ borderColor: 'var(--border-soft)' }}></div>
                                                <span className="flex-shrink mx-4 font-semibold" style={{ color: 'var(--text-muted)' }}>or</span>
                                                <div className="flex-grow border-t" style={{ borderColor: 'var(--border-soft)' }}></div>
                                            </div>
                                            <button
                                                onClick={() => onSurpriseMe(currentQuestion.key as keyof HangoutParams, currentQuestion.options!)}
                                                className="min-h-[44px] px-6 py-4 rounded-lg border-2 text-base font-bold transition-all duration-200 transform hover:scale-105 active:scale-100 shadow-lg animate-pulse-subtle"
                                                style={{ backgroundColor: 'var(--accent-secondary)', color: '#FFFFFF', borderColor: 'transparent' }}
                                            >
                                                Surprise Me
                                            </button>
                                        </>
                                    )}

                                    {currentQuestion.multiSelect && (
                                        <button
                                            onClick={() => onOptionSelect('mustHaves', selectedMustHaves)}
                                            className="min-h-[44px] mt-6 px-8 py-3 rounded-lg text-lg font-bold transition-all duration-300 transform hover:scale-105"
                                            style={{ backgroundColor: 'var(--accent-primary)', color: '#FFFFFF' }}
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
                                                className="min-h-[44px] px-4 py-2 rounded-full font-semibold border hover:bg-black/5"
                                                style={{ color: 'var(--text-primary)', borderColor: 'var(--border-strong)' }}
                                            >
                                                {shortcut}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setShowAdvancedTime(prev => !prev)}
                                        className="text-sm font-semibold underline"
                                        style={{ color: 'var(--accent-primary)' }}
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
                                                        className="w-full sm:w-auto px-4 py-3 border-2 rounded-lg outline-none transition"
                                                        style={{ colorScheme: isDarkMode ? 'dark' : 'light', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', borderColor: 'var(--border-soft)' }}
                                                        min={new Date().toISOString().split('T')[0]}
                                                    />
                                                )}
                                                <div className="flex items-center justify-center gap-2 border-2 rounded-lg p-2 text-xl font-semibold" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', borderColor: 'var(--border-soft)' }}>
                                                    <select value={specificHourInput} onChange={e => setSpecificHourInput(e.target.value)} className="bg-transparent focus:outline-none cursor-pointer" aria-label="Hour">
                                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(h => <option key={h} value={h} className="text-base" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>{h}</option>)}
                                                    </select>
                                                    <span>:</span>
                                                    <select value={specificMinuteInput} onChange={e => setSpecificMinuteInput(e.target.value)} className="bg-transparent focus:outline-none cursor-pointer" aria-label="Minute">
                                                        {['00', '15', '30', '45'].map(m => <option key={m} value={m} className="text-base" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>{m}</option>)}
                                                    </select>
                                                    <select value={specificAmPmInput} onChange={e => setSpecificAmPmInput(e.target.value)} className="bg-transparent focus:outline-none cursor-pointer" aria-label="AM or PM">
                                                        <option value="AM" className="text-base" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>AM</option>
                                                        <option value="PM" className="text-base" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>PM</option>
                                                    </select>
                                                </div>
                                            </div>
                                            {previewDateTime && (
                                                <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                                                    Planning for: {previewDateTime}
                                                </p>
                                            )}
                                            <button
                                                onClick={handleInternalSpecificTimeSubmit}
                                                disabled={currentQuestion.type === 'date-and-time' && !specificDateInput}
                                                className="min-h-[44px] px-8 mt-4 py-3 rounded-lg text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{ backgroundColor: 'var(--accent-primary)', color: '#FFFFFF' }}
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
                                        className="w-32 px-4 py-3 text-center border-2 rounded-lg outline-none transition text-2xl font-bold"
                                        style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', borderColor: 'var(--border-soft)' }}
                                    />
                                    <button
                                        onClick={() => onOptionSelect('groupSize', parseInt(groupSizeInput, 10))}
                                        disabled={!groupSizeInput || parseInt(groupSizeInput, 10) < 2}
                                        className="min-h-[44px] px-8 mt-4 py-3 rounded-lg text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ backgroundColor: 'var(--accent-primary)', color: '#FFFFFF' }}
                                    >
                                        Continue
                                    </button>
                                </div>
                            )}
                        </div >
                    )}

                    {isReviewStep && (
                        <div className="animate-slide-in">
                            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mt-4 text-center" style={{ color: 'var(--text-primary)' }}>Review Your Vibe</h2>
                            <p className="text-center mb-6" style={{ color: 'var(--text-secondary)' }}>You can edit any answer before generating.</p>
                            <div className="flex items-center justify-between mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-soft)' }}>
                                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Open now only</span>
                                <button
                                    onClick={() => onOptionSelect('openNowOnly', !params.openNowOnly)}
                                    className="px-3 py-1 rounded-full text-xs font-bold transition-colors"
                                    style={params.openNowOnly ? { backgroundColor: 'var(--success)', color: '#FFFFFF' } : { backgroundColor: 'var(--border-strong)', color: 'var(--text-primary)' }}
                                >
                                    {params.openNowOnly ? 'ON' : 'OFF'}
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                                {reviewSummary.map(({ key, label, value }) => {
                                    const targetStep = questions.findIndex(q => q.key === key);
                                    return (
                                        <div key={label} className="rounded-lg p-3 border" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-soft)' }}>
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>{label}</p>
                                                {targetStep >= 0 && (
                                                    <button
                                                        onClick={() => onJumpToStep(targetStep)}
                                                        className="text-xs font-semibold underline"
                                                        style={{ color: 'var(--accent-primary)' }}
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</p>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="sticky bottom-0 mt-6 pt-3" style={{ backgroundColor: 'var(--bg-surface)' }}>
                                <p className="text-xs mb-2 text-center" style={{ color: 'var(--text-muted)' }}>Ready in under 20 seconds</p>
                                <button
                                    onClick={() => handleSubmit(params)}
                                    className="min-h-[44px] w-full px-8 py-4 rounded-lg text-lg font-bold transition-all duration-300 transform hover:scale-[1.01] shadow-lg animate-pulse-subtle"
                                    style={{ backgroundColor: 'var(--accent-primary)', color: '#FFFFFF' }}
                                >
                                    Generate My Plan
                                </button>
                            </div>
                        </div>
                    )}
                </div >
            </div >
        </div >
    );
};

export default Questionnaire;
