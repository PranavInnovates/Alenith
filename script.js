// ══════════════════════════════════════════
//  ALENITH — script.js
// ══════════════════════════════════════════

// ─── CUSTOM CURSOR ───────────────────────
const cursor      = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursor-trail');
let mouseX = 0, mouseY = 0, trailX = 0, trailY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top  = mouseY + 'px';
});

(function animateTrail() {
  trailX += (mouseX - trailX) * 0.12;
  trailY += (mouseY - trailY) * 0.12;
  cursorTrail.style.left = trailX + 'px';
  cursorTrail.style.top  = trailY + 'px';
  requestAnimationFrame(animateTrail);
})();

// ─── XP GAMIFICATION ─────────────────────
let xp    = parseInt(localStorage.getItem('alenith_xp')    || '0');
let level = parseInt(localStorage.getItem('alenith_level') || '1');
const XP_PER_LEVEL = 100;

const xpCountEl = document.getElementById('xp-count');
const xpFillEl  = document.getElementById('xp-fill');
const xpLevelEl = document.getElementById('xp-level');
const toastEl   = document.getElementById('toast');

function updateXPDisplay() {
  xpCountEl.textContent = xp;
  xpLevelEl.textContent = level;
  const pct = ((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;
  xpFillEl.style.width = pct + '%';
}

function gainXP(amount, label) {
  xp += amount;
  const newLevel = Math.floor(xp / XP_PER_LEVEL) + 1;
  if (newLevel > level) {
    level = newLevel;
    showToast(`⬆ LEVEL ${level} — SOUL POWER RISING`);
    createBurst(mouseX, mouseY, '#c0392b', 22);
  } else {
    showToast(`+${amount} SOUL XP — ${label || 'THE DARKNESS GROWS'}`);
    createBurst(mouseX, mouseY, '#8b0000', 8);
  }
  localStorage.setItem('alenith_xp',    xp);
  localStorage.setItem('alenith_level', level);
  updateXPDisplay();
}

let toastTimer;
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
}

// XP on xp-action clicks (one-time per element per session)
document.querySelectorAll('.xp-action').forEach(el => {
  let used = false;
  el.addEventListener('click', () => {
    if (used) return;
    gainXP(parseInt(el.dataset.xp || '10'));
    used = true;
  });
});

// XP on tier hover (30 s cooldown)
document.querySelectorAll('[data-xp-hover]').forEach(el => {
  let lastHover = 0;
  el.addEventListener('mouseenter', () => {
    if (Date.now() - lastHover > 30_000) {
      gainXP(parseInt(el.dataset.xpHover || '5'), 'TIER EXPLORED');
      lastHover = Date.now();
    }
  });
});

updateXPDisplay();

// ─── PARTICLE BURST ──────────────────────
function createBurst(x, y, color, count = 10) {
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'burst-particle';
    Object.assign(p.style, { left: x + 'px', top: y + 'px', background: color, boxShadow: `0 0 6px ${color}` });
    document.body.appendChild(p);

    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const dist  = 60 + Math.random() * 90;
    p.animate([
      { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
      { transform: `translate(calc(-50% + ${Math.cos(angle)*dist}px), calc(-50% + ${Math.sin(angle)*dist}px)) scale(0)`, opacity: 0 }
    ], { duration: 700 + Math.random() * 400, easing: 'cubic-bezier(0,0,0.2,1)', fill: 'forwards' })
      .onfinish = () => p.remove();
  }
}

document.addEventListener('click', e => createBurst(e.clientX, e.clientY, '#8b0000', 5));

// ─── HERO CANVAS — blood-mist particles ──
const canvas = document.getElementById('hero-canvas');
const ctx    = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Mist {
  constructor() { this.reset(); }
  reset() {
    this.x  = Math.random() * canvas.width;
    this.y  = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.r  = Math.random() * 2.5 + 0.5;
    this.a  = Math.random() * 0.5 + 0.1;
    // Bloodish red or bone-white motes
    this.hue = Math.random() > 0.7 ? '180,80,80' : '200,180,160';
  }
  update() {
    this.x += this.vx; this.y += this.vy;
    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.hue},${this.a})`;
    ctx.fill();
  }
}

const mists = Array.from({ length: 80 }, () => new Mist());

(function animateCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  mists.forEach((m, i) => {
    m.update(); m.draw();
    // Draw faint web-like connections
    mists.slice(i + 1, i + 6).forEach(n => {
      const dx = m.x - n.x, dy = m.y - n.y;
      const d  = Math.hypot(dx, dy);
      if (d < 100) {
        ctx.beginPath();
        ctx.moveTo(m.x, m.y); ctx.lineTo(n.x, n.y);
        ctx.strokeStyle = `rgba(139,0,0,${0.12 * (1 - d / 100)})`;
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }
    });
  });
  requestAnimationFrame(animateCanvas);
})();

// ─── INTERSECTION OBSERVER REVEAL ────────
function makeObserver(threshold = 0.1, delay = 0) {
  return new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('revealed'), delay + i * 0);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold, rootMargin: '0px 0px -50px 0px' });
}

const observer = makeObserver();

// Section headers
document.querySelectorAll('.section-header').forEach(el => observer.observe(el));

// Hero elements on load
setTimeout(() => {
  document.querySelectorAll('.hero-eyebrow, .hero-sub, .hero-cta').forEach((el, i) => {
    setTimeout(() => el.classList.add('revealed'), 200 + i * 200);
  });
  document.querySelectorAll('.title-line').forEach((el, i) => {
    setTimeout(() => el.classList.add('revealed'), 300 + i * 150);
  });
}, 100);

// Count-up stat numbers
document.querySelectorAll('.stat-num').forEach(el => {
  const obs = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      const target = parseInt(el.dataset.count);
      let cur = 0;
      el.classList.add('revealed');
      const step = () => { cur++; el.textContent = cur; if (cur < target) setTimeout(step, 200); };
      setTimeout(step, 400);
      obs.unobserve(el);
    }
  }, { threshold: 0.5 });
  obs.observe(el);
});

// Stagger game items
document.querySelectorAll('.game-item').forEach((el, i) => {
  const obs = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      setTimeout(() => el.classList.add('revealed'), i * 130);
      obs.unobserve(el);
    }
  }, { threshold: 0.08 });
  obs.observe(el);
});

// Stagger tier cards
document.querySelectorAll('.tier-card').forEach((el, i) => {
  const obs = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      setTimeout(() => el.classList.add('revealed'), i * 100);
      obs.unobserve(el);
    }
  }, { threshold: 0.08 });
  obs.observe(el);
});

// Stagger social cards
document.querySelectorAll('.social-card').forEach((el, i) => {
  const obs = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      setTimeout(() => el.classList.add('revealed'), i * 80);
      obs.unobserve(el);
    }
  }, { threshold: 0.08 });
  obs.observe(el);
});

// ─── STORY SCROLL ────────────────────────
const storySection = document.querySelector('.story-scroll');
const slides       = document.querySelectorAll('.story-slide');
const progressBar  = document.getElementById('story-progress');
let   currentSlide = 0;

window.addEventListener('scroll', () => {
  if (!storySection) return;
  const rect    = storySection.getBoundingClientRect();
  const winH    = window.innerHeight;
  const scrollH = storySection.offsetHeight - winH;
  if (rect.top <= 0 && rect.bottom >= winH) {
    const progress   = Math.min(Math.max(Math.abs(rect.top) / scrollH, 0), 1);
    const slideIndex = Math.min(Math.floor(progress * slides.length), slides.length - 1);
    progressBar.style.height = (progress * 100) + '%';
    if (slideIndex !== currentSlide) {
      slides[currentSlide].classList.remove('active');
      slides[currentSlide].classList.add('exit');
      const prev = currentSlide;
      setTimeout(() => slides[prev].classList.remove('exit'), 700);
      currentSlide = slideIndex;
      slides[currentSlide].classList.add('active');
      gainXP(5, 'STORY UNFOLDED');
    }
  }
}, { passive: true });

// ─── NAV SCROLL ──────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ─── MOBILE MENU ─────────────────────────
const menuToggle = document.getElementById('menu-toggle');
const navLinks   = document.getElementById('nav-links');

menuToggle.addEventListener('click', e => {
  e.stopPropagation();
  navLinks.classList.toggle('open');
});

document.querySelectorAll('.nav-links a').forEach(a =>
  a.addEventListener('click', () => navLinks.classList.remove('open'))
);

// ─── SMOOTH ANCHOR SCROLL ────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - 88, behavior: 'smooth' });
  });
});

// ─── WELCOME XP (first visit per session) ─
window.addEventListener('load', () => {
  if (!sessionStorage.getItem('welcomed')) {
    setTimeout(() => {
      gainXP(10, 'DARKNESS ENTERED');
      sessionStorage.setItem('welcomed', '1');
    }, 1400);
  }
});

// ─── EASTER EGG: KONAMI CODE ─────────────
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let konamiPos = 0;
document.addEventListener('keydown', e => {
  if (e.key === KONAMI[konamiPos]) {
    konamiPos++;
    if (konamiPos === KONAMI.length) {
      gainXP(999, '☠ KONAMI CODE — DARK GOD AWAKENED');
      for (let i = 0; i < 6; i++) {
        setTimeout(() => createBurst(
          Math.random() * window.innerWidth,
          Math.random() * window.innerHeight,
          '#c0392b', 25
        ), i * 180);
      }
      konamiPos = 0;
    }
  } else {
    konamiPos = 0;
  }
});

// ─── PARALLAX: horror-bg cracks on scroll ─
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const cracks   = document.querySelector('.bg-cracks');
  const webs     = document.querySelector('.bg-webs');
  if (cracks) cracks.style.transform = `translateY(${scrolled * 0.08}px)`;
  if (webs)   webs.style.transform   = `translateY(${scrolled * 0.04}px)`;
}, { passive: true });

// Console greeting
console.log('%c☠ ALENITH', 'color:#c0392b;font-size:36px;font-weight:bold;font-family:serif;');
console.log('%cKonami Code unlocks something wicked... ↑↑↓↓←→←→BA', 'color:#8b0000;font-size:13px;');