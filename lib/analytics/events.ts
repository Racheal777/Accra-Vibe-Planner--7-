export type AnalyticsEventName =
  | 'plan_started'
  | 'question_answered'
  | 'review_edited'
  | 'plan_generated'
  | 'card_selected'
  | 'image_swapped';

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export const createAnalyticsEvent = (
  name: AnalyticsEventName,
  metadata?: Record<string, unknown>,
): AnalyticsEvent => ({
  name,
  metadata,
  timestamp: new Date().toISOString(),
});
