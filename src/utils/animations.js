import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const EASE_OUT = 'power3.out';
export const DURATION = 0.9;
export const TRIGGER_START = 'top 88%';

const REVEAL_VARIANTS = {
  up: { y: 40 },
  down: { y: -40 },
  left: { x: -48 },
  right: { x: 48 },
  scale: { scale: 0.94 },
  fade: {}
};

export function initReveals(scope) {
  if (!scope) return;

  // Single reveals
  gsap.utils.toArray('[data-reveal]', scope).forEach(el => {
    const variant = REVEAL_VARIANTS[el.dataset.reveal] ?? REVEAL_VARIANTS.up;
    gsap.from(el, {
      ...variant,
      opacity: 0,
      duration: DURATION,
      delay: parseFloat(el.dataset.revealDelay) || 0,
      ease: EASE_OUT,
      scrollTrigger: {
        trigger: el,
        start: TRIGGER_START,
        once: true
      }
    });
  });

  // Group reveals
  gsap.utils.toArray('[data-reveal-group]', scope).forEach(el => {
    const children = gsap.utils.toArray(':scope > *', el);
    if (children.length) {
      gsap.from(children, {
        y: 32,
        opacity: 0,
        duration: DURATION,
        ease: EASE_OUT,
        stagger: parseFloat(el.dataset.revealGroup) || 0.08,
        scrollTrigger: {
          trigger: el,
          start: TRIGGER_START,
          once: true
        }
      });
    }
  });

  // Line reveals
  gsap.utils.toArray('[data-reveal-lines]', scope).forEach(el => {
    const lines = gsap.utils.toArray('.line', el);
    if (lines.length) {
      gsap.from(lines, {
        yPercent: 110,
        duration: 1.1,
        ease: EASE_OUT,
        stagger: 0.12,
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          once: true
        }
      });
    }
  });

  // Parallax elements
  gsap.utils.toArray('[data-parallax]', scope).forEach(el => {
    const amount = parseFloat(el.dataset.parallax) || 40;
    gsap.fromTo(
      el,
      { yPercent: -amount / 10 },
      {
        yPercent: amount / 10,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('[data-parallax-frame]') || el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      }
    );
  });
}

export function useGsapScope(callback, deps = []) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const mm = gsap.matchMedia();
    mm.add(
      {
        motion: '(prefers-reduced-motion: no-preference)',
        desktop: '(min-width: 768px)'
      },
      context => {
        const { motion: hasMotion, desktop: isDesktop } = context.conditions;
        if (hasMotion) {
          initReveals(element);
          if (callback) {
            callback({ scope: element, desktop: isDesktop, mobile: !isDesktop });
          }
        }
      }
    );

    return () => mm.revert();
  }, deps);

  return ref;
}

export { gsap, ScrollTrigger };
