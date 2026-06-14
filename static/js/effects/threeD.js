/**
 * NEXUS VIP HOST - 3D Effects Engine
 * Premium 3D interactions, mouse tracking, parallax, and depth effects
 */

class Nexus3D {
  constructor() {
    this.cards = [];
    this.parallaxLayers = [];
    this.mouseX = 0;
    this.mouseY = 0;
    this.centerX = window.innerWidth / 2;
    this.centerY = window.innerHeight / 2;
    this.init();
  }

  init() {
    this.bindMouseEvents();
    this.initParallax();
    this.init3DCards();
    this.initFloatingElements();
    this.initDepthLayers();
    this.animationLoop();
  }

  bindMouseEvents() {
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });

    window.addEventListener('resize', () => {
      this.centerX = window.innerWidth / 2;
      this.centerY = window.innerHeight / 2;
    });
  }

  /**
   * 3D Card Tilt Effect
   * Apply to: .tilt-card, .pricing-card, .feature-card, .glass
   */
  init3DCards() {
    const selectors = ['.tilt-card', '.pricing-card', '.feature-card', '.dashboard-card',
                       '.admin-stat-card', '.support-card', '.team-card', '.kb-card',
                       '.dc-card', '.stat-card', '.testimonial-card'];

    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(card => {
        this.applyTiltEffect(card);
      });
    });

    // Also apply to any card with data-tilt attribute
    document.querySelectorAll('[data-tilt]').forEach(card => {
      this.applyTiltEffect(card);
    });
  }

  applyTiltEffect(element) {
    element.classList.add('has-3d');
    element.style.transition = 'transform 0.1s ease-out';

    element.addEventListener('mouseenter', () => {
      element.style.transition = 'transform 0.1s ease-out';
    });

    element.addEventListener('mousemove', (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      element.style.transform = `
        perspective(1000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        translateZ(20px)
        scale3d(1.02, 1.02, 1.02)
      `;

      // Dynamic glow based on mouse position
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;
      element.style.setProperty('--glare-x', `${glareX}%`);
      element.style.setProperty('--glare-y', `${glareY}%`);
    });

    element.addEventListener('mouseleave', () => {
      element.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
      element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0) scale3d(1, 1, 1)';
    });
  }

  /**
   * Parallax Scrolling Effect
   * Apply to: .parallax-layer with data-speed attribute
   */
  initParallax() {
    document.querySelectorAll('.parallax-layer').forEach(el => {
      const speed = parseFloat(el.dataset.speed) || 0.3;
      this.parallaxLayers.push({ el, speed });
    });

    if (this.parallaxLayers.length > 0) {
      window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        this.parallaxLayers.forEach(({ el, speed }) => {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            const yOffset = scrollY * speed;
            el.style.transform = `translateY(${yOffset}px)`;
          }
        });
      });
    }
  }

  /**
   * Floating Elements Animation
   * Apply to: .float-element with data-duration and data-distance
   */
  initFloatingElements() {
    document.querySelectorAll('.float-element').forEach(el => {
      const duration = parseFloat(el.dataset.duration) || 3;
      const distance = parseFloat(el.dataset.distance) || 15;
      const delay = Math.random() * 2;

      el.style.animation = `
        float-${duration} ${duration}s ease-in-out ${delay}s infinite
      `;

      // Create dynamic keyframe
      const style = document.createElement('style');
      style.textContent = `
        @keyframes float-${duration} {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(${-distance}px) translateX(${distance * 0.5}px); }
          50% { transform: translateY(${-distance * 0.5}px) translateX(${-distance}px); }
          75% { transform: translateY(${distance}px) translateX(${distance * 0.3}px); }
        }
      `;
      document.head.appendChild(style);
    });
  }

  /**
   * Depth Layer Effect
   * Creates depth with perspective on container
   */
  initDepthLayers() {
    document.querySelectorAll('.depth-container').forEach(container => {
      const layers = container.querySelectorAll('.depth-layer');
      layers.forEach((layer, index) => {
        const depth = (index + 1) * 50;
        layer.style.transform = `translateZ(${depth}px)`;
        layer.style.transition = 'transform 0.3s ease';
      });

      container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        layers.forEach((layer, index) => {
          const depth = (index + 1) * 30;
          const moveX = x * depth * 0.1;
          const moveY = y * depth * 0.1;
          layer.style.transform = `translateZ(${depth}px) translateX(${moveX}px) translateY(${moveY}px)`;
        });
      });

      container.addEventListener('mouseleave', () => {
        layers.forEach((layer, index) => {
          const depth = (index + 1) * 50;
          layer.style.transform = `translateZ(${depth}px)`;
        });
      });
    });
  }

  /**
   * Continuous animation loop for subtle effects
   */
  animationLoop() {
    // Subtle continuous 3D rotation for hero elements
    const heroElements = document.querySelectorAll('.hero-3d-element');
    let time = 0;

    const animate = () => {
      time += 0.01;

      heroElements.forEach((el, i) => {
        const speed = parseFloat(el.dataset.speed) || 1;
        const offset = i * 2;
        const rotX = Math.sin(time * speed + offset) * 3;
        const rotY = Math.cos(time * speed + offset) * 3;
        el.style.transform = `
          perspective(1200px)
          rotateX(${rotX}deg)
          rotateY(${rotY}deg)
          translateZ(10px)
        `;
      });

      requestAnimationFrame(animate);
    };

    if (heroElements.length > 0) {
      animate();
    }
  }

  /**
   * Create a particle system for premium backgrounds
   */
  static createParticles(container, options = {}) {
    const count = options.count || 60;
    const colors = options.colors || ['#6366f1', '#06b6d4', '#8b5cf6', '#ffffff'];
    const sizeRange = options.sizeRange || [2, 6];
    const speedRange = options.speedRange || [0.2, 0.8];

    const particles = [];
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    container.style.position = 'relative';
    container.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let animId;

    function resize() {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
    }

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0];
        this.speedX = (Math.random() - 0.5) * (speedRange[1] - speedRange[0]) + speedRange[0];
        this.speedY = (Math.random() - 0.5) * (speedRange[1] - speedRange[0]) + speedRange[0];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = Math.random() * 0.5 + 0.2;
        this.pulse = Math.random() * Math.PI * 2;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.pulse += 0.02;

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }
      draw() {
        const pulseOpacity = this.opacity * (0.7 + 0.3 * Math.sin(this.pulse));
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = pulseOpacity;
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = pulseOpacity * 0.15;
        ctx.fill();
      }
    }

    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animId = requestAnimationFrame(animate);
    }

    resize();
    animate();

    window.addEventListener('resize', resize);

    return {
      destroy() {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', resize);
        canvas.remove();
      }
    };
  }

  /**
   * Glow effect on mouse follow
   */
  static createCursorGlow(container) {
    const glow = document.createElement('div');
    glow.style.cssText = `
      position: fixed;
      width: 400px;
      height: 400px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%);
      pointer-events: none;
      transform: translate(-50%, -50%);
      z-index: 0;
      transition: opacity 0.3s ease;
    `;
    document.body.prepend(glow);

    document.addEventListener('mousemove', (e) => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    });

    return {
      destroy() { glow.remove(); }
    };
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.nexus3d = new Nexus3D();
  window.nexusCursorGlow = Nexus3D.createCursorGlow();

  // Auto-init particles on sections with data-particles
  document.querySelectorAll('[data-particles]').forEach(section => {
    const opts = {
      count: parseInt(section.dataset.particleCount) || 50,
      colors: (section.dataset.particleColors || '').split(',').filter(Boolean)
    };
    if (opts.colors.length === 0) {
      opts.colors = ['#6366f1', '#06b6d4', '#8b5cf6'];
    }
    Nexus3D.createParticles(section, opts);
  });
});
