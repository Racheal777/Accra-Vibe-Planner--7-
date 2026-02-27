import { describe, expect, it } from 'vitest';
import { createAnalyticsEvent } from '../../../lib/analytics/events';

describe('analytics events', () => {
  it('creates event payload contract', () => {
    const event = createAnalyticsEvent('plan_started', { mode: 'quick' });
    expect(event.name).toBe('plan_started');
    expect(event.metadata).toEqual({ mode: 'quick' });
    expect(event.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
