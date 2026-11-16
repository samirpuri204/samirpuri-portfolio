import { useState, useEffect, useRef, useCallback } from 'react';
import { developer, navLinks } from '../data';

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const ticking = useRef(false);
  const menuButtonRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Scroll listener for progress and header background
  useEffect(() => {
    const updateScroll = () => {
      const y = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(y > 24);
      setScrollProgress(docHeight > 0 ? Math.min(y / docHeight, 1) : 0);
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        window.requestAnimationFrame(updateScroll);
      }
    };

    updateScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Active section observer
  useEffect(() => {
    const sections = navLinks
      .map(id => document.getElementById(id.toLowerCase()))
      .filter(Boolean);

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );

    sections.forEach(sec => observer.observe(sec));
    return () => observer.disconnect();
  }, []);

  // Lock body scroll when the menu is open
  useEffect(() => {
    if (!isMenuOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMenuOpen]);

  // Close menu on Escape key
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleKeyDown = e => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  return (
    <>
      <nav
        aria-label="Main"
        className={`fixed top-0 left-0 w-full z-50 transition-[transform,opacity,background-color,border-color,backdrop-filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          mounted ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        } ${
          isMenuOpen || scrolled
            ? 'bg-black/70 backdrop-blur-xl border-b border-white/10'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 md:px-12 md:py-6">
          <a
            href="#home"
            aria-label={developer.name}
            onClick={closeMenu}
            className="group relative z-50 text-white font-black text-lg md:text-2xl tracking-wider md:tracking-widest uppercase leading-none whitespace-nowrap rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-4 focus-visible:ring-offset-black"
          >
            <span
              aria-hidden="true"
              className="inline-block transition-colors duration-300 group-hover:text-[var(--accent)]"
            >
              {developer.firstName}
              <span className="inline-block overflow-hidden align-bottom">
                <span className="inline-block translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none group-hover:translate-x-1">
                  &nbsp;{developer.lastName}
                </span>
              </span>
            </span>
            <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-[var(--accent)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none group-hover:scale-x-100"></span>
          </a>

          {/* Desktop navigation */}
          <ul className="hidden lg:flex items-center gap-6">
            {navLinks.map(link => {
              const linkId = link.toLowerCase();
              const isActive = activeSection === linkId;
              return (
                <li key={link}>
                  <a
                    href={`#${linkId}`}
                    aria-current={isActive ? 'true' : undefined}
                    className={`group relative block py-1 text-sm uppercase tracking-wider font-medium transition-colors duration-300 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-4 focus-visible:ring-offset-black ${
                      isActive ? 'text-[var(--accent)]' : 'text-gray-300 hover:text-[var(--accent)]'
                    }`}
                  >
                    {link}
                    <span
                      className={`absolute -bottom-0.5 left-0 h-px w-full bg-[var(--accent)] origin-left transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                        isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                    ></span>
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Desktop contact action */}
          <a
            href="#contact"
            className="hidden lg:inline-flex ml-4 px-5 py-2.5 rounded-full bg-[var(--accent)] text-black text-xs font-bold uppercase tracking-[0.15em] hover:bg-[var(--accent-hover)] transition-colors whitespace-nowrap"
          >
            Contact
          </a>

          {/* Mobile menu button */}
          <button
            ref={menuButtonRef}
            type="button"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsMenuOpen(prev => !prev)}
            className="lg:hidden relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <span
              className={`block h-px w-6 bg-current transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                isMenuOpen ? 'translate-y-[3.5px] rotate-45' : ''
              }`}
            ></span>
            <span
              className={`block h-px w-6 bg-current transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                isMenuOpen ? '-translate-y-[3.5px] -rotate-45' : ''
              }`}
            ></span>
          </button>
        </div>

        {/* Scroll progress bar */}
        <div
          aria-hidden="true"
          className="h-px w-full origin-left bg-[var(--accent)] transition-opacity duration-300 opacity-60"
          style={{ transform: `scaleX(${scrollProgress})` }}
        ></div>
      </nav>

      {/* Fullscreen menu */}
      <div
        id="mobile-menu"
        aria-hidden={!isMenuOpen}
        className={`fixed inset-0 z-40 flex flex-col items-center justify-center bg-[#0a0a0a] transition-[opacity,visibility] duration-500 ease-out motion-reduce:transition-none lg:hidden ${
          isMenuOpen ? 'visible opacity-100 pointer-events-auto' : 'invisible opacity-0 pointer-events-none'
        }`}
      >
        <ul className="flex flex-col items-center gap-8">
          {navLinks.map((link, idx) => {
            const linkId = link.toLowerCase();
            return (
              <li
                key={link}
                className={`transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                  isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                }`}
                style={{ transitionDelay: `${idx * 60}ms` }}
              >
                <a
                  href={`#${linkId}`}
                  onClick={closeMenu}
                  className="block text-3xl font-black uppercase tracking-widest text-white transition-colors duration-300 hover:text-[var(--accent)] active:text-[var(--accent)] outline-none focus-visible:text-[var(--accent)]"
                >
                  {link}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <a
            href={`https://wa.me/${developer.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs uppercase tracking-[0.2em] text-gray-300 hover:text-white transition-colors"
          >
            WhatsApp {developer.whatsappDisplay}
          </a>
          <a
            href={developer.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs uppercase tracking-[0.2em] text-gray-300 hover:text-white transition-colors"
          >
            {developer.urlLabel}
          </a>
          <a
            href={developer.socials.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs uppercase tracking-[0.2em] text-gray-300 hover:text-white transition-colors"
          >
            {developer.socials.github.replace('https://', '')}
          </a>
        </div>
      </div>
    </>
  );
}
