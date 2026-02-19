// ═══════════════════════════════════════
//  ALENITH — script.js (v2 — optimized)
// ═══════════════════════════════════════

'use strict';

// ─── XP SYSTEM ────────────────────────────────────
let xp    = parseInt(localStorage.getItem('alenith_xp')    || '0');
let level = parseInt(localStorage.getItem('alenith_level') || '1');
const XP_PER_LEVEL = 100;
const xpCountEl = document.getElementById('xp-count');
const xpFillEl  = document.getElementById('xp-fill');
const xpLevelEl = document.getElementById('xp-level');
const toastEl   = document.getElementById('toast');

function updateXPBar() {
  xpCountEl.textContent = xp;
  xpLevelEl.textContent = level;
  xpFillEl.style.width = ((xp % XP_PER_LEVEL) / XP_PER_LEVEL * 100) + '%';
}

function gainXP(amount, label) {
  xp += amount;
  const newLevel = Math.floor(xp / XP_PER_LEVEL) + 1;
  if (newLevel > level) {
    level = newLevel;
    showToast(`⬆ LEVEL ${level} — SOUL POWER RISING`);
  } else {
    showToast(`+${amount} SOUL XP — ${label || 'THE DARKNESS GROWS'}`);
  }
  localStorage.setItem('alenith_xp', xp);
  localStorage.setItem('alenith_level', level);
  updateXPBar();
}

let toastTimer;
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
}

// XP actions (one-time clicks)
document.querySelectorAll('.xp-action').forEach(el => {
  let used = false;
  el.addEventListener('click', () => {
    if (used) return;
    gainXP(parseInt(el.dataset.xp || '10'));
    used = true;
  });
});

updateXPBar();

// ─── WELCOME XP ───────────────────────────────────
window.addEventListener('load', () => {
  if (!sessionStorage.getItem('welcomed')) {
    setTimeout(() => {
      gainXP(10, 'DARKNESS ENTERED');
      sessionStorage.setItem('welcomed', '1');
    }, 1200);
  }
});


// ─── NAV ──────────────────────────────────────────
const nav       = document.getElementById('nav');
const menuBtn   = document.getElementById('menu-btn');
const navLinks  = document.getElementById('nav-links');

menuBtn.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuBtn.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', open);
});

navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuBtn.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
  });
});

// Close menu on outside click
document.addEventListener('click', e => {
  if (navLinks.classList.contains('open') &&
      !navLinks.contains(e.target) && !menuBtn.contains(e.target)) {
    navLinks.classList.remove('open');
    menuBtn.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
  }
});


// ─── SMOOTH ANCHORS ───────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = nav.offsetHeight + parseInt(getComputedStyle(document.documentElement).getPropertyValue('--xp-h')) + 8;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
  });
});


// ─── HERO CANVAS (lightweight particle web) ───────
const heroCanvas = document.getElementById('forest-canvas');  // reuse
const heroEl = document.querySelector('.hero');

// Separate small hero particle effect — no canvas needed (CSS only)
// Skip heavy hero-canvas; forest-canvas handles H&G section


// ─── STAT COUNT-UP ────────────────────────────────
document.querySelectorAll('.stat-num').forEach(el => {
  const target = parseInt(el.dataset.count, 10);
  let counted = false;
  const obs = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !counted) {
      counted = true;
      let n = 0;
      const step = () => {
        n++;
        el.textContent = n;
        if (n < target) setTimeout(step, 250);
      };
      setTimeout(step, 300);
      obs.unobserve(el);
    }
  }, { threshold: 0.5 });
  obs.observe(el);
});


// ─── SCROLL REVEAL ────────────────────────────────
const revealObs = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      e.target.style.transitionDelay = (i * 0.06) + 's';
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));


// ─── FOREST CANVAS ────────────────────────────────
const fCanvas = document.getElementById('forest-canvas');
const fCtx    = fCanvas.getContext('2d');
let fW = 0, fH = 0;
let forestAnimId = null;
let forestVisible = false;

function resizeForest() {
  fW = fCanvas.width  = fCanvas.offsetWidth;
  fH = fCanvas.height = fCanvas.offsetHeight;
}
resizeForest();

// Only animate forest when H&G section is in view
const hgSection = document.querySelector('.hg-section');
const hgObs = new IntersectionObserver(([e]) => {
  forestVisible = e.isIntersecting;
  if (forestVisible && !forestAnimId) {
    forestAnimId = requestAnimationFrame(animateForest);
  }
}, { threshold: 0 });
hgObs.observe(hgSection);

// Debounced resize
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(resizeForest, 150);
}, { passive: true });

// Tree drawing (simplified for performance)
function drawTree(ctx, x, baseY, w, h, dark) {
  const d = Math.max(0, dark);
  ctx.fillStyle = `rgb(${d},${Math.max(0,d-4)},${Math.max(0,d-8)})`;
  for (let l = 0; l < 3; l++) {
    const ly = baseY - h * (l / 3);
    const lw = w * (1 - l * 0.2);
    ctx.beginPath();
    ctx.moveTo(x, ly - h * 0.5);
    ctx.lineTo(x - lw / 2, ly);
    ctx.lineTo(x + lw / 2, ly);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = `rgb(${Math.max(0,d-2)},0,0)`;
  ctx.fillRect(x - w * 0.07, baseY - 15, w * 0.14, 22);
}

function drawMoon(ctx, w, h) {
  const g = ctx.createRadialGradient(w * 0.78, h * 0.1, 0, w * 0.78, h * 0.1, 50);
  g.addColorStop(0, 'rgba(220,210,180,0.1)');
  g.addColorStop(1, 'transparent');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(w * 0.78, h * 0.1, 50, 0, Math.PI * 2);
  ctx.fill();
}

// Pre-computed star positions
const STARS = Array.from({ length: 60 }, (_, i) => ({
  x: ((i * 73 + 17) % 100) / 100,
  y: ((i * 47 + 31) % 55) / 100,
  s: (i % 5) + 1
}));

// Fireflies
const FLIES = Array.from({ length: 18 }, () => ({
  x: Math.random(), y: 0.42 + Math.random() * 0.42,
  vx: (Math.random() - .5) * 0.0003, vy: (Math.random() - .5) * 0.0002,
  phase: Math.random() * Math.PI * 2, spd: 0.8 + Math.random() * 1.2
}));

function animateForest(t) {
  if (!forestVisible) { forestAnimId = null; return; }
  forestAnimId = requestAnimationFrame(animateForest);

  fCtx.clearRect(0, 0, fW, fH);

  // Sky
  const sky = fCtx.createLinearGradient(0, 0, 0, fH);
  sky.addColorStop(0, '#020005');
  sky.addColorStop(0.5, '#04000a');
  sky.addColorStop(1, '#080210');
  fCtx.fillStyle = sky;
  fCtx.fillRect(0, 0, fW, fH);

  drawMoon(fCtx, fW, fH);

  // Stars
  const batchLen = STARS.length;
  for (let i = 0; i < batchLen; i++) {
    const s = STARS[i];
    const blink = (Math.sin(t * 0.001 * s.s + i) + 1) * 0.3;
    fCtx.globalAlpha = blink;
    fCtx.fillStyle = 'rgba(200,190,170,1)';
    fCtx.fillRect(s.x * fW, s.y * fH, 1, 1);
  }
  fCtx.globalAlpha = 1;

  // Background trees
  for (let i = 0; i < 24; i++) {
    drawTree(fCtx, (i / 24) * fW + Math.sin(i * 7) * 18, fH * 0.8, 38, 180, 10);
  }
  // Mid trees
  for (let i = 0; i < 14; i++) {
    drawTree(fCtx, (i / 14) * fW + fW / 28, fH * 0.88, 55, 240, 6);
  }
  // Foreground trees (darkest)
  for (let i = 0; i < 7; i++) {
    drawTree(fCtx, (i / 7) * fW + fW / 14, fH, 80, 300, 2);
  }

  // Ground fog
  const fog = fCtx.createLinearGradient(0, fH * 0.7, 0, fH);
  fog.addColorStop(0, 'transparent');
  fog.addColorStop(1, 'rgba(20,4,10,0.5)');
  fCtx.fillStyle = fog;
  fCtx.fillRect(0, fH * 0.7, fW, fH * 0.3);

  // Fireflies
  fCtx.shadowBlur = 10;
  fCtx.shadowColor = 'rgba(255,140,0,.5)';
  for (const ff of FLIES) {
    ff.x += ff.vx; ff.y += ff.vy;
    if (ff.x < 0 || ff.x > 1) ff.vx *= -1;
    if (ff.y < 0.3 || ff.y > 0.9) ff.vy *= -1;
    const blink = Math.sin(t * 0.002 * ff.spd + ff.phase);
    if (blink > 0.3) {
      fCtx.beginPath();
      fCtx.arc(ff.x * fW, ff.y * fH, 1.5, 0, Math.PI * 2);
      fCtx.fillStyle = `rgba(255,180,50,${(blink - 0.3) * 0.9})`;
      fCtx.fill();
    }
  }
  fCtx.shadowBlur = 0;
}


// ─── H&G SCROLL SCENES ────────────────────────────
const hgSticky  = document.querySelector('.hg-sticky');
const hgScenes  = document.querySelectorAll('.hg-scene');
const hgCrumbs  = document.querySelectorAll('.hg-crumb');
const N_SCENES  = hgScenes.length;
let curScene    = 0;
let lastScene   = -1;

function setScene(idx) {
  if (idx === lastScene) return;
  hgScenes[lastScene >= 0 ? lastScene : 0].classList.remove('active');
  hgScenes[idx].classList.add('active');

  hgCrumbs.forEach((c, i) => {
    c.classList.toggle('active', i === idx);
    c.classList.toggle('done', i < idx);
  });

  if (lastScene >= 0) gainXP(6, `CHAPTER ${idx + 1} — FOREST DEEPENS`);
  lastScene = idx;
}

// Initialize scene 0
setScene(0);

function updateHGScroll() {
  const rect  = hgSection.getBoundingClientRect();
  const winH  = window.innerHeight;
  const total = hgSection.offsetHeight - winH;
  if (rect.top > 0 || rect.bottom < winH) return;
  const p     = Math.min(Math.max(-rect.top / total, 0), 1);
  const idx   = Math.min(Math.floor(p * N_SCENES), N_SCENES - 1);
  setScene(idx);
}


// ─── STORY SCROLL ─────────────────────────────────
const storySection = document.querySelector('.story-section');
const storySlides  = document.querySelectorAll('.story-slide');
const storyFill    = document.getElementById('story-fill');
let curStory = 0;

function updateStoryScroll() {
  if (!storySection) return;
  const rect  = storySection.getBoundingClientRect();
  const winH  = window.innerHeight;
  const total = storySection.offsetHeight - winH;
  if (rect.top > 0 || rect.bottom < winH) return;
  const p   = Math.min(Math.max(-rect.top / total, 0), 1);
  const idx = Math.min(Math.floor(p * storySlides.length), storySlides.length - 1);
  storyFill.style.height = (p * 100) + '%';
  if (idx !== curStory) {
    storySlides[curStory].classList.remove('active');
    storySlides[curStory].classList.add('exit');
    const prev = curStory;
    setTimeout(() => storySlides[prev]?.classList.remove('exit'), 600);
    curStory = idx;
    storySlides[curStory].classList.add('active');
    gainXP(4, 'STORY UNFOLDED');
  }
}


// ─── UNIFIED SCROLL HANDLER (RAF-throttled) ────────
let scrollRAF = null;
function onScroll() {
  if (scrollRAF) return;
  scrollRAF = requestAnimationFrame(() => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
    updateHGScroll();
    updateStoryScroll();
    scrollRAF = null;
  });
}
window.addEventListener('scroll', onScroll, { passive: true });


// ─── KONAMI CODE ──────────────────────────────────
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let kIdx = 0;
document.addEventListener('keydown', e => {
  if (e.key === KONAMI[kIdx]) {
    kIdx++;
    if (kIdx === KONAMI.length) {
      gainXP(999, '☠ DARK GOD AWAKENED');
      kIdx = 0;
    }
  } else kIdx = 0;
});


// ─── DEV CONSOLE ─────────────────────────────────
console.log('%c☠ ALENITH', 'color:#c0392b;font-size:32px;font-weight:bold;');
console.log('%cKonami Code unlocks something wicked... ↑↑↓↓←→←→BA', 'color:#8b0000;');