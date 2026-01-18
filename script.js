// Horror Background Canvas
class HorrorBackground {
  constructor() {
    this.canvas = document.getElementById('horror-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.ghosts = [];
    this.mouseX = 0;
    this.mouseY = 0;
    this.time = 0;
    this.init();
  }
  
  init() {
    this.resize();
    this.createParticles();
    this.createGhosts();
    this.animate();
    
    window.addEventListener('resize', () => this.resize());
    document.addEventListener('mousemove', (e) => this.updateMouse(e));
    document.addEventListener('click', (e) => this.createClickEffect(e));
  }
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  updateMouse(e) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  }
  
  createParticles() {
    for (let i = 0; i < 100; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 3 + 0.5,
        speedX: (Math.random() - 0.5) * 1.5,
        speedY: (Math.random() - 0.5) * 1.5,
        color: Math.random() > 0.5 ? '#fda742' : '#027578',
        opacity: Math.random() * 0.6 + 0.2
      });
    }
  }
  
  createGhosts() {
    for (let i = 0; i < 3; i++) {
      this.ghosts.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 40 + 20,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: 0.1,
        phase: Math.random() * Math.PI * 2
      });
    }
  }
  
  createClickEffect(e) {
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x: e.clientX,
        y: e.clientY,
        size: Math.random() * 5 + 1,
        speedX: (Math.random() - 0.5) * 10,
        speedY: (Math.random() - 0.5) * 10,
        color: Math.random() > 0.5 ? '#fda742' : '#027578',
        opacity: 1,
        life: 60
      });
    }
  }
  
  drawParticle(p) {
    const pulse = Math.sin(this.time * 0.05) * 0.3 + 0.7;
    const dist = Math.sqrt(Math.pow(this.mouseX - p.x, 2) + Math.pow(this.mouseY - p.y, 2));
    const effect = Math.max(0, 100 - dist) / 100;
    const size = p.size * (1 + effect * 0.5) * pulse;
    
    const grad = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 3);
    grad.addColorStop(0, p.color + Math.floor(p.opacity * 255).toString(16).padStart(2, '0'));
    grad.addColorStop(1, 'transparent');
    
    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, size * 3, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.fillStyle = p.color + Math.floor(p.opacity * 255).toString(16).padStart(2, '0');
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
    this.ctx.fill();
  }
  
  drawGhost(g) {
    g.phase += 0.02;
    const opacity = (Math.sin(g.phase) * 0.05 + 0.1) * g.opacity;
    this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    this.ctx.beginPath();
    this.ctx.arc(g.x, g.y, g.size, 0, Math.PI * 2);
    this.ctx.fill();
  }
  
  updateParticles() {
    this.particles = this.particles.filter(p => {
      p.x += p.speedX;
      p.y += p.speedY;
      
      if (p.life !== undefined) {
        p.life--;
        p.opacity *= 0.98;
        return p.life > 0;
      }
      
      const dist = Math.sqrt(Math.pow(this.mouseX - p.x, 2) + Math.pow(this.mouseY - p.y, 2));
      if (dist < 150) {
        const angle = Math.atan2(p.y - this.mouseY, p.x - this.mouseX);
        const force = (150 - dist) / 150 * 3;
        p.x += Math.cos(angle) * force;
        p.y += Math.sin(angle) * force;
      }
      
      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;
      
      return true;
    });
  }
  
  updateGhosts() {
    this.ghosts.forEach(g => {
      g.x += g.speedX;
      g.y += g.speedY;
      
      if (g.x < 0 || g.x > this.canvas.width) g.speedX *= -1;
      if (g.y < 0 || g.y > this.canvas.height) g.speedY *= -1;
    });
  }
  
  animate() {
    this.time++;
    this.ctx.fillStyle = 'rgba(5, 5, 5, 0.05)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.updateParticles();
    this.updateGhosts();
    this.particles.forEach(p => this.drawParticle(p));
    this.ghosts.forEach(g => this.drawGhost(g));
    
    requestAnimationFrame(() => this.animate());
  }
}

// Mobile menu toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navMenu = document.querySelector('.nav-menu');

mobileMenuToggle.addEventListener('click', () => {
  mobileMenuToggle.classList.toggle('active');
  navMenu.classList.toggle('active');
});

// Close menu when clicking a link
document.querySelectorAll('.nav-menu a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenuToggle.classList.remove('active');
    navMenu.classList.remove('active');
  });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (!navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
    mobileMenuToggle.classList.remove('active');
    navMenu.classList.remove('active');
  }
});

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  });
});

// Scroll animations
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

// Interactive effects
function addInteractiveEffects() {
  const cards = document.querySelectorAll('.game-card, .tier, .social-card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.borderColor = Math.random() > 0.5 ? '#fda742' : '#027578';
    });
  });
}

// Initialize
window.addEventListener('load', () => {
  new HorrorBackground();
  document.querySelectorAll('section').forEach(el => observer.observe(el));
  addInteractiveEffects();
  
  const firstSection = document.querySelector('.hero-section');
  if (firstSection) {
    firstSection.style.opacity = '1';
    firstSection.style.transform = 'translateY(0)';
  }
});