import confetti from 'canvas-confetti';
import { Habit, HabitCompletionLog } from '../types';

export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayKey(): string {
  return formatDateKey(new Date());
}

export function formatFriendlyDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Upper bound for a single progress entry -- guards against typos like 7000 for 7
// while leaving room for large-unit habits such as daily steps.
export const MAX_PROGRESS_ENTRY = 100000;

export type ProgressEntryResult = { ok: true; amount: number } | { ok: false; error: string };

// Validates a user-typed progress amount (e.g. pages read). Only positive whole
// numbers are accepted -- no zero, negatives, decimals or exponent notation.
export function parseProgressEntry(raw: string, unit = 'pages'): ProgressEntryResult {
  const trimmed = raw.trim();
  if (trimmed === '') return { ok: false, error: `Enter how many ${unit} to log.` };
  if (/^-\d*\.?\d+$/.test(trimmed)) return { ok: false, error: 'Enter a number greater than 0.' };
  if (!/^\d+$/.test(trimmed)) return { ok: false, error: 'Use a whole number, like 7.' };
  const amount = Number(trimmed);
  if (amount <= 0) return { ok: false, error: 'Enter a number greater than 0.' };
  if (amount > MAX_PROGRESS_ENTRY) return { ok: false, error: `That's more than ${MAX_PROGRESS_ENTRY.toLocaleString()} in one go.` };
  return { ok: true, amount };
}

// Progress for a quantity habit. `current` keeps the real total (it may exceed the
// target), while `percent` is capped at 100 and only reaches 100 once the goal is met.
export function getProgressSummary(current: number, target: number) {
  const safeTarget = target > 0 ? target : 1;
  const percent = current >= safeTarget ? 100 : Math.min(99, Math.round((current / safeTarget) * 100));
  return {
    percent,
    remaining: Math.max(0, safeTarget - current),
    extra: Math.max(0, current - safeTarget)
  };
}

// Trigger smooth celebratory confetti
export function triggerCelebrationConfetti() {
  confetti({
    particleCount: 45,
    spread: 60,
    origin: { y: 0.75 },
    colors: ['#63C7D8', '#A8E6CF', '#C7B8FF', '#FFD78C', '#7ED6A7']
  });
}

// Web Audio API soft gentle chime on completion
export function playCompletionSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5
    osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.3); // G5
    
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch (e) {
    // Ignore audio autoplay restrictions gracefully
  }
}

// Calculate streaks across active habits
export function calculateStreakStats(habits: Habit[], logs: HabitCompletionLog[]) {
  if (!habits || habits.length === 0) {
    return { currentStreak: 0, longestStreak: 0, completionRate: 0, bestMonth: 'N/A' };
  }

  const activeHabitIds = new Set(habits.filter(h => !h.isArchived).map(h => h.id));
  const activeCount = activeHabitIds.size;
  if (activeCount === 0) {
    return { currentStreak: 0, longestStreak: 0, completionRate: 0, bestMonth: 'N/A' };
  }

  // Map dates to completed count
  const dateMap: Record<string, number> = {};
  logs.forEach(log => {
    if (log.completed && activeHabitIds.has(log.habitId)) {
      dateMap[log.date] = (dateMap[log.date] || 0) + 1;
    }
  });

  const today = new Date();
  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;

  // Check last 180 days backwards
  let checkDate = new Date(today);
  const todayKey = formatDateKey(checkDate);
  const yesterdayKey = formatDateKey(new Date(today.getTime() - 86400000));

  // Today count
  const todayCount = dateMap[todayKey] || 0;
  // If completed at least 1 habit today or yesterday, streak is active
  const isTodayActive = todayCount > 0;
  const isYesterdayActive = (dateMap[yesterdayKey] || 0) > 0;

  if (isTodayActive || isYesterdayActive) {
    let currDate = isTodayActive ? new Date(today) : new Date(today.getTime() - 86400000);
    while (true) {
      const key = formatDateKey(currDate);
      if ((dateMap[key] || 0) > 0) {
        currentStreak++;
        currDate.setDate(currDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak across history
  const sortedDates = Object.keys(dateMap).sort();
  if (sortedDates.length > 0) {
    let lastDate: Date | null = null;
    sortedDates.forEach(dStr => {
      const parts = dStr.split('-').map(Number);
      const cur = new Date(parts[0], parts[1] - 1, parts[2]);
      if (lastDate) {
        const diffDays = Math.round((cur.getTime() - lastDate.getTime()) / 86400000);
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      if (tempStreak > maxStreak) maxStreak = tempStreak;
      lastDate = cur;
    });
  }

  maxStreak = Math.max(maxStreak, currentStreak);

  // Overall completion rate for the last 30 days
  let totalPossible = 0;
  let totalDone = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(today.getTime() - i * 86400000);
    const key = formatDateKey(d);
    totalPossible += activeCount;
    totalDone += Math.min(dateMap[key] || 0, activeCount);
  }

  const completionRate = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;

  // Best-performing calendar month across the last 365 days, by completion rate
  const monthTotals: Record<string, { done: number; possible: number; label: string }> = {};
  for (let i = 0; i < 365; i++) {
    const d = new Date(today.getTime() - i * 86400000);
    const key = formatDateKey(d);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!monthTotals[monthKey]) {
      monthTotals[monthKey] = {
        done: 0,
        possible: 0,
        label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      };
    }
    monthTotals[monthKey].possible += activeCount;
    monthTotals[monthKey].done += Math.min(dateMap[key] || 0, activeCount);
  }

  const monthKeys = Object.keys(monthTotals);
  const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  let bestMonth = 'N/A';
  let bestRate = -1;
  monthKeys.forEach(monthKey => {
    // Skip the still-in-progress current month when there's other history to compare against
    if (monthKey === currentMonthKey && monthKeys.length > 1) return;
    const { done, possible, label } = monthTotals[monthKey];
    if (possible === 0) return;
    const rate = done / possible;
    if (rate > bestRate) {
      bestRate = rate;
      bestMonth = label;
    }
  });

  return {
    currentStreak,
    longestStreak: maxStreak,
    completionRate,
    bestMonth
  };
}

// Generate realistic 52-week logs for the GitHub-style consistency heatmap
export function generateInitialHeatmapLogs(habits: Habit[]): HabitCompletionLog[] {
  const logs: HabitCompletionLog[] = [];
  const today = new Date();
  const habitIds = habits.map(h => h.id);

  // 365 days of history
  for (let i = 365; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000);
    const dateKey = formatDateKey(d);
    const dayOfWeek = d.getDay();

    // Consistency probability varies realisticly (e.g. weekdays higher, weekend slightly lower)
    const completionProbability = dayOfWeek === 0 || dayOfWeek === 6 ? 0.75 : 0.88;

    habitIds.forEach((hId, index) => {
      // Deterministic pseudo-random based on date and habit ID
      const seed = (i * 13 + index * 37) % 100 / 100;
      if (seed < completionProbability) {
        const habit = habits.find(h => h.id === hId);
        logs.push({
          habitId: hId,
          date: dateKey,
          currentValue: habit ? habit.targetValue : 1,
          completed: true
        });
      }
    } );
  }

  return logs;
}
