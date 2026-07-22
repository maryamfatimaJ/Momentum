import React, { useRef, useEffect, useState } from 'react';
import { useHabitContext } from '../../context/HabitContext';

interface SpotlightHeroProps {
  onWatchDemo?: () => void;
  onGetStarted?: () => void;
}

// Canvas drawing is imperative JS, not Tailwind classes, so it can't pick up
// `dark:` variants -- these are the light/dark equivalents of every hardcoded
// color used in the render loop below.
const HERO_PALETTE = {
  light: {
    topBg: '#FFFFFF',
    topText: '#EEF2F5',
    subtitle: '#94A3B8',
    bottomBase: '#EEF7FA',
    gradientStops: ['#DCEFF5', '#BFDDE8', 'rgba(232, 229, 244, 0.45)', '#EEF7FA', '#FFFFFF'],
    bottomText: '#3A4657',
    finalBase: '#FFFFFF'
  },
  dark: {
    topBg: '#0F172A',
    topText: '#1E293B',
    subtitle: '#94A3B8',
    bottomBase: '#0F2A33',
    gradientStops: ['#123642', '#0D2B36', 'rgba(88, 66, 128, 0.35)', '#0F2A33', '#0F172A'],
    bottomText: '#E2E8F0',
    finalBase: '#0F172A'
  }
} as const;

export const SpotlightHero: React.FC<SpotlightHeroProps> = () => {
  const { theme } = useHabitContext();
  const [isFrozen, setIsFrozen] = useState<boolean>(false);

  // Read via a ref inside the animation loop so toggling theme doesn't have to
  // tear down and rebuild the whole effect (cursor trail, frozen state, etc.)
  const themeRef = useRef(theme);
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  const heroRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Offscreen canvases for multi-layer composition
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const topLayerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const bottomLayerCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Smooth silk motion / cursor inertia refs
  const mousePosRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const smoothPosRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const visitedPointsRef = useRef<{ x: number; y: number }[]>([]);
  const isFrozenRef = useRef<boolean>(false);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const canvas = canvasRef.current;
    if (!hero || !canvas) return;

    // Create offscreen canvases
    if (!maskCanvasRef.current) maskCanvasRef.current = document.createElement('canvas');
    if (!topLayerCanvasRef.current) topLayerCanvasRef.current = document.createElement('canvas');
    if (!bottomLayerCanvasRef.current) bottomLayerCanvasRef.current = document.createElement('canvas');

    const maskCanvas = maskCanvasRef.current;
    const topCanvas = topLayerCanvasRef.current;
    const bottomCanvas = bottomLayerCanvasRef.current;

    const handleResize = () => {
      const rect = hero.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const w = Math.floor(rect.width * dpr);
      const h = Math.floor(rect.height * dpr);

      if (w === 0 || h === 0) return;

      canvas.width = w;
      canvas.height = h;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      maskCanvas.width = w;
      maskCanvas.height = h;

      topCanvas.width = w;
      topCanvas.height = h;

      bottomCanvas.width = w;
      bottomCanvas.height = h;
    };

    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(hero);

    // Multi-layered atmospheric feathered radial gradient brush (~480-500px radius)
    const drawMultiLayerBrush = (x: number, y: number) => {
      if (isFrozenRef.current) return;

      const rect = hero.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const mCtx = maskCanvas.getContext('2d');
      if (!mCtx) return;

      const canvasX = x * dpr;
      const canvasY = y * dpr;
      const radius = Math.min(rect.width * 0.38, 500) * dpr;

      mCtx.save();

      // Multi-layered blended gradient (inner glow, middle diffusion, outer soft blur)
      const grad = mCtx.createRadialGradient(canvasX, canvasY, 0, canvasX, canvasY, radius);
      grad.addColorStop(0, 'rgba(0, 0, 0, 1.0)');      // Subtle inner core
      grad.addColorStop(0.22, 'rgba(0, 0, 0, 0.92)');  // Soft inner glow
      grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.55)');  // Middle diffusion
      grad.addColorStop(0.82, 'rgba(0, 0, 0, 0.20)');  // Large outer blur
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');      // Feathered boundary

      mCtx.fillStyle = grad;
      mCtx.beginPath();
      mCtx.arc(canvasX, canvasY, radius, 0, Math.PI * 2);
      mCtx.fill();
      mCtx.restore();

      // Track visited points for automatic completion freeze
      const minSpacing = 120;
      const isNewArea = !visitedPointsRef.current.some(
        pt => Math.hypot(pt.x - x, pt.y - y) < minSpacing
      );

      if (isNewArea) {
        visitedPointsRef.current.push({ x, y });

        // Once ~24 distinct spatial points have been explored across the screen, freeze the final state
        if (visitedPointsRef.current.length >= 24 && !isFrozenRef.current) {
          triggerFreezeCompletion();
        }
      }
    };

    // Freeze final revealed state & disable cursor effect
    const triggerFreezeCompletion = () => {
      if (isFrozenRef.current) return;
      isFrozenRef.current = true;
      setIsFrozen(true);

      const mCtx = maskCanvas.getContext('2d');
      if (!mCtx) return;

      const rect = hero.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = maskCanvas.width;
      const h = maskCanvas.height;

      // Smoothly fill center region of mask canvas to permanently lock final state
      let step = 0;
      const totalSteps = 30;

      const fillMask = () => {
        step++;
        const progress = step / totalSteps;

        mCtx.save();
        const centerGrad = mCtx.createRadialGradient(
          w / 2, h / 2, 0,
          w / 2, h / 2, Math.max(w, h) * 0.7
        );
        centerGrad.addColorStop(0, `rgba(0, 0, 0, ${0.95 * progress})`);
        centerGrad.addColorStop(0.6, `rgba(0, 0, 0, ${0.80 * progress})`);
        centerGrad.addColorStop(1, `rgba(0, 0, 0, ${0.30 * progress})`);

        mCtx.fillStyle = centerGrad;
        mCtx.fillRect(0, 0, w, h);
        mCtx.restore();

        if (step < totalSteps) {
          requestAnimationFrame(fillMask);
        }
      };

      requestAnimationFrame(fillMask);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isFrozenRef.current) return;

      const rect = hero.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      mousePosRef.current = { x, y };

      if (smoothPosRef.current.x < -500) {
        smoothPosRef.current = { x, y };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isFrozenRef.current) return;

      if (e.touches.length > 0) {
        const rect = hero.getBoundingClientRect();
        const x = e.touches[0].clientX - rect.left;
        const y = e.touches[0].clientY - rect.top;

        mousePosRef.current = { x, y };

        if (smoothPosRef.current.x < -500) {
          smoothPosRef.current = { x, y };
        }
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!isFrozenRef.current) {
        const rect = hero.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        drawMultiLayerBrush(x, y);
      }
    };

    hero.addEventListener('mousemove', handleMouseMove);
    hero.addEventListener('touchmove', handleTouchMove, { passive: true });
    hero.addEventListener('click', handleClick);

    // Main Canvas Composite Render Loop with Silk Inertia
    const render = () => {
      const rect = hero.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const ctx = canvas.getContext('2d');

      const tCtx = topCanvas.getContext('2d');
      const bCtx = bottomCanvas.getContext('2d');

      // Silk inertia calculation: interpolate smoothPos towards mousePos by 0.12 per frame
      if (!isFrozenRef.current && mousePosRef.current.x > -500) {
        const dx = mousePosRef.current.x - smoothPosRef.current.x;
        const dy = mousePosRef.current.y - smoothPosRef.current.y;

        if (Math.hypot(dx, dy) > 0.5) {
          smoothPosRef.current.x += dx * 0.12;
          smoothPosRef.current.y += dy * 0.12;

          drawMultiLayerBrush(smoothPosRef.current.x, smoothPosRef.current.y);
        }
      }

      if (ctx && tCtx && bCtx && rect.width > 0 && rect.height > 0) {
        const w = Math.floor(rect.width * dpr);
        const h = Math.floor(rect.height * dpr);
        const palette = HERO_PALETTE[themeRef.current === 'dark' ? 'dark' : 'light'];

        // -------------------------------------------------------------------
        // 1. RENDER TOP LAYER (White Canvas + Preserved Embossed MOMENTUM)
        // -------------------------------------------------------------------
        tCtx.clearRect(0, 0, w, h);
        tCtx.save();
        tCtx.fillStyle = palette.topBg;
        tCtx.fillRect(0, 0, w, h);

        tCtx.scale(dpr, dpr);

        // Giant MOMENTUM Typography (~78% viewport width) - EXACTLY PRESERVED
        const topText = 'MOMENTUM';
        let topFontSize = rect.width * 0.12;
        tCtx.font = `900 ${topFontSize}px "Plus Jakarta Sans", "Inter", -apple-system, sans-serif`;

        let metrics = tCtx.measureText(topText);
        const targetWidth = rect.width * 0.78;
        topFontSize = topFontSize * (targetWidth / metrics.width);
        tCtx.font = `900 ${topFontSize}px "Plus Jakarta Sans", "Inter", -apple-system, sans-serif`;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2 - 16;

        tCtx.textAlign = 'center';
        tCtx.textBaseline = 'middle';
        tCtx.fillStyle = palette.topText; // Embossed text blending into the layer background
        tCtx.fillText(topText, centerX, centerY);

        // Subtitle below MOMENTUM: "SMALL HABITS. EXTRAORDINARY LIVES."
        const subFontSize = Math.max(Math.min(rect.width * 0.012, 14), 11);
        tCtx.font = `500 ${subFontSize}px "Plus Jakarta Sans", "Inter", sans-serif`;
        tCtx.fillStyle = palette.subtitle;
        tCtx.letterSpacing = '0.25em';
        tCtx.fillText('SMALL HABITS. EXTRAORDINARY LIVES.', centerX, centerY + topFontSize * 0.52);

        tCtx.restore();

        // SUBTRACT MASK FROM TOP LAYER (destination-out)
        tCtx.save();
        tCtx.globalCompositeOperation = 'destination-out';
        tCtx.drawImage(maskCanvas, 0, 0);
        tCtx.restore();

        // -------------------------------------------------------------------
        // 2. RENDER BOTTOM LAYER (Atmospheric Calm Atmosphere + Revealed Sentence)
        // -------------------------------------------------------------------
        bCtx.clearRect(0, 0, w, h);

        // Base atmospheric mist background
        bCtx.save();
        bCtx.fillStyle = palette.bottomBase;
        bCtx.fillRect(0, 0, w, h);

        // Layered Atmospheric Gradient: Soft Mist Blue, Muted Aqua, Subtle Lavender, Frosted White
        const calmGrad = bCtx.createRadialGradient(
          w / 2, h / 2, 0,
          w / 2, h / 2, Math.max(w, h) * 0.60
        );
        calmGrad.addColorStop(0, palette.gradientStops[0]);    // Calm Blue
        calmGrad.addColorStop(0.35, palette.gradientStops[1]); // Muted Aqua
        calmGrad.addColorStop(0.65, palette.gradientStops[2]); // Subtle Lavender tint
        calmGrad.addColorStop(0.85, palette.gradientStops[3]); // Soft Mist
        calmGrad.addColorStop(1, palette.gradientStops[4]);

        bCtx.fillStyle = calmGrad;
        bCtx.globalAlpha = 0.75; // Soft translucent atmosphere
        bCtx.fillRect(0, 0, w, h);
        bCtx.restore();

        // Revealed Sentence: "Become the Best Version of You." (Exact Capitalization & Editorial Serif)
        bCtx.save();
        bCtx.scale(dpr, dpr);

        const bottomText = 'Become the Best Version of You.';
        const bottomFontSize = Math.min(Math.max(rect.width * 0.046, 32), 66);
        // Refined Editorial Serif font
        bCtx.font = `italic 400 ${bottomFontSize}px "Cormorant Garamond", "Newsreader", "Playfair Display", Georgia, serif`;
        bCtx.textAlign = 'center';
        bCtx.textBaseline = 'middle';
        bCtx.fillStyle = palette.bottomText;
        bCtx.fillText(bottomText, rect.width / 2, rect.height / 2);
        bCtx.restore();

        // CROP BOTTOM LAYER TO MASK (destination-in)
        bCtx.save();
        bCtx.globalCompositeOperation = 'destination-in';
        bCtx.drawImage(maskCanvas, 0, 0);
        bCtx.restore();

        // -------------------------------------------------------------------
        // 3. COMPOSITE FINAL IMAGE
        // -------------------------------------------------------------------
        ctx.clearRect(0, 0, w, h);

        // Base background
        ctx.fillStyle = palette.finalBase;
        ctx.fillRect(0, 0, w, h);

        // Draw revealed bottom layer
        ctx.drawImage(bottomCanvas, 0, 0);

        // Draw top layer on top
        ctx.drawImage(topCanvas, 0, 0);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
      hero.removeEventListener('mousemove', handleMouseMove);
      hero.removeEventListener('touchmove', handleTouchMove);
      hero.removeEventListener('click', handleClick);
    };
  }, [isFrozen]);

  return (
    <section
      ref={heroRef}
      id="hero"
      className={`relative bg-white dark:bg-slate-900 min-h-screen h-screen flex items-center justify-center px-6 sm:px-8 overflow-hidden select-none transition-all duration-700 ${
        isFrozen ? 'cursor-default' : 'cursor-crosshair'
      }`}
    >
      {/* Canvas rendering dual-layer frost erasure and reveal */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-auto" />
    </section>
  );
};
