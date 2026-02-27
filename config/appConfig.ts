export const LOCAL_STORAGE_KEYS = {
  theme: 'accra-vibe-theme',
  planHistory: 'accra-vibe-plan-history',
  rateLimitTimestamp: 'accra-vibe-last-plan-timestamp',
  subscriptionStatus: 'accra-vibe-subscription-status',
  subscriptionExpiry: 'accra-vibe-subscription-expiry',
  planCount: 'accra-vibe-plan-count',
} as const;

export const BILLING = {
  microBoost: {
    code: 'micro-boost',
    amountGhs: 3,
    planLimit: 5,
    validityMs: 48 * 60 * 60 * 1000,
  },
  powerPlanner: {
    code: 'power-planner',
    amountGhs: 60,
    planLimit: 150,
    validityMs: 30 * 24 * 60 * 60 * 1000,
  },
} as const;

export const RATE_LIMIT = {
  freePlanCooldownMs: 60 * 1000
} as const;

export const AI = {
  model: 'gemini-2.5-flash',
} as const;
