import { useState, useEffect } from 'react';
import Hero from './components/Hero';
import Navbar from './components/Navbar';
import About from './components/About';
import Services from './components/Services';
import Projects from './components/Projects';
import ComponentsShelf from './components/ComponentsShelf';
import Play from './components/Play';
import Contact from './components/Contact';

export default function App() {
  // Every width stays blank until the hero intro finishes: on phones the nav
  // brand and the burger used to be visible during the very first animation.
  // A deep link (#about) skips the wait.
  const [preloadComplete, setPreloadComplete] = useState(() => {
    if (typeof window !== 'undefined') {
      return Boolean(window.location.hash);
    }
    return false;
  });
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      setPreloadComplete(true);
    }
  }, []);

  return (
    <main>
      <Hero onPreloadComplete={() => setPreloadComplete(true)} />
      {preloadComplete && (
        <div className="animate-fade-in-up">
          <Navbar />
          <About />
          <Services />
          <Projects />
          <ComponentsShelf />
          {/* Play renders its own <section id="play">; wrapping it again doubled
              the vertical padding and produced a dead band above and below. */}
          <Play
            lines={['SAMIR', 'PURI']}
            caption="Break it if you can. It still ships."
            panelClassName="aspect-[5/6] sm:aspect-[4/3] lg:aspect-[16/9]"
          />
          <Contact />
        </div>
      )}
    </main>
  );
}
