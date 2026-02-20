'use strict';
/* ══════════════════════════════════════════════════════
   ALENITH — script.js v7
   Enhanced interactions: skull cursor + eye tracking,
   canvas trail, 3D parallax, horror sounds, XP system,
   H&G scroll, story slides, forest canvas, glitch reveals,
   magnetic buttons, charge click, Konami code
══════════════════════════════════════════════════════ */

/* ─── SKULL CURSOR ─────────────────────────────────── */
const $skull = document.getElementById('skull-cur');
let mx = -300, my = -300, pmx = -300, pmy = -300;
let rafCur = false;

document.addEventListener('mousemove', e => {
  pmx = mx; pmy = my;
  mx = e.clientX; my = e.clientY;
  if (!rafCur) {
    rafCur = true;
    requestAnimationFrame(() => {
      const vx   = mx - pmx;
      const vy   = my - pmy;
      const tilt = Math.max(-26, Math.min(26, vx * 0.9));
      const lean = Math.max(-10, Math.min(10, vy * 0.38));
      $skull.style.left      = mx + 'px';
      $skull.style.top       = my + 'px';
      $skull.style.transform = `translate(-10px,-8px) rotate(${tilt}deg) rotateX(${-lean}deg)`;
      rafCur = false;
    });
  }
}, { passive: true });

document.addEventListener('mouseleave', () => { $skull.style.opacity = '0' });
document.addEventListener('mouseenter', () => { $skull.style.opacity = '1' });

/* ─── CURSOR GLOW ON INTERACTIVE HOVER ─────────────── */
document.querySelectorAll('a, button, .soc, .tier, .game').forEach(el => {
  el.addEventListener('mouseenter', () => {
    $skull.style.filter = 'drop-shadow(0 0 14px rgba(253,167,66,.9))';
  });
  el.addEventListener('mouseleave', () => {
    $skull.style.filter = 'drop-shadow(0 0 5px rgba(2,117,120,.6))';
  });
});

/* ─── CURSOR TRAIL CANVAS ──────────────────────────── */
const trailCanvas = document.getElementById('trail-canvas');
if (trailCanvas) {
  const tctx = trailCanvas.getContext('2d');
  const resize = () => { trailCanvas.width = window.innerWidth; trailCanvas.height = window.innerHeight; };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const pts = [];
  const MAX = 22;
  ;(function loop() {
    requestAnimationFrame(loop);
    tctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
    if (mx > 0) pts.push({ x: mx, y: my, life: 1 });
    if (pts.length > MAX) pts.shift();
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      p.life -= 0.048;
      if (p.life <= 0) continue;
      const r   = p.life * 4.2;
      const col = i % 2 === 0
        ? `rgba(2,117,120,${(p.life * .55).toFixed(2)})`
        : `rgba(253,167,66,${(p.life * .38).toFixed(2)})`;
      tctx.beginPath();
      tctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      tctx.fillStyle = col;
      tctx.fill();
    }
  })();
}

/* ─── HERO SKULL EYE TRACKING ──────────────────────── */
const heroSkull = document.getElementById('hero-skull');
const hsPupilL  = document.getElementById('hs-pupil-l');
const hsPupilR  = document.getElementById('hs-pupil-r');
const BASE_L = { cx: 72, cy: 88 };
const BASE_R = { cx: 128, cy: 88 };
const MAX_OFF = 6.5;

function updateEyes() {
  if (!heroSkull || !hsPupilL) return;
  const rect = heroSkull.getBoundingClientRect();
  const cx = rect.left + rect.width  / 2;
  const cy = rect.top  + rect.height / 2;
  const dx = mx - cx, dy = my - cy;
  const dist = Math.sqrt(dx*dx + dy*dy) || 1;
  const f  = Math.min(1, dist / 300);
  const ox = (dx / dist) * MAX_OFF * f;
  const oy = (dy / dist) * MAX_OFF * f;
  hsPupilL.setAttribute('cx', BASE_L.cx + ox);
  hsPupilL.setAttribute('cy', BASE_L.cy + oy);
  hsPupilR.setAttribute('cx', BASE_R.cx + ox);
  hsPupilR.setAttribute('cy', BASE_R.cy + oy);
}
document.addEventListener('mousemove', updateEyes, { passive: true });

/* ─── HERO SKULL 3D PARALLAX ────────────────────────── */
document.addEventListener('mousemove', e => {
  const wrap = document.getElementById('hero-skull-wrap');
  if (!wrap || !heroSkull) return;
  const rect = wrap.getBoundingClientRect();
  if (!rect.width) return;
  const rx = ((e.clientX - rect.left  - rect.width  / 2) / rect.width)  * 16;
  const ry = ((e.clientY - rect.top   - rect.height / 2) / rect.height) * 10;
  heroSkull.style.transform = `perspective(700px) rotateY(${rx}deg) rotateX(${-ry}deg)`;
}, { passive: true });

/* ─── MAGNETIC BUTTONS ──────────────────────────────── */
document.querySelectorAll('.btn, .btn-wishlist, .tier-btn, .glink').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r  = btn.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width  / 2)) * .28;
    const dy = (e.clientY - (r.top  + r.height / 2)) * .28;
    btn.style.transform = `translate(${dx}px,${dy}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

/* ─── CHARGE CLICK EFFECT ───────────────────────────── */
let chargeTimer = null, chargeStart = 0;
document.addEventListener('mousedown', e => {
  chargeStart = Date.now();
  chargeTimer = setTimeout(() => {
    // Long press — spawn burst
    for (let i = 0; i < 8; i++) {
      setTimeout(() => spawnParticle(e.clientX, e.clientY, true), i * 35);
    }
    try {
      const ac = getAC(), now = ac.currentTime;
      const o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(40, now);
      o.frequency.exponentialRampToValueAtTime(200, now + .4);
      g.gain.setValueAtTime(.18, now);
      g.gain.exponentialRampToValueAtTime(.001, now + .45);
      o.start(now); o.stop(now + .5);
    } catch(err){}
  }, 380);
});
document.addEventListener('mouseup', () => { clearTimeout(chargeTimer) });

/* ─── HORROR AUDIO ──────────────────────────────────── */
let _ac = null;
function getAC() {
  if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)();
  return _ac;
}
const SFX = ['creak','thud','whisper','drip','growl'];

function playHorror(type) {
  try {
    const ac  = getAC(), now = ac.currentTime;
    const sfx = type || SFX[Math.floor(Math.random() * SFX.length)];
    if (sfx === 'creak') {
      const o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(85, now);
      o.frequency.exponentialRampToValueAtTime(35, now + .38);
      g.gain.setValueAtTime(.1, now); g.gain.exponentialRampToValueAtTime(.001, now + .4);
      o.start(now); o.stop(now + .42);
    } else if (sfx === 'thud') {
      const o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(140, now);
      o.frequency.exponentialRampToValueAtTime(18, now + .2);
      g.gain.setValueAtTime(.2, now); g.gain.exponentialRampToValueAtTime(.001, now + .22);
      o.start(now); o.stop(now + .25);
    } else if (sfx === 'whisper') {
      const buf = ac.createBuffer(1, ac.sampleRate * .18, ac.sampleRate);
      const d   = buf.getChannelData(0);
      for (let i=0; i<d.length; i++) d[i] = (Math.random()*2-1)*.055;
      const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
      s.buffer=buf; f.type='bandpass'; f.frequency.value=1800; f.Q.value=.4;
      s.connect(f); f.connect(g); g.connect(ac.destination);
      g.gain.setValueAtTime(1, now); g.gain.exponentialRampToValueAtTime(.001, now + .18);
      s.start(now);
    } else if (sfx === 'drip') {
      const o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(900, now);
      o.frequency.exponentialRampToValueAtTime(320, now + .15);
      g.gain.setValueAtTime(.08, now); g.gain.exponentialRampToValueAtTime(.001, now + .17);
      o.start(now); o.stop(now + .19);
    } else {
      const o = ac.createOscillator(), lfo = ac.createOscillator();
      const lg = ac.createGain(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      lfo.connect(lg); lg.connect(o.frequency);
      o.type='sawtooth'; o.frequency.value=52;
      lfo.type='sine'; lfo.frequency.value=11; lg.gain.value=20;
      g.gain.setValueAtTime(.14, now); g.gain.exponentialRampToValueAtTime(.001, now + .3);
      lfo.start(now); o.start(now); lfo.stop(now + .32); o.stop(now + .32);
    }
  } catch(e){}
}

/* ─── GAME ROW HOVER SOUND ──────────────────────────── */
document.querySelectorAll('.game').forEach(el => {
  el.addEventListener('mouseenter', () => {
    try {
      const ac=getAC(), now=ac.currentTime;
      const o=ac.createOscillator(), g=ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type='square'; o.frequency.value=200;
      g.gain.setValueAtTime(.035, now); g.gain.exponentialRampToValueAtTime(.001, now+.09);
      o.start(now); o.stop(now+.1);
    } catch(e){}
  });
});

/* ─── WISHLIST HOVER SOUND ──────────────────────────── */
document.querySelectorAll('.btn-wishlist, .glink-wishlist').forEach(btn => {
  btn.addEventListener('mouseenter', () => {
    try {
      const ac=getAC(), now=ac.currentTime;
      const o=ac.createOscillator(), g=ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type='sine';
      o.frequency.setValueAtTime(440, now);
      o.frequency.exponentialRampToValueAtTime(660, now + .12);
      g.gain.setValueAtTime(.05, now); g.gain.exponentialRampToValueAtTime(.001, now + .14);
      o.start(now); o.stop(now + .15);
    } catch(e){}
  });
});

/* ─── CLICK PARTICLE ────────────────────────────────── */
const EMOJIS = ['💀','🦴','🩸','👁️','☠️'];
function spawnParticle(x, y, burst = false) {
  const p  = document.createElement('span');
  const dx = (Math.random() - .5) * (burst ? 140 : 90);
  const dy = -(burst ? 55 : 38) - Math.random() * (burst ? 60 : 50);
  p.style.cssText = `
    position:fixed;left:${x}px;top:${y}px;
    font-size:${.8 + Math.random() * .7}rem;line-height:1;
    pointer-events:none;z-index:99998;
    transform:translate(-50%,-50%);will-change:transform,opacity;
  `;
  p.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  document.body.appendChild(p);
  requestAnimationFrame(() => {
    p.style.transition = `transform .72s cubic-bezier(.2,.8,.4,1), opacity .72s ease`;
    p.style.transform  = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.2)`;
    p.style.opacity    = '0';
    setTimeout(() => p.remove(), 760);
  });
}

/* ─── GLOBAL CLICK ──────────────────────────────────── */
document.addEventListener('click', e => {
  $skull.classList.add('clicking');
  setTimeout(() => $skull.classList.remove('clicking'), 240);
  playHorror();
  spawnParticle(e.clientX, e.clientY);
});

/* ─── XP SYSTEM ─────────────────────────────────────── */
let xp    = +localStorage.getItem('al_xp') || 0;
let level = +localStorage.getItem('al_lv') || 1;
const XP_PER_LV = 100;
const $xpC  = document.getElementById('xp-count');
const $xpF  = document.getElementById('xp-fill');
const $xpLv = document.getElementById('xp-level');
const $toast = document.getElementById('toast');
let toastT;

function renderXP() {
  $xpC.textContent  = xp;
  $xpLv.textContent = level;
  $xpF.style.width  = ((xp % XP_PER_LV) / XP_PER_LV * 100) + '%';
}
function showToast(msg) {
  $toast.textContent = msg;
  $toast.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => $toast.classList.remove('show'), 2800);
}
function gainXP(n, label) {
  xp += n;
  const lv = Math.floor(xp / XP_PER_LV) + 1;
  const bar = document.querySelector('.xp-bar');
  if (lv > level) {
    level = lv;
    bar && bar.classList.add('levelup');
    setTimeout(() => bar && bar.classList.remove('levelup'), 720);
    showToast(`⬆ LEVEL ${level} — SOUL RISING`);
    playHorror('thud');
  } else {
    showToast(`+${n} SOUL — ${label || 'DARKNESS GROWS'}`);
  }
  localStorage.setItem('al_xp', xp);
  localStorage.setItem('al_lv', level);
  renderXP();
}

/* XP actions — never block external link navigation */
document.querySelectorAll('.xp-action').forEach(el => {
  let used = false;
  el.addEventListener('click', () => {
    if (!used) { gainXP(+el.dataset.xp || 10); used = true; }
  });
});

renderXP();
window.addEventListener('load', () => {
  if (!sessionStorage.getItem('al_welcome')) {
    setTimeout(() => { gainXP(10, 'DARKNESS ENTERED'); sessionStorage.setItem('al_welcome','1'); }, 1200);
  }
});

/* Community hover XP */
document.querySelectorAll('.soc').forEach(el => {
  let done = false;
  el.addEventListener('mouseenter', () => { if (!done) { gainXP(2, 'LURKING IN SHADOWS'); done = true; } });
});

/* ─── NAV ───────────────────────────────────────────── */
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
  if ($links.classList.contains('open') && !$links.contains(e.target) && !$burger.contains(e.target)) {
    $links.classList.remove('open');
    $burger.classList.remove('open');
    $burger.setAttribute('aria-expanded', false);
  }
});

/* ─── SMOOTH ANCHOR SCROLL ──────────────────────────── */
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

/* ─── STAT COUNT-UP ─────────────────────────────────── */
document.querySelectorAll('[data-count]').forEach(el => {
  const target = +el.dataset.count;
  let done = false;
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !done) {
      done = true;
      let n = 0;
      const step = () => { n++; el.textContent = n; if (n < target) setTimeout(step, 240); };
      setTimeout(step, 400);
    }
  }, { threshold: 0.5 }).observe(el);
});

/* ─── SCROLL REVEAL + HEADING GLITCH ───────────────── */
const revObs = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      e.target.style.transitionDelay = (i * .048) + 's';
      e.target.classList.add('in');
      // Glitch section headings on first reveal
      const h2 = e.target.querySelector && e.target.querySelector('h2');
      if (h2 && e.target.classList.contains('sh')) {
        h2.dataset.text = h2.textContent;
        h2.classList.add('glitch');
        setTimeout(() => h2.classList.remove('glitch'), 520);
      }
      revObs.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

/* ─── FOREST CANVAS ─────────────────────────────────── */
const canvas = document.getElementById('hg-canvas');
const ctx    = canvas.getContext('2d');
const hgSec  = document.getElementById('hg');
let cW=0, cH=0, forestRAF=null, canvasVis=false;

function resizeCanvas() { cW = canvas.width = canvas.offsetWidth; cH = canvas.height = canvas.offsetHeight; }
let resizeDeb;
window.addEventListener('resize', () => { clearTimeout(resizeDeb); resizeDeb = setTimeout(resizeCanvas, 160); }, { passive:true });
resizeCanvas();

new IntersectionObserver(([e]) => {
  canvasVis = e.isIntersecting;
  if (canvasVis && !forestRAF) forestRAF = requestAnimationFrame(drawForest);
}, { threshold: 0 }).observe(hgSec);

const STARS = Array.from({ length: 60 }, (_, i) => ({
  x:((i*73+17)%100)/100, y:((i*47+31)%55)/100, sp:(i%4)+1
}));
const FLIES = Array.from({ length: 16 }, () => ({
  x:Math.random(), y:.42+Math.random()*.4,
  vx:(Math.random()-.5)*.00028, vy:(Math.random()-.5)*.00018,
  ph:Math.random()*Math.PI*2, sp:.8+Math.random()*1.2
}));

function drawTree(x,y,w,h,r,g,b) {
  ctx.fillStyle=`rgb(${r},${g},${b})`;
  const x0=x|0,y0=y|0,w2=(w/2)|0;
  for (let l=0;l<3;l++) {
    const ly=(y0-h*l/3)|0, lw=(w2*(1-l*.18))|0;
    ctx.beginPath(); ctx.moveTo(x0,(ly-h*.48)|0); ctx.lineTo(x0-lw,ly); ctx.lineTo(x0+lw,ly);
    ctx.closePath(); ctx.fill();
  }
  ctx.fillRect((x0-w*.065)|0,y0-14,(w*.13)|0,20);
}

function drawForest(t) {
  if (!canvasVis) { forestRAF=null; return; }
  forestRAF = requestAnimationFrame(drawForest);
  ctx.clearRect(0,0,cW,cH);
  const sky=ctx.createLinearGradient(0,0,0,cH);
  sky.addColorStop(0,'#010810'); sky.addColorStop(.55,'#02101a'); sky.addColorStop(1,'#041820');
  ctx.fillStyle=sky; ctx.fillRect(0,0,cW,cH);
  ctx.globalAlpha=.07; ctx.fillStyle='#d4c8a8';
  ctx.beginPath(); ctx.arc((cW*.78)|0,(cH*.1)|0,48,0,Math.PI*2); ctx.fill();
  ctx.globalAlpha=.04; ctx.beginPath(); ctx.arc((cW*.78)|0,(cH*.1)|0,28,0,Math.PI*2); ctx.fill();
  ctx.globalAlpha=1;
  for (let i=0;i<STARS.length;i++) {
    const s=STARS[i],bk=(Math.sin(t*.001*s.sp+i)+1)*.3;
    ctx.globalAlpha=bk; ctx.fillStyle='#c8bea0';
    ctx.fillRect((s.x*cW)|0,(s.y*cH)|0,1,1);
  }
  ctx.globalAlpha=1;
  for (let i=0;i<22;i++) drawTree(((i/22)*cW+Math.sin(i*6)*16)|0,cH*.8,38,170,2,14,16);
  for (let i=0;i<13;i++) drawTree(((i/13)*cW+cW/26)|0,cH*.88,54,235,1,8,10);
  for (let i=0;i<7;i++)  drawTree(((i/7)*cW+cW/14)|0,cH*1.01,78,295,1,4,5);
  const fog=ctx.createLinearGradient(0,cH*.72,0,cH);
  fog.addColorStop(0,'rgba(4,18,26,0)'); fog.addColorStop(1,'rgba(4,18,26,.65)');
  ctx.fillStyle=fog; ctx.fillRect(0,cH*.72,cW,cH*.28);
  for (const ff of FLIES) {
    ff.x+=ff.vx; ff.y+=ff.vy;
    if(ff.x<0||ff.x>1) ff.vx*=-1; if(ff.y<.3||ff.y>.9) ff.vy*=-1;
    const bk=Math.sin(t*.002*ff.sp+ff.ph);
    if (bk>.28) {
      ctx.globalAlpha=(bk-.28)*.9; ctx.fillStyle='#fda742';
      ctx.beginPath(); ctx.arc((ff.x*cW)|0,(ff.y*cH)|0,1.6,0,Math.PI*2); ctx.fill();
    }
  }
  ctx.globalAlpha=1;
}

/* ─── H&G SCROLL SCENES ─────────────────────────────── */
const hgScenes = document.querySelectorAll('.hs');
const hgDots   = document.querySelectorAll('.hd');
const N_SC     = hgScenes.length;
let lastSc=-1, hgTop=0, hgScrollH=0;

function measureHG() {
  const r=hgSec.getBoundingClientRect();
  hgTop=r.top+window.scrollY; hgScrollH=hgSec.offsetHeight-window.innerHeight;
}
measureHG();
window.addEventListener('resize', measureHG, { passive:true });

function setScene(idx) {
  if (idx===lastSc) return;
  if (lastSc>=0) hgScenes[lastSc].classList.remove('active');
  hgScenes[idx].classList.add('active');
  hgDots.forEach((d,i) => { d.classList.toggle('on',i===idx); d.classList.toggle('was',i<idx) });
  if (lastSc>=0) gainXP(5,`CHAPTER ${idx+1}`);
  lastSc=idx;
}
setScene(0);

/* ─── STORY SCROLL ──────────────────────────────────── */
const storySec    = document.querySelector('.story-section');
const storySlides = document.querySelectorAll('.ss');
const $spFill     = document.getElementById('sp-fill');
let curSS=0, ssTop=0, ssScrollH=0;

function measureSS() {
  const r=storySec.getBoundingClientRect();
  ssTop=r.top+window.scrollY; ssScrollH=storySec.offsetHeight-window.innerHeight;
}
measureSS();
window.addEventListener('resize', measureSS, { passive:true });

/* ─── UNIFIED SCROLL HANDLER ────────────────────────── */
let scrollPending=false;
window.addEventListener('scroll', () => {
  if (scrollPending) return;
  scrollPending=true;
  requestAnimationFrame(() => {
    scrollPending=false;
    const sy=window.scrollY;
    $nav.classList.toggle('solid', sy>50);

    // H&G
    const hgProg=Math.min(Math.max((sy-hgTop)/hgScrollH,0),1);
    if (sy>=hgTop-window.innerHeight && sy<=hgTop+hgScrollH+window.innerHeight) {
      setScene(Math.min(Math.floor(hgProg*N_SC), N_SC-1));
    }

    // Story
    const ssProg=Math.min(Math.max((sy-ssTop)/ssScrollH,0),1);
    if (sy>=ssTop-window.innerHeight && sy<=ssTop+ssScrollH+window.innerHeight) {
      $spFill.style.height=(ssProg*100)+'%';
      const idx=Math.min(Math.floor(ssProg*storySlides.length), storySlides.length-1);
      if (idx!==curSS) {
        storySlides[curSS].classList.remove('active');
        storySlides[curSS].classList.add('exit');
        const prev=curSS;
        setTimeout(()=>storySlides[prev]?.classList.remove('exit'),650);
        curSS=idx;
        storySlides[curSS].classList.add('active');
        gainXP(4,'STORY UNFOLDED');
      }
    }
  });
}, { passive:true });

/* ─── CONTACT FORM ──────────────────────────────────── */
window.handleSubmit = function(e) {
  e.preventDefault();
  gainXP(20,'MESSAGE SENT INTO THE VOID');
  showToast('☠ MESSAGE RECEIVED. WE WILL FIND YOU.');
  e.target.reset();
};

/* ─── PAGE VISIBILITY — pause/resume canvas ─────────── */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { canvasVis = false; }
  else if (hgSec) {
    const r = hgSec.getBoundingClientRect();
    canvasVis = r.bottom > 0 && r.top < window.innerHeight;
    if (canvasVis && !forestRAF) forestRAF = requestAnimationFrame(drawForest);
  }
});

/* ─── KONAMI CODE ───────────────────────────────────── */
const K=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let ki=0;
document.addEventListener('keydown', e => {
  if (e.key===K[ki]) { ki++; if (ki===K.length) { gainXP(999,'☠ DARK GOD AWAKENED'); for(let i=0;i<12;i++) setTimeout(()=>spawnParticle(Math.random()*window.innerWidth,Math.random()*window.innerHeight,true),i*60); ki=0; } }
  else ki=0;
});

/* ─── DEVTOOLS EASTER EGG ───────────────────────────── */
console.log('%cALENITH','color:#027578;font-size:34px;font-family:serif;font-weight:bold;text-shadow:0 0 20px #027578;');
console.log('%c☠  HORROR STUDIO  ☠','color:#fda742;font-size:13px;letter-spacing:6px;');
console.log('%c↑↑↓↓←→←→BA for +999 SOUL','color:#3d6660;font-size:10px;');