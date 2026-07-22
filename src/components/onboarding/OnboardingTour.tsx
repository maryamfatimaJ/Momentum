import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import { useHabitContext } from '../../context/HabitContext';
import { supabase } from '../../lib/supabaseClient';
import { TOUR_STEPS } from './tourSteps';

const ONBOARDING_STORAGE_KEY = 'momentum_onboarding_completed';
const SPOTLIGHT_PADDING = 10;
const CARD_MARGIN = 16;

interface Rect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

function readRect(el: Element): Rect {
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
}

function hasCompletedOnboarding(userMetadataFlag: boolean | undefined): boolean {
  try {
    if (localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true') return true;
  } catch {
    // localStorage unavailable (e.g. private browsing edge cases) -- fall through
  }
  return userMetadataFlag === true;
}

function markOnboardingComplete(session: ReturnType<typeof useHabitContext>['session']) {
  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
  } catch {
    // best-effort only
  }
  // Optional cross-device sync for authenticated users -- uses Supabase Auth's
  // built-in user_metadata blob so no schema migration is required.
  if (session?.user) {
    supabase.auth
      .updateUser({ data: { onboarding_completed: true } })
      .then(({ error }) => {
        if (error) console.error('Failed to sync onboarding completion:', error);
      });
  }
}

export const OnboardingTour: React.FC = () => {
  const { session, activeTab } = useHabitContext();
  const [isActive, setIsActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [anchorRect, setAnchorRect] = useState<Rect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardSize, setCardSize] = useState<{ width: number; height: number } | null>(null);

  const step = TOUR_STEPS[stepIndex];

  // Decide once, on mount, whether a brand-new user should see the tour.
  useEffect(() => {
    if (activeTab !== 'dashboard') return;
    const alreadyDone = hasCompletedOnboarding(session?.user?.user_metadata?.onboarding_completed as boolean | undefined);
    if (!alreadyDone) setIsActive(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Measure (and re-measure) the spotlighted element for the current step.
  useEffect(() => {
    if (!isActive) return;

    const measure = () => {
      if (!step.targetSelector) {
        setAnchorRect(null);
        return;
      }
      const el = document.querySelector(step.targetSelector);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setAnchorRect(readRect(el));
      } else {
        setAnchorRect(null);
      }
    };

    measure();
    const raf = requestAnimationFrame(measure);
    const timeout = setTimeout(measure, 350); // after smooth-scroll settles

    const onViewportChange = () => measure();
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('scroll', onViewportChange, true);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
      window.removeEventListener('resize', onViewportChange);
      window.removeEventListener('scroll', onViewportChange, true);
    };
  }, [isActive, stepIndex, step.targetSelector]);

  // Measure the tooltip card itself so we can clamp its position within the viewport.
  useLayoutEffect(() => {
    if (!isActive || !cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    setCardSize({ width: r.width, height: r.height });
  }, [isActive, stepIndex, anchorRect]);

  useEffect(() => {
    if (!isActive) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  if (!isActive) return null;

  const finish = () => {
    markOnboardingComplete(session);
    setIsActive(false);
  };

  const goNext = () => {
    if (stepIndex === TOUR_STEPS.length - 1) {
      finish();
    } else {
      setStepIndex(i => i + 1);
    }
  };

  const goBack = () => setStepIndex(i => Math.max(0, i - 1));

  const isFirst = stepIndex === 0;
  const isLast = stepIndex === TOUR_STEPS.length - 1;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

  const cardWidth = cardSize?.width ?? Math.min(360, vw - CARD_MARGIN * 2);
  const cardHeight = cardSize?.height ?? 220;

  let cardTop: number;
  let cardLeft: number;

  if (!anchorRect || step.placement === 'center') {
    cardTop = vh / 2 - cardHeight / 2;
    cardLeft = vw / 2 - cardWidth / 2;
  } else {
    const r = anchorRect;
    switch (step.placement) {
      case 'top':
        cardTop = r.top - cardHeight - CARD_MARGIN - SPOTLIGHT_PADDING;
        cardLeft = r.left + r.width / 2 - cardWidth / 2;
        break;
      case 'left':
        cardTop = r.top + r.height / 2 - cardHeight / 2;
        cardLeft = r.left - cardWidth - CARD_MARGIN - SPOTLIGHT_PADDING;
        break;
      case 'right':
        cardTop = r.top + r.height / 2 - cardHeight / 2;
        cardLeft = r.right + CARD_MARGIN + SPOTLIGHT_PADDING;
        break;
      case 'bottom':
      default:
        cardTop = r.bottom + CARD_MARGIN + SPOTLIGHT_PADDING;
        cardLeft = r.left + r.width / 2 - cardWidth / 2;
        break;
    }
    // Flip vertically if it would overflow off the top/bottom of the viewport.
    if (cardTop < CARD_MARGIN) cardTop = r.bottom + CARD_MARGIN + SPOTLIGHT_PADDING;
    if (cardTop + cardHeight > vh - CARD_MARGIN) cardTop = Math.max(CARD_MARGIN, r.top - cardHeight - CARD_MARGIN - SPOTLIGHT_PADDING);
  }

  // Clamp within viewport bounds on all sides (critical for mobile).
  cardLeft = Math.min(Math.max(CARD_MARGIN, cardLeft), Math.max(CARD_MARGIN, vw - cardWidth - CARD_MARGIN));
  cardTop = Math.min(Math.max(CARD_MARGIN, cardTop), Math.max(CARD_MARGIN, vh - cardHeight - CARD_MARGIN));

  const spot = anchorRect
    ? {
        top: Math.max(0, anchorRect.top - SPOTLIGHT_PADDING),
        left: Math.max(0, anchorRect.left - SPOTLIGHT_PADDING),
        width: anchorRect.width + SPOTLIGHT_PADDING * 2,
        height: anchorRect.height + SPOTLIGHT_PADDING * 2
      }
    : null;

  const dimClass = 'fixed bg-slate-900/45 dark:bg-slate-950/60 backdrop-blur-[2px] pointer-events-auto';

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Onboarding tour">
      {/* Backdrop: either 4 bands around the spotlighted rect, or one full-screen dim layer */}
      {spot ? (
        <>
          <div className={dimClass} style={{ top: 0, left: 0, right: 0, height: Math.max(0, spot.top) }} />
          <div className={dimClass} style={{ top: spot.top + spot.height, left: 0, right: 0, bottom: 0 }} />
          <div className={dimClass} style={{ top: spot.top, left: 0, width: Math.max(0, spot.left), height: spot.height }} />
          <div className={dimClass} style={{ top: spot.top, left: spot.left + spot.width, right: 0, height: spot.height }} />

          {/* Spotlight ring */}
          <motion.div
            key={`ring-${step.id}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="fixed rounded-2xl pointer-events-none"
            style={{
              top: spot.top,
              left: spot.left,
              width: spot.width,
              height: spot.height,
              boxShadow: '0 0 0 2px #00A8B5, 0 0 0 6px rgba(0,168,181,0.18), 0 0 32px 6px rgba(0,168,181,0.28)'
            }}
          />
        </>
      ) : (
        <div className={`${dimClass} inset-0`} />
      )}

      {/* Tooltip Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          ref={cardRef}
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed z-[101] w-[min(360px,calc(100vw-2rem))] bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl border border-[#E5EEF2] dark:border-slate-700 shadow-2xl p-6"
          style={{ top: cardTop, left: cardLeft }}
        >
          <button
            onClick={finish}
            aria-label="Close tour"
            className="absolute top-4 right-4 p-1.5 rounded-full text-[#94A3B8] dark:text-slate-500 hover:text-[#1E293B] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Step Dots */}
          <div className="flex items-center gap-1.5 mb-4">
            {TOUR_STEPS.map((s, i) => (
              <span
                key={s.id}
                className={`h-1.5 rounded-full transition-all ${
                  i === stepIndex ? 'w-5 bg-[#00A8B5]' : 'w-1.5 bg-slate-200 dark:bg-slate-600'
                }`}
              />
            ))}
          </div>

          <h3 className="text-base font-bold text-[#0F172A] dark:text-slate-100 pr-6">{step.title}</h3>
          <p className="text-sm text-[#64748B] dark:text-slate-400 leading-relaxed mt-2">{step.description}</p>

          <div className="flex items-center justify-between mt-6">
            {!isLast ? (
              <button
                onClick={finish}
                className="text-xs font-semibold text-[#94A3B8] dark:text-slate-500 hover:text-[#1E293B] dark:hover:text-white transition-colors cursor-pointer"
              >
                Skip Tour
              </button>
            ) : (
              <button
                onClick={finish}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#1E293B] dark:text-slate-100 border border-[#E5EEF2] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                Get Started
              </button>
            )}

            <div className="flex items-center gap-2">
              {!isFirst && (
                <button
                  onClick={goBack}
                  className="p-2 rounded-xl text-[#64748B] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={goNext}
                className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-bold hover:bg-[#1E293B] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>{isLast ? 'Finish' : 'Next'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#00A8B5]" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
