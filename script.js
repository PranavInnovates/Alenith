/* ═══════════════════════════════════════
   ALENITH — script.js v3
   Performance rules:
   - Scroll handler is RAF-gated (one call per frame max)
   - Canvas only runs when H&G section is in viewport
   - Canvas uses integer coords to avoid sub-pixel AA cost
   - No box-shadow in JS, no forced reflows
   - IntersectionObserver for all reveal animations
   - Minimal DOM reads inside scroll handler
═══════════════════════════════════════ */
'use strict';

/* ─── XP ────────────────────────────────── */
let xp    = +localStorage.getItem('al_xp')    || 0;
let level = +localStorage.getItem('al_lv')    || 1;
const XP_PER_LV = 100;
const $xpC  = document.getElementById('xp-count');
const $xpF  = document.getElementById('xp-fill');
const $xpLv = document.getElementById('xp-level');
const $toast = document.getElementById('toast');

function renderXP() {
  $xpC.textContent  = xp;
  $xpLv.textContent = level;
  $xpF.style.width  = ((xp % XP_PER_LV) / XP_PER_LV * 100) + '%';
}

let toastT;
function toast(msg) {
  $toast.textContent = msg;
  $toast.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => $toast.classList.remove('show'), 2400);
}

function gainXP(n, label) {
  xp += n;
  const lv = Math.floor(xp / XP_PER_LV) + 1;
  if (lv > level) {
    level = lv;
    toast(`⬆ LEVEL ${level} — SOUL RISING`);
  } else {
    toast(`+${n} SOUL XP — ${label || 'DARKNESS GROWS'}`);
  }
  localStorage.setItem('al_xp', xp);
  localStorage.setItem('al_lv', level);
  renderXP();
}

document.querySelectorAll('.xp-action').forEach(el => {
  let used = false;
  el.addEventListener('click', () => { if (!used) { gainXP(+el.dataset.xp || 10); used = true; } });
});

renderXP();

window.addEventListener('load', () => {
  if (!sessionStorage.getItem('al_welcome')) {
    setTimeout(() => { gainXP(10, 'DARKNESS ENTERED'); sessionStorage.setItem('al_welcome','1'); }, 1000);
  }
});

/* ─── NAV ───────────────────────────────── */
const $nav   = document.getElementById('nav');
const $burger = document.getElementById('burger');
const $links  = document.getElementById('nav-links');

$burger.addEventListener('click', () => {
  const open = $links.classList.toggle('open');
  $burger.classList.toggle('open', open);
  $burger.setAttribute('aria-expanded', open);
});
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => {
    $links.classList.remove('open');
    $burger.classList.remove('open');
    $burger.setAttribute('aria-expanded', false);
  });
});
document.addEventListener('click', e => {
  if ($links.classList.contains('open') && !$links.contains(e.target) && !$burger.contains(e.target)) {
    $links.classList.remove('open');
    $burger.classList.remove('open');
    $burger.setAttribute('aria-expanded', false);
  }
});

/* ─── SMOOTH ANCHORS ────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    const off = $nav.offsetHeight + parseInt(getComputedStyle(document.documentElement).getPropertyValue('--xph') || '26') + 6;
    window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - off, behavior: 'smooth' });
  });
});

/* ─── STAT COUNT-UP ─────────────────────── */
document.querySelectorAll('[data-count]').forEach(el => {
  const target = +el.dataset.count;
  let done = false;
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !done) {
      done = true;
      let n = 0;
      const step = () => { n++; el.textContent = n; if (n < target) setTimeout(step, 220); };
      setTimeout(step, 350);
    }
  }, { threshold: 0.5 }).observe(el);
});

/* ─── SCROLL REVEAL ─────────────────────── */
const revObs = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      e.target.style.transitionDelay = (i * 0.05) + 's';
      e.target.classList.add('in');
      revObs.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

/* ─── FOREST CANVAS ─────────────────────── */
const canvas  = document.getElementById('hg-canvas');
const ctx     = canvas.getContext('2d');
const hgSec   = document.getElementById('hg');
let cW = 0, cH = 0;
let forestRAF = null;
let canvasVisible = false;

function resizeCanvas() {
  cW = canvas.width  = canvas.offsetWidth;
  cH = canvas.height = canvas.offsetHeight;
}

// Only resize on debounce
let resizeDebounce;
window.addEventListener('resize', () => {
  clearTimeout(resizeDebounce);
  resizeDebounce = setTimeout(resizeCanvas, 150);
}, { passive: true });
resizeCanvas();

// Start/stop canvas loop based on visibility
new IntersectionObserver(([e]) => {
  canvasVisible = e.isIntersecting;
  if (canvasVisible && !forestRAF) forestRAF = requestAnimationFrame(drawForest);
}, { threshold: 0 }).observe(hgSec);

// Pre-computed star data (no Math.random in draw loop)
const STARS = Array.from({ length: 55 }, (_, i) => ({
  x: ((i * 73 + 17) % 100) / 100,
  y: ((i * 47 + 31) % 55) / 100,
  sp: (i % 4) + 1
}));

// Fireflies
const FLIES = Array.from({ length: 16 }, () => ({
  x: Math.random(), y: 0.42 + Math.random() * 0.4,
  vx: (Math.random() - .5) * 0.00028,
  vy: (Math.random() - .5) * 0.00018,
  ph: Math.random() * Math.PI * 2,
  sp: 0.8 + Math.random() * 1.1
}));

// Draw a single tree (integer coords for speed)
function drawTree(x, y, w, h, r, g, b) {
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  const x0 = x | 0, y0 = y | 0, w2 = (w / 2) | 0;
  for (let l = 0; l < 3; l++) {
    const ly = (y0 - h * l / 3) | 0;
    const lw = (w2 * (1 - l * 0.18)) | 0;
    ctx.beginPath();
    ctx.moveTo(x0, ly - (h * 0.48) | 0);
    ctx.lineTo(x0 - lw, ly);
    ctx.lineTo(x0 + lw, ly);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillRect((x0 - w * 0.065) | 0, y0 - 14, (w * 0.13) | 0, 20);
}

function drawForest(t) {
  if (!canvasVisible) { forestRAF = null; return; }
  forestRAF = requestAnimationFrame(drawForest);

  ctx.clearRect(0, 0, cW, cH);

  // Sky gradient (reuse on same canvas size to avoid object creation — create once)
  const sky = ctx.createLinearGradient(0, 0, 0, cH);
  sky.addColorStop(0, '#010810');
  sky.addColorStop(.55, '#02101a');
  sky.addColorStop(1, '#041820');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, cW, cH);

  // Moon glow — simple filled circle, no shadow
  const mx = (cW * 0.78) | 0, my = (cH * 0.1) | 0;
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = '#d4c8a8';
  ctx.beginPath(); ctx.arc(mx, my, 48, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 0.04;
  ctx.beginPath(); ctx.arc(mx, my, 28, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  // Stars — single fillRect, cheap
  for (let i = 0; i < STARS.length; i++) {
    const s  = STARS[i];
    const bk = (Math.sin(t * 0.001 * s.sp + i) + 1) * 0.28;
    ctx.globalAlpha = bk;
    ctx.fillStyle = '#c8bea0';
    ctx.fillRect((s.x * cW) | 0, (s.y * cH) | 0, 1, 1);
  }
  ctx.globalAlpha = 1;

  // BG trees (lightest teal-dark)
  for (let i = 0; i < 22; i++) {
    const tx = ((i / 22) * cW + Math.sin(i * 6) * 16) | 0;
    drawTree(tx, cH * 0.8, 38, 170, 2, 14, 16);
  }
  // Mid trees
  for (let i = 0; i < 13; i++) {
    const tx = ((i / 13) * cW + cW / 26) | 0;
    drawTree(tx, cH * 0.88, 54, 235, 1, 8, 10);
  }
  // FG trees (darkest)
  for (let i = 0; i < 7; i++) {
    const tx = ((i / 7) * cW + cW / 14) | 0;
    drawTree(tx, cH * 1.01, 78, 295, 1, 4, 5);
  }

  // Ground fog — linear gradient rect, no blur
  const fog = ctx.createLinearGradient(0, cH * 0.72, 0, cH);
  fog.addColorStop(0, 'rgba(4,18,26,0)');
  fog.addColorStop(1, 'rgba(4,18,26,0.55)');
  ctx.fillStyle = fog;
  ctx.fillRect(0, cH * 0.72, cW, cH * 0.28);

  // Fireflies — no shadowBlur (expensive on mobile)
  for (const ff of FLIES) {
    ff.x += ff.vx; ff.y += ff.vy;
    if (ff.x < 0 || ff.x > 1) ff.vx *= -1;
    if (ff.y < 0.3 || ff.y > 0.9) ff.vy *= -1;
    const bk = Math.sin(t * 0.002 * ff.sp + ff.ph);
    if (bk > 0.3) {
      ctx.globalAlpha = (bk - 0.3) * 0.85;
      ctx.fillStyle = '#fda742';
      ctx.beginPath();
      ctx.arc((ff.x * cW) | 0, (ff.y * cH) | 0, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

/* ─── H&G SCROLL SCENES ─────────────────── */
const hgScenes = document.querySelectorAll('.hs');
const hgDots   = document.querySelectorAll('.hd');
const N_SC     = hgScenes.length;
let curSc = 0, lastSc = -1;

// Cache bounding measurements, recalculate on resize
let hgTop = 0, hgScrollH = 0;
function measureHG() {
  const r = hgSec.getBoundingClientRect();
  hgTop     = r.top + window.scrollY;
  hgScrollH = hgSec.offsetHeight - window.innerHeight;
}
measureHG();
window.addEventListener('resize', measureHG, { passive: true });

function setScene(idx) {
  if (idx === lastSc) return;
  if (lastSc >= 0) hgScenes[lastSc].classList.remove('active');
  hgScenes[idx].classList.add('active');
  hgDots.forEach((d, i) => {
    d.classList.toggle('on',  i === idx);
    d.classList.toggle('was', i < idx);
  });
  if (lastSc >= 0) gainXP(5, `CHAPTER ${idx + 1}`);
  lastSc = idx;
}
setScene(0);

/* ─── STORY SCROLL ──────────────────────── */
const storySection = document.querySelector('.story-section');
const storySlides  = document.querySelectorAll('.ss');
const $spFill      = document.getElementById('sp-fill');
let curSS = 0;

let ssTop = 0, ssScrollH = 0;
function measureSS() {
  const r = storySection.getBoundingClientRect();
  ssTop     = r.top + window.scrollY;
  ssScrollH = storySection.offsetHeight - window.innerHeight;
}
measureSS();
window.addEventListener('resize', measureSS, { passive: true });

/* ─── UNIFIED SCROLL (RAF-gated) ────────── */
let scrollPending = false;
function onScroll() {
  if (scrollPending) return;
  scrollPending = true;
  requestAnimationFrame(() => {
    scrollPending = false;
    const sy = window.scrollY;

    // Nav
    $nav.classList.toggle('solid', sy > 50);

    // H&G
    const hgProg = Math.min(Math.max((sy - hgTop) / hgScrollH, 0), 1);
    if (sy >= hgTop - window.innerHeight && sy <= hgTop + hgScrollH + window.innerHeight) {
      setScene(Math.min(Math.floor(hgProg * N_SC), N_SC - 1));
    }

    // Story
    const ssProg = Math.min(Math.max((sy - ssTop) / ssScrollH, 0), 1);
    if (sy >= ssTop - window.innerHeight && sy <= ssTop + ssScrollH + window.innerHeight) {
      $spFill.style.height = (ssProg * 100) + '%';
      const idx = Math.min(Math.floor(ssProg * storySlides.length), storySlides.length - 1);
      if (idx !== curSS) {
        storySlides[curSS].classList.remove('active');
        storySlides[curSS].classList.add('exit');
        const prev = curSS;
        setTimeout(() => storySlides[prev]?.classList.remove('exit'), 550);
        curSS = idx;
        storySlides[curSS].classList.add('active');
        gainXP(4, 'STORY UNFOLDED');
      }
    }
  });
}
window.addEventListener('scroll', onScroll, { passive: true });

/* ─── KONAMI ─────────────────────────────── */
const K = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let ki = 0;
document.addEventListener('keydown', e => {
  if (e.key === K[ki]) { ki++; if (ki === K.length) { gainXP(999, '☠ DARK GOD AWAKENED'); ki = 0; } }
  else ki = 0;
});

console.log('%cALENITH', 'color:#027578;font-size:28px;font-weight:bold;');
console.log('%c↑↑↓↓←→←→BA', 'color:#fda742;');