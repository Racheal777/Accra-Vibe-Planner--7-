import { describe, expect, it } from 'vitest';
import {
  TIME_SHORTCUTS,
  formatPlanningDateTime,
  getDateTimeFromShortcut,
  normalizeTimeInput,
} from '../../utils/dateTime';

describe('dateTime utils', () => {
  it('maps shortcut labels to ISO-like datetime strings', () => {
    for (const shortcut of TIME_SHORTCUTS) {
      const value = getDateTimeFromShortcut(shortcut);
      expect(value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    }
  });

  it('normalizes shortcut input into datetime', () => {
    const normalized = normalizeTimeInput('Tonight');
    expect(normalized).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });

  it('formats canonical datetime for UI confirmation', () => {
    const formatted = formatPlanningDateTime('2026-03-06T19:00');
    expect(formatted).toContain('March');
    expect(formatted).toContain('7:00');
  });
});
