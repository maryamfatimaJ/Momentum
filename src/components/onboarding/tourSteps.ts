export interface TourStep {
  id: string;
  title: string;
  description: string;
  // CSS selector of the element to spotlight; null centers the card with no cutout.
  targetSelector: string | null;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Momentum',
    description: "Welcome! Let's take a quick 30-second tour to help you get started.",
    targetSelector: '[data-tour="nav-dashboard"]',
    placement: 'bottom'
  },
  {
    id: 'create-habit',
    title: 'Create Habits',
    description: 'This is where you create and organize your daily habits. Start with just one small habit.',
    targetSelector: '[data-tour="create-habit"]',
    placement: 'bottom'
  },
  {
    id: 'ai-coach',
    title: 'AI Coach',
    description: 'Your AI Coach helps you build routines, stay motivated, and answer productivity questions whenever you need guidance.',
    targetSelector: '[data-tour="ai-coach"]',
    placement: 'top'
  },
  {
    id: 'calendar',
    title: 'Calendar & Consistency',
    description: 'Every completed habit builds your streak and fills your calendar heatmap, helping you visualize consistency over time.',
    targetSelector: '[data-tour="nav-calendar"]',
    placement: 'bottom'
  },
  {
    id: 'milestones',
    title: 'Milestones',
    description: 'Unlock milestones as your consistency grows. Small wins lead to lasting progress.',
    targetSelector: '[data-tour="nav-milestones"]',
    placement: 'bottom'
  },
  {
    id: 'final',
    title: "You're all set",
    description: 'Now start building the best version of yourself.',
    targetSelector: null,
    placement: 'center'
  }
];
