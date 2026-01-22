// Score weight configurations for tooltips

export interface ScoreWeight {
  name: string;
  weight: number;
  score?: number;
  color?: string;
}

// Overall score weights (from backend constants)
export const OVERALL_SCORE_WEIGHTS = {
  SEO: 0.15,
  READABILITY: 0.15,
  KEYWORD_DENSITY: 0.12,
  GRAMMAR: 0.12,
  CONTENT_INTENT: 0.12,
  TECHNICAL_HEALTH: 0.12,
  STRATEGIC_ANALYSIS: 0.12,
  BRAND_INTENT: 0.10,
} as const;

// SEO score category weights (from backend seoScoring.ts)
export const SEO_SCORE_WEIGHTS = {
  META_TAGS: 0.40,
  CONTENT_QUALITY: 0.40,
  TECHNICAL: 0.20,
} as const;

// Color palette for different score types
export const SCORE_COLORS = {
  SEO: '#3b82f6',           // blue-500
  READABILITY: '#10b981',   // emerald-500
  KEYWORD_DENSITY: '#f59e0b', // amber-500
  GRAMMAR: '#8b5cf6',       // violet-500
  CONTENT_INTENT: '#06b6d4', // cyan-500
  TECHNICAL_HEALTH: '#ef4444', // red-500
  STRATEGIC_ANALYSIS: '#84cc16', // lime-500
  BRAND_INTENT: '#ec4899',  // pink-500
  META_TAGS: '#3b82f6',     // blue-500
  CONTENT_QUALITY: '#10b981', // emerald-500
  TECHNICAL: '#8b5cf6',     // violet-500
} as const;

/**
 * Generate overall score weights with individual scores
 */
export const generateOverallScoreWeights = (scores: {
  seo_score?: number;
  readability_score?: number;
  keyword_density_score?: number;
  grammar_score?: number;
  content_intent_score?: number;
  technical_health_score?: number;
  strategic_analysis_score?: number;
  brand_intent_score?: number;
}): ScoreWeight[] => [
  {
    name: 'SEO Score',
    weight: OVERALL_SCORE_WEIGHTS.SEO,
    score: scores.seo_score,
    color: SCORE_COLORS.SEO,
  },
  {
    name: 'Readability',
    weight: OVERALL_SCORE_WEIGHTS.READABILITY,
    score: scores.readability_score,
    color: SCORE_COLORS.READABILITY,
  },
  {
    name: 'Keyword Density',
    weight: OVERALL_SCORE_WEIGHTS.KEYWORD_DENSITY,
    score: scores.keyword_density_score,
    color: SCORE_COLORS.KEYWORD_DENSITY,
  },
  {
    name: 'Grammar',
    weight: OVERALL_SCORE_WEIGHTS.GRAMMAR,
    score: scores.grammar_score,
    color: SCORE_COLORS.GRAMMAR,
  },
  {
    name: 'Content Intent',
    weight: OVERALL_SCORE_WEIGHTS.CONTENT_INTENT,
    score: scores.content_intent_score,
    color: SCORE_COLORS.CONTENT_INTENT,
  },
  {
    name: 'Technical Health',
    weight: OVERALL_SCORE_WEIGHTS.TECHNICAL_HEALTH,
    score: scores.technical_health_score,
    color: SCORE_COLORS.TECHNICAL_HEALTH,
  },
  {
    name: 'Strategic Analysis',
    weight: OVERALL_SCORE_WEIGHTS.STRATEGIC_ANALYSIS,
    score: scores.strategic_analysis_score,
    color: SCORE_COLORS.STRATEGIC_ANALYSIS,
  },
  {
    name: 'Brand Intent',
    weight: OVERALL_SCORE_WEIGHTS.BRAND_INTENT,
    score: scores.brand_intent_score,
    color: SCORE_COLORS.BRAND_INTENT,
  },
];

/**
 * Generate SEO score weights with category scores
 */
export const generateSEOScoreWeights = (breakdown?: {
  metaTags?: { score: number; maxScore: number };
  contentQuality?: { score: number; maxScore: number };
  technical?: { score: number; maxScore: number };
}): ScoreWeight[] => [
  {
    name: 'Meta Tags',
    weight: SEO_SCORE_WEIGHTS.META_TAGS,
    score: breakdown?.metaTags ? Math.round((breakdown.metaTags.score / breakdown.metaTags.maxScore) * 100) : undefined,
    color: SCORE_COLORS.META_TAGS,
  },
  {
    name: 'Content Quality',
    weight: SEO_SCORE_WEIGHTS.CONTENT_QUALITY,
    score: breakdown?.contentQuality ? Math.round((breakdown.contentQuality.score / breakdown.contentQuality.maxScore) * 100) : undefined,
    color: SCORE_COLORS.CONTENT_QUALITY,
  },
  {
    name: 'Technical SEO',
    weight: SEO_SCORE_WEIGHTS.TECHNICAL,
    score: breakdown?.technical ? Math.round((breakdown.technical.score / breakdown.technical.maxScore) * 100) : undefined,
    color: SCORE_COLORS.TECHNICAL,
  },
];