import {
  VIBE_OPTIONS,
  TIME_WINDOW_OPTIONS,
  BUDGET_OPTIONS,
  AUDIENCE_OPTIONS,
  ROMANTIC_AUDIENCE_OPTIONS,
  TIMING_OPTIONS,
  DATE_MEAL_OPTIONS,
  TRAVEL_PREFERENCE_OPTIONS,
  MUST_HAVE_OPTIONS,
} from '../constants';
import type { HangoutParams } from '../types';

export interface Question {
  key: keyof HangoutParams | 'specificDateTime' | 'mustHaves';
  prompt: string;
  type: 'options' | 'time' | 'date-and-time' | 'number';
  section?: 'Mood' | 'Constraints' | 'Logistics';
  helperText?: string;
  multiSelect?: boolean;
  options?: readonly { name: string; value: any }[];
}

// Moved question generation to a standalone function for reusability
export const getQuestions = (currentParams: HangoutParams): Question[] => {
    const isQuick = currentParams.planningMode === 'quick';
    const audienceQuestion: Question = currentParams.vibe === 'Romantic Date'
      ? { key: 'audience', prompt: "Who's this romantic mission for?", type: 'options', options: ROMANTIC_AUDIENCE_OPTIONS, section: 'Constraints' }
      : { key: 'audience', prompt: "Who's in this mission?", type: 'options', options: AUDIENCE_OPTIONS, section: 'Constraints' };
      
    const quickQuestions: Question[] = [
      { key: 'vibe', prompt: 'What kind of outing do you want right now?', type: 'options', options: VIBE_OPTIONS, section: 'Mood', helperText: 'Why we ask this: it sets the mood and shortlists better venues fast.' },
      { key: 'budget', prompt: 'Budget per person?', type: 'options', options: BUDGET_OPTIONS, section: 'Constraints', helperText: 'Why we ask this: we avoid options that overshoot your spend.' },
      { key: 'timing', prompt: "When are we doing this?", type: 'options', options: TIMING_OPTIONS, section: 'Logistics', helperText: 'Why we ask this: open-hours and traffic differ by time.' },
    ];

    const questions: Question[] = isQuick ? quickQuestions : [
      { key: 'vibe', prompt: "First, what's the vibe?", type: 'options', options: VIBE_OPTIONS, section: 'Mood', helperText: 'Why we ask this: vibe is the strongest predictor of a satisfying pick.' },
      ...(currentParams.vibe === 'Romantic Date' ? [{ key: 'dateMeal', prompt: 'Perfect. What time of day is the date?', type: 'options', options: DATE_MEAL_OPTIONS, section: 'Mood', helperText: 'Why we ask this: timing changes atmosphere and venue quality.' } as Question] : []),
      { key: 'timeWindow', prompt: 'How much time have you got?', type: 'options', options: TIME_WINDOW_OPTIONS, section: 'Constraints', helperText: 'Why we ask this: short windows need close-by, low-friction plans.' },
      { key: 'budget', prompt: 'How deep are your pockets?', type: 'options', options: BUDGET_OPTIONS, section: 'Constraints', helperText: 'Why we ask this: we optimize for best value at your spend range.' },
      { ...audienceQuestion, helperText: 'Why we ask this: group size and social context affect seating and activity fit.' },
      { key: 'travelPreference', prompt: 'How far are you willing to go?', type: 'options', options: TRAVEL_PREFERENCE_OPTIONS, section: 'Logistics', helperText: 'Why we ask this: this helps us prioritize practical options.' },
      { key: 'mustHaves', prompt: 'Any must-haves? Pick one or more.', type: 'options', options: MUST_HAVE_OPTIONS, section: 'Logistics', helperText: 'Why we ask this: non-negotiables prevent bad recommendations.', multiSelect: true },
    ];

    if (!isQuick && currentParams.audience === 'With the Crew') {
      questions.push({ key: 'groupSize', prompt: 'How many in your crew?', type: 'number', helperText: 'Why we ask this: we avoid spots that feel cramped for bigger groups.' });
    }

    // Dynamic Timing Options Logic
    let timingOptions = [...TIMING_OPTIONS]; // Use a mutable copy
    if (currentParams.vibe === 'Romantic Date' && currentParams.dateMeal) {
        const currentHour = new Date().getHours(); // 0-23

        switch (currentParams.dateMeal) {
            case 'Breakfast':
                if (currentHour >= 11) {
                    // After 11 AM, it's too late for any breakfast plans today.
                    timingOptions = timingOptions.filter(
                        opt => opt.value !== 'Right Now!' && opt.value !== 'Later Today'
                    );
                }
                break;
            case 'Brunch':
                // Brunch window is roughly 11am - 3pm
                if (currentHour < 11 || currentHour >= 15) {
                    timingOptions = timingOptions.filter(opt => opt.value !== 'Right Now!');
                }
                if (currentHour >= 15) {
                    timingOptions = timingOptions.filter(opt => opt.value !== 'Later Today');
                }
                break;
            case 'Lunch':
                // Before 11 AM is too early for lunch "Right Now!". After 3 PM is too late.
                if (currentHour < 11 || currentHour >= 15) {
                    timingOptions = timingOptions.filter(opt => opt.value !== 'Right Now!');
                }
                // After 3 PM, it's also too late for lunch "Later Today".
                if (currentHour >= 15) {
                    timingOptions = timingOptions.filter(opt => opt.value !== 'Later Today');
                }
                break;
            case 'Dinner':
                // Before 6 PM is too early for dinner "Right Now!".
                if (currentHour < 18) {
                    timingOptions = timingOptions.filter(opt => opt.value !== 'Right Now!');
                }
                // After 10 PM, it's getting too late to plan something for "Later Today".
                if (currentHour >= 22) {
                    timingOptions = timingOptions.filter(opt => opt.value !== 'Later Today');
                }
                break;
        }
    }


    if (!isQuick) {
      questions.push({ key: 'timing', prompt: 'And when are we doing this?', type: 'options', options: timingOptions, section: 'Logistics', helperText: 'Why we ask this: open venues and traffic windows shift throughout the day.' });
    }

    if (currentParams.timing === 'Later Today') {
        questions.push({ key: 'specificDateTime', prompt: 'Got it. What time later today?', type: 'time', section: 'Logistics', helperText: 'Why we ask this: exact timing improves open-now confidence.' });
    } else if (currentParams.timing === 'Sometime This Week') {
        questions.push({ key: 'specificDateTime', prompt: 'Sounds good. What day and time?', type: 'date-and-time', section: 'Logistics', helperText: 'Why we ask this: date and time influence route conditions and hours.' });
    }

    return questions;
};
