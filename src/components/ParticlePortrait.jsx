import { useRef, useEffect } from 'react';
import gsap from 'gsap';

const ATLAS_WIDTH = 1024;
const ATLAS_HEIGHT = 640;
const TILE_PITCH_PX = 56;
const DUST_RATIO = 0.07;

const getCellPitch = width => Math.min(6, Math.max(3.5, width / 200));

const vertexShaderSource = `#version 300 es
precision highp float;

in vec2 aHome;   // 0..1 inside the anchor rect
in vec3 aAir;    // x,y 0..1 over the canvas, z = depth (0 near, 1 far)
in vec4 aInfo;   // brightness, delay, duration, phase
in vec3 aCell;   // atlas window origin (uv), kind (0 tile, 1 dust)

uniform vec2 uRes;       // canvas, CSS px
uniform vec4 uRect;      // anchor x, y, w, h in canvas CSS px
uniform float uCell;     // tile pitch, CSS px
uniform float uDpr;
uniform float uTime;     // seconds, always running
uniform float uReveal;   // seconds since play
uniform float uScatter;  // 0 = face, 1 = blown back into the air
uniform vec2 uMouse;     // CSS px, far away when absent

out vec2 vCell;
out float vBright;
out float vLand;
out float vAlpha;
out float vPhase;

float inOut(float t) { return t < 0.5 ? 4.0*t*t*t : 1.0 - pow(-2.0*t + 2.0, 3.0) / 2.0; }

void main() {
  float bright = aInfo.x;
  float delay  = aInfo.y;
  float dur    = aInfo.z;
  float phase  = aInfo.w;
  float depth  = aAir.z;
  bool dust    = aCell.z > 0.5;

  // Air position: a slow float, nearer specks drift further.
  vec2 drift = vec2(sin(uTime*0.31 + phase*6.283), cos(uTime*0.23 + phase*9.1))
             * (6.0 + 22.0*(1.0 - depth));
  vec2 air  = aAir.xy * uRes + drift;
  vec2 home = uRect.xy + aHome * uRect.zw;

  // Reveal: fade in as a speck (staggered), then fly home.
  float appear = smoothstep(0.0, 0.8, uReveal - delay*0.35);
  float fly    = dust ? 0.0 : clamp((uReveal - delay) / dur, 0.0, 1.0);
  float e      = inOut(fly);

  // Scroll: tiles leave in a ragged order rather than all at once.
  float q = clamp(uScatter*1.7 - phase*0.7, 0.0, 1.0);
  q = q*q;

  float k = e * (1.0 - q);              // 1 = sitting in the face
  vec2 pos = mix(air, home, k);

  // A curved path reads as gathered, a straight one as tweened.
  vec2 d = home - air;
  pos += vec2(-d.y, d.x) * 0.18 * sin(3.14159*k) * (phase - 0.5);

  // The pointer parts the tiles it passes over.
  vec2 m = pos - uMouse;
  float ml = length(m);
  pos += (ml > 0.001 ? m/ml : vec2(0.0)) * smoothstep(110.0, 0.0, ml) * 16.0 * k;

  float land  = smoothstep(0.55, 1.0, k);
  float speck = mix(2.2, 0.9, depth);
  float tile  = uCell * (0.25 + 0.7*bright);
  float size  = mix(speck, tile, land);

  float dustA = dust ? mix(0.55, 0.22, smoothstep(2.0, 4.0, uReveal)) : 1.0;
  vAlpha  = appear * mix(0.25 + 0.55*(1.0 - depth), 1.0, land) * dustA;
  vBright = bright;
  vLand   = land;
  vCell   = aCell.xy;
  vPhase  = phase;

  vec2 clip = pos / uRes * 2.0 - 1.0;
  gl_Position  = vec4(clip.x, -clip.y, 0.0, 1.0);
  gl_PointSize = max(size * uDpr, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;

uniform sampler2D uAtlas;
uniform vec2 uWin;     // window size in atlas uv
uniform float uTime;

in vec2 vCell;
in float vBright;
in float vLand;
in float vAlpha;
in float vPhase;
out vec4 outColor;

void main() {
  vec3 c = texture(uAtlas, vCell + gl_PointCoord * uWin).rgb;
  float peak = max(max(c.r, c.g), max(c.b, 0.06));
  vec3 hue = c / peak;
  vec3 tile = mix(hue, min(c * 1.8, 1.0), 0.35);
  tile = mix(tile, vec3(1.0), 0.15);
  float twinkle = 0.9 + 0.1*sin(uTime*1.6 + vPhase*47.0);
  tile *= (0.1 + 0.95*vBright) * twinkle;

  vec3 speck = vec3(0.9, 0.92, 1.0);
  vec3 rgb = mix(speck, tile, vLand);
  outColor = vec4(rgb * vAlpha, vAlpha);
}
`;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(info || 'Shader compilation error');
  }
  return shader;
}

const CROP_BOXES = [
  [0.26, 0.17, 0.48, 0.37],
  [0.53, 0.08, 0.15, 0.55],
  [0.4, 0.14, 0.16, 0.72],
  [0.2, 0.22, 0.4, 0.4]
];

function buildAtlas(thumbImages) {
  const canvas = document.createElement('canvas');
  canvas.width = ATLAS_WIDTH;
  canvas.height = ATLAS_HEIGHT;
  const ctx = canvas.getContext('2d');
  const halfW = ATLAS_WIDTH / 2;
  const halfH = ATLAS_HEIGHT / 2;

  thumbImages.slice(0, 4).forEach((img, idx) => {
    const [cx, cy, cw, ch] = CROP_BOXES[idx] || [0, 0, 1, 1];
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    const dx = (idx % 2) * halfW;
    const dy = Math.floor(idx / 2) * halfH;
    ctx.drawImage(img, cx * nw, cy * nh, cw * nw, ch * nh, dx, dy, halfW, halfH);
  });

  return canvas;
}

function smoothHermite(min, max, value) {
  const t = Math.min(1, Math.max(0, (value - min) / (max - min)));
  return t * t * (3 - 2 * t);
}

function generateParticles(faceImg, width, crop) {
  const pitch = getCellPitch(width);
  const cols = Math.max(20, Math.round(width / pitch));
  const rows = Math.round((cols * faceImg.naturalHeight) / faceImg.naturalWidth);

  const sampleCanvas = document.createElement('canvas');
  sampleCanvas.width = cols;
  sampleCanvas.height = rows;
  const sCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });
  sCtx.imageSmoothingQuality = 'high';
  sCtx.drawImage(faceImg, 0, 0, cols, rows);

  const data = sCtx.getImageData(0, 0, cols, rows).data;
  const homes = [];
  const airs = [];
  const infos = [];
  const cells = [];
  const cellUvW = TILE_PITCH_PX / ATLAS_WIDTH;
  const cellUvH = TILE_PITCH_PX / ATLAS_HEIGHT;
  let maxSettleTime = 0;

  const addParticle = (hx, hy, bright, isDust) => {
    homes.push(hx, hy);
    airs.push(Math.random() * 1.2 - 0.1, Math.random() * 1.2 - 0.1, Math.random());

    const delay = 0.35 + Math.random() * 1 + hy * 0.45;
    const dur = 1.35 + Math.random() * 0.55;
    if (!isDust) {
      maxSettleTime = Math.max(maxSettleTime, delay + dur);
    }
    infos.push(bright, delay, dur, Math.random());
    cells.push(Math.random() * (1 - cellUvW), Math.random() * (1 - cellUvH), isDust ? 1 : 0);
  };

  const luminances = new Float32Array(cols * rows);
  for (let i = 0; i < cols * rows; i++) {
    const p = i * 4;
    luminances[i] =
      ((0.2126 * data[p] + 0.7152 * data[p + 1] + 0.0722 * data[p + 2]) / 255) *
      (data[p + 3] / 255);
  }

  const valid = Array.from(luminances)
    .filter(val => val >= 0.035)
    .sort((a, b) => a - b);
  const lowP = valid[Math.floor(valid.length * 0.02)] ?? 0;
  const highP = valid[Math.floor(valid.length * 0.97)] ?? 1;
  const maxRow = Math.min(rows, Math.ceil(rows * crop));

  for (let r = 0; r < maxRow; r++) {
    for (let c = 0; c < cols; c++) {
      const lum = luminances[r * cols + c];
      if (lum < 0.035 || (lum < 0.08 && Math.random() < 0.45)) continue;
      const norm = Math.min(1, Math.max(0, (lum - lowP) / (highP - lowP)));
      const adjusted = 0.2 * norm + 0.8 * smoothHermite(0.1, 0.55, norm);
      addParticle((c + 0.5) / cols, (r + 0.5) / rows, adjusted, false);
    }
  }

  const coreCount = homes.length / 2;
  const dustTotal = Math.round(coreCount * DUST_RATIO);
  for (let i = 0; i < dustTotal; i++) {
    addParticle(0.5, 0.5, 0.3, true);
  }

  return {
    settle: maxSettleTime,
    cell: pitch,
    count: homes.length / 2,
    home: new Float32Array(homes),
    air: new Float32Array(airs),
    info: new Float32Array(infos),
    cellAttr: new Float32Array(cells)
  };
}

export default function ParticlePortrait({
  src,
  thumbs,
  anchorRef,
  play,
  label,
  className = ''
}) {
  const canvasRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (play && startTimeRef.current === null) {
      const reducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      startTimeRef.current = performance.now() / 1000 - (reducedMotion ? 100 : 0);
    }
  }, [play]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const anchor = anchorRef.current;
    if (!canvas || !anchor) return;

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false
    });

    const fallback = () => {
      anchor.style.visibility = 'visible';
      canvas.style.display = 'none';
    };

    if (!gl) {
      fallback();
      return;
    }

    let isDisposed = false;
    let isTickerActive = false;
    let isVisible = true;
    let particleCount = 0;
    let cellPitch = 6;
    let settleDuration = 0;
    let cachedAnchorWidth = -1;
    let faceImage = null;
    const originTime = performance.now() / 1000;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

    let program;
    try {
      program = gl.createProgram();
      gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource));
      gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) || 'Program link error');
      }
    } catch (err) {
      console.error(err);
      fallback();
      return;
    }

    gl.useProgram(program);
    const getLoc = name => gl.getUniformLocation(program, name);
    const uniforms = {
      res: getLoc('uRes'),
      rect: getLoc('uRect'),
      cell: getLoc('uCell'),
      dpr: getLoc('uDpr'),
      time: getLoc('uTime'),
      reveal: getLoc('uReveal'),
      scatter: getLoc('uScatter'),
      mouse: getLoc('uMouse'),
      atlas: getLoc('uAtlas'),
      win: getLoc('uWin')
    };

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const attribNames = ['aHome', 'aAir', 'aInfo', 'aCell'];
    const attribSizes = [2, 3, 4, 3];
    const buffers = attribNames.map((name, i) => {
      const buf = gl.createBuffer();
      const loc = gl.getAttribLocation(program, name);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, attribSizes[i], gl.FLOAT, false, 0, 0);
      return buf;
    });

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.uniform2f(uniforms.win, TILE_PITCH_PX / ATLAS_WIDTH, TILE_PITCH_PX / ATLAS_HEIGHT);

    const rebuildMesh = () => {
      const aRect = anchor.getBoundingClientRect();
      const width = aRect.width;
      if (!faceImage || width < 10 || Math.abs(width - cachedAnchorWidth) < 1) return;
      cachedAnchorWidth = width;

      const cRect = canvas.getBoundingClientRect();
      const crop = Math.max(0, Math.min(1, (cRect.bottom - aRect.top) / aRect.height));
      const result = generateParticles(faceImage, width, crop);

      particleCount = result.count;
      cellPitch = result.cell;
      settleDuration = result.settle;

      [result.home, result.air, result.info, result.cellAttr].forEach((dataArray, i) => {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers[i]);
        gl.bufferData(gl.ARRAY_BUFFER, dataArray, gl.STATIC_DRAW);
      });
    };

    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
    const onPointerMove = e => {
      const r = canvas.getBoundingClientRect();
      mouse.tx = e.clientX - r.left;
      mouse.ty = e.clientY - r.top;
      if (mouse.x < -999) {
        mouse.x = mouse.tx;
        mouse.y = mouse.ty;
      }
    };
    const onPointerLeave = () => {
      mouse.tx = mouse.ty = -9999;
      mouse.x = mouse.y = -9999;
    };

    const renderFrame = () => {
      if (!particleCount || startTimeRef.current === null) {
        gl.clear(gl.COLOR_BUFFER_BIT);
        return;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cRect = canvas.getBoundingClientRect();
      const pw = Math.round(cRect.width * dpr);
      const ph = Math.round(cRect.height * dpr);

      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw;
        canvas.height = ph;
      }

      rebuildMesh();

      const aRect = anchor.getBoundingClientRect();
      const now = performance.now() / 1000;
      const scatter = reducedMotion
        ? 0
        : Math.min(1, Math.max(0, -cRect.top / (cRect.height * 0.7)));

      mouse.x += (mouse.tx - mouse.x) * 0.18;
      mouse.y += (mouse.ty - mouse.y) * 0.18;

      gl.viewport(0, 0, pw, ph);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform2f(uniforms.res, cRect.width, cRect.height);
      gl.uniform4f(
        uniforms.rect,
        aRect.left - cRect.left,
        aRect.top - cRect.top,
        aRect.width,
        aRect.height
      );
      gl.uniform1f(uniforms.cell, cellPitch);
      gl.uniform1f(uniforms.dpr, dpr);
      gl.uniform1f(uniforms.time, now - originTime);
      gl.uniform1f(uniforms.reveal, now - startTimeRef.current);
      gl.uniform1f(uniforms.scatter, scatter);
      gl.uniform2f(uniforms.mouse, mouse.x, mouse.y);

      gl.drawArrays(gl.POINTS, 0, particleCount);
    };

    const setTickerRunning = shouldRun => {
      if (shouldRun !== isTickerActive) {
        isTickerActive = shouldRun;
        if (shouldRun) {
          gsap.ticker.add(renderFrame);
        } else {
          gsap.ticker.remove(renderFrame);
        }
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      setTickerRunning(isVisible && particleCount > 0);
    });
    observer.observe(canvas);

    Promise.all([loadImage(src), Promise.all(thumbs.map(loadImage))])
      .then(([face, thumbImgs]) => {
        if (isDisposed) return;
        faceImage = face;

        const texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          buildAtlas(thumbImgs)
        );
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.uniform1i(uniforms.atlas, 0);

        rebuildMesh();
        setTickerRunning(isVisible && particleCount > 0);
      })
      .catch(err => {
        console.error('ParticlePortrait image load error:', err);
        fallback();
      });

    if (hasFinePointer) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      document.addEventListener('pointerleave', onPointerLeave);
    }

    return () => {
      isDisposed = true;
      setTickerRunning(false);
      observer.disconnect();
      if (hasFinePointer) {
        window.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerleave', onPointerLeave);
      }
      buffers.forEach(b => gl.deleteBuffer(b));
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
    };
  }, [src, thumbs, anchorRef]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={label}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
}
