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
  const [preloadComplete, setPreloadComplete] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024 || Boolean(window.location.hash);
    }
    return false;
  });
  useEffect(() => {
    if (typeof window !== 'undefined' && (window.innerWidth < 1024 || window.location.hash)) {
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
          <section id="play" className="bg-[#050505] text-white py-24 md:py-32 px-4 sm:px-6 md:px-16">
            <div className="mx-auto max-w-5xl">
              <Play
                lines={['SAMIR', 'PURI']}
                caption="Break it if you can. It still ships."
                panelClassName="aspect-[5/6] sm:aspect-[4/3] lg:aspect-[16/9]"
              />
            </div>
          </section>
          <Contact />
        </div>
      )}
    </main>
  );
}
