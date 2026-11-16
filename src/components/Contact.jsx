import { useState } from 'react';
import { useGsapScope, gsap, EASE_OUT } from '../utils/animations';
import { developer, footerLinks } from '../data';

export default function Contact() {
  const [copied, setCopied] = useState(false);

  const containerRef = useGsapScope(({ scope, desktop }) => {
    const panel = scope.querySelector('[data-contact-panel]');
    if (!panel) return;

    gsap.timeline({
      scrollTrigger: {
        trigger: panel,
        start: 'top 85%',
        once: true
      }
    })
      .from(panel, {
        y: 48,
        opacity: 0,
        duration: 1.1,
        ease: EASE_OUT
      })
      .from(
        panel.querySelectorAll('[data-row-inner]'),
        {
          yPercent: 105,
          opacity: 0,
          duration: 0.85,
          ease: EASE_OUT,
          stagger: 0.08
        },
        '-=0.75'
      );

    if (desktop) {
      gsap.fromTo(
        panel,
        { yPercent: 3.5 },
        {
          yPercent: -3.5,
          ease: 'none',
          scrollTrigger: {
            trigger: scope,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
          }
        }
      );
    }

    if (window.matchMedia('(pointer: fine)').matches) {
      scope.querySelectorAll('[data-magnetic]').forEach(el => {
        const factor = parseFloat(el.dataset.magnetic) || 0.3;
        const toX = gsap.quickTo(el, 'x', { duration: 0.55, ease: 'power3.out' });
        const toY = gsap.quickTo(el, 'y', { duration: 0.55, ease: 'power3.out' });

        const onMove = e => {
          const rect = el.getBoundingClientRect();
          toX((e.clientX - (rect.left + rect.width / 2)) * factor);
          toY((e.clientY - (rect.top + rect.height / 2)) * factor);
        };
        const onLeave = () => {
          toX(0);
          toY(0);
        };

        el.addEventListener('pointermove', onMove);
        el.addEventListener('pointerleave', onLeave);
        el.addEventListener('blur', onLeave);
      });
    }
  });

  const copyEmail = () => {
    navigator.clipboard?.writeText(developer.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappUrl = `https://wa.me/${developer.whatsapp}?text=Hi%20Samir%2C%20I%20found%20your%20portfolio%20and%20I'd%20like%20to%20talk.`;

  return (
    <div
      ref={containerRef}
      id="contact"
      className="relative min-h-screen text-white font-sans flex flex-col overflow-hidden [clip-path:inset(0)]"
    >
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        className="fixed top-0 left-0 w-full h-[100vh] object-cover z-0"
      >
        <source src="./assets/contact_bg-BZTj-iD6.mp4" type="video/mp4" />
      </video>

      {/* Dark gradient overlays */}
      <div className="absolute inset-0 z-0 bg-black/70 pointer-events-none" />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/60 via-transparent to-black/85 pointer-events-none" />

      {/* Main Content Grid */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-16 pt-20 md:pt-28 pb-16 flex-1 flex items-center">
        <div className="w-full flex flex-col lg:flex-row gap-14 lg:gap-24">
          {/* Left Column: CTA & Info */}
          <div className="w-full lg:w-6/12 flex flex-col">
            <div data-reveal="true" className="mb-7">
              <span className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.06] backdrop-blur-md px-3.5 py-1.5 text-[10px] md:text-[11px] uppercase tracking-[0.26em] text-gray-300">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-halo" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                Available for work
              </span>
            </div>

            <h2
              data-reveal-lines="true"
              className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter drop-shadow-2xl mb-7 leading-[0.95]"
            >
              <span className="block overflow-hidden pb-[0.08em]">
                <span className="line block text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-300 to-gray-800">
                  Get in touch
                </span>
              </span>
            </h2>

            <p
              data-reveal="true"
              data-reveal-delay="0.15"
              className="text-gray-300 text-base md:text-lg font-light leading-relaxed max-w-md"
            >
              Open to freelance projects, full-time roles and product collaborations. I build web
              apps, mobile apps and AI-powered tools — from database to deployed product. WhatsApp
              gets the fastest reply.
            </p>

            <div data-reveal-group="0.12" className="flex flex-wrap gap-3 mt-10">
              <a
                data-magnetic="0.28"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group px-6 py-3.5 rounded-full bg-[var(--accent)] text-black text-sm font-medium inline-flex items-center gap-2.5 shadow-lg shadow-black/30 transition-[background-color,box-shadow] duration-300 ease-out hover:bg-[var(--accent-hover)] hover:shadow-xl hover:shadow-black/40"
              >
                Message on WhatsApp
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 transition-transform duration-300 ease-out group-hover:scale-110"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.41a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.44.12-.14.2-.31.3-.47.1-.16.05-.3-.02-.42-.08-.12-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.23.25-.87.85-.87 2.08 0 1.22.89 2.4 1.01 2.57.13.16 1.76 2.68 4.26 3.76.59.26 1.06.41 1.42.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right Column: Contact Panel */}
          <div className="w-full lg:w-6/12">
            <div
              data-contact-panel="true"
              className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col divide-y divide-white/10"
            >
              {/* Email */}
              <div data-row-inner="true" className="pb-6">
                <span className="text-[10px] md:text-[11px] uppercase tracking-[0.26em] text-gray-400 block mb-2">
                  Email
                </span>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <a
                    href={`mailto:${developer.email}`}
                    className="text-lg md:text-xl font-medium text-white hover:text-[var(--accent)] transition-colors break-all"
                  >
                    {developer.email}
                  </a>
                  <button
                    type="button"
                    onClick={copyEmail}
                    className="px-3 py-1 rounded-full border border-white/20 text-xs text-gray-300 hover:text-white hover:border-white/40 transition-colors cursor-pointer"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* WhatsApp */}
              <div data-row-inner="true" className="py-6">
                <span className="text-[10px] md:text-[11px] uppercase tracking-[0.26em] text-gray-400 block mb-2">
                  WhatsApp
                </span>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg md:text-xl font-medium text-white hover:text-[var(--accent)] transition-colors"
                >
                  {developer.whatsappDisplay}
                </a>
              </div>

              {/* Website */}
              <div data-row-inner="true" className="py-6">
                <span className="text-[10px] md:text-[11px] uppercase tracking-[0.26em] text-gray-400 block mb-2">
                  Website
                </span>
                <a
                  href={developer.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg md:text-xl font-medium text-white hover:text-[var(--accent)] transition-colors break-all"
                >
                  {developer.urlLabel}
                </a>
              </div>

              {/* Location */}
              <div data-row-inner="true" className="py-6">
                <span className="text-[10px] md:text-[11px] uppercase tracking-[0.26em] text-gray-400 block mb-2">
                  Location
                </span>
                <p className="text-base md:text-lg text-white font-medium">{developer.location}</p>
              </div>

              {/* Elsewhere */}
              <div data-row-inner="true" className="pt-6">
                <span className="text-[10px] md:text-[11px] uppercase tracking-[0.26em] text-gray-400 block mb-4">
                  Elsewhere
                </span>
                <div className="flex items-center gap-3">
                  {/* Website */}
                  <a
                    data-magnetic="0.35"
                    href={developer.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Website"
                    title={developer.urlLabel}
                    className="w-11 h-11 rounded-full border border-white/10 bg-white/[0.07] flex items-center justify-center transition-[background-color,color,border-color] duration-300 ease-out hover:bg-white hover:text-black hover:border-white"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="M3 12h18M12 3c2.6 2.6 2.6 15.4 0 18M12 3C9.4 5.6 9.4 18.4 12 21" />
                    </svg>
                  </a>

                  {/* GitHub */}
                  <a
                    data-magnetic="0.35"
                    href={developer.socials.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                    title="GitHub"
                    className="w-11 h-11 rounded-full border border-white/10 bg-white/[0.07] flex items-center justify-center transition-[background-color,color,border-color] duration-300 ease-out hover:bg-white hover:text-black hover:border-white"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 fill-current"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                  </a>

                  {/* Facebook */}
                  <a
                    data-magnetic="0.35"
                    href={developer.socials.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    title="Facebook"
                    className="w-11 h-11 rounded-full border border-white/10 bg-white/[0.07] flex items-center justify-center transition-[background-color,color,border-color] duration-300 ease-out hover:bg-white hover:text-black hover:border-white"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 fill-current"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.01 3.66 9.17 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.45 2.9h-2.33V22c4.78-.77 8.44-4.93 8.44-9.94z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-16 pb-9">
        <div className="border-t border-white/10 pt-6 flex flex-col-reverse md:flex-row md:items-center justify-between gap-5 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} {developer.name}. All rights reserved.</p>
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {footerLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-white transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
            <span className="hidden md:inline h-3 w-px bg-white/15" aria-hidden="true" />
            <a
              href={developer.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors duration-300"
            >
              {developer.urlLabel}
            </a>
            <a
              href={developer.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors duration-300"
            >
              GitHub
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors duration-300"
            >
              WhatsApp
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
