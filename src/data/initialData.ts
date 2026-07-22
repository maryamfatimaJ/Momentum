import { Habit, DailyChallenge, StreakMilestone, MotivationalQuote, UserProfile, AICoachInsight, AIWeeklyReview } from '../types';

export const PRESET_HABITS: Omit<Habit, 'id' | 'createdAt'>[] = [
  {
    title: 'Workout & Exercise',
    category: 'Fitness',
    iconName: 'Dumbbell',
    color: '#63C7D8',
    frequency: 'Daily',
    targetValue: 30,
    targetUnit: 'mins',
    reminderTime: '07:00',
    notes: 'Prioritize physical vitality and energy for the day.'
  },
  {
    title: 'Hydrate (Drink Water)',
    category: 'Health',
    iconName: 'Droplets',
    color: '#3FB7CB',
    frequency: 'Daily',
    targetValue: 3,
    targetUnit: 'L',
    reminderTime: '08:00',
    notes: 'Keep a clean water bottle on your desk.'
  },
  {
    title: 'Morning Prayer & Devotion',
    category: 'Mindset',
    iconName: 'Sun',
    color: '#FFD78C',
    frequency: 'Daily',
    targetValue: 15,
    targetUnit: 'mins',
    reminderTime: '06:30',
    notes: 'Start with gratitude and spiritual grounding.'
  },
  {
    title: 'Read a Book',
    category: 'Growth',
    iconName: 'BookOpen',
    color: '#C7B8FF',
    frequency: 'Daily',
    targetValue: 15,
    targetUnit: 'pages',
    reminderTime: '21:00',
    notes: 'Knowledge accumulates compound interest.'
  },
  {
    title: 'Mindful Meditation',
    category: 'Mindset',
    iconName: 'Brain',
    color: '#A8E6CF',
    frequency: 'Daily',
    targetValue: 10,
    targetUnit: 'mins',
    reminderTime: '07:30',
    notes: 'Calm the mind, focus on diaphragmatic breathing.'
  },
  {
    title: 'Full Body Stretch',
    category: 'Wellness',
    iconName: 'Smile',
    color: '#7ED6A7',
    frequency: 'Daily',
    targetValue: 10,
    targetUnit: 'mins',
    reminderTime: '18:00',
    notes: 'Release muscular tension after long work blocks.'
  },
  {
    title: 'Daily Reflection Journal',
    category: 'Mindset',
    iconName: 'Heart',
    color: '#F4A7A7',
    frequency: 'Daily',
    targetValue: 1,
    targetUnit: 'entry',
    reminderTime: '21:30',
    notes: 'Write 3 things you are grateful for today.'
  },
  {
    title: 'Deep Focus Coding',
    category: 'Focus',
    iconName: 'Code',
    color: '#63C7D8',
    frequency: 'Daily',
    targetValue: 60,
    targetUnit: 'mins',
    reminderTime: '10:00',
    notes: 'Build meaningful projects uninterrupted.'
  },
  {
    title: 'Sleep Before 11 PM',
    category: 'Health',
    iconName: 'Moon',
    color: '#C7B8FF',
    frequency: 'Daily',
    targetValue: 1,
    targetUnit: 'time',
    reminderTime: '22:30',
    notes: 'Quality sleep fuels tomorrow\'s momentum.'
  },
  {
    title: 'Healthy Eating & Clean Meals',
    category: 'Health',
    iconName: 'Apple',
    color: '#7ED6A7',
    frequency: 'Daily',
    targetValue: 3,
    targetUnit: 'meals',
    reminderTime: '12:30',
    notes: 'Nourish your body with whole, nutrient-dense food.'
  },
  {
    title: 'Brisk Walking',
    category: 'Fitness',
    iconName: 'Activity',
    color: '#3FB7CB',
    frequency: 'Daily',
    targetValue: 5000,
    targetUnit: 'steps',
    reminderTime: '17:00',
    notes: 'Step outside for fresh air and active recovery.'
  },
  {
    title: 'Language Practice',
    category: 'Growth',
    iconName: 'Compass',
    color: '#FFD78C',
    frequency: 'Daily',
    targetValue: 15,
    targetUnit: 'mins',
    reminderTime: '19:00',
    notes: 'Expand your mind with new vocabulary daily.'
  }
];

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'habit-1',
    title: 'Workout & Exercise',
    category: 'Fitness',
    iconName: 'Dumbbell',
    color: '#63C7D8',
    frequency: 'Daily',
    targetValue: 30,
    targetUnit: 'mins',
    reminderTime: '07:00',
    notes: 'Morning movement for peak focus and stamina.',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
  },
  {
    id: 'habit-2',
    title: 'Hydrate (Drink Water)',
    category: 'Health',
    iconName: 'Droplets',
    color: '#3FB7CB',
    frequency: 'Daily',
    targetValue: 3,
    targetUnit: 'L',
    reminderTime: '08:00',
    notes: 'Stay energized throughout the afternoon.',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
  },
  {
    id: 'habit-3',
    title: 'Read 15 Pages',
    category: 'Growth',
    iconName: 'BookOpen',
    color: '#C7B8FF',
    frequency: 'Daily',
    targetValue: 15,
    targetUnit: 'pages',
    reminderTime: '21:00',
    notes: 'Currently reading Atomic Habits.',
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString().split('T')[0]
  },
  {
    id: 'habit-4',
    title: 'Mindful Meditation',
    category: 'Mindset',
    iconName: 'Brain',
    color: '#A8E6CF',
    frequency: 'Daily',
    targetValue: 10,
    targetUnit: 'mins',
    reminderTime: '07:30',
    notes: 'Diaphragmatic breathwork.',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString().split('T')[0]
  }
];

export const DAILY_CHALLENGES_POOL: Omit<DailyChallenge, 'id' | 'date' | 'completed'>[] = [
  {
    title: 'Walk 5,000 Steps Today',
    description: 'Get moving outdoors and step away from screen work for 30 minutes.',
    category: 'Fitness',
    xpReward: 150
  },
  {
    title: 'Hydrate with 2 Liters Water',
    description: 'Keep a clean glass or bottle filled at all times throughout your day.',
    category: 'Health',
    xpReward: 100
  },
  {
    title: 'Read 10 Pages Uninterrupted',
    description: 'Set your phone on Do Not Disturb and immerse in non-fiction wisdom.',
    category: 'Growth',
    xpReward: 120
  },
  {
    title: '5-Minute Quiet Meditation',
    description: 'Close your eyes and breathe deeply to reset your mental posture.',
    category: 'Mindset',
    xpReward: 100
  },
  {
    title: 'Zero Sugar Challenge',
    description: 'Refrain from processed sugars today for sustained blood sugar energy.',
    category: 'Health',
    xpReward: 200
  },
  {
    title: 'Gratitude Reflection Journal',
    description: 'Write down 3 specific things that brought joy or growth to your week.',
    category: 'Mindset',
    xpReward: 125
  },
  {
    title: 'Complete All Daily Habits',
    description: 'Achieve 100% compliance across your active Momentum daily routines.',
    category: 'Focus',
    xpReward: 250
  }
];

export const MOTIVATIONAL_QUOTES: MotivationalQuote[] = [
  {
    id: 'q1',
    text: 'Small actions created consistently build extraordinary lives.',
    author: 'Momentum Philosophy'
  },
  {
    id: 'q2',
    text: 'Progress grows where daily consistency lives.',
    author: 'Momentum Philosophy'
  },
  {
    id: 'q3',
    text: 'Momentum is built one habit at a time.',
    author: 'Momentum Philosophy'
  },
  {
    id: 'q4',
    text: 'Become the Best Version of You.',
    author: 'Momentum Principle'
  },
  {
    id: 'q5',
    text: 'You do not rise to the level of your goals. You fall to the level of your systems.',
    author: 'Core Philosophy'
  },
  {
    id: 'q6',
    text: 'Discipline is choosing between what you want now and what you want most.',
    author: 'Daily Wisdom'
  }
];

export const INITIAL_MILESTONES: StreakMilestone[] = [
  {
    days: 7,
    title: 'Spark of Momentum',
    description: 'Maintained 7 consecutive days of active habits.',
    iconName: 'Zap',
    unlocked: true,
    unlockedAt: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0]
  },
  {
    days: 21,
    title: 'Habit Formation',
    description: 'Reached 21 days—the psychological threshold for subconscious routine.',
    iconName: 'Flame',
    unlocked: true,
    unlockedAt: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0]
  },
  {
    days: 50,
    title: 'Unstoppable Force',
    description: '50 unbroken days of dedication and progress.',
    iconName: 'Shield',
    unlocked: false
  },
  {
    days: 100,
    title: 'Master of Consistency',
    description: '100 days of sustained personal transformation.',
    iconName: 'Award',
    unlocked: false
  },
  {
    days: 365,
    title: 'Legendary Lifestyle',
    description: '365 days of relentless momentum. You are truly the best version of you.',
    iconName: 'Crown',
    unlocked: false
  }
];

export const INITIAL_PROFILE: UserProfile = {
  name: 'Alex Rivera',
  email: 'alex@momentum.app',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  theme: 'light',
  notificationsEnabled: true,
  reminderTime: '08:00',
  primaryGoal: 'Peak performance, mental clarity, and daily fitness momentum',
  joinedDate: '2026-01-01'
};

// A brand-new guest gets a blank profile rather than the "Alex Rivera" demo persona.
export const GUEST_DEFAULT_PROFILE: UserProfile = {
  name: 'Guest',
  email: '',
  avatarUrl: '',
  theme: 'light',
  notificationsEnabled: true,
  reminderTime: '08:00',
  primaryGoal: '',
  joinedDate: ''
};

// All milestones start locked for a brand-new guest -- INITIAL_MILESTONES pre-unlocks
// the 7/21-day tiers purely for demo purposes (see loadDemoData in HabitContext).
export const EMPTY_MILESTONES: StreakMilestone[] = INITIAL_MILESTONES.map(m => ({
  ...m,
  unlocked: false,
  unlockedAt: undefined
}));

// Sample AI Coach content shown only after the user explicitly loads demo data;
// a real guest sees these as null until they refresh insights/ask a question.
export const DEMO_AI_INSIGHT: AICoachInsight = {
  headline: "Small consistent steps create compound transformation.",
  insight: "You're showing consistent momentum across morning fitness and hydration routines.",
  tip: "Complete your reading habit early in the evening to optimize your pre-sleep wind-down.",
  recoveryPlan: "If you miss a session, lower the bar to just 2 minutes rather than skipping entirely.",
  detectedWeakness: "Read 15 Pages",
  motivationalQuote: "Progress grows where consistency lives."
};

export const DEMO_AI_WEEKLY_REVIEW: AIWeeklyReview = {
  summary: "An exceptional week of deliberate focus. Your hydration and fitness habits achieved 92% compliance.",
  scoreGrade: "A+",
  strongestHabit: "Hydrate (Drink Water)",
  focusArea: "Read 15 Pages",
  recommendations: [
    "Pair your reading habit immediately after evening tea to leverage habit stacking.",
    "Set your workout gear out the night before to eliminate morning friction.",
    "Keep up your 10-minute meditation streak for mental stamina."
  ]
};
