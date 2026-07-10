export type SeoPageKey =
  | 'aiLifeLog'
  | 'dailyJournal'
  | 'healthJournal'
  | 'foodLog'
  | 'activityLog'
  | 'aiSummary'
  | 'privacy';

export type SeoPage = {
  title: string;
  eyebrow: string;
  description: string;
  bullets: string[];
  futureFeatures: string[];
};

export const SEO_PAGES: Record<SeoPageKey, SeoPage> = {
  aiLifeLog: {
    title: 'AI Life Log',
    eyebrow: 'LifeLog use case',
    description:
      'LifeLog helps people capture daily experiences, health notes, meals, activities, and reflections in one private AI-assisted journal.',
    bullets: ['Capture structured life entries', 'Review patterns over time', 'Use AI support without exposing private notes in analytics'],
    futureFeatures: ['Guided daily prompts', 'Pattern summaries', 'Searchable timeline views'],
  },
  dailyJournal: {
    title: 'Daily Journal',
    eyebrow: 'Journaling',
    description:
      'A daily journal page for tracking what happened, how the day felt, and what should be remembered later.',
    bullets: ['Daily entries', 'Private reflections', 'Simple review history'],
    futureFeatures: ['Mood and habit prompts', 'Daily streaks', 'Calendar navigation'],
  },
  healthJournal: {
    title: 'Health Journal',
    eyebrow: 'Health tracking',
    description:
      'A health journal for logging symptoms, appointments, medications, sleep, mood, and personal notes in one place.',
    bullets: ['Health notes', 'Symptom context', 'Shareable history for trusted experts'],
    futureFeatures: ['Condition-specific templates', 'Trend detection', 'Exportable visit summaries'],
  },
  foodLog: {
    title: 'Food Log',
    eyebrow: 'Nutrition tracking',
    description:
      'A food log page for recording meals, snacks, nutrition notes, and food-related patterns over time.',
    bullets: ['Meal notes', 'Food pattern tracking', 'Nutrition context for AI summaries'],
    futureFeatures: ['Meal templates', 'Photo-assisted food logging', 'Nutrition category filters'],
  },
  activityLog: {
    title: 'Activity Log',
    eyebrow: 'Movement tracking',
    description:
      'An activity log for recording workouts, walks, exercise, recovery, and daily movement notes.',
    bullets: ['Exercise entries', 'Activity categories', 'Historical activity review'],
    futureFeatures: ['Activity templates', 'Weekly movement summaries', 'Wearable import planning'],
  },
  aiSummary: {
    title: 'AI Summary',
    eyebrow: 'AI reflection',
    description:
      'AI summaries help turn LifeLog entries into useful reflections, patterns, and next-step notes.',
    bullets: ['Summarize journal history', 'Find patterns', 'Save useful responses'],
    futureFeatures: ['Summary history', 'Topic-specific summaries', 'Expert-ready summary exports'],
  },
  privacy: {
    title: 'Privacy',
    eyebrow: 'Data protection',
    description:
      'LifeLog is designed around private personal records, careful sharing, and analytics that avoid sensitive user-entered content.',
    bullets: ['Private account data', 'Controlled expert sharing', 'No health text sent to product analytics'],
    futureFeatures: ['Privacy controls dashboard', 'Data export controls', 'Account deletion flow'],
  },
};

export const SEO_PAGE_PATHS: Record<string, SeoPageKey> = {
  '/ai-life-log': 'aiLifeLog',
  '/daily-journal': 'dailyJournal',
  '/health-journal': 'healthJournal',
  '/food-log': 'foodLog',
  '/activity-log': 'activityLog',
  '/ai-summary': 'aiSummary',
  '/privacy': 'privacy',
};

export const SEO_PAGE_LINKS = Object.entries(SEO_PAGE_PATHS).map(([path, key]) => ({
  path,
  key,
  title: SEO_PAGES[key].title,
}));
