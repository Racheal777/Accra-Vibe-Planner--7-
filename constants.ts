import { Vibe, TimeWindow, Budget, Audience, Timing, DateMeal, TravelPreference, MustHave } from './types';

interface Option<T> {
  name: T;
  value: T;
}

export const VIBE_OPTIONS: Option<Vibe>[] = [
  { name: 'Relax & Unwind', value: 'Relax & Unwind' },
  { name: 'Food & Nightlife', value: 'Food & Nightlife' },
  { name: 'Rich Kids Sports', value: 'Rich Kids Sports' },
  { name: 'Active & Adventure', value: 'Active & Adventure' },
  { name: 'Movies & Plays', value: 'Movies & Plays' },
  { name: 'Romantic Date', value: 'Romantic Date' },
  { name: 'Picnic & Parks', value: 'Picnic & Parks' },
];

export const TIME_WINDOW_OPTIONS: Option<TimeWindow>[] = [
  { name: 'Quickie (1-2 hours)', value: 'Quickie (1-2 hours)' },
  { name: 'Half-Day Sesh (3-4 hours)', value: 'Half-Day Sesh (3-4 hours)' },
  { name: 'The Main Event (5+ hours)', value: 'The Main Event (5+ hours)' },
  { name: 'A Whole Day Trip (8+ hours)', value: 'A Whole Day Trip (8+ hours)' },
];

export const BUDGET_OPTIONS: Option<Budget>[] = [
    { name: 'Basically Free', value: 'Basically Free' },
    { name: 'Mid-Range', value: 'Mid-Range' },
    { name: 'Feeling Fancy', value: 'Feeling Fancy' },
];

export const AUDIENCE_OPTIONS: Option<Audience>[] = [
    { name: 'Solo Mission', value: 'Solo Mission' }, 
    { name: 'With the Crew', value: 'With the Crew' }
];

export const ROMANTIC_AUDIENCE_OPTIONS: Option<Audience>[] = [
    { name: 'Just the Two of Us', value: 'Just the Two of Us' },
    { name: "It's a Double Date", value: "It's a Double Date" }
];

export const TIMING_OPTIONS: Option<Timing>[] = [
  { name: 'Right Now!', value: 'Right Now!' },
  { name: 'Later Today', value: 'Later Today' },
  { name: 'Sometime This Week', value: 'Sometime This Week' },
];

export const DATE_MEAL_OPTIONS: Option<DateMeal>[] = [
    { name: 'Breakfast', value: 'Breakfast' }, 
    { name: 'Brunch', value: 'Brunch' },
    { name: 'Lunch', value: 'Lunch' }, 
    { name: 'Dinner', value: 'Dinner' }
];

export const TRAVEL_PREFERENCE_OPTIONS: Option<TravelPreference>[] = [
  { name: '5-10 mins', value: '5-10 mins' },
  { name: '15-20 mins', value: '15-20 mins' },
  { name: '30+ mins', value: '30+ mins' },
];

export const MUST_HAVE_OPTIONS: Option<MustHave>[] = [
  { name: 'Quiet atmosphere', value: 'Quiet atmosphere' },
  { name: 'Outdoor seating', value: 'Outdoor seating' },
  { name: 'Easy parking', value: 'Easy parking' },
  { name: 'Reservation not required', value: 'Reservation not required' },
];
