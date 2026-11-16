import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGsapScope } from '../utils/animations';
import { developer, shelfComponents } from '../data';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const RACK_CLASSES = [
  'scale-100 opacity-100',
  'scale-90 opacity-50',
  'scale-[0.81] opacity-25'
];

function ComponentItem({ item, isActive, rack, reducedMotion, onSelect, wasDragged }) {
  const videoRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive && !reducedMotion) {
      if (!videoLoaded) {
        video.src = `./photos/154-portfolio/reels/${item.slug}.mp4`;
        setVideoLoaded(true);
      }
      video
        .play()
        .then(() => setPlaying(true))
        .catch(() => {});
    } else {
      video.pause();
      setPlaying(false);
    }
  }, [isActive, videoLoaded, item.slug, reducedMotion]);

  const whatsappMessage = encodeURIComponent(
    `Hi Samir, I saw the "${item.name}" interaction on your portfolio. Could you tell me more about it?`
  );

  return (
    <div
      className={`relative shrink-0 snap-start flex flex-col origin-top transition-[scale,opacity] duration-[320ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] w-[280px] sm:w-[320px] lg:w-[360px] ${
        RACK_CLASSES[rack] || RACK_CLASSES[2]
      }`}
    >
      {playing && rack === 0 && (
        <span className="absolute -top-3 left-0 z-20 px-2 py-0.5 bg-[#ff5c3d] text-white text-[10px] font-bold tracking-widest uppercase">
          Demo
        </span>
      )}

      <button
        type="button"
        onClick={() => {
          if (wasDragged()) return;
          if (!isActive) onSelect();
        }}
        aria-label={isActive ? `${item.name} — active study` : `Bring ${item.name} to the front`}
        aria-current={isActive ? 'true' : undefined}
        className="block w-full text-left cursor-pointer bg-[#0d0d0f] border-2 border-[var(--accent)]/55 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
      >
        <div className="relative w-full aspect-[9/16] bg-[#0a0a0c] overflow-hidden">
          <img
            src={`./photos/154-portfolio/reels/${item.slug}.jpg`}
            alt=""
            loading="lazy"
            decoding="async"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              playing ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              playing ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>

        <div className="px-4 py-4 border-t border-white/5">
          <div className="flex items-baseline justify-between gap-3 mb-1">
            <h3 className="text-lg font-bold text-white truncate">{item.name}</h3>
            <span className="text-[9px] tracking-[0.15em] text-gray-600 font-mono uppercase shrink-0">
              {item.category}
            </span>
          </div>

          <p className="text-gray-500 text-xs truncate">{item.tagline}</p>
        </div>
      </button>

      <a
        href={`https://wa.me/${developer.whatsapp}?text=${whatsappMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-4 w-full px-5 py-2.5 rounded-full border border-white/25 text-white text-xs hover:bg-white hover:text-black transition-colors inline-flex items-center justify-center gap-2 ${
          isActive ? '' : 'opacity-60 hover:opacity-100'
        }`}
      >
        Ask about this on WhatsApp
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-3.5 h-3.5"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.41a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.44.12-.14.2-.31.3-.47.1-.16.05-.3-.02-.42-.08-.12-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.23.25-.87.85-.87 2.08 0 1.22.89 2.4 1.01 2.57.13.16 1.76 2.68 4.26 3.76.59.26 1.06.41 1.42.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28z" />
        </svg>
      </a>
    </div>
  );
}

function CatalogueCard({ isActive, rack }) {
  return (
    <div
      className={`relative shrink-0 snap-start flex flex-col origin-top transition-[scale,opacity] duration-[320ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] w-[280px] sm:w-[320px] lg:w-[360px] ${
        RACK_CLASSES[rack] || RACK_CLASSES[2]
      }`}
    >
      <a
        href={developer.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block w-full border-2 border-[var(--accent)]/55 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
      >
        <div className="relative w-full aspect-[9/16] overflow-hidden bg-[linear-gradient(160deg,#e8e4dc_0%,#cfc7b6_38%,#7b6f8f_72%,#2b2440_100%)]">
          <div
            className="absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage:
                'linear-gradient(#050505 1px, transparent 1px), linear-gradient(90deg, #050505 1px, transparent 1px)',
              backgroundSize: '34px 34px'
            }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 flex flex-col justify-between p-6 text-black">
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase opacity-70">
              The full picture
            </span>
            <div>
              <p className="text-[5.5rem] leading-[0.85] font-black tracking-tighter">All</p>
              <p className="text-lg font-bold tracking-tight mt-2">work & experiments</p>
              <p className="text-xs opacity-75 mt-1 font-mono uppercase tracking-wider">
                {developer.urlLabel} →
              </p>
            </div>
          </div>
        </div>
      </a>
    </div>
  );
}

export default function ComponentsShelf() {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const sideRef = useGsapScope();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const totalItems = shelfComponents.length;

  useEffect(() => {
    const desktopMq = window.matchMedia('(min-width: 1024px)');
    const updateDesktop = () => setIsDesktop(desktopMq.matches);
    updateDesktop();
    desktopMq.addEventListener('change', updateDesktop);

    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(motionMq.matches);
    updateMotion();
    motionMq.addEventListener('change', updateMotion);

    return () => {
      desktopMq.removeEventListener('change', updateDesktop);
      motionMq.removeEventListener('change', updateMotion);
    };
  }, []);

  const measureNearest = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const scrollLeft = track.scrollLeft;
    let closestIndex = 0;
    let minDiff = Infinity;

    Array.from(track.children).forEach((child, idx) => {
      const diff = Math.abs(child.offsetLeft - track.offsetLeft - scrollLeft);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });

    setActiveIndex(closestIndex);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let rafId = 0;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(measureNearest);
    };

    track.addEventListener('scroll', onScroll, { passive: true });
    measureNearest();
    return () => {
      cancelAnimationFrame(rafId);
      track.removeEventListener('scroll', onScroll);
    };
  }, [measureNearest]);

  // Pinned desktop horizontal scrolling
  const shouldPin = isDesktop && !reducedMotion;

  useEffect(() => {
    if (!shouldPin) return;
    const sec = containerRef.current;
    const track = trackRef.current;
    if (!sec || !track) return;

    const maxScroll = () => track.scrollWidth - track.clientWidth;
    if (maxScroll() <= 0) return;

    const tween = gsap.to(track, {
      scrollLeft: maxScroll,
      ease: 'none',
      scrollTrigger: {
        trigger: sec,
        start: 'top top',
        end: () => `+=${maxScroll()}`,
        pin: true,
        scrub: 1,
        onUpdate: self => setScrollProgress(self.progress),
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    const refresh = () => ScrollTrigger.refresh();
    const timer = setTimeout(refresh, 300);
    window.addEventListener('load', refresh);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('load', refresh);
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.set(track, { clearProps: 'scrollLeft' });
    };
  }, [shouldPin]);

  const scrollToItem = useCallback(
    index => {
      const track = trackRef.current;
      if (!track) return;
      const target = track.children[Math.max(0, Math.min(track.children.length - 1, index))];
      if (target) {
        track.scrollTo({
          left: target.offsetLeft - track.offsetLeft,
          behavior: reducedMotion ? 'auto' : 'smooth'
        });
      }
    },
    [reducedMotion]
  );

  // Drag interaction
  const dragRef = useRef({ active: false, dragging: false, startX: 0, startScroll: 0, moved: 0 });

  const onPointerDown = e => {
    if (e.pointerType === 'touch') return;
    const track = trackRef.current;
    dragRef.current = {
      active: true,
      dragging: false,
      startX: e.clientX,
      startScroll: track.scrollLeft,
      moved: 0
    };
  };

  const onPointerMove = e => {
    const drag = dragRef.current;
    if (!drag.active) return;
    const diff = e.clientX - drag.startX;
    drag.moved = Math.abs(diff);
    if (!drag.dragging && drag.moved > 6) {
      drag.dragging = true;
      trackRef.current?.setPointerCapture?.(e.pointerId);
    }
    if (drag.dragging) {
      trackRef.current.scrollLeft = drag.startScroll - diff;
    }
  };

  const onPointerUp = e => {
    const drag = dragRef.current;
    if (!drag.active) return;
    drag.active = false;
    if (drag.dragging) {
      drag.dragging = false;
      trackRef.current?.releasePointerCapture?.(e.pointerId);
      scrollToItem(activeIndex);
    }
  };

  const onKeyDown = e => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollToItem(activeIndex + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollToItem(activeIndex - 1);
    }
  };

  return (
    <section
      ref={containerRef}
      id="components"
      className={`bg-[#050505] w-full text-white overflow-hidden ${
        shouldPin ? 'h-screen flex flex-col justify-center py-0' : 'pt-10 md:pt-20 pb-12 md:pb-16'
      }`}
    >
      <div className="max-w-[1600px] mx-auto w-full flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-5 px-6 md:px-16">
        {/* Left Side: Info & Links */}
        <div ref={sideRef} className="w-full lg:w-[300px] xl:w-[340px] shrink-0 flex flex-col">
          <div
            data-reveal-group="0.12"
            className="bg-white/[0.05] p-[1.125rem] border-t-2 border-white/80"
          >
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white leading-[0.95] mb-6">
              Interface parts that behave under pressure.
            </h2>
            <p className="text-gray-400 text-sm md:text-base font-light leading-relaxed">
              {totalItems} interface studies — motion, gesture and state — each one written in plain
              HTML, CSS and JavaScript, with no framework and no build step.
            </p>
          </div>

          <div
            data-reveal="true"
            data-reveal-delay="0.1"
            className="flex flex-wrap gap-3 mt-3 bg-white/[0.05] p-[1.125rem]"
          >
            <a
              href={developer.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group px-6 py-3.5 bg-[var(--accent)] text-black text-xs font-bold tracking-[0.15em] uppercase hover:bg-[var(--accent-hover)] transition-colors inline-flex items-center gap-2 shadow-[0_0_28px_-6px_var(--accent)]"
            >
              See everything I build
              <svg
                className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </a>
            <a
              href={`https://wa.me/${developer.whatsapp}?text=Hi%20Samir%2C%20I%20saw%20your%20portfolio%20and%20I'd%20like%20to%20talk.`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 border border-white/25 text-white text-xs font-bold tracking-[0.15em] uppercase hover:bg-white hover:text-black transition-colors"
            >
              {developer.whatsappDisplay}
            </a>
          </div>
        </div>

        {/* Right Side: Shelf Track */}
        <div className="flex-1 min-w-0 flex flex-col bg-white/[0.05] p-[1.125rem] gap-3">
          <div
            ref={trackRef}
            role="group"
            aria-roledescription="carousel"
            aria-label="Interface studies"
            tabIndex={0}
            onKeyDown={onKeyDown}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className="flex items-stretch gap-3 py-3 -my-3 -mr-[1.125rem] pr-[1.125rem] overflow-x-auto snap-x snap-mandatory cursor-grab active:cursor-grabbing [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
          >
            {shelfComponents.map((item, idx) => (
              <ComponentItem
                key={item.slug}
                item={item}
                isActive={idx === activeIndex}
                rack={Math.min(2, Math.abs(idx - activeIndex))}
                reducedMotion={reducedMotion}
                wasDragged={() => dragRef.current.moved > 6}
                onSelect={() => scrollToItem(idx)}
              />
            ))}
            <CatalogueCard
              isActive={activeIndex === totalItems}
              rack={Math.min(2, Math.abs(totalItems - activeIndex))}
            />
          </div>

          {/* Carousel footer navigation */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="flex gap-[0.3rem]">
                {shelfComponents.map((item, idx) => (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => scrollToItem(idx)}
                    aria-label={`Go to ${item.name}`}
                    className={`h-[3px] transition-all duration-[320ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] ${
                      idx === Math.min(activeIndex, totalItems - 1)
                        ? 'w-5 bg-white'
                        : 'w-2 bg-white/25 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
              <span className="hidden sm:inline text-[10px] tracking-[0.2em] text-[#ff5c3d] font-mono uppercase">
                → Drag to spin the shelf
              </span>
            </div>

            <span className="text-[10px] tracking-[0.2em] text-gray-500 font-mono">
              {Math.min(activeIndex + 1, totalItems)} / {totalItems}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
