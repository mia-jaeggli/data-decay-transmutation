/* ═══════════════════════════════════════════════════════
   rd-engine.js — Gray-Scott reaction-diffusion engine
   Adapted from ~/projects/RD-simulator/rd-studio.js.
   UI controls, sliders, palettes, and export have been
   removed — parameters are baked in by each project's
   sketch.js via the config object below.
   ═══════════════════════════════════════════════════════ */

'use strict';

// createRDEngine(canvas, seedImage, config) → { start, stop, reset }
//
// seedImage must already be a loaded (complete) image element —
// the engine does not load images itself. The canvas's own
// width/height determine the display resolution.
function createRDEngine(canvas, seedImage, config) {
  const cfg = Object.assign({
    // Gray-Scott reaction constants
    feed: 0.037,
    kill: 0.065,
    dA: 1.0,
    dB: 0.5,
    seedModulatesDiffusion: false,

    // Grid resolution relative to display size, and sim speed
    simScale: 2,
    stepsPerFrame: 6,

    // How the seed image is read into the initial B concentration
    // 'brightness' | 'inverse-brightness' | 'threshold' | 'edge'
    seedingMode: 'brightness',
    threshold: 128,
    seedStrength: 1,
    seedCoverage: 0.5,

    // How B concentration displaces pixels when rendering
    // 'b-gradient' | 'b-gradient-inverse' | 'b-value' | 'b-curl' | 'b-as-index'
    displacementMode: 'b-gradient',
    displacementStrength: 10,
    fixedAngleDeg: 0,

    // Whether displacement compounds frame-over-frame, or is
    // always recomputed fresh from the untouched seed
    accumulate: true,

    // Fill used when a displaced sample falls outside the frame
    // 'black' | 'white' | 'seed-mean' | 'transparent'
    bgFill: 'black',
  }, config);

  const fixedAngle = cfg.fixedAngleDeg * Math.PI / 180;
  const ctx = canvas.getContext('2d');

  let displayW = 0, displayH = 0;
  let simW = 0, simH = 0;

  let gridA = null, gridB = null;
  let nextA = null, nextB = null;

  let seedPixelsDisplay = null;  // display-res canonical original
  let workingPixels = null;      // display-res, accumulating damage
  let seedLuminance = null;
  let seedGradientMag = null;
  let seedMeanColor = [128, 128, 128];

  let displayImageData = null;
  let running = false;
  let rafId = null;

  // ── Gray-Scott simulation step ─────────────────────────
  function simulationStep() {
    const F = cfg.feed, K = cfg.kill;
    const dA_base = cfg.dA, dB_base = cfg.dB;
    const modulate = cfg.seedModulatesDiffusion;

    for (let y = 1; y < simH - 1; y++) {
      const row = y * simW;
      for (let x = 1; x < simW - 1; x++) {
        const i = row + x;
        const iL = i - 1, iR = i + 1, iU = i - simW, iD = i + simW;

        const a = gridA[i], b = gridB[i];

        let dA = dA_base, dB = dB_base;
        if (modulate) {
          const gm = Math.min(1, seedGradientMag[i] * 3);
          dA = dA_base * (1 + gm * 0.5);
          dB = dB_base * (1 - gm * 0.4);
        }

        const lapA =
          gridA[iL] * 0.2 + gridA[iR] * 0.2 + gridA[iU] * 0.2 + gridA[iD] * 0.2 +
          gridA[iU - 1] * 0.05 + gridA[iU + 1] * 0.05 +
          gridA[iD - 1] * 0.05 + gridA[iD + 1] * 0.05 - a;

        const lapB =
          gridB[iL] * 0.2 + gridB[iR] * 0.2 + gridB[iU] * 0.2 + gridB[iD] * 0.2 +
          gridB[iU - 1] * 0.05 + gridB[iU + 1] * 0.05 +
          gridB[iD - 1] * 0.05 + gridB[iD + 1] * 0.05 - b;

        const rxn = a * b * b;
        let na = a + (dA * lapA - rxn + F * (1 - a));
        let nb = b + (dB * lapB + rxn - (K + F) * b);

        if (na < 0) na = 0; else if (na > 1) na = 1;
        if (nb < 0) nb = 0; else if (nb > 1) nb = 1;
        nextA[i] = na;
        nextB[i] = nb;
      }
    }
    [gridA, nextA] = [nextA, gridA];
    [gridB, nextB] = [nextB, gridB];
  }

  // ── Per-pixel displacement vector [dx, dy] in display px ──
  function computeDisplacement(x, y) {
    const sx = Math.min(simW - 2, Math.max(1, Math.floor(x * simW / displayW)));
    const sy = Math.min(simH - 2, Math.max(1, Math.floor(y * simH / displayH)));
    const i = sy * simW + sx;

    const gx = gridB[i + 1] - gridB[i - 1];
    const gy = gridB[i + simW] - gridB[i - simW];
    const bVal = gridB[i];
    const str = cfg.displacementStrength;

    switch (cfg.displacementMode) {
      case 'b-gradient':         return [gx * str * 20, gy * str * 20];
      case 'b-gradient-inverse': return [-gx * str * 20, -gy * str * 20];
      case 'b-value':
        return [Math.cos(fixedAngle) * bVal * str,
                Math.sin(fixedAngle) * bVal * str];
      case 'b-curl':             return [-gy * str * 20, gx * str * 20];
      case 'b-as-index':         return [gx * str * 20, gy * str * 20];
      default:                   return [0, 0];
    }
  }

  // ── Bilinear sample from a pixel buffer into out[opi] ──
  function sampleBilinear(src, fx, fy, out, opi) {
    if (fx < 0 || fx >= displayW - 1 || fy < 0 || fy >= displayH - 1) {
      fillPixel(out, opi); return;
    }
    const x0 = fx | 0, y0 = fy | 0;
    const wx = fx - x0, wy = fy - y0;
    const i00 = (y0 * displayW + x0) * 4;
    const i10 = i00 + 4;
    const i01 = i00 + displayW * 4;
    const i11 = i01 + 4;
    for (let c = 0; c < 3; c++) {
      out[opi + c] =
        src[i00 + c] * (1 - wx) * (1 - wy) +
        src[i10 + c] * wx       * (1 - wy) +
        src[i01 + c] * (1 - wx) * wy +
        src[i11 + c] * wx       * wy;
    }
    out[opi + 3] = 255;
  }

  // ── Background fill helpers ────────────────────────────
  function getBgRGBA() {
    switch (cfg.bgFill) {
      case 'white':       return [255, 255, 255, 255];
      case 'seed-mean':   return [...seedMeanColor, 255];
      case 'transparent': return [0, 0, 0, 0];
      default:            return [0, 0, 0, 255];  // black
    }
  }

  function fillPixel(buf, idx) {
    const [r, g, b, a] = getBgRGBA();
    buf[idx] = r; buf[idx + 1] = g; buf[idx + 2] = b; buf[idx + 3] = a;
  }

  // ── Apply backward-only displacement ──────────────────
  function applyDisplacement() {
    if (!workingPixels) return;
    const src = cfg.accumulate ? workingPixels : seedPixelsDisplay;
    const out = cfg.accumulate
      ? new Uint8ClampedArray(workingPixels.length)
      : workingPixels;

    // Backward sampling: for each output pixel, pull from source at (x-dx, y-dy)
    for (let y = 0; y < displayH; y++) {
      for (let x = 0; x < displayW; x++) {
        const [dx, dy] = computeDisplacement(x, y);
        sampleBilinear(src, x - dx, y - dy, out, (y * displayW + x) * 4);
      }
    }

    if (cfg.accumulate) workingPixels.set(out);
  }

  // ── Full render frame ──────────────────────────────────
  function renderFrame() {
    if (!workingPixels || !displayImageData) return;
    applyDisplacement();
    displayImageData.data.set(workingPixels);
    ctx.putImageData(displayImageData, 0, 0);
  }

  // ── Seed → chemical B grid ─────────────────────────────
  function applySeedingMode() {
    const { seedStrength: str, seedCoverage: cov, threshold: thresh, seedingMode: mode } = cfg;
    const n = simW * simH;
    const raw = new Float32Array(n);

    for (let i = 0; i < n; i++) {
      const lum = seedLuminance[i];
      switch (mode) {
        case 'brightness':         raw[i] = lum; break;
        case 'inverse-brightness': raw[i] = 1 - lum; break;
        case 'threshold':          raw[i] = lum * 255 > thresh ? 1 : 0; break;
        case 'edge':               raw[i] = Math.min(1, seedGradientMag[i] * 5); break;
      }
    }

    // Coverage percentile cutoff
    const stride = Math.max(1, (n / 4000) | 0);
    const sample = [];
    for (let i = 0; i < n; i += stride) sample.push(raw[i]);
    sample.sort((a, b) => b - a);
    const cutoff = sample[Math.min(sample.length - 1, (sample.length * cov) | 0)];

    for (let i = 0; i < n; i++) {
      const v = raw[i] >= cutoff ? raw[i] : 0;
      gridB[i] = v * str;
      gridA[i] = 1 - gridB[i] * 0.5;
    }
  }

  // ── Seed image → simulation initialisation ─────────────
  function initSimulation() {
    displayW = canvas.width;
    displayH = canvas.height;

    simW = Math.max(2, Math.floor(displayW / cfg.simScale));
    simH = Math.max(2, Math.floor(displayH / cfg.simScale));

    const n = simW * simH;
    gridA = new Float32Array(n); gridB = new Float32Array(n);
    nextA = new Float32Array(n); nextB = new Float32Array(n);
    seedLuminance = new Float32Array(n);
    seedGradientMag = new Float32Array(n);

    for (let i = 0; i < n; i++) { gridA[i] = 1; gridB[i] = 0; }

    // Draw seed at sim resolution
    const simCanvas = Object.assign(document.createElement('canvas'), { width: simW, height: simH });
    simCanvas.getContext('2d').drawImage(seedImage, 0, 0, simW, simH);
    const simPx = simCanvas.getContext('2d').getImageData(0, 0, simW, simH).data;

    for (let i = 0; i < n; i++) {
      const p = i * 4;
      seedLuminance[i] = (0.299 * simPx[p] + 0.587 * simPx[p + 1] + 0.114 * simPx[p + 2]) / 255;
    }
    for (let y = 1; y < simH - 1; y++) {
      for (let x = 1; x < simW - 1; x++) {
        const i = y * simW + x;
        const gx = seedLuminance[i + 1] - seedLuminance[i - 1];
        const gy = seedLuminance[i + simW] - seedLuminance[i - simW];
        seedGradientMag[i] = Math.sqrt(gx * gx + gy * gy);
      }
    }

    // Draw seed at display resolution (canonical original)
    const displayCanvas = Object.assign(document.createElement('canvas'), { width: displayW, height: displayH });
    displayCanvas.getContext('2d').drawImage(seedImage, 0, 0, displayW, displayH);
    seedPixelsDisplay = displayCanvas.getContext('2d').getImageData(0, 0, displayW, displayH).data;
    workingPixels = new Uint8ClampedArray(seedPixelsDisplay);

    // Mean seed colour, used by bgFill: 'seed-mean'
    let rs = 0, gs = 0, bs = 0, cnt = 0;
    for (let i = 0; i < seedPixelsDisplay.length; i += 4) {
      rs += seedPixelsDisplay[i]; gs += seedPixelsDisplay[i + 1]; bs += seedPixelsDisplay[i + 2];
      cnt++;
    }
    seedMeanColor = [rs / cnt | 0, gs / cnt | 0, bs / cnt | 0];

    displayImageData = ctx.createImageData(displayW, displayH);

    applySeedingMode();
    renderFrame();
  }

  // ── Animation loop ──────────────────────────────────────
  function loop() {
    if (!running) return;
    for (let i = 0; i < cfg.stepsPerFrame; i++) simulationStep();
    renderFrame();
    rafId = requestAnimationFrame(loop);
  }

  // ── Public API ──────────────────────────────────────────
  function start() {
    if (!gridA) initSimulation();
    if (running) return;
    running = true;
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
  }

  function reset() {
    stop();
    initSimulation();
  }

  return { start, stop, reset };
}
