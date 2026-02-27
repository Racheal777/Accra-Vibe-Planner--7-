import { createAnalyticsEvent, type AnalyticsEventName } from './events';

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export const trackEvent = (name: AnalyticsEventName, metadata?: Record<string, unknown>): void => {
  const event = createAnalyticsEvent(name, metadata);
  console.info('[analytics]', event);
};
