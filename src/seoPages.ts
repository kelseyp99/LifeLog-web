export type SeoPageKey =
  | 'aiLifeLog'
  | 'dailyJournal'
  | 'healthJournal'
  | 'foodLog'
  | 'activityLog'
  | 'aiSummary'
  | 'lifeLogGuide';

export type SeoPage = {
  title: string;
  seoTitle?: string;
  heroTitle?: string;
  eyebrow: string;
  description: string;
  metaDescription?: string;
  intro?: string[];
  bullets: string[];
  recordItems?: { title: string; copy: string }[];
  futureFeatures: string[];
  useCases?: Array<string | { title: string; copy: string }>;
  organizationCopy?: string;
  organizationDetails?: string[];
  aiCopy?: string;
  ctaTitle?: string;
  ctaCopy?: string;
  relatedKeys?: SeoPageKey[];
};

export const SEO_PAGES: Record<SeoPageKey, SeoPage> = {
  lifeLogGuide: {
    title: 'What Is a Life Log? A Simple Guide to Logging Your Everyday Life',
    seoTitle: 'What Is a Life Log? A Simple Guide to Logging Your Everyday Life',
    heroTitle: 'What Is a Life Log? A Simple Guide to Logging Your Everyday Life',
    eyebrow: 'A practical guide to life logging',
    description:
      'A life log is a private, dated record of everyday experiences, details, and observations you want to remember and understand over time.',
    metaDescription:
      'Learn what a life log is, what to track, how it differs from a journal, and how LifeLog helps you keep a private daily life log.',
    intro: [
      'Life logging is the habit of recording useful details from ordinary days. A life log might include a quick note about a conversation, a meal, a walk, a health observation, a decision, or something you want to revisit later. It does not need to be long or polished; consistency and context matter more than writing a perfect entry.',
      'Unlike a record created only for special occasions, a daily life log grows alongside your real routine. Small entries can help you reconstruct a busy week, notice a change, or find the details surrounding a memory.',
    ],
    bullets: [
      'A dated record of events, thoughts, routines, and observations',
      'A flexible place for notes, meals, activities, health context, and everyday moments',
      'A private history you can search and review when memory is incomplete',
    ],
    recordItems: [
      { title: 'Everyday events', copy: 'Record appointments, errands, conversations, places, purchases, decisions, and moments that may matter later.' },
      { title: 'Food and activity', copy: 'Add meals, snacks, walks, workouts, movement, recovery, or the surrounding context in your own words.' },
      { title: 'Health and wellbeing', copy: 'Note sleep, mood, energy, symptoms, routines, questions, and other personal observations without trying to diagnose them.' },
      { title: 'Ideas and reflections', copy: 'Save lessons, questions, goals, milestones, and details you want to connect with the day they occurred.' },
    ],
    useCases: [
      { title: 'Life log vs. journal', copy: 'A journal often emphasizes reflection or a narrative entry. A life log can be shorter and more varied, combining practical facts, observations, and reflections in one searchable timeline.' },
      { title: 'A quick daily example', copy: '“Walked after lunch, tried a new sandwich, felt more focused in the afternoon, and need to ask about the appointment time.” One compact entry can preserve several useful details.' },
      { title: 'A longer-term example', copy: 'After several weeks, you might search for a routine, meal, symptom, project, or place and review the surrounding entries instead of relying on a vague memory.' },
    ],
    organizationCopy:
      'LifeLog helps turn life logging into a practical personal timeline. You can keep entries in categories, search your history, and create an AI-assisted summary from the records you choose to review.',
    organizationDetails: [
      'The goal is not to document every second. Start with details that are easy to forget or useful in context, then let your daily life log develop at a pace you can sustain.',
      'LifeLog is a private reflection and record-keeping tool. Its summaries can help organize your notes, but you should compare them with the original entries and use authoritative sources for medical, legal, or financial decisions.',
    ],
    futureFeatures: [],
    ctaTitle: 'Start your own daily life log',
    ctaCopy: 'Use LifeLog to capture everyday details in one private, searchable place.',
    relatedKeys: ['aiLifeLog', 'dailyJournal', 'foodLog', 'activityLog'],
  },
  aiLifeLog: {
    title: 'AI Life Log',
    seoTitle: 'AI Life Log for Searchable Daily History | LifeLog',
    heroTitle: 'Build a life log you can search, revisit, and summarize',
    eyebrow: 'Your searchable personal timeline',
    description:
      'LifeLog brings everyday notes, activities, meals, health observations, and reflections into one dated history—so useful details are easier to find when memory is not enough.',
    metaDescription:
      'Record daily notes, meals, activities, and health observations in a searchable life log, then create AI-assisted summaries from the history you choose.',
    intro: [
      'Most days contain small details that become important later: when a new routine began, what you ate before a long afternoon, the name of a place you visited, or the context behind a decision. A life log gives those details a dependable home without requiring every entry to become a polished journal essay.',
      'LifeLog is designed for quick, practical recording. Add the amount of detail that fits the moment, organize it by category, and return when you want to reconstruct a day, compare periods, or prepare a concise recap.',
    ],
    bullets: [
      'Daily events and personal notes',
      'Meals, activities, sleep, mood, and health context',
      'Questions, decisions, milestones, and details worth remembering',
      'Saved AI-assisted summaries based on the history you choose to review',
    ],
    recordItems: [
      { title: 'Everyday moments', copy: 'Capture appointments, errands, conversations, places, purchases, decisions, and small events you may want to recall later.' },
      { title: 'Routines and wellbeing', copy: 'Note sleep, energy, mood, medications, symptoms, habits, and changes in how a day felt—using your own words.' },
      { title: 'Food and movement', copy: 'Record meals, snacks, walks, workouts, recovery days, and the context that is often missing from specialized trackers.' },
      { title: 'Questions and reflections', copy: 'Save follow-up questions, lessons, ideas, and observations while they are fresh, then connect them to the day they occurred.' },
    ],
    futureFeatures: [],
    useCases: [
      { title: 'Reconstruct a busy week', copy: 'Search your entries before a planning session to remember meetings, meals, exercise, decisions, and unfinished follow-ups without piecing them together from several apps.' },
      { title: 'Trace a change over time', copy: 'Look back for the first mention of a routine, symptom, hobby, or goal, then review nearby entries to recover the surrounding context.' },
      { title: 'Prepare a useful recap', copy: 'Select a relevant stretch of history before a personal review or conversation, then turn scattered observations into a readable starting point.' },
    ],
    organizationCopy:
      'LifeLog keeps entries associated with dates and categories rather than leaving everything in one endless note. Search helps you move from a remembered word, topic, or time period back to the original entry and its neighboring context.',
    organizationDetails: [
      'A search result is most useful when you can see what happened around it. Your dated history lets you move from one matching detail to nearby food, activity, health, or general notes from the same period.',
      'This creates a record that becomes more valuable gradually. You do not need to predict which detail will matter in six months; you only need to record enough context to recognize it later.',
    ],
    aiCopy:
      'When you request a summary, LifeLog can condense the entries you choose into a more readable overview. This can help organize recurring topics, notable events, and open questions before you review the source entries yourself. AI output can miss context or make mistakes, so treat it as a reflection aid—not a factual record, diagnosis, or professional advice.',
    ctaTitle: 'Start a life log that is useful later',
    ctaCopy: 'Get LifeLog and begin with one quick entry about today. Your searchable history grows from there.',
    relatedKeys: ['dailyJournal', 'healthJournal', 'activityLog', 'aiSummary'],
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
    seoTitle: 'Health Journal for Personal Notes and History | LifeLog',
    heroTitle: 'Keep health observations in context—not scattered across memory',
    eyebrow: 'A clearer personal health timeline',
    description:
      'Use LifeLog to record symptoms, routines, appointments, questions, and day-to-day observations alongside the food, activity, and life context surrounding them.',
    metaDescription:
      'Create a dated health journal for symptoms, sleep, medications, appointments, and personal observations, with search and careful AI-assisted summaries.',
    intro: [
      'Health details are easy to forget or misremember, especially when they seem minor at the time. A brief note about when something started, what changed that week, or which question you wanted to ask can make a later review more grounded.',
      'LifeLog is a personal record, not a medical device. It helps you preserve your own observations in everyday language so you can revisit the original notes and communicate more clearly when appropriate.',
    ],
    bullets: [
      'Symptoms and when you noticed them',
      'Sleep, mood, energy, and other personal observations',
      'Appointments, questions, medications, and routine changes',
      'Notes about what improved, continued, or changed over time',
    ],
    recordItems: [
      { title: 'Symptoms and observations', copy: 'Write down what you noticed, when you noticed it, how long it lasted, and any context you believe may be useful later—without trying to diagnose it.' },
      { title: 'Sleep, mood, and energy', copy: 'Record bedtime or wake-up notes, energy changes, stress, mood, and other subjective details in the terms that make sense to you.' },
      { title: 'Medications and routines', copy: 'Note medication reminders, routine changes, questions about instructions, and the dates you started or stopped something as directed.' },
      { title: 'Appointments and follow-ups', copy: 'Save questions beforehand and record your understanding of next steps afterward. Keep official instructions in their original source as well.' },
    ],
    futureFeatures: [],
    useCases: [
      { title: 'Prepare for an appointment', copy: 'Search for relevant entries, confirm dates, and create a short list of observations and questions. Bring the original notes when exact wording or timing matters.' },
      { title: 'Remember what changed', copy: 'Review the period around a new routine, medication, symptom, or sleep change to see what you actually recorded rather than relying only on recall.' },
      { title: 'Keep everyday context nearby', copy: 'Read health notes beside meals, activity, travel, work, or daily reflections when that context is useful to your own review.' },
    ],
    organizationCopy:
      'Dated entries and categories keep health observations connected to the rest of your LifeLog history. Search by a remembered term, category, or period to retrieve the note and review what else you recorded around the same time.',
    organizationDetails: [
      'A consistent, lightweight habit is often more useful than an elaborate template you stop using. A short entry such as “low energy after lunch; slept six hours” preserves a time, observation, and context that can be expanded later.',
      'LifeLog does not verify measurements or replace records from clinicians, pharmacies, laboratories, or medical devices. Use it as a personal companion to those authoritative sources.',
    ],
    aiCopy:
      'AI-assisted summaries can organize selected notes into a concise recap, grouping repeated topics and dates so you have a clearer draft to review. Always compare the summary with the original entries. It does not diagnose conditions, assess urgency, recommend treatment, or replace advice from a qualified professional.',
    ctaTitle: 'Begin a clearer health history',
    ctaCopy: 'Get LifeLog and record the observations and questions you want available for your next review.',
    relatedKeys: ['dailyJournal', 'foodLog', 'activityLog', 'aiSummary'],
  },
  foodLog: {
    title: 'Food Log',
    seoTitle: 'Food Log for Meals, Context, and Searchable History | LifeLog',
    heroTitle: 'Remember what you ate—and the context around it',
    eyebrow: 'A practical meal history',
    description:
      'LifeLog gives meals, snacks, drinks, ingredients, timing, and personal observations a searchable place in your daily history—without requiring calorie counting.',
    metaDescription:
      'Keep a searchable food log for meals, snacks, ingredients, timing, and personal context, with optional AI-assisted summaries of selected entries.',
    intro: [
      'A useful food record can be simple. Sometimes you only need the name of a meal and an approximate time. Other times, ingredients, portion notes, where you ate, or how the rest of the day felt provide the detail you will want later.',
      'LifeLog lets food entries live beside the rest of your day. That makes the log useful for memory and reflection even when you are not following a formal nutrition plan.',
    ],
    bullets: [
      'Meals, snacks, drinks, and approximate times',
      'Ingredients, portions, preparation notes, and dining context',
      'Hunger, energy, mood, or other observations you choose to record',
      'Questions and follow-up notes for your own review',
    ],
    recordItems: [
      { title: 'Meals and snacks', copy: 'Save a quick description of breakfast, lunch, dinner, snacks, and drinks. Add a photo reference or preparation detail when it will help you recognize the meal.' },
      { title: 'Ingredients and portions', copy: 'Record notable ingredients, substitutions, restaurant dishes, approximate amounts, or recipe variations when those specifics matter to your purpose.' },
      { title: 'Timing and setting', copy: 'Note when and where you ate, whether the meal was planned or rushed, and who you shared it with if that context is worth remembering.' },
      { title: 'Personal observations', copy: 'Add hunger, fullness, energy, enjoyment, convenience, or other neutral observations. LifeLog does not score foods or tell you what you should eat.' },
    ],
    futureFeatures: [],
    useCases: [
      { title: 'Recreate a meal or recipe', copy: 'Search for an ingredient, restaurant, or occasion to recover what you ordered, which substitution worked, or the preparation note you wanted to repeat.' },
      { title: 'Review a week realistically', copy: 'Look across ordinary meals, snacks, travel days, celebrations, and rushed moments instead of relying on a single memorable day as representative.' },
      { title: 'Prepare for a conversation', copy: 'Collect relevant entries before speaking with a qualified nutrition professional, while keeping their guidance separate from your personal observations.' },
    ],
    organizationCopy:
      'Food entries remain attached to dates and categories, so you can search for a dish, ingredient, restaurant, or remembered detail and then move back into the surrounding day. That is helpful when a meal only makes sense alongside travel, activity, sleep, or a health note.',
    organizationDetails: [
      'You can keep the level of detail flexible. A quick “sandwich and coffee around noon” is still searchable; a longer entry can preserve ingredients, preparation, company, and follow-up thoughts.',
      'History also reduces the pressure to spot a pattern immediately. Record what happened first, then review a suitable period when you have a specific question—without assuming that two events are connected simply because they occurred close together.',
    ],
    aiCopy:
      'AI-assisted summaries can condense selected food entries into a readable recap and call attention to repeated words, meals, or contexts in what you wrote. Review the source entries before drawing conclusions. The summary does not calculate complete nutrition, establish cause and effect, or provide dietary or medical advice.',
    ctaTitle: 'Start a food log that fits real life',
    ctaCopy: 'Get LifeLog and save your next meal in a few words. Add detail only when it is useful to you.',
    relatedKeys: ['healthJournal', 'activityLog', 'dailyJournal', 'aiSummary'],
  },
  activityLog: {
    title: 'Activity Log',
    seoTitle: 'Activity Log for Workouts and Everyday Movement | LifeLog',
    heroTitle: 'Track movement with the details a step count leaves out',
    eyebrow: 'Workouts, movement, and recovery in context',
    description:
      'Record workouts, walks, physical tasks, recovery, and routine changes in your own words, then search the history when you want a clearer view of what you did.',
    metaDescription:
      'Create a searchable activity log for workouts, walks, everyday movement, effort, and recovery notes, with optional AI-assisted summaries.',
    intro: [
      'Numbers such as time, distance, repetitions, or steps can be useful, but they rarely tell the whole story. The route, purpose, effort, weather, equipment, interruption, or recovery note may be the detail that helps you understand the session later.',
      'LifeLog complements specialized fitness trackers by giving unstructured context a place to live. It also makes room for movement that does not look like a formal workout, from gardening and commuting to moving furniture or taking a restorative walk.',
    ],
    bullets: [
      'Type of activity, date, duration, and location notes',
      'Effort, distance, repetitions, or other details you choose',
      'Recovery observations and changes to a routine',
      'Everyday movement that may not belong in a workout app',
    ],
    recordItems: [
      { title: 'Planned exercise', copy: 'Record runs, rides, strength sessions, classes, sports, mobility work, or any structured activity with the details relevant to your routine.' },
      { title: 'Everyday movement', copy: 'Save walks, active commutes, yard work, household projects, play, and other physical tasks that may not appear meaningfully in a workout app.' },
      { title: 'Effort and conditions', copy: 'Add duration, distance, repetitions, perceived effort, route, equipment, weather, or interruptions when those details help explain the experience.' },
      { title: 'Recovery and adjustments', copy: 'Note rest days, soreness, energy, substitutions, and changes you made. These are personal observations, not readiness or injury assessments.' },
    ],
    futureFeatures: [],
    useCases: [
      { title: 'Resume a routine', copy: 'Search for your last few sessions to remember weights, routes, class notes, modifications, or where you stopped before travel or a busy period.' },
      { title: 'Review consistency', copy: 'Look back across several weeks to see the activities you actually recorded—including short walks and recovery days—rather than judging the period from memory.' },
      { title: 'Explain the surrounding day', copy: 'Read an activity beside sleep, food, schedule, or general notes when you want to remember why one session felt different from another.' },
    ],
    organizationCopy:
      'Categories and dates make individual activities easier to retrieve while keeping them connected to your broader personal history. Search for an activity, location, piece of equipment, or phrase, then review nearby entries for the context you recorded at the time.',
    organizationDetails: [
      'A flexible log works for both structured plans and irregular movement. You can keep a concise record of recurring sessions while using longer notes for a new route, technique cue, milestone, or change in routine.',
      'LifeLog records what you enter; it does not measure performance, verify distance, determine whether an activity is safe, or replace coaching or medical guidance.',
    ],
    aiCopy:
      'AI-assisted summaries can turn selected activity entries into a concise recap, grouping sessions and repeated themes from your notes. Use the result to navigate your history, then confirm important details in the original entries. It does not evaluate training quality, diagnose injuries, or prescribe exercise.',
    ctaTitle: 'Create an activity history you will use',
    ctaCopy: 'Get LifeLog and record today’s movement, including the context that mattered—not just the numbers.',
    relatedKeys: ['healthJournal', 'foodLog', 'dailyJournal', 'aiSummary'],
  },
  aiSummary: {
    title: 'AI Summary',
    eyebrow: 'AI reflection',
    description:
      'AI summaries help turn LifeLog entries into useful reflections, patterns, and next-step notes.',
    bullets: ['Summarize journal history', 'Find patterns', 'Save useful responses'],
    futureFeatures: ['Summary history', 'Topic-specific summaries', 'Expert-ready summary exports'],
  },
};

export const SEO_PAGE_PATHS: Record<string, SeoPageKey> = {
  '/what-is-a-life-log': 'lifeLogGuide',
  '/ai-life-log': 'aiLifeLog',
  '/daily-journal': 'dailyJournal',
  '/health-journal': 'healthJournal',
  '/food-log': 'foodLog',
  '/activity-log': 'activityLog',
  '/ai-summary': 'aiSummary',
};

export const SEO_PAGE_LINKS = Object.entries(SEO_PAGE_PATHS).map(([path, key]) => ({
  path,
  key,
  title: SEO_PAGES[key].title,
}));
