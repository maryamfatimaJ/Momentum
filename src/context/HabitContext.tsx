import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  Habit,
  HabitCompletionLog,
  DailyChallenge,
  StreakMilestone,
  UserProfile,
  AICoachInsight,
  AIWeeklyReview,
  MotivationalQuote,
  HabitCategory
} from '../types';
import {
  INITIAL_HABITS,
  DAILY_CHALLENGES_POOL,
  MOTIVATIONAL_QUOTES,
  INITIAL_MILESTONES,
  INITIAL_PROFILE,
  GUEST_DEFAULT_PROFILE,
  EMPTY_MILESTONES,
  DEMO_AI_INSIGHT,
  DEMO_AI_WEEKLY_REVIEW
} from '../data/initialData';
import {
  getTodayKey,
  generateInitialHeatmapLogs,
  triggerCelebrationConfetti,
  playCompletionSound,
  calculateStreakStats
} from '../utils/habitUtils';
import { supabase, isSupabaseConfigured, ensureSupabaseConfigured } from '../lib/supabaseClient';
import { toRow, fromRow, HABIT_FIELDS, LOG_FIELDS, PROFILE_FIELDS, MILESTONE_FIELDS, DAILY_CHALLENGE_FIELDS } from '../lib/supabaseMappers';

interface HabitContextType {
  activeTab: 'dashboard' | 'habits' | 'calendar' | 'streaks' | 'analytics' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'habits' | 'calendar' | 'streaks' | 'analytics' | 'settings') => void;
  isLandingPage: boolean;
  setIsLandingPage: (isLanding: boolean) => void;
  habits: Habit[];
  logs: HabitCompletionLog[];
  userProfile: UserProfile;
  todayChallenge: DailyChallenge;
  milestones: StreakMilestone[];
  aiInsight: AICoachInsight | null;
  aiWeeklyReview: AIWeeklyReview | null;
  dailyQuote: MotivationalQuote;
  selectedCategory: HabitCategory | 'All';
  setSelectedCategory: (cat: HabitCategory | 'All') => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Auth
  session: Session | null;
  authLoading: boolean;
  dataLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isPasswordRecovery: boolean;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (email: string, password: string, name: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;

  // Actions
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => Habit;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  togglePauseHabit: (id: string) => void;
  toggleArchiveHabit: (id: string) => void;
  toggleHabitCompletion: (habitId: string, dateStr?: string) => void;
  updateHabitProgress: (habitId: string, value: number, dateStr?: string) => void;
  completeChallenge: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  fetchAICoachInsight: () => Promise<void>;
  fetchAIWeeklyReview: () => Promise<void>;
  parseHabitWithAI: (prompt: string) => Promise<Habit | null>;
  askCoach: (question: string) => Promise<string>;
  chatHistory: Array<{ role: 'user' | 'assistant'; text: string }>;
  sendCoachMessage: (question: string) => Promise<void>;
  resetAllData: () => Promise<void>;
  loadDemoData: () => void;

  // Computed stats
  streakStats: { currentStreak: number; longestStreak: number; completionRate: number; bestMonth: string };
  todayCompletionPercent: number;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export const HabitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLandingPage, setIsLandingPage] = useState<boolean>(() => {
    const saved = localStorage.getItem('momentum_is_landing_page');
    return saved === null ? true : saved === 'true';
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'habits' | 'calendar' | 'streaks' | 'analytics' | 'settings'>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | 'All'>('All');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('momentum_theme');
    // First-time visitors always start in Light mode regardless of OS preference;
    // the theme only changes once the user explicitly toggles it in Settings.
    return saved === 'dark' ? 'dark' : 'light';
  });

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      if (session?.user) {
        supabase.from('profiles').update({ theme: next }).eq('id', session.user.id)
          .then(({ error }) => { if (error) console.error('Failed to sync theme preference:', error); });
      }
      return next;
    });
  };

  // Auth state
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState<boolean>(false);
  const [dataLoading, setDataLoading] = useState<boolean>(false);
  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  // Load from local storage, or a brand-new/empty state for a first-time guest
  // (no sample habits/streaks/milestones -- see loadDemoData for the opt-in demo fill).
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('momentum_habits');
    return saved ? JSON.parse(saved) : [];
  });

  const [logs, setLogs] = useState<HabitCompletionLog[]>(() => {
    const saved = localStorage.getItem('momentum_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('momentum_profile');
    return saved ? JSON.parse(saved) : GUEST_DEFAULT_PROFILE;
  });

  const [milestones, setMilestones] = useState<StreakMilestone[]>(() => {
    const saved = localStorage.getItem('momentum_milestones');
    return saved ? JSON.parse(saved) : EMPTY_MILESTONES;
  });

  const [todayChallenge, setTodayChallenge] = useState<DailyChallenge>(() => {
    const today = getTodayKey();
    const saved = localStorage.getItem('momentum_today_challenge');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === today) return parsed;
    }
    // Pick deterministic challenge based on date
    const dayIndex = new Date().getDate() % DAILY_CHALLENGES_POOL.length;
    const poolItem = DAILY_CHALLENGES_POOL[dayIndex];
    return {
      id: `challenge-${today}`,
      date: today,
      title: poolItem.title,
      description: poolItem.description,
      category: poolItem.category,
      xpReward: poolItem.xpReward,
      completed: false
    };
  });

  const [dailyQuote, setDailyQuote] = useState<MotivationalQuote>(() => {
    const dayIndex = new Date().getDate() % MOTIVATIONAL_QUOTES.length;
    return MOTIVATIONAL_QUOTES[dayIndex];
  });

  const [aiInsight, setAiInsight] = useState<AICoachInsight | null>(() => {
    const saved = localStorage.getItem('momentum_ai_insight');
    return saved ? JSON.parse(saved) : null;
  });

  const [aiWeeklyReview, setAiWeeklyReview] = useState<AIWeeklyReview | null>(() => {
    const saved = localStorage.getItem('momentum_ai_weekly_review');
    return saved ? JSON.parse(saved) : null;
  });

  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>(() => {
    const saved = localStorage.getItem('momentum_chat_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Save changes to LocalStorage (acts as the guest-mode store and an instant-boot cache)
  useEffect(() => {
    localStorage.setItem('momentum_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('momentum_chat_history', JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    localStorage.setItem('momentum_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('momentum_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('momentum_milestones', JSON.stringify(milestones));
  }, [milestones]);

  useEffect(() => {
    localStorage.setItem('momentum_today_challenge', JSON.stringify(todayChallenge));
  }, [todayChallenge]);

  useEffect(() => {
    if (aiInsight) {
      localStorage.setItem('momentum_ai_insight', JSON.stringify(aiInsight));
    }
  }, [aiInsight]);

  useEffect(() => {
    if (aiWeeklyReview) {
      localStorage.setItem('momentum_ai_weekly_review', JSON.stringify(aiWeeklyReview));
    }
  }, [aiWeeklyReview]);

  useEffect(() => {
    localStorage.setItem('momentum_is_landing_page', String(isLandingPage));
  }, [isLandingPage]);

  useEffect(() => {
    localStorage.setItem('momentum_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Pull a signed-in user's real data down from Supabase, seeding a profile/milestones
  // row on their very first login. Habits/logs are left empty for brand-new accounts
  // (the Habit Stack view already has a friendly empty state + presets for that).
  const loadRemoteData = async (userId: string, authUser: Session['user']) => {
    setDataLoading(true);
    try {
      const challengeDateKey = getTodayKey();
      const [profileRes, habitsRes, logsRes, milestonesRes, challengeRes, chatRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase.from('habits').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('habit_logs').select('*').eq('user_id', userId),
        supabase.from('milestones').select('*').eq('user_id', userId).order('days', { ascending: true }),
        supabase.from('daily_challenges').select('*').eq('user_id', userId).eq('date', challengeDateKey).maybeSingle(),
        supabase.from('ai_coach_messages').select('role, content').eq('user_id', userId).order('created_at', { ascending: true })
      ]);

      if (profileRes.data) {
        setUserProfile(fromRow<UserProfile>(profileRes.data, PROFILE_FIELDS));
        if (profileRes.data.theme === 'light' || profileRes.data.theme === 'dark') {
          setTheme(profileRes.data.theme);
        }
      } else {
        const seededProfile: UserProfile = {
          ...INITIAL_PROFILE,
          name: (authUser.user_metadata?.full_name as string) || (authUser.user_metadata?.name as string) || INITIAL_PROFILE.name,
          email: authUser.email || INITIAL_PROFILE.email,
          avatarUrl: (authUser.user_metadata?.avatar_url as string) || (authUser.user_metadata?.picture as string) || INITIAL_PROFILE.avatarUrl,
          joinedDate: getTodayKey()
        };
        const { error } = await supabase.from('profiles').upsert({ id: userId, ...toRow(seededProfile, PROFILE_FIELDS) });
        if (error) console.error('Failed to seed profile:', error);
        setUserProfile(seededProfile);
      }

      if (habitsRes.data) {
        setHabits(habitsRes.data.map(row => fromRow<Habit>(row, HABIT_FIELDS)));
      }
      if (logsRes.data) {
        setLogs(logsRes.data.map(row => fromRow<HabitCompletionLog>(row, LOG_FIELDS)));
      }

      if (milestonesRes.data && milestonesRes.data.length > 0) {
        setMilestones(milestonesRes.data.map(row => fromRow<StreakMilestone>(row, MILESTONE_FIELDS)));
      } else {
        const seededMilestones = INITIAL_MILESTONES.map(m => ({ ...m, unlocked: false, unlockedAt: undefined }));
        const rows = seededMilestones.map(m => ({ user_id: userId, ...toRow(m, MILESTONE_FIELDS) }));
        const { error } = await supabase.from('milestones').upsert(rows, { onConflict: 'user_id,days' });
        if (error) console.error('Failed to seed milestones:', error);
        setMilestones(seededMilestones);
      }

      if (challengeRes.data) {
        const row = challengeRes.data;
        setTodayChallenge({
          id: `challenge-${row.date}`,
          ...fromRow<Omit<DailyChallenge, 'id'>>(row, DAILY_CHALLENGE_FIELDS)
        });
      } else {
        const { error } = await supabase
          .from('daily_challenges')
          .upsert({ user_id: userId, ...toRow(todayChallenge, DAILY_CHALLENGE_FIELDS) }, { onConflict: 'user_id,date' });
        if (error) console.error('Failed to seed daily challenge:', error);
      }

      if (chatRes.data) {
        setChatHistory(chatRes.data.map(row => ({ role: row.role as 'user' | 'assistant', text: row.content })));
      }
    } catch (err) {
      console.error('Failed to load account data from Supabase:', err);
    }
    setDataLoading(false);
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      // A logged-in user reloading the page should land back in their dashboard,
      // not the marketing page -- the Supabase session persists on its own, but
      // our own isLandingPage nav flag needs to be told about it explicitly. Setting
      // dataLoading here too (rather than waiting for the loadRemoteData effect below)
      // closes the gap where the very first paint could otherwise flash stale/guest
      // data before the real Supabase data has loaded.
      if (data.session) {
        setIsLandingPage(false);
        setDataLoading(true);
      }
      setSession(data.session);
      setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      // Clicking a "reset password" email link lands back here with a recovery
      // session already established; surface the auth modal in a mode that lets
      // the user actually set a new password instead of silently signing them in.
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
        setIsAuthModalOpen(true);
      } else if (event === 'SIGNED_IN') {
        // Email/password sign-in already gets a redirect from AuthModal's own
        // success handler, but an OAuth provider (Google, etc.) does a full-page
        // redirect away and back -- there's no in-page success handler for that,
        // so this listener is what actually lands the user in the dashboard
        // instead of leaving them stranded on the marketing page post-redirect.
        setIsLandingPage(false);
        setActiveTab('dashboard');
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Guards against React StrictMode's deliberate double-invocation of effects in
  // development (and any other cause of duplicate calls) firing loadRemoteData
  // twice concurrently for the same user, which could otherwise race two profile
  // "first login" seed inserts against each other.
  const loadingUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const userId = session?.user?.id;
    if (userId && loadingUserIdRef.current !== userId) {
      loadingUserIdRef.current = userId;
      loadRemoteData(userId, session!.user);
    } else if (!userId) {
      loadingUserIdRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  // Live multi-device/multi-tab sync: push habit/log/milestone changes made
  // elsewhere (another browser tab, another device) into this session without
  // needing a manual reload.
  useEffect(() => {
    if (!isSupabaseConfigured || !session?.user) return;
    const uid = session.user.id;

    const channel = supabase
      .channel(`momentum-sync-${uid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'habits', filter: `user_id=eq.${uid}` }, (payload) => {
        if (payload.eventType === 'DELETE') {
          const deletedId = (payload.old as any).id;
          setHabits(prev => prev.filter(h => h.id !== deletedId));
          return;
        }
        const updated = fromRow<Habit>(payload.new as any, HABIT_FIELDS);
        setHabits(prev => {
          const idx = prev.findIndex(h => h.id === updated.id);
          if (idx === -1) return [updated, ...prev];
          const next = [...prev];
          next[idx] = updated;
          return next;
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'habit_logs', filter: `user_id=eq.${uid}` }, (payload) => {
        if (payload.eventType === 'DELETE') {
          const old = payload.old as any;
          setLogs(prev => prev.filter(l => !(l.habitId === old.habit_id && l.date === old.date)));
          return;
        }
        const updated = fromRow<HabitCompletionLog>(payload.new as any, LOG_FIELDS);
        setLogs(prev => {
          const idx = prev.findIndex(l => l.habitId === updated.habitId && l.date === updated.date);
          if (idx === -1) return [...prev, updated];
          const next = [...prev];
          next[idx] = updated;
          return next;
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'milestones', filter: `user_id=eq.${uid}` }, (payload) => {
        if (payload.eventType === 'DELETE') return;
        const updated = fromRow<StreakMilestone>(payload.new as any, MILESTONE_FIELDS);
        setMilestones(prev => {
          const idx = prev.findIndex(m => m.days === updated.days);
          if (idx === -1) return [...prev, updated].sort((a, b) => a.days - b.days);
          const next = [...prev];
          next[idx] = updated;
          return next;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  // Auth actions
  const signInWithPassword = async (email: string, password: string) => {
    ensureSupabaseConfigured();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  // Returns true if the new account was signed in immediately (email confirmation
  // disabled on the project), or false if a confirmation email must be clicked first
  // (Supabase issues no session in that case) -- callers must branch on this rather
  // than assuming signup success implies an authenticated session.
  const signUpWithPassword = async (email: string, password: string, name: string): Promise<boolean> => {
    ensureSupabaseConfigured();
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
    if (error) throw error;
    return Boolean(data.session);
  };

  const signInWithGoogle = async () => {
    ensureSupabaseConfigured();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) throw error;
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
  };

  const resetPasswordForEmail = async (email: string) => {
    ensureSupabaseConfigured();
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    if (error) throw error;
  };

  const updatePassword = async (newPassword: string) => {
    ensureSupabaseConfigured();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    setIsPasswordRecovery(false);
  };

  // Compute stats
  const streakStats = calculateStreakStats(habits, logs);

  const todayKey = getTodayKey();
  const activeHabits = habits.filter(h => !h.isArchived && !h.isPaused);
  const todayCompletedCount = activeHabits.filter(h => {
    const log = logs.find(l => l.habitId === h.id && l.date === todayKey);
    return log?.completed;
  }).length;

  const todayCompletionPercent = activeHabits.length > 0
    ? Math.round((todayCompletedCount / activeHabits.length) * 100)
    : 0;

  // Automatically unlock any milestone whose day threshold the current streak has
  // reached. Runs for guests (local-only) and authenticated users (synced) alike --
  // self-terminating: once a milestone flips to unlocked, the next pass finds no
  // more newly-eligible milestones and no-ops.
  //
  // The very first pass after mount/data-load only syncs the `unlocked` flag
  // silently (no confetti/sound) -- otherwise a fresh guest session (seeded with
  // a long synthetic demo streak) or a returning user whose streak already
  // cleared several thresholds would blast confetti for milestones they didn't
  // just cross, the instant the page loads.
  const hasDoneInitialMilestoneSyncRef = useRef(false);

  useEffect(() => {
    const newlyUnlocked = milestones.filter(m => !m.unlocked && streakStats.currentStreak >= m.days);
    if (newlyUnlocked.length === 0) {
      hasDoneInitialMilestoneSyncRef.current = true;
      return;
    }

    const isInitialSync = !hasDoneInitialMilestoneSyncRef.current;
    hasDoneInitialMilestoneSyncRef.current = true;

    const unlockedToday = getTodayKey();
    setMilestones(prev => prev.map(m =>
      (!m.unlocked && streakStats.currentStreak >= m.days)
        ? { ...m, unlocked: true, unlockedAt: unlockedToday }
        : m
    ));

    if (!isInitialSync) {
      triggerCelebrationConfetti();
      playCompletionSound();
    }

    if (session?.user) {
      const uid = session.user.id;
      newlyUnlocked.forEach(m => {
        supabase.from('milestones')
          .update({ unlocked: true, unlocked_at: unlockedToday })
          .eq('user_id', uid)
          .eq('days', m.days)
          .then(({ error }) => { if (error) console.error('Failed to sync milestone unlock:', error); });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streakStats.currentStreak, milestones]);

  // Actions
  const addHabit = (newHabitData: Omit<Habit, 'id' | 'createdAt'>): Habit => {
    const id = crypto.randomUUID();
    const createdAt = getTodayKey();
    const newHabit: Habit = {
      ...newHabitData,
      id,
      createdAt
    };
    setHabits(prev => [newHabit, ...prev]);

    if (session?.user) {
      supabase
        .from('habits')
        .insert({ user_id: session.user.id, ...toRow(newHabit, HABIT_FIELDS) })
        .then(({ error }) => { if (error) console.error('Failed to sync new habit:', error); });
    }

    return newHabit;
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));

    if (session?.user) {
      const row = toRow(updates, HABIT_FIELDS);
      if (Object.keys(row).length > 0) {
        supabase.from('habits').update(row).eq('id', id)
          .then(({ error }) => { if (error) console.error('Failed to sync habit update:', error); });
      }
    }
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    setLogs(prev => prev.filter(l => l.habitId !== id));

    if (session?.user) {
      // habit_logs rows cascade-delete in Postgres via the habit_id foreign key
      supabase.from('habits').delete().eq('id', id)
        .then(({ error }) => { if (error) console.error('Failed to sync habit deletion:', error); });
    }
  };

  const togglePauseHabit = (id: string) => {
    const target = habits.find(h => h.id === id);
    if (!target) return;
    const nextPaused = !target.isPaused;
    setHabits(prev => prev.map(h => h.id === id ? { ...h, isPaused: nextPaused } : h));

    if (session?.user) {
      supabase.from('habits').update({ is_paused: nextPaused }).eq('id', id)
        .then(({ error }) => { if (error) console.error('Failed to sync habit pause state:', error); });
    }
  };

  const toggleArchiveHabit = (id: string) => {
    const target = habits.find(h => h.id === id);
    if (!target) return;
    const nextArchived = !target.isArchived;
    setHabits(prev => prev.map(h => h.id === id ? { ...h, isArchived: nextArchived } : h));

    if (session?.user) {
      supabase.from('habits').update({ is_archived: nextArchived }).eq('id', id)
        .then(({ error }) => { if (error) console.error('Failed to sync habit archive state:', error); });
    }
  };

  const syncLogToSupabase = (log: HabitCompletionLog) => {
    if (!session?.user) return;
    supabase
      .from('habit_logs')
      .upsert({ user_id: session.user.id, ...toRow(log, LOG_FIELDS) }, { onConflict: 'habit_id,date' })
      .then(({ error }) => { if (error) console.error('Failed to sync habit log:', error); });
  };

  const toggleHabitCompletion = (habitId: string, dateStr = getTodayKey()) => {
    const targetHabit = habits.find(h => h.id === habitId);
    if (!targetHabit) return;

    setLogs(prev => {
      const existingIndex = prev.findIndex(l => l.habitId === habitId && l.date === dateStr);
      let isNewlyCompleted = false;
      let updatedLog: HabitCompletionLog;

      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        updatedLog = {
          ...existing,
          completed: !existing.completed,
          currentValue: !existing.completed ? targetHabit.targetValue : 0
        };
        isNewlyCompleted = updatedLog.completed;
        const newArr = [...prev];
        newArr[existingIndex] = updatedLog;
        if (isNewlyCompleted) {
          triggerCelebrationConfetti();
          playCompletionSound();
        }
        syncLogToSupabase(updatedLog);
        return newArr;
      } else {
        updatedLog = {
          habitId,
          date: dateStr,
          currentValue: targetHabit.targetValue,
          completed: true
        };
        isNewlyCompleted = true;
        triggerCelebrationConfetti();
        playCompletionSound();
        syncLogToSupabase(updatedLog);
        return [...prev, updatedLog];
      }
    });
  };

  const updateHabitProgress = (habitId: string, value: number, dateStr = getTodayKey()) => {
    const targetHabit = habits.find(h => h.id === habitId);
    if (!targetHabit) return;

    setLogs(prev => {
      const existingIndex = prev.findIndex(l => l.habitId === habitId && l.date === dateStr);
      const isCompleted = value >= targetHabit.targetValue;

      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        const wasCompleted = existing.completed;
        const updatedLog: HabitCompletionLog = {
          ...existing,
          currentValue: value,
          completed: isCompleted
        };
        const newArr = [...prev];
        newArr[existingIndex] = updatedLog;
        if (!wasCompleted && isCompleted) {
          triggerCelebrationConfetti();
          playCompletionSound();
        }
        syncLogToSupabase(updatedLog);
        return newArr;
      } else {
        if (isCompleted) {
          triggerCelebrationConfetti();
          playCompletionSound();
        }
        const newLog: HabitCompletionLog = {
          habitId,
          date: dateStr,
          currentValue: value,
          completed: isCompleted
        };
        syncLogToSupabase(newLog);
        return [...prev, newLog];
      }
    });
  };

  const completeChallenge = () => {
    if (todayChallenge.completed) return;
    setTodayChallenge(prev => ({ ...prev, completed: true }));
    triggerCelebrationConfetti();
    playCompletionSound();

    if (session?.user) {
      supabase
        .from('daily_challenges')
        .upsert(
          { user_id: session.user.id, ...toRow({ ...todayChallenge, completed: true }, DAILY_CHALLENGE_FIELDS) },
          { onConflict: 'user_id,date' }
        )
        .then(({ error }) => { if (error) console.error('Failed to sync daily challenge completion:', error); });
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }));

    if (session?.user) {
      const row = toRow(updates, PROFILE_FIELDS);
      if (Object.keys(row).length > 0) {
        supabase.from('profiles').upsert({ id: session.user.id, ...row })
          .then(({ error }) => { if (error) console.error('Failed to sync profile:', error); });
      }
    }
  };

  const fetchAICoachInsight = async () => {
    try {
      const missed = activeHabits
        .filter(h => {
          const log = logs.find(l => l.habitId === h.id && l.date === todayKey);
          return !log?.completed;
        })
        .map(h => h.title);

      const res = await fetch('/api/gemini/coach-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          habits: activeHabits.map(h => ({ title: h.title, category: h.category })),
          currentStreak: streakStats.currentStreak,
          completionRate: todayCompletionPercent,
          missedHabits: missed,
          userGoal: userProfile.primaryGoal
        })
      });

      if (!res.ok) throw new Error('Failed to reach AI Coach API');
      const data = await res.json();
      if (data.success && data.coach) {
        setAiInsight({ ...data.coach, lastUpdated: new Date().toLocaleTimeString() });
      }
    } catch (err) {
      console.error('Error fetching AI Coach Insight:', err);
    }
  };

  const fetchAIWeeklyReview = async () => {
    try {
      const res = await fetch('/api/gemini/weekly-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          historyData: logs.slice(-30),
          activeHabitsCount: activeHabits.length
        })
      });

      if (!res.ok) throw new Error('Failed to reach AI Weekly Review API');
      const data = await res.json();
      if (data.success && data.review) {
        setAiWeeklyReview({ ...data.review, generatedAt: new Date().toLocaleDateString() });
      }
    } catch (err) {
      console.error('Error fetching AI Weekly Review:', err);
    }
  };

  const parseHabitWithAI = async (prompt: string): Promise<Habit | null> => {
    try {
      const res = await fetch('/api/gemini/parse-habit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      if (!res.ok) throw new Error('Server error');
      const data = await res.json();
      if (data.success && data.habit) {
        const parsed = data.habit;
        const newHabit: Omit<Habit, 'id' | 'createdAt'> = {
          title: parsed.title || prompt,
          category: (parsed.category as HabitCategory) || 'Growth',
          iconName: parsed.iconName || 'Zap',
          color: parsed.color || '#63C7D8',
          frequency: (parsed.frequency as any) || 'Daily',
          targetValue: parsed.targetValue || 1,
          targetUnit: parsed.targetUnit || 'times',
          reminderTime: parsed.reminderTime || '08:00',
          notes: parsed.notes || 'Created via Momentum AI'
        };
        const added = addHabit(newHabit);
        triggerCelebrationConfetti();
        return added;
      }
    } catch (err) {
      console.error('Parse habit error:', err);
    }
    return null;
  };

  const askCoach = async (question: string): Promise<string> => {
    try {
      const res = await fetch('/api/gemini/ask-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          currentStreak: streakStats.currentStreak,
          completionRate: todayCompletionPercent,
          activeHabitsCount: activeHabits.length
        })
      });
      if (!res.ok) throw new Error('Failed to reach AI Coach');
      const data = await res.json();
      if (data.success && data.reply) return data.reply;
      throw new Error('Invalid AI Coach response');
    } catch (err) {
      console.error('Ask coach error:', err);
      return 'Focus on completing 1 small routine right now to restart your momentum.';
    }
  };

  const persistCoachMessage = (role: 'user' | 'assistant', content: string) => {
    if (!session?.user) return;
    supabase.from('ai_coach_messages').insert({ user_id: session.user.id, role, content })
      .then(({ error }) => { if (error) console.error('Failed to persist chat message:', error); });
  };

  const sendCoachMessage = async (question: string): Promise<void> => {
    setChatHistory(prev => [...prev, { role: 'user', text: question }]);
    persistCoachMessage('user', question);

    const reply = await askCoach(question);

    setChatHistory(prev => [...prev, { role: 'assistant', text: reply }]);
    persistCoachMessage('assistant', reply);
  };

  const resetAllData = async () => {
    if (session?.user) {
      // habit_logs cascade-deletes with habits via the FK constraint
      await supabase.from('habits').delete().eq('user_id', session.user.id);
      await supabase.from('milestones').delete().eq('user_id', session.user.id);
    }
    localStorage.clear();
    setHabits([]);
    setLogs([]);
    setUserProfile(GUEST_DEFAULT_PROFILE);
    setMilestones(EMPTY_MILESTONES);
    setAiInsight(null);
    setAiWeeklyReview(null);
    window.location.reload();
  };

  // Explicit, opt-in sample data fill for exploring the app -- a first-time guest
  // otherwise starts completely empty (see the useState initializers above).
  const loadDemoData = () => {
    setHabits(INITIAL_HABITS);
    setLogs(generateInitialHeatmapLogs(INITIAL_HABITS));
    setMilestones(INITIAL_MILESTONES);
    setAiInsight(DEMO_AI_INSIGHT);
    setAiWeeklyReview(DEMO_AI_WEEKLY_REVIEW);
  };

  return (
    <HabitContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isLandingPage,
        setIsLandingPage,
        habits,
        logs,
        userProfile,
        todayChallenge,
        milestones,
        aiInsight,
        aiWeeklyReview,
        dailyQuote,
        selectedCategory,
        setSelectedCategory,
        theme,
        toggleTheme,
        session,
        authLoading,
        dataLoading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        isPasswordRecovery,
        signInWithPassword,
        signUpWithPassword,
        signInWithGoogle,
        signOut,
        resetPasswordForEmail,
        updatePassword,
        addHabit,
        updateHabit,
        deleteHabit,
        togglePauseHabit,
        toggleArchiveHabit,
        toggleHabitCompletion,
        updateHabitProgress,
        completeChallenge,
        updateProfile,
        fetchAICoachInsight,
        fetchAIWeeklyReview,
        parseHabitWithAI,
        askCoach,
        chatHistory,
        sendCoachMessage,
        resetAllData,
        loadDemoData,
        streakStats,
        todayCompletionPercent
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};

export const useHabitContext = () => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabitContext must be used within a HabitProvider');
  }
  return context;
};
