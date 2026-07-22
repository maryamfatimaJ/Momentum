export type HabitCategory = 
  | 'Fitness' 
  | 'Mindset' 
  | 'Health' 
  | 'Focus' 
  | 'Growth' 
  | 'Wellness';

export type HabitFrequency = 'Daily' | 'Weekly' | 'Monthly';

export interface Habit {
  id: string;
  title: string;
  category: HabitCategory;
  iconName: string;
  color: string;
  frequency: HabitFrequency;
  targetValue: number;
  targetUnit: string;
  reminderTime?: string;
  notes?: string;
  isPaused?: boolean;
  isArchived?: boolean;
  createdAt: string; // ISO date string YYYY-MM-DD
}

export interface HabitCompletionLog {
  habitId: string;
  date: string; // YYYY-MM-DD
  currentValue: number;
  completed: boolean;
  notes?: string;
}

export interface DailyChallenge {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  category: HabitCategory;
  xpReward: number;
  completed: boolean;
}

export interface StreakMilestone {
  days: number;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  theme: 'light' | 'dark';
  notificationsEnabled: boolean;
  reminderTime: string;
  primaryGoal: string;
  joinedDate: string;
}

export interface AICoachInsight {
  headline: string;
  insight: string;
  tip: string;
  recoveryPlan: string;
  detectedWeakness?: string;
  motivationalQuote: string;
  lastUpdated?: string;
}

export interface AIWeeklyReview {
  summary: string;
  scoreGrade: string;
  strongestHabit: string;
  focusArea: string;
  recommendations: string[];
  generatedAt?: string;
}

export interface MotivationalQuote {
  id: string;
  text: string;
  author: string;
}
