import type { Vibe } from '../../types';

export interface ParsedPlan {
  id: string;
  rawContent: string;
  title: string;
  imageUrl: string;
  imageStatus: 'external' | 'fallback';
  parseWarnings: string[];
  reasoning?: string;
  category: Vibe;
  location: string;
  rating: string;
  openingHours: string;
  description: string;
  cost: string;
  proTip: string;
  dressCode: string;
  noiseLevel: string;
  seating: string;
  picnicEssentials: string[] | null;
  estimatedRideCost?: string;
  weather?: string;
}

export interface ParsedTravelDetails {
  distance: string;
  travelTime: string;
  traffic: string;
  weather: string;
}

const SUPPORTED_VIBES = new Set<Vibe>([
  'Relax & Unwind',
  'Food & Nightlife',
  'Sports & Games',
  'Active & Adventure',
  'Movies & Plays',
  'Romantic Date',
  'Picnic & Parks',
  '',
]);

const isValidExternalImageUrl = (value?: string): boolean => {
  if (!value) return false;
  return /^https?:\/\/.+/i.test(value.trim());
};

export const parsePlans = (content: string): { plans: ParsedPlan[]; recommendation: string | null } => {
  const recommendationMatch = content.match(/Recommendation:([\s\S]*)/);
  const recommendation = recommendationMatch ? recommendationMatch[0].trim() : null;

  const plansContent = recommendation ? content.split(recommendation)[0] : content;
  const planStrings = plansContent.split('---').map((plan) => plan.trim()).filter(Boolean);

  const plans = planStrings.map((planString, index) => {
    const lines = planString.split('\n').filter((line) => line.trim() !== '');
    const data: Partial<ParsedPlan> & { rawContent: string } = { rawContent: planString };
    const parseWarnings: string[] = [];
    let inChecklist = false;
    let inPicnic = false;
    const picnicItems: string[] = [];

    lines.forEach((line) => {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();

      if (key.trim().toLowerCase().includes('option')) return;

      if (!line.trim().match(/^[-*]/)) {
        inChecklist = false;
        inPicnic = false;
      }

      const cleanKey = key.replace(/^[-*]+/, '').replace(/\*/g, '').trim();
      const cleanValue = value.replace(/\*/g, '').trim();

      switch (cleanKey) {
        case 'Title':
          data.title = cleanValue;
          break;
        case 'Category':
          data.category = cleanValue as Vibe;
          break;
        case 'Location':
          data.location = cleanValue;
          break;
        case 'Rating':
          data.rating = cleanValue;
          break;
        case 'Opening Hours':
          data.openingHours = cleanValue;
          break;
        case 'Description':
          data.description = cleanValue;
          break;
        case 'Cost':
          data.cost = cleanValue;
          break;
        case 'Estimated Ride Cost':
          data.estimatedRideCost = cleanValue;
          break;
        case 'Weather':
          data.weather = cleanValue;
          break;
        case 'Pro-Tip':
          data.proTip = cleanValue;
          break;
        case 'Essentials Checklist':
          inChecklist = true;
          break;
        case 'Picnic Essentials':
          inPicnic = true;
          break;
        default:
          if (inChecklist && line.trim().match(/^[-*]/)) {
            switch (cleanKey) {
              case 'Dress Code':
                data.dressCode = cleanValue;
                break;
              case 'Noise Level':
                data.noiseLevel = cleanValue;
                break;
              case 'Seating':
                data.seating = cleanValue;
                break;
            }
          } else if (inPicnic && line.trim().match(/^[-*]/)) {
            picnicItems.push(line.substring(1).trim());
          }
          break;
      }
    });

    if (picnicItems.length > 0) {
      data.picnicEssentials = picnicItems;
    }

    const category: Vibe = data.category && SUPPORTED_VIBES.has(data.category) ? data.category : '';
    const title = data.title || 'N/A';
    const location = data.location || 'N/A';
    const id = `${index + 1}-${title}-${location}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return {
      id,
      rawContent: planString,
      title,
      imageUrl: '',
      imageStatus: 'fallback' as const,
      parseWarnings,
      reasoning: undefined,
      category,
      location,
      rating: data.rating || 'N/A',
      openingHours: data.openingHours || 'N/A',
      description: data.description || 'No description available.',
      cost: data.cost || 'N/A',
      proTip: data.proTip || 'N/A',
      dressCode: data.dressCode || 'N/A',
      noiseLevel: data.noiseLevel || 'N/A',
      seating: data.seating || 'N/A',
      picnicEssentials: data.picnicEssentials || null,
      estimatedRideCost: data.estimatedRideCost,
      weather: data.weather,
    };
  });

  return { plans, recommendation };
};

export const parseTravelDetails = (content: string): ParsedTravelDetails | null => {
  if (!content || !content.includes('Travel Estimate')) return null;

  const getDetail = (key: string): string => {
    const regex = new RegExp(`${key}:\\s*([^\\n\\r]*)`);
    const match = content.match(regex);
    return match ? match[1].trim() : 'Could not be determined';
  };

  return {
    distance: getDetail('Distance'),
    travelTime: getDetail('Travel Time'),
    traffic: getDetail('Traffic'),
    weather: getDetail('Weather Forecast'),
  };
};

export const getPlanField = (rawPlan: string, key: string): string => {
  const line = rawPlan.split('\n').find((entry) => entry.trim().startsWith(`${key}:`));
  return line ? line.replace(`${key}:`, '').trim() : '';
};

export const getTitleFromPlan = (planText: string): string => {
  const title = getPlanField(planText, 'Title');
  return title || 'Vibe Plan';
};

export const getDestinationFromPlan = (planText: string): string | null => {
  const destination = getPlanField(planText, 'Location');
  return destination || null;
};

export const splitFinalPlan = (planContent: string): { planSection: string; travelSection: string } => {
  const parts = planContent.split('\n\n---\n');
  return {
    planSection: parts[0] || '',
    travelSection: parts.length > 1 ? parts[1] : '',
  };
};

export const getRecommendedPlanTitle = (recommendation: string | null): string | null => {
  return recommendation ? recommendation.split(':')[1]?.trim() || null : null;
};
