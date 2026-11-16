import { useState, useEffect, useRef, useCallback } from 'react';

const CHAR_EMPTY = 0;
const CHAR_SOLID = 1;
const CHAR_BROKEN = 2;
const CHAR_W = 5;
const CHAR_H = 7;
const CHAR_GAP = 1;
const LINE_GAP = 3;

const PIXEL_FONT = {
  A: '.###./#...#/#...#/#####/#...#/#...#/#...#',
  B: '####./#...#/#...#/####./#...#/#...#/####.',
  C: '.####/#..../#..../#..../#..../#..../.####',
  D: '####./#...#/#...#/#...#/#...#/#...#/####.',
  E: '#####/#..../#..../####./#..../#..../#####',
  F: '#####/#..../#..../####./#..../#..../#....',
  G: '.###./#...#/#..../#..##/#...#/#...#/.###.',
  H: '#...#/#...#/#...#/#####/#...#/#...#/#...#',
  I: '#####/..#../..#../..#../..#../..#../#####',
  J: '..###/...#./...#./...#./...#./#..#./.##..',
  K: '#...#/#..#./#.#../##.../#.#../#..#./#...#',
  L: '#..../#..../#..../#..../#..../#..../#####',
  M: '#...#/##.##/#.#.#/#...#/#...#/#...#/#...#',
  N: '#...#/##..#/#.#.#/#..##/#...#/#...#/#...#',
  O: '.###./#...#/#...#/#...#/#...#/#...#/.###.',
  P: '####./#...#/#...#/####./#..../#..../#....',
  Q: '.###./#...#/#...#/#...#/#.#.#/#..#./.##.#',
  R: '####./#...#/#...#/####./#.#../#..#./#...#',
  S: '.####/#..../#..../.###./....#/....#/####.',
  T: '#####/..#../..#../..#../..#../..#../..#..',
  U: '#...#/#...#/#...#/#...#/#...#/#...#/.###.',
  V: '#...#/#...#/#...#/#...#/#...#/.#.#./..#..',
  W: '#...#/#...#/#...#/#...#/#.#.#/##.##/#...#',
  X: '#...#/#...#/.#.#./..#../.#.#./#...#/#...#',
  Y: '#...#/#...#/.#.#./..#../..#../..#../..#..',
  Z: '#####/....#/...#./..#../.#.../#..../#####',
  0: '.###./#...#/#..##/#.#.#/##..#/#...#/.###.',
  1: '..#../.##../..#../..#../..#../..#../.###.',
  2: '.###./#...#/....#/...#./..#../.#.../#####',
  3: '#####/...#./..#../...#./....#/#...#/.###.',
  4: '...#./..##./.#.#./#..#./#####/...#./...#.',
  5: '#####/#..../####./....#/....#/#...#/.###.',
  6: '..##./.#.../#..../####./#...#/#...#/.###.',
  7: '#####/....#/...#./..#../.#.../.#.../.#...',
  8: '.###./#...#/#...#/.###./#...#/#...#/.###.',
  9: '.###./#...#/#...#/.####/....#/...#./.##..',
  '.': '...../...../...../...../...../.##../.##..',
  ',': '...../...../...../...../.##../.##../#....',
  '!': '..#../..#../..#../..#../..#../...../..#..',
  '?': '.###./#...#/....#/..##./..#../...../..#..',
  '-': '...../...../...../#####/...../...../.....',
  "'": '..#../..#../...../...../...../...../.....',
  '&': '.##../#..#./#..#./.##../#.#.#/#..#./.##.#',
  '/': '....#/....#/...#./..#../.#.../#..../#....',
  '+': '...../..#../..#../#####/..#../..#../.....',
  ':': '...../..#../..#../...../..#../..#../.....'
};

const clamp = (val, min, max) => Math.min(max, Math.max(min, val));
const measureLine = str => Math.max(0, str.length * 6 - CHAR_GAP);
const measureText = lines => ({
  w: Math.max(1, ...lines.map(measureLine)),
  h: lines.length * CHAR_H + (lines.length - 1) * LINE_GAP
});

function createGrid(lines, cols, rows, yFactor) {
  const grid = new Uint8Array(cols * rows);
  const textDim = measureText(lines);
  const startY = Math.max(0, Math.round(rows * yFactor - textDim.h / 2));

  lines.forEach((line, lineIdx) => {
    const startX = Math.round((cols - measureLine(line)) / 2);
    const rowY = startY + lineIdx * 10;

    Array.from(line.toUpperCase()).forEach((char, charIdx) => {
      const glyph = PIXEL_FONT[char];
      if (!glyph) return;
      const colX = startX + charIdx * 6;
      glyph.split('/').forEach((glyphRow, rIdx) => {
        for (let cIdx = 0; cIdx < CHAR_W; cIdx++) {
          if (glyphRow[cIdx] !== '#') continue;
          const x = colX + cIdx;
          const y = rowY + rIdx;
          if (x >= 0 && x < cols && y >= 0 && y < rows) {
            grid[y * cols + x] = CHAR_SOLID;
          }
        }
      });
    });
  });

  return grid;
}

export default function Play({
  lines = ['Hello', 'World'],
  caption = 'Break it if you can. It still ships.',
  panelClassName = 'aspect-[5/6] sm:aspect-[4/3] lg:aspect-[16/9]'
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const controllerRef = useRef(null);
  const stateRef = useRef(null);

  const [phase, setPhase] = useState('idle');
  const [lives, setLives] = useState(3);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!container || !canvas || !ctx) return;

    let animId = 0;
    let currentDim = '';
    let isVisible = true;
    let isIntersecting = false;

    const renderLayers = () => {
      const state = stateRef.current;
      if (!state) return;
      const { layerCtx, cell, gap, cols, rows, grid, ox, oy } = state;
      layerCtx.clearRect(0, 0, state.width, state.height);
      const blockSize = cell - gap;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const val = grid[r * cols + c];
          if (val !== CHAR_EMPTY) {
            layerCtx.fillStyle = val === CHAR_SOLID ? '#f2efe9' : 'rgba(242, 239, 233, 0.07)';
            layerCtx.fillRect(ox + c * cell, oy + r * cell, blockSize, blockSize);
          }
        }
      }
      state.layerDirty = false;
    };

    const drawFrame = () => {
      const state = stateRef.current;
      if (!state) return;
      if (state.layerDirty) renderLayers();

      ctx.clearRect(0, 0, state.width, state.height);
      ctx.drawImage(state.layer, 0, 0, state.width, state.height);

      if (state.phase !== 'playing' && state.phase !== 'attract') return;

      const { paddle, ball, radius } = state;
      ctx.fillStyle = state.accent;

      const px = paddle.x - paddle.w / 2;
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(px, paddle.y, paddle.w, paddle.h, paddle.h / 2);
        ctx.fill();
      } else {
        ctx.fillRect(px, paddle.y, paddle.w, paddle.h);
      }

      ctx.beginPath();
      ctx.arc(ball.x, ball.y, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    const initBoard = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      if (w < 40 || h < 40) return;
      currentDim = `${w}x${h}`;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const textDim = measureText(lines);
      const scale = Math.min((w * (w < 520 ? 0.94 : 0.88)) / textDim.w, (h * 0.56) / textDim.h);
      const cell = clamp(Math.floor(scale), 4, 26);
      const cols = Math.floor(w / cell);
      const rows = Math.floor(h / cell);
      const yFactor = clamp(0.3 + (h / w) * 0.12, 0.3, 0.44);
      const grid = createGrid(lines, cols, rows, yFactor);

      let standing = 0;
      for (let i = 0; i < grid.length; i++) {
        if (grid[i] === CHAR_SOLID) standing++;
      }

      const layer = document.createElement('canvas');
      layer.width = canvas.width;
      layer.height = canvas.height;
      const layerCtx = layer.getContext('2d');
      layerCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

      stateRef.current = {
        width: w,
        height: h,
        cell,
        cols,
        rows,
        grid,
        standing,
        ox: (w - cols * cell) / 2,
        oy: (h - rows * cell) / 2,
        gap: Math.max(1, Math.round(cell * 0.22)),
        accent: getComputedStyle(container).getPropertyValue('--accent').trim() || '#e8e4dc',
        layer,
        layerCtx,
        layerDirty: true,
        radius: clamp(cell * 0.5, 4, 9),
        paddle: {
          x: w / 2,
          w: clamp(w * 0.26, 64, 200),
          h: clamp(cell * 0.8, 5, 14),
          y: h - Math.max(26, cell * 2.4)
        },
        ball: { x: w / 2, y: 0, vx: 0, vy: 0 },
        baseSpeed: clamp(h * 0.46, 150, 420),
        serving: true,
        serveDelay: 0.6,
        lives: 3,
        phase: 'attract',
        clock: 0,
        regrow: [],
        last: 0,
        acc: 0
      };

      setPhase('attract');
      setLives(3);
      drawFrame();
    };

    const getHitBricks = () => {
      const { ball, radius, cell, cols, rows, ox, oy, grid } = stateRef.current;
      const c1 = Math.floor((ball.x - radius - ox) / cell);
      const c2 = Math.floor((ball.x + radius - ox) / cell);
      const r1 = Math.floor((ball.y - radius - oy) / cell);
      const r2 = Math.floor((ball.y + radius - oy) / cell);

      const hit = [];
      for (let r = Math.max(0, r1); r <= Math.min(rows - 1, r2); r++) {
        for (let c = Math.max(0, c1); c <= Math.min(cols - 1, c2); c++) {
          if (grid[r * cols + c] === CHAR_SOLID) {
            hit.push(r * cols + c);
          }
        }
      }
      return hit;
    };

    const stepAxis = (axis, dt) => {
      const state = stateRef.current;
      const { ball } = state;
      if (axis === 'x') ball.x += ball.vx * dt;
      else ball.y += ball.vy * dt;

      const hit = getHitBricks();
      if (!hit.length) return;

      const isAttract = state.phase === 'attract';
      hit.forEach(idx => {
        state.grid[idx] = CHAR_BROKEN;
        state.standing--;
        if (isAttract) {
          state.regrow.push({ cell: idx, at: state.clock + 1.4 });
        }
      });
      state.layerDirty = true;

      if (axis === 'x') {
        ball.x -= ball.vx * dt;
        ball.vx = -ball.vx;
      } else {
        ball.y -= ball.vy * dt;
        ball.vy = -ball.vy;
      }
    };

    const resetServe = () => {
      const state = stateRef.current;
      state.serving = true;
      state.serveDelay = 0.8;
      state.ball.vx = 0;
      state.ball.vy = 0;
    };

    const setGameOver = p => {
      stateRef.current.phase = p;
      setPhase(p);
    };

    const updatePhysics = dt => {
      const state = stateRef.current;
      const { ball, paddle, radius } = state;
      const isAttract = state.phase === 'attract';

      state.clock += dt;
      while (state.regrow.length && state.regrow[0].at <= state.clock) {
        const item = state.regrow.shift();
        if (state.grid[item.cell] === CHAR_BROKEN) {
          state.grid[item.cell] = CHAR_SOLID;
          state.standing++;
          state.layerDirty = true;
        }
      }

      if (isAttract && !state.serving) {
        paddle.x = clamp(
          paddle.x + (ball.x - paddle.x) * Math.min(1, dt * 7),
          paddle.w / 2,
          state.width - paddle.w / 2
        );
      }

      if (state.serving) {
        ball.x = paddle.x;
        ball.y = paddle.y - radius - 1;
        if (Number.isFinite(state.serveDelay)) {
          state.serveDelay -= dt;
          if (state.serveDelay <= 0) {
            state.serving = false;
            ball.vx = state.baseSpeed * 0.35 * (Math.random() < 0.5 ? -1 : 1);
            ball.vy = -state.baseSpeed;
          }
        }
        return;
      }

      stepAxis('x', dt);
      stepAxis('y', dt);

      if (ball.x - radius < 0) {
        ball.x = radius;
        ball.vx = Math.abs(ball.vx);
      }
      if (ball.x + radius > state.width) {
        ball.x = state.width - radius;
        ball.vx = -Math.abs(ball.vx);
      }
      if (ball.y - radius < 0) {
        ball.y = radius;
        ball.vy = Math.abs(ball.vy);
      }

      const overPaddle = Math.abs(ball.x - paddle.x) <= paddle.w / 2 + radius;
      const hittingPaddle =
        ball.vy > 0 && ball.y + radius >= paddle.y && ball.y - radius <= paddle.y + paddle.h;

      if (overPaddle && hittingPaddle) {
        const hitOffset = clamp((ball.x - paddle.x) / (paddle.w / 2), -1, 1) * 1.05;
        const currentSpeed = Math.min(Math.hypot(ball.vx, ball.vy) * 1.008, state.baseSpeed * 1.45);
        ball.vx = Math.sin(hitOffset) * currentSpeed;
        ball.vy = -Math.cos(hitOffset) * currentSpeed;
        ball.y = paddle.y - radius - 0.5;
      }

      if (ball.y - radius > state.height) {
        if (isAttract) {
          resetServe();
        } else {
          state.lives--;
          setLives(state.lives);
          if (state.lives <= 0) setGameOver('over');
          else resetServe();
        }
      }

      if (!isAttract && state.standing === 0) {
        setGameOver('won');
      }
    };

    const FIXED_DT = 1 / 120;
    const loop = time => {
      animId = requestAnimationFrame(loop);
      const state = stateRef.current;
      if (!state) return;

      const elapsed = state.last ? Math.min((time - state.last) / 1000, 4 * FIXED_DT) : 0;
      state.last = time;

      if (state.phase === 'playing' || state.phase === 'attract') {
        state.acc += elapsed;
        let count = 0;
        while (state.acc >= FIXED_DT && count < 4) {
          updatePhysics(FIXED_DT);
          state.acc -= FIXED_DT;
          count++;
        }
        if (count === 4) state.acc = 0;
      }
      drawFrame();
    };

    const isRunning = () => isVisible && isIntersecting;
    const startLoop = () => {
      if (!animId && isRunning()) {
        if (stateRef.current) {
          stateRef.current.last = 0;
          stateRef.current.acc = 0;
        }
        animId = requestAnimationFrame(loop);
      }
    };

    const stopLoop = () => {
      cancelAnimationFrame(animId);
      animId = 0;
    };

    controllerRef.current = {
      launch: () => {
        let state = stateRef.current;
        if (!state) return;
        if (state.phase !== 'playing') {
          initBoard();
          state = stateRef.current;
        }
        state.phase = 'playing';
        setPhase('playing');
        if (state.serving) {
          state.ball.x = state.paddle.x;
          state.ball.y = state.paddle.y - state.radius - 1;
          state.serving = false;
          state.serveDelay = Infinity;
          state.ball.vx = state.baseSpeed * 0.35;
          state.ball.vy = -state.baseSpeed;
        }
        startLoop();
      },
      movePaddleTo: clientX => {
        const state = stateRef.current;
        if (state) {
          state.paddle.x = clamp(clientX, state.paddle.w / 2, state.width - state.paddle.w / 2);
        }
      },
      nudgePaddle: delta => {
        const state = stateRef.current;
        if (state) {
          state.paddle.x = clamp(
            state.paddle.x + delta,
            state.paddle.w / 2,
            state.width - state.paddle.w / 2
          );
        }
      }
    };

    initBoard();
    startLoop();

    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const r = container.getBoundingClientRect();
        if (`${Math.round(r.width)}x${Math.round(r.height)}` !== currentDim) {
          initBoard();
        }
      }, 180);
    });
    ro.observe(container);

    const io = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting;
      if (isRunning()) startLoop();
      else stopLoop();
    }, { threshold: 0.01 });
    io.observe(container);

    const onVisibilityChange = () => {
      isVisible = document.visibilityState === 'visible';
      if (isRunning()) startLoop();
      else stopLoop();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      stopLoop();
      clearTimeout(resizeTimer);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      controllerRef.current = null;
    };
  }, [lines]);

  const ensurePlaying = useCallback(() => {
    if (stateRef.current?.phase === 'attract') {
      controllerRef.current?.launch();
      return true;
    }
    return false;
  }, []);

  const onPointerMove = useCallback(
    e => {
      const container = containerRef.current;
      if (container) {
        ensurePlaying();
        controllerRef.current?.movePaddleTo(e.clientX - container.getBoundingClientRect().left);
      }
    },
    [ensurePlaying]
  );

  const onKeyDown = useCallback(
    e => {
      const step = (stateRef.current?.cell ?? 8) * 4;
      if (e.key === 'ArrowLeft') {
        ensurePlaying();
        controllerRef.current?.nudgePaddle(-step);
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        ensurePlaying();
        controllerRef.current?.nudgePaddle(step);
        e.preventDefault();
      } else if (e.key === ' ' || e.key === 'Enter') {
        controllerRef.current?.launch();
        e.preventDefault();
      }
    },
    [ensurePlaying]
  );

  const statusLabel =
    phase === 'won' ? 'Cleared' : phase === 'over' ? 'Out of balls' : phase === 'playing' ? 'Playing' : 'Ready';

  return (
    <section id="play" className="bg-[#050505] text-white py-24 md:py-32 px-4 sm:px-6 md:px-16">
      <div className="mx-auto max-w-5xl">
        <div className="relative">
          {caption && (
            <p className="mb-5 inline-block pb-1 border-b-2 border-[var(--accent)] text-xs sm:text-sm font-medium tracking-wide text-white/80">
              {caption}
            </p>
          )}

          <div
            ref={containerRef}
            role="application"
            aria-roledescription="brick breaker"
            aria-label={`${lines.join(' ')} — a playable headline. Arrow keys move the paddle, space launches the ball.`}
            tabIndex={0}
            onPointerMove={onPointerMove}
            onPointerDown={() => controllerRef.current?.launch()}
            onKeyDown={onKeyDown}
            style={{ touchAction: phase === 'playing' ? 'none' : 'auto' }}
            className={`relative w-full ${panelClassName} select-none outline-none rounded-sm focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505] ${
              phase === 'playing' ? 'cursor-none' : 'cursor-pointer'
            }`}
          >
            <canvas ref={canvasRef} aria-hidden="true" className="block w-full h-full" />
            <h2 className="sr-only">{lines.join(' ')}</h2>
            <p aria-live="polite" className="sr-only">
              {statusLabel}
            </p>

            {phase === 'playing' && (
              <div className="absolute top-3 right-3 flex gap-1.5" aria-hidden="true">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <span
                    key={idx}
                    className={`w-2 h-2 rounded-full ${
                      idx < lives ? 'bg-[var(--accent)]' : 'bg-white/15'
                    }`}
                  />
                ))}
              </div>
            )}

            {phase !== 'playing' && (
              <div className="absolute bottom-4 right-4 flex items-center gap-4 pointer-events-none">
                {(phase === 'over' || phase === 'won') && (
                  <span
                    className={`bg-[#050505] px-2 py-1 text-xs sm:text-sm tracking-widest uppercase ${
                      phase === 'won' ? 'text-[var(--accent)]' : 'text-white/50'
                    }`}
                  >
                    {statusLabel}
                  </span>
                )}
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    controllerRef.current?.launch();
                  }}
                  className="pointer-events-auto cursor-pointer px-5 py-2 bg-[#050505] border border-[var(--accent)]/50 text-[var(--accent)] text-xs sm:text-sm tracking-[0.3em] uppercase transition-colors hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                >
                  {phase === 'over' || phase === 'won' ? 'Again' : 'Play'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
