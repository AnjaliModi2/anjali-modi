/**
 * ============================================================================
 * ARJUN MALHOTRA — PORTFOLIO & DYNAMIC CANVAS ANIMATION ENGINE
 * High-performance HTML5 Canvas frame scrubbing with physics-based inertia
 * ============================================================================
 */

(function () {
  'use strict';

  // --- Configuration ---
  const TOTAL_FRAMES = 176;
  const FRAME_PREFIX = 'frames/frame_';
  const FRAME_EXTENSION = '.png';
  const LERP_EASE = 0.085; // Optimal balance of responsiveness & momentum

  // --- DOM Elements ---
  const canvas = document.getElementById('frame-canvas');
  const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
  
  const loader = document.getElementById('loader');
  const progressCircle = document.getElementById('progress-circle');
  const loaderPercent = document.getElementById('loader-percent');
  const loaderStatus = document.getElementById('loader-status');
  const loaderBarFill = document.getElementById('loader-bar-fill');
  
  const timelineProgress = document.getElementById('timeline-progress');
  const hudFrameNum = document.getElementById('hud-frame-num');
  const hudPercent = document.getElementById('hud-percent');
  const bgModeBtn = document.getElementById('bg-mode-btn');
  const canvasWash = document.getElementById('canvas-wash');
  const stampBadge = document.getElementById('stamp-badge');
  const backToTopBtn = document.getElementById('back-to-top');

  // --- State Variables ---
  const frames = [];
  let loadedCount = 0;
  let isInitialLoaded = false;
  let targetFrame = 0;
  let currentFrame = 0;
  let lastRenderedFrame = -1;
  let needsRedraw = true;
  let maxScrollDistance = 1;
  let currentScrollProgress = 0;

  // Circle progress calculation (r = 52, perimeter = 2 * PI * 52 ≈ 326.726)
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 52;
  if (progressCircle) {
    progressCircle.style.strokeDasharray = `${CIRCLE_CIRCUMFERENCE}`;
    progressCircle.style.strokeDashoffset = `${CIRCLE_CIRCUMFERENCE}`;
  }

  // --- Helper: Format frame filename ---
  function getFrameUrl(index) {
    const frameNumber = String(index + 1).padStart(6, '0');
    return `${FRAME_PREFIX}${frameNumber}${FRAME_EXTENSION}`;
  }

  // --- High-DPI Canvas Resizing ---
  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for optimal GPU memory
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    needsRedraw = true;
    updateScrollMetrics();
  }

  function updateScrollMetrics() {
    const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
    maxScrollDistance = Math.max(1, scrollHeight - window.innerHeight);
  }

  // --- Render Frame to Canvas (Cover Fit) ---
  function drawFrame(frameIndex) {
    const img = frames[frameIndex] || frames[0];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    // Calculate aspect-ratio cover
    const scale = Math.max(cw / iw, ch / ih);
    const renderWidth = iw * scale;
    const renderHeight = ih * scale;
    const offsetX = (cw - renderWidth) * 0.5;
    const offsetY = (ch - renderHeight) * 0.5;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Draw directly over full canvas
    ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
  }

  // --- Update HUD & Scroll Indicators ---
  function updateHUD(frameIndex, progress) {
    if (hudFrameNum) {
      hudFrameNum.textContent = String(frameIndex + 1).padStart(3, '0');
    }
    
    const percentStr = (progress * 100).toFixed(1);
    if (hudPercent) {
      hudPercent.textContent = `${percentStr}%`;
    }
    
    if (timelineProgress) {
      timelineProgress.style.width = `${percentStr}%`;
    }

    // Micro-rotate stamp badge based on scroll
    if (stampBadge) {
      const rotation = window.pageYOffset * 0.25;
      stampBadge.style.transform = `rotate(${rotation}deg)`;
    }
  }

  // --- Scroll Calculation ---
  function calculateTarget() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    currentScrollProgress = Math.max(0, Math.min(1, scrollY / maxScrollDistance));
    targetFrame = currentScrollProgress * (TOTAL_FRAMES - 1);
    return currentScrollProgress;
  }

  // --- Animation & Lerp Render Loop ---
  function renderLoop() {
    const progress = calculateTarget();

    // Lerp smoothing physics
    const delta = targetFrame - currentFrame;
    if (Math.abs(delta) > 0.0005) {
      currentFrame += delta * LERP_EASE;
    } else {
      currentFrame = targetFrame;
    }

    const frameToRender = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(currentFrame)));

    if (frameToRender !== lastRenderedFrame || needsRedraw) {
      drawFrame(frameToRender);
      lastRenderedFrame = frameToRender;
      updateHUD(frameToRender, currentFrame / (TOTAL_FRAMES - 1));
      needsRedraw = false;
    }

    requestAnimationFrame(renderLoop);
  }

  // --- Preloader & Asset Management ---
  function updatePreloader(progress) {
    const percentage = Math.min(100, Math.round(progress * 100));
    
    if (loaderPercent) {
      loaderPercent.textContent = `${percentage}%`;
    }
    
    if (loaderStatus) {
      loaderStatus.textContent = `Preloading sequence (${loadedCount} / ${TOTAL_FRAMES})`;
    }
    
    if (loaderBarFill) {
      loaderBarFill.style.width = `${percentage}%`;
    }
    
    if (progressCircle) {
      const offset = CIRCLE_CIRCUMFERENCE - (percentage / 100) * CIRCLE_CIRCUMFERENCE;
      progressCircle.style.strokeDashoffset = `${offset}`;
    }
  }

  function onAllFramesLoaded() {
    updatePreloader(1);
    
    // Smooth dismiss transition
    setTimeout(() => {
      if (loader) {
        loader.classList.add('fade-out');
      }
    }, 350);
  }

  function preloadAssets() {
    // 1. Prioritize frame 1 for instant display
    const firstImg = new Image();
    firstImg.src = getFrameUrl(0);
    frames[0] = firstImg;

    firstImg.onload = () => {
      loadedCount++;
      isInitialLoaded = true;
      resizeCanvas();
      drawFrame(0);
      updatePreloader(loadedCount / TOTAL_FRAMES);

      // 2. Load remaining frames progressively
      loadRemainingFrames();
    };

    firstImg.onerror = () => {
      console.warn('Failed to load initial frame, attempting remainder.');
      loadRemainingFrames();
    };
  }

  function loadRemainingFrames() {
    for (let i = 1; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFrameUrl(i);
      frames[i] = img;

      img.onload = () => {
        loadedCount++;
        updatePreloader(loadedCount / TOTAL_FRAMES);

        if (loadedCount === TOTAL_FRAMES) {
          onAllFramesLoaded();
        }
      };

      img.onerror = () => {
        console.warn(`Failed to load frame ${i + 1}`);
        loadedCount++;
        updatePreloader(loadedCount / TOTAL_FRAMES);
        if (loadedCount === TOTAL_FRAMES) {
          onAllFramesLoaded();
        }
      };
    }
  }

  // --- Interactive UI Enhancements ---
  function initInteractions() {
    // Background blend toggle button
    if (bgModeBtn && canvasWash) {
      bgModeBtn.addEventListener('click', () => {
        canvasWash.classList.toggle('dimmed');
        const isDimmed = canvasWash.classList.contains('dimmed');
        bgModeBtn.style.borderColor = isDimmed ? 'var(--accent-red)' : 'var(--border-subtle)';
      });
    }

    // Back to top button
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  // --- Event Listeners ---
  function initEvents() {
    window.addEventListener('resize', () => {
      resizeCanvas();
    }, { passive: true });

    window.addEventListener('scroll', () => {
      updateScrollMetrics();
    }, { passive: true });

    // Keyboard smooth navigation (Arrow keys, Space, PageUp/Down)
    window.addEventListener('keydown', (e) => {
      const step = window.innerHeight * 0.45;
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        window.scrollBy({ top: step, behavior: 'smooth' });
        e.preventDefault();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        window.scrollBy({ top: -step, behavior: 'smooth' });
        e.preventDefault();
      } else if (e.key === 'Home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        e.preventDefault();
      } else if (e.key === 'End') {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
        e.preventDefault();
      }
    });
  }

  // --- Bootstrap Engine ---
  function init() {
    resizeCanvas();
    initEvents();
    initInteractions();
    preloadAssets();
    requestAnimationFrame(renderLoop);
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
