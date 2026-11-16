# Samir Puri — Portfolio

Source for **https://samirpuri.com.np** — the personal site of Samir Puri, a full-stack developer in Nepal.

React 19 + Vite + GSAP 3, with a WebGL 2 particle portrait built from a custom shader and a tile atlas of project imagery.

## Stack

| Layer | Choice |
| --- | --- |
| UI | React 19 |
| Build | Vite 6 |
| Animation | GSAP 3 (timelines, ScrollTrigger) + a custom Wordmark timeline |
| Hero visual | WebGL 2 (`GL_POINTS`, GLSL vertex/fragment shaders) |
| Styles | Precompiled Tailwind CSS with a small hand-written utility layer |

## Structure

```
src/
  components/     Hero, Navbar, About, Services, Projects, ComponentsShelf, Play, Contact, Wordmark, ParticlePortrait
  data.js         Profile, contact links, copy and project content
  utils/          Shared GSAP helpers (reveals, parallax, matchMedia)
  index.css       Compiled Tailwind + site utilities
public/
  assets/         Portrait, project screenshots, social card
design/
  og-card.html    Source for the 1200x630 social share card
```

## Run it

```bash
npm install
npm run dev      # local development
npm run build    # production build -> dist/ (plus dist/portfolio/)
npm run preview  # preview the production build
```

## Hero intro

The hero opens with a letter-by-letter wordmark:

1. A dot drops with squash and stretch and bounces elastically.
2. The pivot letter lands, then the remaining letters are flung in from a lever and settle.
3. The wordmark morphs `SAMIR` → `SAMIRPURI` letter by letter.
4. The two halves split apart; the particle portrait assembles behind them.

The intro runs identically at every viewport width. Split offsets are pixel values derived from the painted width, so they are recomputed on resize and orientation change. Users with `prefers-reduced-motion: reduce` land directly on the composed hero.

## Notes

- The page is client-rendered; `robots.txt`, `sitemap.xml`, canonical, Open Graph / Twitter metadata and Person + WebSite JSON-LD are in place.
- Deployed on Vercel from this directory (`npm run build`, output `dist`).

## Licence

Site content © Samir Puri. The animation system derives from a licensed template — see the license terms of that template before reusing the motion code elsewhere.
