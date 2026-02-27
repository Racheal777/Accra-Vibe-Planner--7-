import { describe, expect, it } from 'vitest';
import { getQuestions } from '../../utils/questions';
import type { HangoutParams } from '../../types';

const baseParams: HangoutParams = {
  planningMode: 'quick',
  vibe: '',
  timeWindow: '',
  budget: '',
  audience: '',
  timing: '',
  location: null,
  proximity: 'any',
  dateMeal: '',
  specificDateTime: '',
  groupSize: undefined,
  travelPreference: '',
  mustHaves: [],
  openNowOnly: false,
};

describe('questions', () => {
  it('keeps quick mode in three steps before review', () => {
    const quick = getQuestions({ ...baseParams, planningMode: 'quick' });
    expect(quick.length).toBeLessThanOrEqual(3);
    expect(quick.map((q) => q.section)).toEqual(['Mood', 'Constraints', 'Logistics']);
  });

  it('keeps multi-select must-have step in detailed mode', () => {
    const detailed = getQuestions({ ...baseParams, planningMode: 'detailed', vibe: 'Food & Nightlife' });
    const mustHave = detailed.find((question) => question.key === 'mustHaves');
    expect(mustHave?.multiSelect).toBe(true);
  });
});
