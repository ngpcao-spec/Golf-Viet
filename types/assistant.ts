export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";
export type ExperienceStyle =
  | "relaxing"
  | "technical"
  | "premium"
  | "scenic"
  | "any";
export type BudgetChoice = "under_1500" | "1500_2500" | "2500_4000" | "any";
export type DistanceChoice = "15" | "30" | "50" | "any";
export type PriorityChoice =
  | "price"
  | "quality"
  | "distance"
  | "reviews"
  | "availability";

export type AssistantAnswers = {
  skill: SkillLevel;
  style: ExperienceStyle;
  budget: BudgetChoice;
  distance: DistanceChoice;
  priority: PriorityChoice;
};

export type PartialAssistantAnswers = Partial<AssistantAnswers>;

export type ScoredCourse = {
  golfId: string;
  slug: string;
  score: number;
  matchPercent: number;
  cheapestPrice: number;
  earliestTime: string | null;
  availableCount: number;
};

export type AiRecommendation = {
  golfId: string;
  headline: string;
  reason: string;
  highlights: string[];
};

export type RecommendationSource = "openai" | "fallback";

export type RecommendationResponse = {
  source: RecommendationSource;
  recommendations: AiRecommendation[];
};
