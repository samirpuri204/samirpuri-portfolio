import { useGsapScope } from '../utils/animations';
import { developer, projects } from '../data';

export default function Projects() {
  const containerRef = useGsapScope();

  return (
    <div
      ref={containerRef}
      id="project"
      className="bg-[#050505] w-full text-white pt-10 md:pt-20 pb-24 px-6 md:px-16"
    >
      <div className="flex flex-col lg:flex-row justify-between items-start w-full z-10 gap-12 lg:gap-0 mb-20 lg:mb-32">
        <div className="w-full lg:w-7/12 overflow-visible">
          <h2
            data-reveal-lines="true"
            className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter drop-shadow-2xl leading-[0.9] uppercase whitespace-nowrap"
          >
            <span className="block overflow-hidden pb-[0.08em]">
              <span className="line flex items-center gap-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-300 to-gray-800">
                  Selected
                </span>
                <span className="font-light italic text-gray-300 lowercase font-serif pr-4 pt-2 md:pt-4">
                  work
                </span>
              </span>
            </span>
          </h2>
        </div>

        <div
          data-reveal-group="true"
          className="w-full lg:w-4/12 flex flex-col items-start lg:mt-4"
        >
          <p className="text-gray-300 text-sm md:text-base font-light leading-relaxed mb-8">
            A few things I have shipped: web platforms, Android releases and browser tools, each built end to end — schema, interface, deployment and the fixes that only show up in production.
          </p>
          <a
            href={developer.socials.github}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer px-6 py-2.5 rounded-full border border-[var(--accent)] bg-[var(--accent)] text-black font-medium text-xs md:text-sm hover:bg-[var(--accent-hover)] hover:border-[var(--accent-hover)] transition-colors flex items-center gap-2"
          >
            View GitHub
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
          </a>
        </div>
      </div>

      <div className="flex flex-col gap-24 lg:gap-40 w-full">
        {projects.map((item, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <div
              key={item.name}
              className={`flex flex-col ${
                isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } items-center justify-between gap-12 lg:gap-16 w-full group`}
            >
              {/* Image Frame */}
              <div
                data-reveal={isEven ? 'left' : 'right'}
                data-parallax-frame="true"
                className="w-full lg:w-6/12 overflow-hidden relative aspect-[16/10] bg-[#111] rounded-sm"
              >
                <img
                  src={item.image}
                  alt={item.imageAlt || item.name}
                  loading="lazy"
                  decoding="async"
                  data-parallax="24"
                  className="w-full h-[106%] -mt-[3%] object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
                />
              </div>

              {/* Text / Details */}
              <div
                data-reveal-group="0.1"
                className="w-full lg:w-5/12 flex flex-col items-start"
              >
                <span className="text-[var(--accent)] text-xs md:text-sm font-bold tracking-widest uppercase mb-4">
                  0{idx + 1}
                </span>

                <h3 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter text-white leading-[1.1] uppercase mb-6">
                  {item.title.first}{' '}
                  {item.title.accent && (
                    <span className="font-light italic text-gray-300 lowercase font-serif">
                      {item.title.accent}
                    </span>
                  )}
                  <br />
                  {item.title.second}
                </h3>

                <p className="text-gray-400 text-sm md:text-base font-light leading-relaxed mb-10">
                  {item.description}
                </p>

                <div className="flex items-center gap-4 flex-wrap">
                  <a
                    {...(item.live
                      ? { href: item.live, target: '_blank', rel: 'noopener noreferrer' }
                      : { href: '#contact' })}
                    className="cursor-pointer px-6 py-2.5 rounded-full border border-[var(--accent)] bg-[var(--accent)] text-black text-xs md:text-sm font-medium hover:bg-[var(--accent-hover)] hover:border-[var(--accent-hover)] transition-colors inline-flex items-center gap-2"
                  >
                    {item.liveLabel}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
                      />
                    </svg>
                  </a>

                  {item.repo && (
                    <a
                      href={item.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${item.name} on GitHub`}
                      className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 hover:border-white/40 transition-colors text-white"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 md:w-5 md:h-5 fill-current"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
