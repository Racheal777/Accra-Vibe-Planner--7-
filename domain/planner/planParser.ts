import type { Vibe } from '../../types';

export interface ParsedPlan {
  rawContent: string;
  title: string;
  imageUrl: string;
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
  'Rich Kids Sports',
  'Active & Adventure',
  'Movies & Plays',
  'Romantic Date',
  'Picnic & Parks',
  '',
]);

export const parsePlans = (content: string): { plans: ParsedPlan[]; recommendation: string | null } => {
  const recommendationMatch = content.match(/Recommendation:([\s\S]*)/);
  const recommendation = recommendationMatch ? recommendationMatch[0].trim() : null;

  const plansContent = recommendation ? content.split(recommendation)[0] : content;
  const planStrings = plansContent.split('---').map((plan) => plan.trim()).filter(Boolean);

  const plans = planStrings.map((planString) => {
    const lines = planString.split('\n').filter((line) => line.trim() !== '');
    const data: Partial<ParsedPlan> & { rawContent: string } = { rawContent: planString };
    let inChecklist = false;
    let inPicnic = false;
    const picnicItems: string[] = [];

    lines.forEach((line) => {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();

      if (key.trim().toLowerCase().includes('option')) return;

      if (!line.trim().startsWith('-')) {
        inChecklist = false;
        inPicnic = false;
      }

      switch (key.trim()) {
        case 'Title':
          data.title = value;
          break;
        case 'Image URL':
          data.imageUrl = value;
          break;
        case 'Category':
          data.category = value as Vibe;
          break;
        case 'Location':
          data.location = value;
          break;
        case 'Rating':
          data.rating = value;
          break;
        case 'Opening Hours':
          data.openingHours = value;
          break;
        case 'Description':
          data.description = value;
          break;
        case 'Cost':
          data.cost = value;
          break;
        case 'Pro-Tip':
          data.proTip = value;
          break;
        case 'Essentials Checklist':
          inChecklist = true;
          break;
        case 'Picnic Essentials':
          inPicnic = true;
          break;
        default:
          if (inChecklist && line.trim().startsWith('-')) {
            const checkKey = key.trim().substring(1).trim();
            switch (checkKey) {
              case 'Dress Code':
                data.dressCode = value;
                break;
              case 'Noise Level':
                data.noiseLevel = value;
                break;
              case 'Seating':
                data.seating = value;
                break;
            }
          } else if (inPicnic && line.trim().startsWith('-')) {
            picnicItems.push(line.substring(1).trim());
          }
          break;
      }
    });

    if (picnicItems.length > 0) {
      data.picnicEssentials = picnicItems;
    }

    const category = data.category && SUPPORTED_VIBES.has(data.category) ? data.category : '';

    return {
      rawContent: planString,
      title: data.title || 'N/A',
      imageUrl: data.imageUrl || '',
      category,
      location: data.location || 'N/A',
      rating: data.rating || 'N/A',
      openingHours: data.openingHours || 'N/A',
      description: data.description || 'No description available.',
      cost: data.cost || 'N/A',
      proTip: data.proTip || 'N/A',
      dressCode: data.dressCode || 'N/A',
      noiseLevel: data.noiseLevel || 'N/A',
      seating: data.seating || 'N/A',
      picnicEssentials: data.picnicEssentials || null,
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
