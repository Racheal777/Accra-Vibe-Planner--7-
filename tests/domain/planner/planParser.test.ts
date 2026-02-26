import { describe, expect, it } from 'vitest';
import {
  getDestinationFromPlan,
  getTitleFromPlan,
  parsePlans,
  splitFinalPlan,
} from '../../../domain/planner/planParser';

describe('planParser', () => {
  it('parses plan options and recommendation', () => {
    const sample = `OPTION 1
Title: Skybar 25
Image URL: https://example.com/1.jpg
Category: Food & Nightlife
Location: Skybar 25, Villaggio, Accra
Rating: 4.5/5 stars
Opening Hours: 6:00 PM - 1:00 AM
Essentials Checklist:
- Dress Code: Smart Casual
- Noise Level: Lively
- Seating: Private tables
Description: Rooftop drinks with a city view.
Cost: GH₵200
Pro-Tip: Book early.
---
OPTION 2
Title: Sandbox Beach Club
Image URL: https://example.com/2.jpg
Category: Relax & Unwind
Location: Sandbox, Labadi, Accra
Rating: 4.3/5 stars
Opening Hours: 10:00 AM - 10:00 PM
Essentials Checklist:
- Dress Code: Casual
- Noise Level: Moderate
- Seating: Mixed seating
Description: Beachside chill and sunset vibe.
Cost: GH₵120
Pro-Tip: Go before sunset.
---
Recommendation: Pick Skybar 25 for a stronger nightlife vibe.`;

    const { plans, recommendation } = parsePlans(sample);

    expect(plans).toHaveLength(2);
    expect(plans[0].title).toBe('Skybar 25');
    expect(plans[0].location).toContain('Accra');
    expect(plans[0].imageStatus).toBe('external');
    expect(plans[0].parseWarnings).toHaveLength(0);
    expect(recommendation).toContain('Recommendation:');
  });

  it('falls back image metadata when image url is missing or invalid', () => {
    const sample = `OPTION 1
Title: Mystery Spot
Image URL: not-a-url
Category: Relax & Unwind
Location: Osu, Accra
Rating: Not available
Opening Hours: Not available
Essentials Checklist:
- Dress Code: Casual
- Noise Level: Moderate
- Seating: Mixed
Description: Vibes.
Cost: GH₵20
Pro-Tip: Call first.`;

    const { plans } = parsePlans(sample);
    expect(plans[0].imageUrl).toBe('');
    expect(plans[0].imageStatus).toBe('fallback');
    expect(plans[0].parseWarnings.join(' ')).toContain('Image URL');
  });

  it('extracts title and destination from raw plan text', () => {
    const rawPlan = `Title: Polo Club\nLocation: Polo Club, Airport Residential Area, Accra`;

    expect(getTitleFromPlan(rawPlan)).toBe('Polo Club');
    expect(getDestinationFromPlan(rawPlan)).toBe('Polo Club, Airport Residential Area, Accra');
  });

  it('splits final plan into plan and travel sections', () => {
    const finalPlan = `Title: Bistro\nLocation: Osu, Accra\n\n---\nTitle: Travel & Weather Forecast\nTravel Estimate:`;
    const { planSection, travelSection } = splitFinalPlan(finalPlan);

    expect(planSection).toContain('Title: Bistro');
    expect(travelSection).toContain('Travel & Weather Forecast');
  });
});
