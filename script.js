// ─── CUSTOM CURSOR ───
const cursor = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursor-trail');
let mouseX = 0, mouseY = 0, trailX = 0, trailY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
});

function animateTrail() {
  trailX += (mouseX - trailX) * 0.12;
  trailY += (mouseY - trailY) * 0.12;
  cursorTrail.style.left = trailX + 'px';
  cursorTrail.style.top = trailY + 'px';
  requestAnimationFrame(animateTrail);
}
animateTrail();

// ─── XP GAMIFICATION SYSTEM ───
let xp = parseInt(localStorage.getItem('alenith_xp') || '0');
let level = parseInt(localStorage.getItem('alenith_level') || '1');
const XP_PER_LEVEL = 100;

const xpCount = document.getElementById('xp-count');
const xpFill = document.getElementById('xp-fill');
const xpLevel = document.getElementById('xp-level');
const toast = document.getElementById('toast');

function updateXPDisplay() {
  xpCount.textContent = xp;
  xpLevel.textContent = level;
  const percent = ((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;
  xpFill.style.width = percent + '%';
}

function gainXP(amount, label) {
  xp += amount;
  const newLevel = Math.floor(xp / XP_PER_LEVEL) + 1;
  
  if (newLevel > level) {
    level = newLevel;
    showToast(`⬆ LEVEL ${level} UNLOCKED — SOUL POWER RISING`);
    createBurst(mouseX, mouseY, '#ff6b35', 20);
  } else {
    showToast(`+${amount} SOUL XP — ${label || 'DARKNESS FEEDS YOU'}`);
    createBurst(mouseX, mouseY, '#00c2c7', 8);
  }

  localStorage.setItem('alenith_xp', xp);
  localStorage.setItem('alenith_level', level);
  updateXPDisplay();
}

let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

// Attach XP to clickable elements
document.querySelectorAll('.xp-action').forEach(el => {
  let used = false;
  el.addEventListener('click', e => {
    if (used) return; // one-time XP per element per session
    const amount = parseInt(el.dataset.xp || '10');
    gainXP(amount);
    used = true;
  });
});

// XP on hover for tier cards (once per hover session)
document.querySelectorAll('[data-xp-hover]').forEach(el => {
  let lastHover = 0;
  el.addEventListener('mouseenter', () => {
    const now = Date.now();
    if (now - lastHover > 30000) { // 30s cooldown
      const amount = parseInt(el.dataset.xpHover || '5');
      gainXP(amount, 'TIER EXPLORED');
      lastHover = now;
    }
  });
});

updateXPDisplay();

// ─── PARTICLE BURST ───
function createBurst(x, y, color, count = 10) {
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'burst-particle';
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    p.style.background = color;
    p.style.boxShadow = `0 0 6px ${color}`;
    
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const dist = 60 + Math.random() * 80;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;
    
    p.style.animation = 'none';
    document.body.appendChild(p);
    
    p.animate([
      { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
      { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`, opacity: 0 }
    ], { duration: 700 + Math.random() * 400, easing: 'cubic-bezier(0, 0, 0.2, 1)', fill: 'forwards' })
      .onfinish = () => p.remove();
  }
}

document.addEventListener('click', e => {
  createBurst(e.clientX, e.clientY, '#00c2c7', 5);
});

// ─── HERO CANVAS (Floating Nodes) ───
const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');
let nodes = [];

function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Node {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;
    this.r = Math.random() * 2 + 1;
    this.alpha = Math.random() * 0.6 + 0.2;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 194, 199, ${this.alpha})`;
    ctx.fill();
  }
}

for (let i = 0; i < 60; i++) nodes.push(new Node());

function animateCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  nodes.forEach((n, i) => {
    n.update();
    n.draw();
    
    nodes.slice(i + 1).forEach(m => {
      const dx = n.x - m.x, dy = n.y - m.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(m.x, m.y);
        ctx.strokeStyle = `rgba(0, 194, 199, ${0.15 * (1 - dist / 120)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    });
  });
  
  requestAnimationFrame(animateCanvas);
}
animateCanvas();

// ─── SCROLL REVEAL ───
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('[data-scroll-reveal]').forEach(el => revealObserver.observe(el));

// Staggered section headers
document.querySelectorAll('.section-header').forEach(el => revealObserver.observe(el));

// Count-up animation for hero stats
document.querySelectorAll('.stat-num').forEach(el => {
  const obs = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      const target = parseInt(el.dataset.count);
      let current = 0;
      const step = () => {
        current++;
        el.textContent = current;
        if (current < target) setTimeout(step, 200);
      };
      setTimeout(() => {
        el.classList.add('revealed');
        step();
      }, 400);
      obs.unobserve(el);
    }
  }, { threshold: 0.5 });
  obs.observe(el);
});

// Stagger game items
document.querySelectorAll('.game-item').forEach((el, i) => {
  const obs = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      setTimeout(() => el.classList.add('revealed'), i * 120);
      obs.unobserve(el);
    }
  }, { threshold: 0.1 });
  obs.observe(el);
});

// Stagger tier cards
document.querySelectorAll('.tier-card').forEach((el, i) => {
  const obs = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      setTimeout(() => el.classList.add('revealed'), i * 100);
      obs.unobserve(el);
    }
  }, { threshold: 0.1 });
  obs.observe(el);
});

// Stagger social cards
document.querySelectorAll('.social-card').forEach((el, i) => {
  const obs = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      setTimeout(() => el.classList.add('revealed'), i * 80);
      obs.unobserve(el);
    }
  }, { threshold: 0.1 });
  obs.observe(el);
});

// Hero title lines
document.querySelectorAll('.title-line').forEach((el, i) => {
  setTimeout(() => el.classList.add('revealed'), 300 + i * 150);
});

document.querySelectorAll('.hero-eyebrow, .hero-sub, .hero-cta').forEach((el, i) => {
  setTimeout(() => el.classList.add('revealed'), 200 + i * 200);
});

// ─── STORY SCROLL ───
const storySection = document.querySelector('.story-scroll');
const slides = document.querySelectorAll('.story-slide');
const storyProgressBar = document.getElementById('story-progress');
const totalSlides = slides.length;
let currentSlide = 0;

function updateStory(progress) {
  const slideIndex = Math.min(Math.floor(progress * totalSlides), totalSlides - 1);
  const slideProgress = (progress * totalSlides) - Math.floor(progress * totalSlides);
  
  storyProgressBar.style.height = (progress * 100) + '%';
  
  if (slideIndex !== currentSlide) {
    slides[currentSlide].classList.remove('active');
    slides[currentSlide].classList.add('exit');
    setTimeout(() => slides[currentSlide]?.classList.remove('exit'), 700);
    
    currentSlide = slideIndex;
    slides[currentSlide].classList.add('active');
    
    // XP for reaching new slides
    gainXP(5, 'STORY UNFOLDED');
  }
}

window.addEventListener('scroll', () => {
  if (!storySection) return;
  const rect = storySection.getBoundingClientRect();
  const windowH = window.innerHeight;
  const sectionH = storySection.offsetHeight - windowH;
  
  if (rect.top <= 0 && rect.bottom >= windowH) {
    const scrolled = Math.abs(rect.top) / sectionH;
    updateStory(Math.min(Math.max(scrolled, 0), 1));
  }
});

// ─── NAV SCROLL STATE ───
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

// ─── MOBILE MENU ───
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');

menuToggle.addEventListener('click', e => {
  e.stopPropagation();
  navLinks.classList.toggle('open');
  menuToggle.classList.toggle('open');
});

document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle.classList.remove('open');
  });
});

// ─── SMOOTH ANCHOR SCROLL ───
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    const offset = target.getBoundingClientRect().top + window.pageYOffset - 90;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  });
});

// ─── WELCOME XP ───
window.addEventListener('load', () => {
  setTimeout(() => {
    if (!sessionStorage.getItem('welcomed')) {
      gainXP(10, 'DARKNESS ENTERS');
      sessionStorage.setItem('welcomed', '1');
    }
  }, 1200);
});

// ─── EASTER EGG: Konami Code ───
const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let konamiPos = 0;
document.addEventListener('keydown', e => {
  if (e.key === konami[konamiPos]) {
    konamiPos++;
    if (konamiPos === konami.length) {
      gainXP(999, '🎃 KONAMI CODE — WITCH MODE ACTIVATED');
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          createBurst(Math.random() * window.innerWidth, Math.random() * window.innerHeight, '#ff6b35', 20);
        }, i * 200);
      }
      konamiPos = 0;
    }
  } else {
    konamiPos = 0;
  }
});

console.log('%c⬡ ALENITH', 'color: #00c2c7; font-size: 32px; font-weight: bold; font-family: monospace;');
console.log('%cType the Konami Code for a secret... ↑↑↓↓←→←→BA', 'color: #ff6b35; font-size: 14px;');