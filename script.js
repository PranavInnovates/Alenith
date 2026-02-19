// ══════════════════════════════════════════
//  ALENITH — script.js
// ══════════════════════════════════════════

// ─── CUSTOM CURSOR ────────────────────────
const cursor      = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursor-trail');
let mouseX = 0, mouseY = 0, trailX = 0, trailY = 0;
document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  cursor.style.left = mouseX + 'px'; cursor.style.top = mouseY + 'px';
});
(function animateTrail() {
  trailX += (mouseX - trailX) * 0.12; trailY += (mouseY - trailY) * 0.12;
  cursorTrail.style.left = trailX + 'px'; cursorTrail.style.top = trailY + 'px';
  requestAnimationFrame(animateTrail);
})();

// ─── XP GAMIFICATION ──────────────────────
let xp    = parseInt(localStorage.getItem('alenith_xp')    || '0');
let level = parseInt(localStorage.getItem('alenith_level') || '1');
const XP_PER_LEVEL = 100;
const xpCountEl = document.getElementById('xp-count');
const xpFillEl  = document.getElementById('xp-fill');
const xpLevelEl = document.getElementById('xp-level');
const toastEl   = document.getElementById('toast');

function updateXPDisplay() {
  xpCountEl.textContent = xp; xpLevelEl.textContent = level;
  xpFillEl.style.width = ((xp % XP_PER_LEVEL) / XP_PER_LEVEL * 100) + '%';
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
  localStorage.setItem('alenith_xp', xp); localStorage.setItem('alenith_level', level);
  updateXPDisplay();
}

let toastTimer;
function showToast(msg) {
  toastEl.textContent = msg; toastEl.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
}

document.querySelectorAll('.xp-action').forEach(el => {
  let used = false;
  el.addEventListener('click', () => { if (used) return; gainXP(parseInt(el.dataset.xp || '10')); used = true; });
});
document.querySelectorAll('[data-xp-hover]').forEach(el => {
  let last = 0;
  el.addEventListener('mouseenter', () => { if (Date.now() - last > 30000) { gainXP(parseInt(el.dataset.xpHover || '5'), 'TIER EXPLORED'); last = Date.now(); } });
});
updateXPDisplay();

// ─── PARTICLE BURST ───────────────────────
function createBurst(x, y, color, count = 10) {
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'burst-particle';
    Object.assign(p.style, { left: x+'px', top: y+'px', background: color, boxShadow:`0 0 6px ${color}` });
    document.body.appendChild(p);
    const angle = (Math.PI*2*i)/count + Math.random()*0.5;
    const dist  = 60 + Math.random()*90;
    p.animate([
      { transform:'translate(-50%,-50%) scale(1)',opacity:1 },
      { transform:`translate(calc(-50% + ${Math.cos(angle)*dist}px),calc(-50% + ${Math.sin(angle)*dist}px)) scale(0)`,opacity:0 }
    ], { duration:700+Math.random()*400, easing:'cubic-bezier(0,0,0.2,1)', fill:'forwards' }).onfinish = () => p.remove();
  }
}
document.addEventListener('click', e => createBurst(e.clientX, e.clientY, '#8b0000', 5));

// ─── HERO CANVAS — blood mist particles ───
const heroCanvas = document.getElementById('hero-canvas');
const hCtx = heroCanvas.getContext('2d');
function resizeHeroCanvas() { heroCanvas.width = heroCanvas.offsetWidth; heroCanvas.height = heroCanvas.offsetHeight; }
resizeHeroCanvas(); window.addEventListener('resize', resizeHeroCanvas);

class Mist {
  constructor() { this.reset(); }
  reset() {
    this.x  = Math.random() * heroCanvas.width;
    this.y  = Math.random() * heroCanvas.height;
    this.vx = (Math.random()-.5)*.3; this.vy = (Math.random()-.5)*.3;
    this.r  = Math.random()*2.5+.5;  this.a  = Math.random()*.5+.1;
    this.hue = Math.random() > .7 ? '180,80,80' : '200,180,160';
  }
  update() {
    this.x += this.vx; this.y += this.vy;
    if (this.x<0||this.x>heroCanvas.width||this.y<0||this.y>heroCanvas.height) this.reset();
  }
  draw() {
    hCtx.beginPath(); hCtx.arc(this.x,this.y,this.r,0,Math.PI*2);
    hCtx.fillStyle = `rgba(${this.hue},${this.a})`; hCtx.fill();
  }
}
const mists = Array.from({length:80},()=>new Mist());
(function animateHeroCanvas() {
  hCtx.clearRect(0,0,heroCanvas.width,heroCanvas.height);
  mists.forEach((m,i)=>{
    m.update(); m.draw();
    mists.slice(i+1,i+6).forEach(n=>{
      const d=Math.hypot(m.x-n.x,m.y-n.y);
      if(d<100){ hCtx.beginPath(); hCtx.moveTo(m.x,m.y); hCtx.lineTo(n.x,n.y); hCtx.strokeStyle=`rgba(139,0,0,${.12*(1-d/100)})`; hCtx.lineWidth=.4; hCtx.stroke(); }
    });
  });
  requestAnimationFrame(animateHeroCanvas);
})();

// ─── FOREST CANVAS for H&G section ────────
const forestCanvas = document.getElementById('forest-canvas');
const fCtx = forestCanvas.getContext('2d');
let forestW = 0, forestH = 0;

function resizeForestCanvas() {
  forestW = forestCanvas.width  = forestCanvas.offsetWidth;
  forestH = forestCanvas.height = forestCanvas.offsetHeight;
}
resizeForestCanvas();
window.addEventListener('resize', resizeForestCanvas);

// Tree silhouette generator
function drawForestTree(ctx, x, baseY, w, h, depth) {
  const layers = 3;
  for (let l = 0; l < layers; l++) {
    const ly = baseY - (h * (l / layers));
    const lh = h * 0.55;
    const lw = w * (1 - l * 0.18);
    ctx.beginPath();
    ctx.moveTo(x, ly - lh);
    ctx.lineTo(x - lw/2, ly);
    ctx.lineTo(x + lw/2, ly);
    ctx.closePath();
    const darkness = Math.max(0, 12 - depth * 3);
    ctx.fillStyle = `rgb(${darkness},${Math.max(0,darkness-4)},${Math.max(0,darkness-6)})`;
    ctx.fill();
  }
  // Trunk
  ctx.fillStyle = `rgb(8,4,4)`;
  ctx.fillRect(x - w*0.06, baseY - 20, w*0.12, 28);
}

// Moon
function drawMoon(ctx, w, h) {
  const grd = ctx.createRadialGradient(w*0.78, h*0.12, 0, w*0.78, h*0.12, 55);
  grd.addColorStop(0, 'rgba(220,210,180,0.12)');
  grd.addColorStop(0.4, 'rgba(200,190,160,0.06)');
  grd.addColorStop(1, 'transparent');
  ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(w*0.78, h*0.12, 55, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(210,200,170,0.07)'; ctx.beginPath(); ctx.arc(w*0.78, h*0.12, 32, 0, Math.PI*2); ctx.fill();
}

// Fog ground
function drawGroundFog(ctx, w, h, t) {
  for (let i = 0; i < 4; i++) {
    const grd = ctx.createLinearGradient(0, h*0.65, 0, h);
    grd.addColorStop(0, 'transparent');
    grd.addColorStop(1, `rgba(20,4,8,${0.35 + i*0.08})`);
    ctx.fillStyle = grd;
    const offsetX = Math.sin(t*0.0005 + i) * 60;
    ctx.beginPath();
    ctx.ellipse(w*0.5 + offsetX, h*0.88, w*0.9, h*0.25, 0, 0, Math.PI*2);
    ctx.fill();
  }
}

// Fireflies (amber dots)
const fireflies = Array.from({length:25}, () => ({
  x: Math.random(), y: 0.4 + Math.random()*0.45,
  vx: (Math.random()-.5)*0.0003, vy: (Math.random()-.5)*0.0003,
  phase: Math.random()*Math.PI*2, speed: 0.8 + Math.random()*1.5
}));

function animateForest(t) {
  fCtx.clearRect(0,0,forestW,forestH);

  // Sky
  const sky = fCtx.createLinearGradient(0,0,0,forestH);
  sky.addColorStop(0, '#020005');
  sky.addColorStop(0.5, '#04000a');
  sky.addColorStop(1, '#0a0208');
  fCtx.fillStyle = sky; fCtx.fillRect(0,0,forestW,forestH);

  drawMoon(fCtx, forestW, forestH);

  // Stars
  fCtx.fillStyle = 'rgba(200,190,170,0.5)';
  for (let i = 0; i < 80; i++) {
    const sx = ((i * 73 + 17) % 100)/100 * forestW;
    const sy = ((i * 47 + 31) % 60)/100 * forestH;
    const blink = Math.sin(t*0.001*((i%5)+1) + i) * 0.5 + 0.5;
    fCtx.globalAlpha = blink * 0.6;
    fCtx.fillRect(sx, sy, 1, 1);
  }
  fCtx.globalAlpha = 1;

  // Background trees (far, thin, many)
  for (let i = 0; i < 30; i++) {
    const tx = (i/30)*forestW + Math.sin(i*7)*20;
    drawForestTree(fCtx, tx, forestH*0.82, 40+Math.sin(i*3)*15, 200+Math.cos(i*2)*60, 4);
  }
  // Mid trees
  for (let i = 0; i < 18; i++) {
    const tx = (i/18)*forestW + forestW/36 + Math.cos(i*5)*10;
    drawForestTree(fCtx, tx, forestH*0.9, 60+Math.sin(i*4)*20, 280+Math.sin(i*2)*80, 2);
  }
  // Foreground trees
  for (let i = 0; i < 9; i++) {
    const tx = (i/9)*forestW + forestW/18;
    drawForestTree(fCtx, tx, forestH*1.02, 90+i*8, 360+i*20, 0);
  }

  drawGroundFog(fCtx, forestW, forestH, t);

  // Fireflies
  fireflies.forEach((ff, i) => {
    ff.x += ff.vx; ff.y += ff.vy;
    if (ff.x < 0 || ff.x > 1) ff.vx *= -1;
    if (ff.y < 0.3 || ff.y > 0.9) ff.vy *= -1;
    const blink = Math.sin(t * 0.002 * ff.speed + ff.phase);
    if (blink > 0.3) {
      const fx = ff.x * forestW, fy = ff.y * forestH;
      fCtx.beginPath(); fCtx.arc(fx, fy, 2, 0, Math.PI*2);
      fCtx.fillStyle = `rgba(255,180,50,${(blink-0.3)*0.8})`;
      fCtx.shadowBlur = 12; fCtx.shadowColor = 'rgba(255,140,0,0.6)'; fCtx.fill();
      fCtx.shadowBlur = 0;
    }
  });

  requestAnimationFrame(animateForest);
}
requestAnimationFrame(animateForest);

// ─── H&G SCROLL CHAPTER ───────────────────
const hgSection  = document.querySelector('.hg-scroll');
const hgScenes   = document.querySelectorAll('.hg-scene');
const hgCrumbs   = document.querySelectorAll('.crumb');
const totalHGScenes = hgScenes.length;
let currentHGScene = 0;

function activateHGScene(index) {
  if (index === currentHGScene) return;

  // Deactivate old
  hgScenes[currentHGScene].classList.remove('hg-scene--active');

  // Activate new
  currentHGScene = index;
  hgScenes[currentHGScene].classList.add('hg-scene--active');

  // Update breadcrumbs
  hgCrumbs.forEach((crumb, i) => {
    crumb.classList.remove('active', 'eaten');
    if (i < index)  crumb.classList.add('eaten');
    if (i === index) crumb.classList.add('active');
  });

  // XP for exploring
  gainXP(8, `CHAPTER ${index + 1} — FOREST DEEPENS`);

  // Screen flash on scene 3 (the house reveal)
  if (index === 3) triggerLightning('rgba(139,0,0,0.15)');
  if (index === 4) triggerLightning('rgba(60,0,0,0.25)');
}

function updateHGScroll() {
  if (!hgSection) return;
  const rect    = hgSection.getBoundingClientRect();
  const winH    = window.innerHeight;
  const totalH  = hgSection.offsetHeight - winH;
  if (rect.top <= 0 && rect.bottom >= winH) {
    const progress   = Math.min(Math.max(Math.abs(rect.top) / totalH, 0), 1);
    const sceneIndex = Math.min(Math.floor(progress * totalHGScenes), totalHGScenes - 1);
    activateHGScene(sceneIndex);
  }
}

// ─── STUDIO STORY SCROLL ──────────────────
const storySection = document.querySelector('.story-scroll');
const storySlides  = document.querySelectorAll('.story-slide');
const progressBar  = document.getElementById('story-progress');
let   currentSlide = 0;

function updateStoryScroll() {
  if (!storySection) return;
  const rect   = storySection.getBoundingClientRect();
  const winH   = window.innerHeight;
  const scrollH = storySection.offsetHeight - winH;
  if (rect.top <= 0 && rect.bottom >= winH) {
    const progress   = Math.min(Math.max(Math.abs(rect.top) / scrollH, 0), 1);
    const slideIndex = Math.min(Math.floor(progress * storySlides.length), storySlides.length - 1);
    progressBar.style.height = (progress * 100) + '%';
    if (slideIndex !== currentSlide) {
      storySlides[currentSlide].classList.remove('active'); storySlides[currentSlide].classList.add('exit');
      const prev = currentSlide;
      setTimeout(() => storySlides[prev].classList.remove('exit'), 700);
      currentSlide = slideIndex;
      storySlides[currentSlide].classList.add('active');
      gainXP(5, 'STORY UNFOLDED');
    }
  }
}

// ─── SCROLL LISTENER (combined) ───────────
window.addEventListener('scroll', () => {
  updateHGScroll();
  updateStoryScroll();
  // Nav
  document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 60);
  // Parallax background
  const scrolled = window.pageYOffset;
  const cracks = document.querySelector('.bg-cracks');
  if (cracks) cracks.style.transform = `translateY(${scrolled * 0.06}px)`;
}, { passive: true });

// ─── SCROLL REVEAL for other sections ─────
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('revealed'); revealObs.unobserve(entry.target); } });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.section-header').forEach(el => revealObs.observe(el));

// Hero entrance
setTimeout(() => {
  document.querySelectorAll('.hero-eyebrow,.hero-sub,.hero-cta').forEach((el,i) => {
    setTimeout(() => el.classList.add('revealed'), 200 + i*200);
  });
  document.querySelectorAll('.title-line').forEach((el,i) => {
    setTimeout(() => el.classList.add('revealed'), 300 + i*150);
  });
}, 100);

// Count-up stats
document.querySelectorAll('.stat-num').forEach(el => {
  const obs = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) {
      const target = parseInt(el.dataset.count); let cur = 0;
      el.classList.add('revealed');
      const step = () => { cur++; el.textContent = cur; if (cur < target) setTimeout(step, 200); };
      setTimeout(step, 400); obs.unobserve(el);
    }
  }, { threshold: 0.5 });
  obs.observe(el);
});

// Stagger game items
document.querySelectorAll('.game-item').forEach((el, i) => {
  const obs = new IntersectionObserver(([e]) => { if(e.isIntersecting){ setTimeout(()=>el.classList.add('revealed'),i*130); obs.unobserve(el); } }, { threshold:.08 });
  obs.observe(el);
});

// Stagger tier/social
document.querySelectorAll('.tier-card,.social-card').forEach((el,i) => {
  const obs = new IntersectionObserver(([e]) => { if(e.isIntersecting){ setTimeout(()=>el.classList.add('revealed'),i*90); obs.unobserve(el); } }, { threshold:.08 });
  obs.observe(el);
});

// ─── LIGHTNING FLASH ──────────────────────
function triggerLightning(color = 'rgba(139,0,0,0.12)') {
  const flash = document.createElement('div');
  flash.style.cssText = `position:fixed;inset:0;background:${color};pointer-events:none;z-index:8000;animation:lightFlash .3s ease-out forwards`;
  document.body.appendChild(flash);
  if (!document.getElementById('flashStyle')) {
    const s = document.createElement('style');
    s.id = 'flashStyle';
    s.textContent = '@keyframes lightFlash{0%,100%{opacity:0}40%{opacity:1}}';
    document.head.appendChild(s);
  }
  setTimeout(() => flash.remove(), 300);
}

// Random lightning every 12–20s
(function scheduleLightning() {
  setTimeout(() => { triggerLightning(); scheduleLightning(); }, 12000 + Math.random()*8000);
})();

// ─── MOBILE MENU ──────────────────────────
const menuToggle = document.getElementById('menu-toggle');
const navLinks   = document.getElementById('nav-links');
menuToggle.addEventListener('click', e => { e.stopPropagation(); navLinks.classList.toggle('open'); });
document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

// ─── SMOOTH ANCHOR SCROLL ─────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const t = document.querySelector(a.getAttribute('href'));
    if (t) window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - 88, behavior: 'smooth' });
  });
});

// ─── WELCOME XP ───────────────────────────
window.addEventListener('load', () => {
  if (!sessionStorage.getItem('welcomed')) {
    setTimeout(() => { gainXP(10,'DARKNESS ENTERED'); sessionStorage.setItem('welcomed','1'); }, 1400);
  }
});

// ─── KONAMI CODE ──────────────────────────
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let kPos = 0;
document.addEventListener('keydown', e => {
  if (e.key === KONAMI[kPos]) {
    kPos++;
    if (kPos === KONAMI.length) {
      gainXP(999, '☠ KONAMI CODE — DARK GOD AWAKENED');
      for (let i=0;i<6;i++) setTimeout(()=>createBurst(Math.random()*innerWidth,Math.random()*innerHeight,'#c0392b',25),i*180);
      kPos = 0;
    }
  } else kPos = 0;
});

console.log('%c☠ ALENITH','color:#c0392b;font-size:36px;font-weight:bold;font-family:serif;');
console.log('%cKonami Code unlocks something wicked... ↑↑↓↓←→←→BA','color:#8b0000;font-size:13px;');