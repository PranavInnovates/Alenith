'use strict';
/* ═════════════════════════════════════════════
   ALENITH — script.js v5
   • Skull cursor — 30px, velocity tilt
   • Canvas trail — teal/amber dots
   • Hero skull eye tracking + 3D parallax tilt
   • Horror Web Audio sounds
   • XP system · Scroll scenes · Forest canvas
   • Contact form handler
   • Konami code
═════════════════════════════════════════════ */

/* ─── SKULL CURSOR ──────────────────────────── */
const $skull = document.getElementById('skull-cur');
let mx = -300, my = -300;
let pmx = -300, pmy = -300;
let rafCursor = false;

document.addEventListener('mousemove', e => {
  pmx = mx; pmy = my;
  mx = e.clientX;
  my = e.clientY;
  if (!rafCursor) {
    rafCursor = true;
    requestAnimationFrame(() => {
      const vx = mx - pmx;
      const vy = my - pmy;
      const tilt = Math.max(-24, Math.min(24, vx * 0.9));
      const lean = Math.max(-10, Math.min(10, vy * 0.4));
      $skull.style.left      = mx + 'px';
      $skull.style.top       = my + 'px';
      $skull.style.transform = `translate(-10px,-8px) rotate(${tilt}deg) rotateX(${-lean}deg)`;
      rafCursor = false;
    });
  }
}, { passive: true });

document.addEventListener('mouseleave', () => { $skull.style.opacity = '0'; });
document.addEventListener('mouseenter', () => { $skull.style.opacity = '1'; });

/* ─── CANVAS CURSOR TRAIL ───────────────────── */
const trailCanvas = document.getElementById('trail-canvas');
if (trailCanvas) {
  const tctx = trailCanvas.getContext('2d');

  function resizeTrail() {
    trailCanvas.width  = window.innerWidth;
    trailCanvas.height = window.innerHeight;
  }
  resizeTrail();
  window.addEventListener('resize', resizeTrail, { passive: true });

  const trailPts = [];
  const MAX_TRAIL = 20;

  ;(function loopTrail() {
    requestAnimationFrame(loopTrail);
    tctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);

    if (mx > 0) trailPts.push({ x: mx, y: my, life: 1 });
    if (trailPts.length > MAX_TRAIL) trailPts.shift();

    for (let i = 0; i < trailPts.length; i++) {
      const p = trailPts[i];
      p.life -= 0.052;
      if (p.life <= 0) continue;
      const r = p.life * 3.8;
      const col = i % 2 === 0
        ? `rgba(2,117,120,${(p.life * 0.55).toFixed(2)})`
        : `rgba(253,167,66,${(p.life * 0.38).toFixed(2)})`;
      tctx.beginPath();
      tctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      tctx.fillStyle = col;
      tctx.fill();
    }
  })();
}

/* ─── HERO SKULL EYE TRACKING ──────────────── */
const heroSkull = document.getElementById('hero-skull');
const hsPupilL  = document.getElementById('hs-pupil-l');
const hsPupilR  = document.getElementById('hs-pupil-r');
const BASE_L = { cx: 72, cy: 88 };
const BASE_R = { cx: 128, cy: 88 };
const MAX_OFF = 6.5;

function updateEyes() {
  if (!heroSkull || !hsPupilL || !hsPupilR) return;
  const rect = heroSkull.getBoundingClientRect();
  const cx = rect.left + rect.width  / 2;
  const cy = rect.top  + rect.height / 2;
  const dx = mx - cx;
  const dy = my - cy;
  const dist = Math.sqrt(dx*dx + dy*dy) || 1;
  const factor = Math.min(1, dist / 280);
  const ox = (dx / dist) * MAX_OFF * factor;
  const oy = (dy / dist) * MAX_OFF * factor;
  hsPupilL.setAttribute('cx', BASE_L.cx + ox);
  hsPupilL.setAttribute('cy', BASE_L.cy + oy);
  hsPupilR.setAttribute('cx', BASE_R.cx + ox);
  hsPupilR.setAttribute('cy', BASE_R.cy + oy);
}
document.addEventListener('mousemove', updateEyes, { passive: true });

/* ─── HERO SKULL 3D PARALLAX ────────────────── */
document.addEventListener('mousemove', e => {
  const wrap = document.getElementById('hero-skull-wrap');
  if (!wrap || !heroSkull) return;
  const rect = wrap.getBoundingClientRect();
  if (rect.width === 0) return;
  const rx = ((e.clientX - rect.left - rect.width  / 2) / rect.width)  * 14;
  const ry = ((e.clientY - rect.top  - rect.height / 2) / rect.height) * 9;
  heroSkull.style.transform = `perspective(650px) rotateY(${rx}deg) rotateX(${-ry}deg)`;
}, { passive: true });

/* ─── HORROR SOUND (Web Audio, no files) ──── */
let _ac = null;
function getAC() {
  if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)();
  return _ac;
}
const SOUNDS = ['creak','thud','whisper','drip','growl'];

function playHorror() {
  try {
    const ac  = getAC();
    const now = ac.currentTime;
    const pick = SOUNDS[Math.floor(Math.random() * SOUNDS.length)];

    if (pick === 'creak') {
      const o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(80, now);
      o.frequency.exponentialRampToValueAtTime(38, now+.35);
      g.gain.setValueAtTime(.12, now);
      g.gain.exponentialRampToValueAtTime(.001, now+.38);
      o.start(now); o.stop(now+.4);
    } else if (pick === 'thud') {
      const o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(140, now);
      o.frequency.exponentialRampToValueAtTime(20, now+.18);
      g.gain.setValueAtTime(.22, now);
      g.gain.exponentialRampToValueAtTime(.001, now+.22);
      o.start(now); o.stop(now+.25);
    } else if (pick === 'whisper') {
      const buf = ac.createBuffer(1, ac.sampleRate*.18, ac.sampleRate);
      const d = buf.getChannelData(0);
      for (let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*.06;
      const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
      s.buffer = buf; f.type='bandpass'; f.frequency.value=1800; f.Q.value=.4;
      s.connect(f); f.connect(g); g.connect(ac.destination);
      g.gain.setValueAtTime(1, now);
      g.gain.exponentialRampToValueAtTime(.001, now+.18);
      s.start(now);
    } else if (pick === 'drip') {
      const o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(900, now);
      o.frequency.exponentialRampToValueAtTime(340, now+.14);
      g.gain.setValueAtTime(.09, now);
      g.gain.exponentialRampToValueAtTime(.001, now+.16);
      o.start(now); o.stop(now+.18);
    } else {
      const o = ac.createOscillator(), lfo = ac.createOscillator();
      const lg = ac.createGain(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      lfo.connect(lg); lg.connect(o.frequency);
      o.type='sawtooth'; o.frequency.value=55;
      lfo.type='sine'; lfo.frequency.value=12; lg.gain.value=22;
      g.gain.setValueAtTime(.15, now);
      g.gain.exponentialRampToValueAtTime(.001, now+.28);
      lfo.start(now); o.start(now); lfo.stop(now+.3); o.stop(now+.3);
    }
  } catch(e) { /* silent */ }
}

/* ─── CLICK PARTICLE ────────────────────────── */
function spawnParticle(x, y) {
  const p = document.createElement('span');
  const dx = (Math.random() - .5) * 85;
  const dy = -(32 + Math.random() * 48);
  p.style.cssText = `
    position:fixed;left:${x}px;top:${y}px;
    font-size:${.9 + Math.random() * .6}rem;line-height:1;
    pointer-events:none;z-index:99998;
    transform:translate(-50%,-50%);
    will-change:transform,opacity;
  `;
  p.textContent = Math.random() > .5 ? '💀' : '🦴';
  document.body.appendChild(p);
  requestAnimationFrame(() => {
    p.style.transition = 'transform .68s cubic-bezier(.2,.8,.4,1), opacity .68s ease';
    p.style.transform  = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.28)`;
    p.style.opacity    = '0';
    setTimeout(() => p.remove(), 720);
  });
}

/* ─── GLOBAL CLICK ──────────────────────────── */
document.addEventListener('click', e => {
  $skull.classList.add('clicking');
  setTimeout(() => $skull.classList.remove('clicking'), 240);
  playHorror();
  spawnParticle(e.clientX, e.clientY);
});

/* ─── XP SYSTEM ─────────────────────────────── */
let xp    = +localStorage.getItem('al_xp') || 0;
let level = +localStorage.getItem('al_lv') || 1;
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
function showToast(msg) {
  $toast.textContent = msg;
  $toast.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => $toast.classList.remove('show'), 2700);
}

function gainXP(n, label) {
  xp += n;
  const lv = Math.floor(xp / XP_PER_LV) + 1;
  const $xpBar = document.querySelector('.xp-bar');
  if (lv > level) {
    level = lv;
    $xpBar && $xpBar.classList.add('levelup');
    setTimeout(() => $xpBar && $xpBar.classList.remove('levelup'), 650);
    showToast(`⬆ LEVEL ${level} — SOUL RISING`);
  } else {
    showToast(`+${n} SOUL — ${label || 'DARKNESS GROWS'}`);
  }
  localStorage.setItem('al_xp', xp);
  localStorage.setItem('al_lv', level);
  renderXP();
}

document.querySelectorAll('.xp-action').forEach(el => {
  let used = false;
  el.addEventListener('click', () => {
    if (!used) { gainXP(+el.dataset.xp || 10); used = true; }
    // navigation proceeds naturally — no preventDefault
  });
});

renderXP();
window.addEventListener('load', () => {
  if (!sessionStorage.getItem('al_welcome')) {
    setTimeout(() => { gainXP(10, 'DARKNESS ENTERED'); sessionStorage.setItem('al_welcome','1'); }, 1200);
  }
});

/* ─── COMMUNITY HOVER XP ───────────────────── */
document.querySelectorAll('.soc').forEach(el => {
  let done = false;
  el.addEventListener('mouseenter', () => {
    if (!done) { gainXP(2, 'LURKING IN SHADOWS'); done = true; }
  });
});

/* ─── NAV ───────────────────────────────────── */
const $nav    = document.getElementById('nav');
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
  if ($links.classList.contains('open') &&
      !$links.contains(e.target) &&
      !$burger.contains(e.target)) {
    $links.classList.remove('open');
    $burger.classList.remove('open');
    $burger.setAttribute('aria-expanded', false);
  }
});

/* ─── SMOOTH ANCHORS ────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    const xphPx = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--xph')) || 28;
    const off = ($nav.offsetHeight || 62) + xphPx + 8;
    window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - off, behavior: 'smooth' });
  });
});

/* ─── STAT COUNT-UP ─────────────────────────── */
document.querySelectorAll('[data-count]').forEach(el => {
  const target = +el.dataset.count;
  let done = false;
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !done) {
      done = true;
      let n = 0;
      const step = () => { n++; el.textContent = n; if (n < target) setTimeout(step, 230); };
      setTimeout(step, 380);
    }
  }, { threshold: 0.5 }).observe(el);
});

/* ─── SCROLL REVEAL ─────────────────────────── */
const revObs = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      e.target.style.transitionDelay = (i * 0.045) + 's';
      e.target.classList.add('in');
      // Trigger glitch on section headings
      const h2 = e.target.querySelector('h2');
      if (h2 && e.target.classList.contains('sh')) {
        h2.dataset.text = h2.textContent;
        h2.classList.add('glitch-active');
        setTimeout(() => h2.classList.remove('glitch-active'), 500);
      }
      revObs.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

/* ─── FOREST CANVAS ─────────────────────────── */
const canvas = document.getElementById('hg-canvas');
const ctx    = canvas.getContext('2d');
const hgSec  = document.getElementById('hg');
let cW = 0, cH = 0, forestRAF = null, canvasVis = false;

function resizeCanvas() {
  cW = canvas.width  = canvas.offsetWidth;
  cH = canvas.height = canvas.offsetHeight;
}
let resizeDeb;
window.addEventListener('resize', () => {
  clearTimeout(resizeDeb);
  resizeDeb = setTimeout(resizeCanvas, 160);
}, { passive: true });
resizeCanvas();

new IntersectionObserver(([e]) => {
  canvasVis = e.isIntersecting;
  if (canvasVis && !forestRAF) forestRAF = requestAnimationFrame(drawForest);
}, { threshold: 0 }).observe(hgSec);

const STARS = Array.from({ length: 55 }, (_, i) => ({
  x: ((i*73+17)%100)/100,
  y: ((i*47+31)%55)/100,
  sp: (i%4)+1
}));
const FLIES = Array.from({ length: 14 }, () => ({
  x: Math.random(), y: .42 + Math.random()*.4,
  vx: (Math.random()-.5)*.00026,
  vy: (Math.random()-.5)*.00016,
  ph: Math.random()*Math.PI*2,
  sp: .8 + Math.random()*1.1
}));

function drawTree(x,y,w,h,r,g,b) {
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  const x0=x|0, y0=y|0, w2=(w/2)|0;
  for (let l=0;l<3;l++) {
    const ly=(y0-h*l/3)|0, lw=(w2*(1-l*.18))|0;
    ctx.beginPath();
    ctx.moveTo(x0, (ly-h*.48)|0);
    ctx.lineTo(x0-lw, ly);
    ctx.lineTo(x0+lw, ly);
    ctx.closePath(); ctx.fill();
  }
  ctx.fillRect((x0-w*.065)|0, y0-14, (w*.13)|0, 20);
}

function drawForest(t) {
  if (!canvasVis) { forestRAF = null; return; }
  forestRAF = requestAnimationFrame(drawForest);
  ctx.clearRect(0,0,cW,cH);

  const sky = ctx.createLinearGradient(0,0,0,cH);
  sky.addColorStop(0,'#010810'); sky.addColorStop(.55,'#02101a'); sky.addColorStop(1,'#041820');
  ctx.fillStyle = sky; ctx.fillRect(0,0,cW,cH);

  ctx.globalAlpha=.07; ctx.fillStyle='#d4c8a8';
  ctx.beginPath(); ctx.arc((cW*.78)|0,(cH*.1)|0,48,0,Math.PI*2); ctx.fill();
  ctx.globalAlpha=.04;
  ctx.beginPath(); ctx.arc((cW*.78)|0,(cH*.1)|0,28,0,Math.PI*2); ctx.fill();
  ctx.globalAlpha=1;

  for (let i=0;i<STARS.length;i++) {
    const s=STARS[i], bk=(Math.sin(t*.001*s.sp+i)+1)*.28;
    ctx.globalAlpha=bk; ctx.fillStyle='#c8bea0';
    ctx.fillRect((s.x*cW)|0,(s.y*cH)|0,1,1);
  }
  ctx.globalAlpha=1;

  for (let i=0;i<22;i++) drawTree(((i/22)*cW+Math.sin(i*6)*16)|0,cH*.8,38,170,2,14,16);
  for (let i=0;i<13;i++) drawTree(((i/13)*cW+cW/26)|0,cH*.88,54,235,1,8,10);
  for (let i=0;i<7;i++)  drawTree(((i/7)*cW+cW/14)|0,cH*1.01,78,295,1,4,5);

  const fog=ctx.createLinearGradient(0,cH*.72,0,cH);
  fog.addColorStop(0,'rgba(4,18,26,0)'); fog.addColorStop(1,'rgba(4,18,26,0.6)');
  ctx.fillStyle=fog; ctx.fillRect(0,cH*.72,cW,cH*.28);

  for (const ff of FLIES) {
    ff.x+=ff.vx; ff.y+=ff.vy;
    if(ff.x<0||ff.x>1) ff.vx*=-1;
    if(ff.y<.3||ff.y>.9) ff.vy*=-1;
    const bk=Math.sin(t*.002*ff.sp+ff.ph);
    if (bk>.3) {
      ctx.globalAlpha=(bk-.3)*.85; ctx.fillStyle='#fda742';
      ctx.beginPath(); ctx.arc((ff.x*cW)|0,(ff.y*cH)|0,1.5,0,Math.PI*2); ctx.fill();
    }
  }
  ctx.globalAlpha=1;
}

/* ─── H&G SCROLL SCENES ────────────────────── */
const hgScenes = document.querySelectorAll('.hs');
const hgDots   = document.querySelectorAll('.hd');
const N_SC     = hgScenes.length;
let lastSc = -1, hgTop = 0, hgScrollH = 0;

function measureHG() {
  const r = hgSec.getBoundingClientRect();
  hgTop = r.top + window.scrollY;
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
  if (lastSc >= 0) gainXP(5, `CHAPTER ${idx+1}`);
  lastSc = idx;
}
setScene(0);

/* ─── STORY SCROLL ──────────────────────────── */
const storySec    = document.querySelector('.story-section');
const storySlides = document.querySelectorAll('.ss');
const $spFill     = document.getElementById('sp-fill');
let curSS = 0, ssTop = 0, ssScrollH = 0;

function measureSS() {
  const r = storySec.getBoundingClientRect();
  ssTop = r.top + window.scrollY;
  ssScrollH = storySec.offsetHeight - window.innerHeight;
}
measureSS();
window.addEventListener('resize', measureSS, { passive: true });

/* ─── UNIFIED SCROLL HANDLER ────────────────── */
let scrollPending = false;
window.addEventListener('scroll', () => {
  if (scrollPending) return;
  scrollPending = true;
  requestAnimationFrame(() => {
    scrollPending = false;
    const sy = window.scrollY;

    $nav.classList.toggle('solid', sy > 50);

    // H&G
    const hgProg = Math.min(Math.max((sy-hgTop)/hgScrollH,0),1);
    if (sy >= hgTop - window.innerHeight && sy <= hgTop+hgScrollH+window.innerHeight) {
      setScene(Math.min(Math.floor(hgProg*N_SC), N_SC-1));
    }

    // Story
    const ssProg = Math.min(Math.max((sy-ssTop)/ssScrollH,0),1);
    if (sy >= ssTop - window.innerHeight && sy <= ssTop+ssScrollH+window.innerHeight) {
      $spFill.style.height = (ssProg*100)+'%';
      const idx = Math.min(Math.floor(ssProg*storySlides.length), storySlides.length-1);
      if (idx !== curSS) {
        storySlides[curSS].classList.remove('active');
        storySlides[curSS].classList.add('exit');
        const prev = curSS;
        setTimeout(() => storySlides[prev]?.classList.remove('exit'), 600);
        curSS = idx;
        storySlides[curSS].classList.add('active');
        gainXP(4, 'STORY UNFOLDED');
      }
    }
  });
}, { passive: true });

/* ─── CONTACT FORM ──────────────────────────── */
window.handleSubmit = function(e) {
  e.preventDefault();
  gainXP(20, 'MESSAGE SENT INTO THE VOID');
  showToast('☠ MESSAGE RECEIVED. WE WILL FIND YOU.');
  e.target.reset();
};

/* ─── KONAMI CODE ───────────────────────────── */
const K = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let ki = 0;
document.addEventListener('keydown', e => {
  if (e.key === K[ki]) { ki++; if (ki===K.length) { gainXP(999,'☠ DARK GOD AWAKENED'); ki=0; } }
  else ki = 0;
});

console.log('%cALENITH','color:#027578;font-size:32px;font-family:serif;font-weight:bold;');
console.log('%c☠  ↑↑↓↓←→←→BA  ☠','color:#fda742;font-size:14px;');

/* ─── CURSOR GLOW ON INTERACTIVE HOVER ─── */
document.querySelectorAll('a, button, .soc, .tier, .game').forEach(el => {
  el.addEventListener('mouseenter', () => {
    $skull.style.filter = 'drop-shadow(0 0 12px rgba(253,167,66,.85))';
  });
  el.addEventListener('mouseleave', () => {
    $skull.style.filter = 'drop-shadow(0 0 5px rgba(2,117,120,.6))';
  });
});

/* ─── GAME ROW HOVER SOUND ─── */
document.querySelectorAll('.game').forEach(el => {
  el.addEventListener('mouseenter', () => {
    try {
      const ac = getAC(), now = ac.currentTime;
      const o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = 'square'; o.frequency.value = 220;
      g.gain.setValueAtTime(.04, now);
      g.gain.exponentialRampToValueAtTime(.001, now + .08);
      o.start(now); o.stop(now + .09);
    } catch(e){}
  });
});

/* ─── WISHLIST BTN EXTRA SPARKLE ─── */
const wishlistBtns = document.querySelectorAll('.btn-wishlist, .glink-wishlist');
wishlistBtns.forEach(btn => {
  btn.addEventListener('mouseenter', () => {
    try {
      const ac = getAC(), now = ac.currentTime;
      const o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(440, now);
      o.frequency.exponentialRampToValueAtTime(660, now + .12);
      g.gain.setValueAtTime(.06, now);
      g.gain.exponentialRampToValueAtTime(.001, now + .14);
      o.start(now); o.stop(now + .15);
    } catch(e){}
  });
});