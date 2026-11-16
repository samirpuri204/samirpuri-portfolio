import { useRef } from 'react';
import { useGsapScope, gsap, EASE_OUT, DURATION } from '../utils/animations';
import { introWords, stackMarqueeRows } from '../data';

export default function About() {
  const wordsRef = useRef(null);

  const sectionRef = useGsapScope(({ scope, desktop }) => {
    gsap.from('[data-intro]', {
      y: 100,
      opacity: 0,
      duration: 1,
      ease: EASE_OUT,
      scrollTrigger: {
        trigger: scope,
        start: 'top 70%',
        once: true
      }
    });

    if (wordsRef.current) {
      if (desktop) {
        gsap.fromTo(
          wordsRef.current.querySelectorAll('.word'),
          { color: '#52525b', opacity: 0.2 },
          {
            color: '#ffffff',
            opacity: 1,
            stagger: 0.1,
            scrollTrigger: {
              trigger: wordsRef.current,
              start: 'top 85%',
              end: 'bottom 50%',
              scrub: true
            }
          }
        );
      } else {
        gsap.from(wordsRef.current, {
          y: 24,
          opacity: 0,
          duration: DURATION,
          ease: EASE_OUT,
          scrollTrigger: {
            trigger: wordsRef.current,
            start: 'top 90%',
            once: true
          }
        });
      }
    }
  });

  return (
    <section
      ref={sectionRef}
      id="about"
      className="bg-[#050505] text-white pt-24 pb-0 px-6 md:px-16 flex flex-col justify-center relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto w-full z-10 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-8 md:gap-12 lg:gap-24 items-center">
          <div className="flex flex-col items-center lg:items-start">
            <span className="text-[10px] md:text-[11px] uppercase tracking-[0.32em] text-gray-500 mb-4 md:mb-6">
              About me
            </span>
            <h2
              data-intro="true"
              className="text-[18vw] md:text-[9rem] lg:text-[11rem] xl:text-[13rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-300 to-gray-800 drop-shadow-2xl leading-[0.85]"
            >
              Intro
            </h2>
          </div>

          <div className="relative bg-white/5 backdrop-blur-md px-5 py-7 md:p-10 lg:p-12 rounded-3xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-white/[0.07] transition-colors duration-300 text-left">
            <p
              ref={wordsRef}
              lang="en"
              className="text-gray-300 text-[15px] sm:text-base md:text-lg lg:text-xl leading-[1.7] md:leading-relaxed font-light text-pretty hyphens-auto"
            >
              {introWords.map((item, index) => (
                <span key={index}>
                  <span className={`word ${item.className || ''}`}>{item.text}</span>
                  {index < introWords.length - 1 ? ' ' : ''}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>

      <div className="relative mt-auto -mx-6 md:-mx-16 pt-10 pb-2 bg-[#030303]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <div className="flex items-center gap-4 px-6 md:px-16 mb-6">
          <span className="text-[10px] md:text-[11px] uppercase tracking-[0.32em] text-gray-500 whitespace-nowrap">
            The stack
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></span>
        </div>

        <ul className="sr-only">
          {stackMarqueeRows
            .flatMap(row => row.items)
            .map(item => (
              <li key={item}>{item}</li>
            ))}
        </ul>

        <div className="flex flex-col gap-2.5 md:gap-3">
          {stackMarqueeRows.map(row => {
            const repeated = Array.from({ length: row.copies }, () => row.items).flat();
            const fullList = [...repeated, ...repeated];
            return (
              <div key={row.label} className="marquee-row" aria-hidden="true">
                <div
                  className="marquee-track"
                  style={{
                    '--marquee-duration': `${row.duration}s`,
                    '--marquee-direction': row.reverse ? 'reverse' : 'normal'
                  }}
                >
                  {fullList.map((tech, idx) => (
                    <span
                      key={idx}
                      className="mx-1 md:mx-1.5 inline-flex items-center gap-2.5 whitespace-nowrap rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 md:px-5 md:py-2.5 text-[13px] md:text-[15px] font-medium tracking-wide text-gray-300 transition-colors duration-300 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                    >
                      <span className="h-1 w-1 shrink-0 rounded-full bg-white/25"></span>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
