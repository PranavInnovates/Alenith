// ============================================
// WITCH CACKLE SOUND ON EVERY CLICK
// ============================================

const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioContext;

function initAudio() {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
}

function playWitchCackle() {
  initAudio();
  
  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  const filterNode = audioContext.createBiquadFilter();
  
  oscillator.connect(filterNode);
  filterNode.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.type = 'sawtooth';
  const basePitch = 800 + Math.random() * 400;
  
  oscillator.frequency.setValueAtTime(basePitch, now);
  oscillator.frequency.exponentialRampToValueAtTime(basePitch * 1.5, now + 0.05);
  oscillator.frequency.exponentialRampToValueAtTime(basePitch * 0.8, now + 0.1);
  oscillator.frequency.exponentialRampToValueAtTime(basePitch * 1.3, now + 0.15);
  oscillator.frequency.exponentialRampToValueAtTime(basePitch * 0.9, now + 0.2);
  
  filterNode.type = 'bandpass';
  filterNode.frequency.setValueAtTime(1200, now);
  filterNode.Q.setValueAtTime(5, now);
  
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.exponentialRampToValueAtTime(0.3, now + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.15, now + 0.1);
  gainNode.gain.exponentialRampToValueAtTime(0.05, now + 0.2);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
  
  oscillator.start(now);
  oscillator.stop(now + 0.3);
}

document.addEventListener('click', function(e) {
  playWitchCackle();
  createClickEffect(e.clientX, e.clientY);
}, true);

function createClickEffect(x, y) {
  const splatter = document.createElement('div');
  splatter.style.position = 'fixed';
  splatter.style.left = x + 'px';
  splatter.style.top = y + 'px';
  splatter.style.width = '20px';
  splatter.style.height = '20px';
  splatter.style.background = 'radial-gradient(circle, #027578, transparent)';
  splatter.style.borderRadius = '50%';
  splatter.style.pointerEvents = 'none';
  splatter.style.transform = 'translate(-50%, -50%)';
  splatter.style.animation = 'splatterFade 0.8s ease-out forwards';
  splatter.style.zIndex = '9999';
  
  document.body.appendChild(splatter);
  setTimeout(() => splatter.remove(), 800);
}

const splatterStyle = document.createElement('style');
splatterStyle.textContent = `
  @keyframes splatterFade {
    0% {
      transform: translate(-50%, -50%) scale(0);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) scale(3);
      opacity: 0;
    }
  }
`;
document.head.appendChild(splatterStyle);

// ============================================
// MOBILE MENU FUNCTIONALITY
// ============================================

const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const nav = document.querySelector('.nav');

mobileMenuToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  mobileMenuToggle.classList.toggle('active');
  navMenu.classList.toggle('active');
});

document.querySelectorAll('.nav-menu a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenuToggle.classList.remove('active');
    navMenu.classList.remove('active');
  });
});

document.addEventListener('click', (e) => {
  if (!navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
    mobileMenuToggle.classList.remove('active');
    navMenu.classList.remove('active');
  }
});

// ============================================
// SMOOTH SCROLLING
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const headerOffset = 120;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// ============================================
// SCROLL EFFECTS
// ============================================

let lastScroll = 0;
window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  
  if (currentScroll > 50) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
  
  lastScroll = currentScroll;
});

const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -80px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
  observer.observe(section);
});

// ============================================
// PARALLAX EFFECT ON BACKGROUND
// ============================================

window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const fogLayer = document.querySelector('.fog-layer');
  const floatingSkulls = document.querySelector('.floating-skulls');
  
  if (fogLayer) {
    fogLayer.style.transform = `translateY(${scrolled * 0.2}px)`;
  }
  
  if (floatingSkulls) {
    floatingSkulls.style.transform = `translateY(${scrolled * 0.15}px) rotate(${scrolled * 0.05}deg)`;
  }
});

// ============================================
// CARD HOVER EFFECTS WITH PARTICLES
// ============================================

const cards = document.querySelectorAll('.game-card, .tier, .social-card');
const glowColors = ['#027578', '#fda742', '#4da8aa'];

cards.forEach(card => {
  card.addEventListener('mouseenter', function() {
    const randomColor = glowColors[Math.floor(Math.random() * glowColors.length)];
    this.style.boxShadow = `0 12px 48px ${randomColor}80, inset 0 0 30px ${randomColor}40`;
    
    // Create particle burst on hover
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        createHoverParticle(this, randomColor);
      }, i * 50);
    }
  });
  
  card.addEventListener('mouseleave', function() {
    this.style.boxShadow = '';
  });
});

function createHoverParticle(element, color) {
  const rect = element.getBoundingClientRect();
  const particle = document.createElement('div');
  
  const startX = rect.left + rect.width / 2;
  const startY = rect.top + rect.height / 2;
  
  particle.style.position = 'fixed';
  particle.style.left = startX + 'px';
  particle.style.top = startY + 'px';
  particle.style.width = '4px';
  particle.style.height = '4px';
  particle.style.background = color;
  particle.style.borderRadius = '50%';
  particle.style.pointerEvents = 'none';
  particle.style.zIndex = '9998';
  particle.style.boxShadow = `0 0 10px ${color}`;
  
  const angle = Math.random() * Math.PI * 2;
  const distance = 100 + Math.random() * 100;
  const endX = startX + Math.cos(angle) * distance;
  const endY = startY + Math.sin(angle) * distance;
  
  particle.style.animation = `burstParticle 1s ease-out forwards`;
  
  const keyframes = `
    @keyframes burstParticle {
      0% {
        transform: translate(0, 0) scale(1);
        opacity: 1;
      }
      100% {
        transform: translate(${endX - startX}px, ${endY - startY}px) scale(0);
        opacity: 0;
      }
    }
  `;
  
  const style = document.createElement('style');
  style.textContent = keyframes;
  document.head.appendChild(style);
  
  document.body.appendChild(particle);
  setTimeout(() => {
    particle.remove();
    style.remove();
  }, 1000);
}

// ============================================
// 3D TILT EFFECT ON CARDS
// ============================================

const socialCards = document.querySelectorAll('.social-card, .game-card, .tier');
socialCards.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 15;
    const rotateY = (centerX - x) / 15;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ============================================
// ANIMATED ELEMENTS
// ============================================

const animateElements = document.querySelectorAll('.game-card, .tier, .social-card');
const animateObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.animation = `fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards`;
        entry.target.style.opacity = '1';
      }, index * 150);
      animateObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

animateElements.forEach(el => {
  el.style.opacity = '0';
  animateObserver.observe(el);
});

const fadeInStyle = document.createElement('style');
fadeInStyle.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(40px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(fadeInStyle);

// ============================================
// LIST ITEMS ANIMATION WITH REVEAL
// ============================================

const listItems = document.querySelectorAll('.demon-list li, .tier li');
const listObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('revealed');
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateX(0)';
      }, index * 150);
      listObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

listItems.forEach(item => {
  item.style.opacity = '0';
  item.style.transform = 'translateX(-50px)';
  item.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
  listObserver.observe(item);
});

// ============================================
// BRAND LOGO ANIMATION
// ============================================

const brand = document.querySelector('.brand');
let gradientPosition = 0;

brand.addEventListener('mouseenter', () => {
  const interval = setInterval(() => {
    gradientPosition += 10;
    brand.style.backgroundPosition = `${gradientPosition}% 50%`;
  }, 50);
  
  brand.addEventListener('mouseleave', () => {
    clearInterval(interval);
    gradientPosition = 0;
  }, { once: true });
});

// ============================================
// BUTTON RIPPLE EFFECT
// ============================================

const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .game-link');
buttons.forEach(button => {
  button.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
  .btn-primary, .btn-secondary, .game-link {
    position: relative;
    overflow: hidden;
  }
  
  .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(2, 117, 120, 0.6);
    transform: scale(0);
    animation: rippleEffect 0.6s ease-out;
    pointer-events: none;
  }
  
  @keyframes rippleEffect {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(rippleStyle);

// ============================================
// CURSOR TRAIL EFFECT
// ============================================

let cursorTrail = [];
const maxTrailLength = 15;

document.addEventListener('mousemove', (e) => {
  if (window.innerWidth > 768) {
    cursorTrail.push({ x: e.clientX, y: e.clientY, time: Date.now() });
    
    if (cursorTrail.length > maxTrailLength) {
      cursorTrail.shift();
    }
    
    const trail = document.createElement('div');
    trail.style.position = 'fixed';
    trail.style.left = e.clientX + 'px';
    trail.style.top = e.clientY + 'px';
    trail.style.width = '8px';
    trail.style.height = '8px';
    trail.style.background = 'radial-gradient(circle, rgba(2, 117, 120, 0.6), transparent)';
    trail.style.borderRadius = '50%';
    trail.style.pointerEvents = 'none';
    trail.style.transform = 'translate(-50%, -50%)';
    trail.style.transition = 'opacity 0.5s ease';
    trail.style.zIndex = '9998';
    
    document.body.appendChild(trail);
    
    setTimeout(() => {
      trail.style.opacity = '0';
      setTimeout(() => trail.remove(), 500);
    }, 100);
    
    cursorTrail = cursorTrail.filter(point => Date.now() - point.time < 500);
  }
});

// ============================================
// SMOOTH PAGE LOAD
// ============================================

window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s ease';
  
  setTimeout(() => {
    document.body.style.opacity = '1';
  }, 100);
  
  console.log('%c🎃 Welcome to the darkness... 🎃', 'color: #fda742; font-size: 24px; font-weight: bold; text-shadow: 0 0 10px #027578;');
  console.log('%c👻 Every click awakens the spirits... 👻', 'color: #027578; font-size: 18px; font-weight: bold;');
});

// ============================================
// ACTIVE NAVIGATION HIGHLIGHTING
// ============================================

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

window.addEventListener('scroll', debounce(() => {
  let current = '';
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (pageYOffset >= (sectionTop - 200)) {
      current = section.getAttribute('id');
    }
  });
  
  navLinks.forEach(link => {
    link.style.color = '';
    link.style.textShadow = '';
    if (link.getAttribute('href').slice(1) === current) {
      link.style.color = '#fda742';
      link.style.textShadow = '0 0 10px #fda742';
    }
  });
}, 100));

// ============================================
// RANDOM LIGHTNING FLASH EFFECT
// ============================================

function createLightningFlash() {
  const flash = document.createElement('div');
  flash.style.position = 'fixed';
  flash.style.top = '0';
  flash.style.left = '0';
  flash.style.width = '100%';
  flash.style.height = '100%';
  flash.style.background = 'rgba(77, 168, 170, 0.2)';
  flash.style.pointerEvents = 'none';
  flash.style.zIndex = '9999';
  flash.style.animation = 'lightningFlash 0.2s ease-out';
  
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 200);
}

const lightningFlashStyle = document.createElement('style');
lightningFlashStyle.textContent = `
  @keyframes lightningFlash {
    0%, 100% { opacity: 0; }
    50% { opacity: 1; }
  }
`;
document.head.appendChild(lightningFlashStyle);

function scheduleNextLightning() {
  const delay = 10000 + Math.random() * 10000;
  setTimeout(() => {
    createLightningFlash();
    scheduleNextLightning();
  }, delay);
}

scheduleNextLightning();

// ============================================
// FLOATING ANIMATION FOR GAME ICONS
// ============================================

const gameIcons = document.querySelectorAll('.game-icon');
gameIcons.forEach((icon, index) => {
  icon.style.animationDelay = `${index * 0.3}s`;
});

console.log('%c⚠️ The witch awakens with every click... ⚠️', 'color: #fda742; font-size: 16px; font-weight: bold; background: #0a0a0a; padding: 10px;');

// ============================================
// INTERACTIVE TEXT EFFECTS
// ============================================

// Add hover effect to all paragraphs
document.querySelectorAll('section p').forEach(p => {
  p.addEventListener('mouseenter', function() {
    this.style.transition = 'all 0.3s ease';
    this.style.textShadow = '0 0 15px rgba(2, 117, 120, 0.5)';
    this.style.transform = 'translateX(5px)';
  });
  
  p.addEventListener('mouseleave', function() {
    this.style.textShadow = 'none';
    this.style.transform = 'translateX(0)';
  });
});

// Add glow effect on text selection
document.addEventListener('selectionchange', () => {
  const selection = window.getSelection();
  if (selection.toString().length > 0) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    const glow = document.createElement('div');
    glow.style.position = 'fixed';
    glow.style.left = rect.left + 'px';
    glow.style.top = rect.top + 'px';
    glow.style.width = rect.width + 'px';
    glow.style.height = rect.height + 'px';
    glow.style.background = 'radial-gradient(circle, rgba(253, 167, 66, 0.2), transparent)';
    glow.style.pointerEvents = 'none';
    glow.style.zIndex = '9997';
    glow.style.animation = 'selectionGlow 0.5s ease-out';
    
    document.body.appendChild(glow);
    setTimeout(() => glow.remove(), 500);
  }
});

const selectionGlowStyle = document.createElement('style');
selectionGlowStyle.textContent = `
  @keyframes selectionGlow {
    0% {
      opacity: 0;
      transform: scale(0.8);
    }
    50% {
      opacity: 0.8;
    }
    100% {
      opacity: 0;
      transform: scale(1.2);
    }
  }
`;
document.head.appendChild(selectionGlowStyle);

// Interactive title letters
document.querySelectorAll('.mega-title, .section-title').forEach(title => {
  title.addEventListener('mouseenter', function() {
    this.style.animation = 'none';
    setTimeout(() => {
      this.style.animation = '';
    }, 10);
  });
});