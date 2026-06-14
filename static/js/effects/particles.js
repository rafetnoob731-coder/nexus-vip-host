/**
 * NEXUS VIP HOST - Premium Particle & Background Effects
 * Dynamic particle networks, floating orbs, gradient meshes
 */

class NexusParticles {
  constructor() {
    this.systems = [];
    this.init();
  }

  init() {
    this.initNetworkParticles();
    this.initFloatingOrbs();
    this.initGradientMesh();
  }

  /**
   * Network particle connections (like a neural network)
   */
  initNetworkParticles() {
    document.querySelectorAll('[data-network]').forEach(canvas => {
      const system = new NetworkParticleSystem(canvas);
      this.systems.push(system);
    });
  }

  /**
   * Floating gradient orbs
   */
  initFloatingOrbs() {
    document.querySelectorAll('[data-orbs]').forEach(container => {
      const count = parseInt(container.dataset.orbCount) || 4;
      const colors = (container.dataset.orbColors || '#6366f1,#06b6d4,#8b5cf6').split(',');

      for (let i = 0; i < count; i++) {
        const orb = document.createElement('div');
        const size = Math.random() * 200 + 100;
        const color = colors[i % colors.length];
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const duration = Math.random() * 10 + 15;
        const delay = Math.random() * 5;

        orb.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, ${color}44, ${color}11 60%, transparent);
          left: ${x}%;
          top: ${y}%;
          transform: translate(-50%, -50%);
          animation: orbFloat${i} ${duration}s ease-in-out ${delay}s infinite;
          pointer-events: none;
          z-index: 0;
        `;

        container.appendChild(orb);

        // Dynamic keyframes
        const style = document.createElement('style');
        style.textContent = `
          @keyframes orbFloat${i} {
            0%, 100% { transform: translate(-50%, -50%) translate(0, 0) scale(1); }
            25% { transform: translate(-50%, -50%) translate(${Math.random() * 60 - 30}px, ${Math.random() * 60 - 30}px) scale(${Math.random() * 0.3 + 0.8}); }
            50% { transform: translate(-50%, -50%) translate(${Math.random() * 80 - 40}px, ${Math.random() * 40 - 20}px) scale(${Math.random() * 0.4 + 0.9}); }
            75% { transform: translate(-50%, -50%) translate(${Math.random() * 40 - 20}px, ${Math.random() * 60 - 30}px) scale(${Math.random() * 0.3 + 0.85}); }
          }
        `;
        document.head.appendChild(style);
      }
    });
  }

  /**
   * Animated gradient mesh background
   */
  initGradientMesh() {
    document.querySelectorAll('[data-mesh]').forEach(container => {
      const canvas = document.createElement('canvas');
      canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:0.15;';
      container.prepend(canvas);

      const ctx = canvas.getContext('2d');
      let animId;

      function resize() {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
      }

      const colors = [
        { r: 99, g: 102, b: 241 },
        { r: 6, g: 182, b: 212 },
        { r: 139, g: 92, b: 246 }
      ];

      let time = 0;

      function animate() {
        time += 0.005;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const w = canvas.width;
        const h = canvas.height;

        // Draw animated gradient blobs
        colors.forEach((c, i) => {
          const x = w * (0.2 + 0.6 * (i / (colors.length - 1))) + Math.sin(time + i * 2) * w * 0.1;
          const y = h * 0.5 + Math.cos(time * 0.7 + i * 1.5) * h * 0.2;
          const radius = w * 0.3 + Math.sin(time * 0.5 + i) * w * 0.05;

          const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
          gradient.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, 0.15)`);
          gradient.addColorStop(0.5, `rgba(${c.r}, ${c.g}, ${c.b}, 0.05)`);
          gradient.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, w, h);
        });

        animId = requestAnimationFrame(animate);
      }

      resize();
      animate();
      window.addEventListener('resize', resize);

      container._meshCleanup = () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', resize);
        canvas.remove();
      };
    });
  }
}


/**
 * Network Particle System
 * Connected dots like a neural network
 */
class NetworkParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.mouseX = -1000;
    this.mouseY = -1000;
    this.animId = null;

    this.count = parseInt(canvas.dataset.particleCount) || 80;
    this.connectDistance = parseInt(canvas.dataset.connectDistance) || 150;
    this.mouseRadius = parseInt(canvas.dataset.mouseRadius) || 200;
    this.speed = parseFloat(canvas.dataset.speed) || 0.5;

    this.init();
  }

  init() {
    this.resize();
    this.createParticles();
    this.bindEvents();
    this.animate();
  }

  resize() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * this.speed,
        vy: (Math.random() - 0.5) * this.speed,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouseX = -1000;
      this.mouseY = -1000;
    });
  }

  animate() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Update & draw particles
    this.particles.forEach(p => {
      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Bounce
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      // Mouse interaction
      const dx = this.mouseX - p.x;
      const dy = this.mouseY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this.mouseRadius) {
        const force = (this.mouseRadius - dist) / this.mouseRadius;
        p.x -= dx * force * 0.02;
        p.y -= dy * force * 0.02;
      }

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(99, 102, 241, ${p.opacity})`;
      ctx.fill();
    });

    // Draw connections
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const a = this.particles[i];
        const b = this.particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.connectDistance) {
          const opacity = (1 - dist / this.connectDistance) * 0.3;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    this.animId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  window.nexusParticles = new NexusParticles();
});
