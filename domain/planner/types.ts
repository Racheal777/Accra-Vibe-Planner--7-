export type ImageState = 'idle' | 'loading-external' | 'external-ok' | 'external-failed' | 'fallback-local';

export interface RecommendationSignals {
  budgetFit: 'fit' | 'above' | 'unknown';
  openLikelihood: 'high' | 'medium' | 'low';
  distanceConfidence: 'high' | 'medium' | 'low' | 'unknown';
}

export interface PlanCardViewModel {
  id: string;
  title: string;
  location: string;
  imageUrl: string;
  imageStatus: 'external' | 'fallback';
  reasoning?: string;
  recommendationSignals: RecommendationSignals;
}
