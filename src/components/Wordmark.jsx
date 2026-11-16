import { useRef, useState, useMemo, useLayoutEffect, useEffect } from 'react';
import gsap from 'gsap';

const Ri = 63;

const getLetterMetrics = (letter, element, containerHeight) => {
  try {
    if (!getLetterMetrics.canvas) {
      getLetterMetrics.canvas = document.createElement('canvas');
    }
    const ctx = getLetterMetrics.canvas.getContext('2d');
    const style = getComputedStyle(element);
    ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const metrics = ctx.measureText(letter);
    if (!Number.isFinite(metrics.actualBoundingBoxLeft)) return null;

    const topOffset =
      (containerHeight - (metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent)) / 2 +
      metrics.fontBoundingBoxAscent;

    return {
      cx: (metrics.actualBoundingBoxRight - metrics.actualBoundingBoxLeft) / 2,
      bottom: topOffset + metrics.actualBoundingBoxDescent,
      height: metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent
    };
  } catch {
    return null;
  }
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Wordmark({
  word,
  pivotIndex,
  className = '',
  letterClassName = '',
  dotClassName = 'bg-white',
  loop = false,
  speed = 1,
  onComplete
}) {
  const containerRef = useRef(null);
  const headingRef = useRef(null);
  const dotRef = useRef(null);
  const flashRef = useRef(null);
  const letterRefs = useRef([]);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const [tick, setTick] = useState(0);
  const letters = useMemo(() => Array.from(word), [word]);

  const activePivot = useMemo(() => {
    if (Number.isInteger(pivotIndex) && letters[pivotIndex]?.trim()) {
      return pivotIndex;
    }
    const idx = letters.findIndex(ch => 'Iil1'.includes(ch));
    return idx === -1 ? 0 : idx;
  }, [letters, pivotIndex]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const heading = headingRef.current;
    const dot = dotRef.current;
    const flash = flashRef.current;
    const domLetters = letterRefs.current.slice(0, letters.length);
    const pivotEl = domLetters[activePivot];

    if (!container || !heading || !dot || !pivotEl) return;

    const nonPivotIndices = domLetters
      .map((el, i) => (el && i !== activePivot && letters[i].trim() ? i : -1))
      .filter(i => i !== -1);

    let ctx;
    let isCancelled = false;
    let cleanup = () => {};

    if (prefersReducedMotion()) {
      gsap.set([...domLetters.filter(Boolean)], { opacity: 1 });
      gsap.set(dot, { opacity: 0 });
      const timer = setTimeout(() => onCompleteRef.current?.(), 250);
      return () => clearTimeout(timer);
    }

    gsap.set(domLetters.filter(Boolean), { opacity: 0 });
    gsap.set(dot, { opacity: 0 });

    const fontPromise = document.fonts?.ready ?? Promise.resolve();

    fontPromise.then(() => {
      if (isCancelled) return;

      ctx = gsap.context(() => {
        gsap.set([...domLetters.filter(Boolean), dot], { clearProps: 'transform' });

        const cRect = container.getBoundingClientRect();
        const fontSize = parseFloat(getComputedStyle(heading).fontSize) || 16;

        const bounds = domLetters.map(el => {
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return {
            left: r.left - cRect.left,
            top: r.top - cRect.top,
            w: r.width,
            h: r.height,
            cx: r.left - cRect.left + r.width / 2,
            cy: r.top - cRect.top + r.height / 2
          };
        });

        const pivotBounds = bounds[activePivot];
        const metrics =
          getLetterMetrics(letters[activePivot], pivotEl, pivotBounds.h) ?? {
            cx: pivotBounds.w / 2,
            bottom: pivotBounds.h,
            height: pivotBounds.h * 0.78
          };

        const pivotCenter = {
          x: pivotBounds.left + metrics.cx,
          y: pivotBounds.top + metrics.bottom
        };
        const leverHeight = metrics.height;
        const dotSize = fontSize * 0.24;

        gsap.set(pivotEl, {
          transformOrigin: `${(metrics.cx / pivotBounds.w) * 100}% ${(metrics.bottom / pivotBounds.h) * 100}%`
        });
        gsap.set(dot, {
          width: dotSize,
          height: dotSize,
          left: pivotCenter.x - dotSize / 2,
          top: pivotCenter.y + fontSize * 0.1
        });

        const getLeverPoint = angleDeg => {
          const rad = (angleDeg * Math.PI) / 180;
          return {
            x: pivotCenter.x + Math.sin(rad) * leverHeight,
            y: pivotCenter.y - Math.cos(rad) * leverHeight
          };
        };

        const dropY = -(cRect.top + pivotCenter.y) - fontSize;
        const flashSize = fontSize * 2.6;

        const emitFlash = (timeline, pos, maxOpacity, atTime) => {
          if (!flash) return;
          timeline
            .set(
              flash,
              {
                width: flashSize,
                height: flashSize,
                left: pos.x - flashSize / 2,
                top: pos.y - flashSize / 2
              },
              atTime
            )
            .to(flash, { opacity: maxOpacity, duration: 0.05, ease: 'none' }, atTime)
            .to(flash, { opacity: 0, duration: 0.34, ease: 'power2.out' }, atTime + 0.05);
        };

        const flingLetter = (timeline, idx, launchPos, atTime) => {
          const el = domLetters[idx];
          const b = bounds[idx];
          const dx = launchPos.x - b.cx;
          const dy = launchPos.y - b.cy;
          const dur = 0.5 + Math.min(Math.abs(dx) / 900, 0.32);
          const apex = -(Math.abs(dx) * 0.3 + fontSize * 0.25);
          const spin = (dx > 0 ? -1 : 1) * gsap.utils.random(170, 300);

          return (
            timeline
              .set(
                el,
                {
                  x: dx,
                  y: dy,
                  rotation: spin,
                  scale: 0.3,
                  opacity: 0,
                  transformOrigin: '50% 50%'
                },
                atTime
              )
              .to(el, { opacity: 1, scale: 1, duration: dur * 0.45 }, atTime)
              .to(el, { x: 0, duration: dur, ease: 'power1.out' }, atTime)
              .to(el, { y: Math.min(dy, 0) + apex, duration: dur * 0.45, ease: 'power2.out' }, atTime)
              .to(el, { y: 0, duration: dur * 0.55, ease: 'power2.in' }, atTime + dur * 0.45)
              .to(el, { rotation: 0, duration: dur, ease: 'power2.out' }, atTime)
              .to(el, { y: -fontSize * 0.05, duration: 0.09, ease: 'power2.out' }, atTime + dur)
              .to(el, { y: 0, duration: 0.16, ease: 'power2.in' }, atTime + dur + 0.09),
            atTime + dur
          );
        };

        const flingGroup = (timeline, angleDeg, groupIndices, atTime) => {
          if (!groupIndices.length) return atTime;
          const launchPos = getLeverPoint(angleDeg);

          timeline
            .to(pivotEl, { rotation: angleDeg, duration: 0.4, ease: 'back.out(1.4)' }, atTime)
            .to(pivotEl, { rotation: angleDeg + (angleDeg < 0 ? 6 : -6), duration: 0.08 }, atTime + 0.34)
            .to(pivotEl, { rotation: angleDeg, duration: 0.3, ease: 'elastic.out(1, 0.5)' }, atTime + 0.42);

          let maxEnd = atTime;
          groupIndices.forEach((targetIdx, order) => {
            const launchTime = atTime + 0.34 + order * 0.1;
            emitFlash(timeline, launchPos, 0.5 - order * 0.1, launchTime);
            maxEnd = Math.max(maxEnd, flingLetter(timeline, targetIdx, launchPos, launchTime));
          });

          return maxEnd;
        };

        const master = gsap.timeline({
          defaults: { ease: 'power2.out' },
          repeat: loop ? -1 : 0,
          repeatDelay: loop ? 1.1 : 0,
          onComplete: () => {
            if (!loop) onCompleteRef.current?.();
          }
        });

        master.timeScale(speed);
        master
          .set(container, { opacity: 1 })
          .set(domLetters.filter(Boolean), { opacity: 0, x: 0, y: 0, rotation: 0, scale: 1 })
          .set(pivotEl, { opacity: 0, y: dropY, rotation: 0 })
          .set(dot, { opacity: 0, y: dropY, scale: 1 });

        // The dot drop / pivot landing is the opening beat. At 0.5 it held the
        // screen for ~2.8s before any letter flew in, which read as the page
        // being empty and the animation "starting late". 0.7 keeps the bounce
        // but puts letters on screen at ~2.0s.
        const dropScale = 0.7;
        const introTimeline = gsap.timeline({ defaults: { ease: 'power2.out' } });
        const bounceHeight = fontSize * 0.4;

        // Dot drops with squash & stretch and elastic bounce
        introTimeline
          .set(dot, { opacity: 1 }, 0)
          .to(dot, { y: 0, duration: 0.42, ease: 'power2.in' }, 0)
          .to(dot, { scaleX: 0.82, scaleY: 1.22, duration: 0.28, ease: 'power1.in' }, 0.14)
          .to(dot, { scaleX: 1.4, scaleY: 0.52, duration: 0.06 }, 0.42)
          .to(dot, { y: -bounceHeight, duration: 0.2 }, 0.48)
          .to(dot, { scaleX: 1, scaleY: 1, duration: 0.18 }, 0.48)
          .to(dot, { y: 0, duration: 0.18, ease: 'power2.in' }, 0.68)
          .to(dot, { scaleX: 0.92, scaleY: 1.08, duration: 0.14, ease: 'power1.in' }, 0.72)
          .to(dot, { scaleX: 1.2, scaleY: 0.74, duration: 0.05 }, 0.86)
          .to(dot, { scaleX: 1, scaleY: 1, duration: 0.36, ease: 'elastic.out(1, 0.42)' }, 0.91);

        emitFlash(introTimeline, pivotCenter, 0.4, 0.42);
        emitFlash(introTimeline, pivotCenter, 0.24, 0.86);

        // Pivot 'I' drops down and lands
        const pivotBounce = fontSize * 0.13;
        introTimeline
          .set(pivotEl, { opacity: 1 }, 0.8)
          .to(pivotEl, { y: 0, duration: 0.34, ease: 'power2.in' }, 0.8)
          .to(pivotEl, { scaleX: 0.86, scaleY: 1.16, duration: 0.24, ease: 'power1.in' }, 0.88)
          .to(pivotEl, { scaleX: 1.32, scaleY: 0.64, duration: 0.06 }, 1.14)
          .to(pivotEl, { y: -pivotBounce, duration: 0.1 }, 1.2)
          .to(pivotEl, { scaleX: 1, scaleY: 1, duration: 0.12 }, 1.2)
          .to(pivotEl, { y: 0, duration: 0.1, ease: 'power2.in' }, 1.3)
          .to(pivotEl, { scaleX: 1.12, scaleY: 0.88, duration: 0.05 }, 1.4)
          .to(pivotEl, { scaleX: 1, scaleY: 1, duration: 0.38, ease: 'elastic.out(1, 0.4)' }, 1.45)
          .fromTo(
            pivotEl,
            { rotation: -9 },
            { rotation: 0, duration: 0.5, ease: 'elastic.out(1, 0.36)' },
            1.19
          );

        emitFlash(introTimeline, pivotCenter, 0.6, 1.14);
        emitFlash(introTimeline, pivotCenter, 0.26, 1.4);

        master.add(introTimeline.timeScale(dropScale), 0);

        const leftGroup = nonPivotIndices.filter(i => i < activePivot).reverse();
        const rightGroup = nonPivotIndices.filter(i => i > activePivot);

        let launchPhase = 1.4 / dropScale;
        launchPhase = flingGroup(master, -Ri, leftGroup, launchPhase);
        launchPhase = flingGroup(master, Ri, rightGroup, leftGroup.length ? launchPhase - 0.3 : launchPhase);

        master
          .to(pivotEl, { rotation: 0, duration: 0.5, ease: 'elastic.out(1, 0.55)' }, launchPhase - 0.16)
          .to(dot, { opacity: 0, scale: 0, duration: 0.3, ease: 'power2.in' }, launchPhase - 0.12);

        let resizeTimer;
        const handleResize = () => {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(() => {
            if (loop) {
              setTick(t => t + 1);
            } else if (master.progress() < 1) {
              master.progress(1);
            }
          }, 150);
        };

        window.addEventListener('resize', handleResize);
        cleanup = () => {
          clearTimeout(resizeTimer);
          window.removeEventListener('resize', handleResize);
        };
      }, container);
    });

    return () => {
      isCancelled = true;
      cleanup();
      ctx?.revert();
    };
  }, [letters, activePivot, loop, speed, tick]);

  return (
    <div ref={containerRef} aria-hidden="true" className="absolute top-0 left-0 opacity-0">
      <h1 ref={headingRef} className={className}>
        {letters.map((char, i) => (
          <span
            key={`${char}-${i}`}
            ref={el => {
              letterRefs.current[i] = el;
            }}
            className={`inline-block will-change-transform ${letterClassName}`}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </h1>

      <span ref={dotRef} className={`absolute rounded-full pointer-events-none ${dotClassName}`} />
      <span
        ref={flashRef}
        className="absolute rounded-full opacity-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 70%)'
        }}
      />
    </div>
  );
}
