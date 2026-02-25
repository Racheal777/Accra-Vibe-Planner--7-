// Fix: Removed self-import from './types' that was causing declaration conflicts.

// Fix: Removed the import from './constants' which was causing a circular dependency.

// Fix: Replaced incorrect constant definitions with proper type exports.
// This resolves circular dependency issues and defines the types used throughout the application.
export type Vibe =
  | 'Relax & Unwind'
  | 'Food & Nightlife'
  | 'Rich Kids Sports'
  | 'Active & Adventure'
  | 'Movies & Plays'
  | 'Romantic Date'
  | 'Picnic & Parks'
  | '';

export type TimeWindow =
  | 'Quickie (1-2 hours)'
  | 'Half-Day Sesh (3-4 hours)'
  | 'The Main Event (5+ hours)'
  | 'A Whole Day Trip (8+ hours)'
  | '';

export type Budget = 'Basically Free' | 'Mid-Range' | 'Feeling Fancy' | '';

export type Audience = 'Solo Mission' | 'With the Crew' | 'Just the Two of Us' | "It's a Double Date" | '';

export type Timing = 'Right Now!' | 'Later Today' | 'Sometime This Week' | '';

export type DateMeal = 'Breakfast' | 'Brunch' | 'Lunch' | 'Dinner' | '';
export type PlanningMode = 'quick' | 'detailed' | '';
export type TravelPreference = '5-10 mins' | '15-20 mins' | '30+ mins' | '';
export type MustHave =
  | 'Quiet atmosphere'
  | 'Outdoor seating'
  | 'Easy parking'
  | 'Reservation not required'
  | '';

export type Location = {
  latitude: number;
  longitude: number;
} | null;

export interface HangoutParams {
  planningMode?: PlanningMode;
  vibe: Vibe;
  timeWindow: TimeWindow;
  budget: Budget;
  audience: Audience;
  timing: Timing;
  location: Location;
  proximity?: 'close' | 'any';
  dateMeal?: DateMeal;
  specificDateTime?: string;
  groupSize?: number;
  travelPreference?: TravelPreference;
  mustHaves?: MustHave[];
}

export interface SavedPlan {
  id: string;
  planContent: string;
  savedAt: string;
  rating: number | null;
}

export type AppState = 'WELCOME' | 'GATHERING_INPUT' | 'LOADING' | 'SHOWING_OPTIONS' | 'ASKING_LOCATION' | 'SHOWING_FINAL_PLAN' | 'ERROR' | 'RATE_LIMITED';
