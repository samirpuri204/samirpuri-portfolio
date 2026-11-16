import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { developer } from '../data';
import Wordmark from './Wordmark';
import ParticlePortrait from './ParticlePortrait';

const HERO_IMAGE = './assets/samir-portrait.png';
const PROJECT_THUMBS = [
  './assets/project-tempmails.jpg',
  './assets/project-aiwith.jpg',
  './assets/project-nepmind.jpg',
  './assets/project-pairnepal.jpg'
];

const FULL_NAME = `${developer.heading.first}${developer.heading.second}`;
const SPLIT_AT = developer.heading.first.length;

const headingClassName =
  'hero-heading flex items-baseline font-black tracking-tighter drop-shadow-2xl leading-none uppercase';
const gradientClassName =
  'text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-300 to-gray-800';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function Hero({ onPreloadComplete }) {
  const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 1024;
  // Reduced motion skips the intro entirely and lands on the final name.
  const skipIntro = prefersReducedMotion();
  // The wordmark intro runs at every width: it always starts on the short
  // wordmark and morphs into the full name before the split.
  const [word, setWord] = useState(skipIntro ? FULL_NAME : developer.wordmark);
  const [isWordmarkComplete, setIsWordmarkComplete] = useState(skipIntro);
  const [showWordmarkOverlay, setShowWordmarkOverlay] = useState(!skipIntro);
  // Same beat as desktop: the portrait assembles when the split starts.
  const [playParticle, setPlayParticle] = useState(false);

  const containerRef = useRef(null);
  const headingRef = useRef(null);
  const leftSpanRef = useRef(null);
  const rightSpanRef = useRef(null);
  const roleRef = useRef(null);
  const ctaRef = useRef(null);
  const imgAnchorRef = useRef(null);
  const onCompleteRef = useRef(onPreloadComplete);

  useEffect(() => {
    onCompleteRef.current = onPreloadComplete;
  }, [onPreloadComplete]);

  // Warm the portrait PNG while the wordmark plays, so the particles have data
  // the moment the canvas mounts. Network only: it never gates the intro.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const img = new window.Image();
    img.src = HERO_IMAGE;
    img.onerror = () => {};
  }, []);

  // Mobile stays scrollable during the intro; only desktop locks the page.
  useEffect(() => {
    if (isSmallScreen) {
      document.body.style.overflowX = 'hidden';
      onCompleteRef.current?.();
      return;
    }

    window.scrollTo(0, 0);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isSmallScreen]);

  // Safety net: the name must never stay hidden. If the wordmark timeline has
  // not reported completion (throttled rAF, stalled fonts, background tab),
  // fall through to the static name so the hero is never blank.
  useEffect(() => {
    if (isWordmarkComplete) return;
    const timer = setTimeout(() => {
      setIsWordmarkComplete(true);
      setShowWordmarkOverlay(false);
    }, 6000);
    return () => clearTimeout(timer);
  }, [isWordmarkComplete]);

  // Wordmark morph: SAMIR -> SAMIRPURI, letter by letter (every width).
  // It deliberately does NOT wait for the portrait image: the 1.4 MB PNG used
  // to gate the morph, so on a slow link the name stalled on "SAMIR" long after
  // the page had loaded.
  useEffect(() => {
    if (!isWordmarkComplete) return;

    const targetWord = FULL_NAME;
    const initialWord = developer.wordmark;
    const stepIncrement = 1 / 3;
    let step = 0;

    const intervalId = setInterval(() => {
      setWord(() =>
        targetWord
          .split('')
          .map((char, idx) =>
            idx < Math.floor(step)
              ? targetWord[idx]
              : idx < initialWord.length
                ? initialWord[idx]
                : ''
          )
          .join('')
      );

      if (step >= targetWord.length) {
        clearInterval(intervalId);
      }

      step += stepIncrement;
    }, 50);

    return () => clearInterval(intervalId);
  }, [isWordmarkComplete]);

  // Hero choreography. Runs once the final word is on screen, so the heading
  // width is measured with the full name and the split can never clip.
  useEffect(() => {
    if (!isWordmarkComplete || word !== FULL_NAME) return;

    const ctx = gsap.context(() => {
      // The name is on screen, so mount the rest of the page now instead of
      // waiting for the split to finish: the site used to stay locked behind
      // the intro until ~8.5s after navigation.
      onCompleteRef.current?.();

      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = 'auto';
          onCompleteRef.current?.();
        }
      });

      const isMobile = window.innerWidth < 768;
      const leftSpan = leftSpanRef.current;
      const rightSpan = rightSpanRef.current;

      // Measure the painted run with transforms cleared, so the split can never
      // push a glyph past the viewport edge at any window width.
      gsap.set([leftSpan, rightSpan], { x: 0 });
      const leftRect = leftSpan.getBoundingClientRect();
      const rightRect = rightSpan.getBoundingClientRect();
      const runWidth = rightRect.right - leftRect.left;
      const room = Math.max(0, window.innerWidth - runWidth - 32);
      const splitDistance = isMobile
        ? Math.min(window.innerWidth * 0.2, room)
        : Math.min(288, window.innerWidth * 0.2, room);

      // Reduced motion: land on the final composition without tweening.
      if (prefersReducedMotion()) {
        gsap.set(containerRef.current, { top: isMobile ? '20%' : '74%' });
        gsap.set([roleRef.current, ctaRef.current], { y: 0, opacity: 1 });
        gsap.set(leftSpan, { x: -splitDistance / 2 });
        gsap.set(rightSpan, { x: splitDistance / 2 });
        setPlayParticle(true);
        document.body.style.overflow = 'auto';
        onCompleteRef.current?.();
        tl.kill();
        return;
      }

      tl.to(
        containerRef.current,
        {
          top: isMobile ? '20%' : '74%',
          duration: 1.5,
          ease: 'power3.inOut'
        },
        '+=0.2'
      );

      tl.fromTo(
        [roleRef.current, ctaRef.current],
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.2,
          ease: 'power3.out'
        },
        '-=1.0'
      );

      tl.call(() => setPlayParticle(true), null, '-=1.2');

      tl.to(
        leftSpanRef.current,
        {
          x: -splitDistance / 2,
          duration: 1.5,
          ease: 'power3.out'
        },
        '<'
      );

      tl.to(
        rightSpanRef.current,
        {
          x: splitDistance / 2,
          duration: 1.5,
          ease: 'power3.out'
        },
        '<'
      );
    });

    return () => ctx.revert();
  }, [word, isWordmarkComplete]);

  // The split offsets are pixels derived from the painted width, so they must be
  // recomputed whenever the viewport changes. Without this, loading at desktop
  // width and then viewing at phone width kept a 136 px offset on a 52 px font
  // and pushed the halves off-screen (you only saw fragments like "URI").
  useEffect(() => {
    if (!isWordmarkComplete || word !== FULL_NAME) return;

    const apply = () => {
      const container = containerRef.current;
      const left = leftSpanRef.current;
      const right = rightSpanRef.current;
      if (!container || !left || !right) return;

      const isMobile = window.innerWidth < 768;
      gsap.set([left, right], { x: 0 });
      const leftRect = left.getBoundingClientRect();
      const rightRect = right.getBoundingClientRect();
      const runWidth = rightRect.right - leftRect.left;
      const room = Math.max(0, window.innerWidth - runWidth - 32);
      const split = isMobile
        ? Math.min(window.innerWidth * 0.2, room)
        : Math.min(288, window.innerWidth * 0.2, room);

      gsap.set(container, { top: isMobile ? '20%' : '74%' });
      gsap.set(left, { x: -split / 2 });
      gsap.set(right, { x: split / 2 });
    };

    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(apply);
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, [isWordmarkComplete, word]);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-end justify-center bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{
        background: 'radial-gradient(circle, #222222 0%, #000000 80%)'
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      {/* Center Heading & Split Typography Container */}
      <div
        ref={containerRef}
        className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none select-none flex flex-col items-start w-max"
      >
        <h1
          ref={headingRef}
          className={`${headingClassName} transition-opacity duration-300 ${
            isWordmarkComplete ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span ref={leftSpanRef} className={`${gradientClassName} will-change-transform`}>
            {word.slice(0, SPLIT_AT)}
          </span>
          <span ref={rightSpanRef} className={`${gradientClassName} will-change-transform`}>
            {word.slice(SPLIT_AT)}
          </span>
        </h1>

        {/* Wordmark Animated Introduction (every width; faster on phones) */}
        {showWordmarkOverlay && (
          <div
            className={`absolute top-0 left-0 transition-opacity duration-300 ${
              isWordmarkComplete ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <Wordmark
              word={developer.wordmark}
              className={headingClassName}
              letterClassName={gradientClassName}
              dotClassName="bg-gray-200"
              speed={1.15}
              onComplete={() => {
                setIsWordmarkComplete(true);
                setTimeout(() => setShowWordmarkOverlay(false), 320);
              }}
            />
          </div>
        )}

        {/* Subtitle */}
        <p
          ref={roleRef}
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 md:translate-x-0 md:-bottom-12 md:left-8 text-white text-base md:text-2xl lg:text-4xl drop-shadow-md z-10 w-max opacity-0"
        >
          <span className="font-bold">{developer.role.bold}</span>{' '}
          <span className="font-light italic text-gray-300">{developer.role.light}</span>
        </p>

        {/* CTA Button */}
        <div
          ref={ctaRef}
          className="absolute -bottom-20 left-1/2 -translate-x-1/2 md:translate-x-0 md:-bottom-12 md:left-auto md:right-20 flex items-center gap-2 md:gap-4 pointer-events-auto z-10 w-max opacity-0"
        >
          <a
            href="#contact"
            aria-label="Contact"
            className="group w-8 h-8 md:w-12 md:h-12 rounded-full border border-gray-400/30 flex items-center justify-center backdrop-blur-md bg-black/20 hover:bg-white/10 hover:border-gray-400/50 transition-all duration-300 cursor-pointer"
          >
            <svg
              className="w-3 h-3 md:w-4 md:h-4 text-gray-300 transition-transform duration-300 group-hover:rotate-45"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 7L7 17M7 17H16M7 17V8" />
            </svg>
          </a>
          <a
            href="#contact"
            className="px-5 py-1.5 md:px-7 md:py-2.5 rounded-full border border-gray-400/30 flex items-center justify-center backdrop-blur-md bg-black/20 hover:bg-white/10 hover:border-gray-400/50 transition-all cursor-pointer"
          >
            <span className="text-gray-300 text-xs md:text-base italic font-light tracking-wider">
              Contact
            </span>
          </a>
        </div>
      </div>

      {/* Static Fallback Image / Size Anchor */}
      <div className="absolute inset-x-0 top-[30vh] md:top-[2vh] z-10 text-center text-white flex flex-col items-center w-full pointer-events-none">
        <img
          ref={imgAnchorRef}
          alt=""
          aria-hidden="true"
          className="invisible w-auto max-w-none h-[110vh] md:h-[143vh]"
          src={HERO_IMAGE}
        />
      </div>

      {/* Interactive WebGL 2 Particle Portrait. Mounted after the wordmark so
          WebGL context creation and the 5-image atlas build do not block the
          main thread while the first letters are painting. */}
      {isWordmarkComplete && (
        <ParticlePortrait
          src={HERO_IMAGE}
          thumbs={PROJECT_THUMBS}
          anchorRef={imgAnchorRef}
          play={playParticle}
          label={`Portrait of ${developer.name} made from tiles of his projects`}
          className="z-10"
        />
      )}
    </section>
  );
}
