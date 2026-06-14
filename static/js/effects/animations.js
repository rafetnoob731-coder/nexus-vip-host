/**
 * NEXUS VIP HOST - Premium Animation System
 * Scroll-triggered reveals, stagger animations, liquid buttons, advanced transitions
 */

class NexusAnimations {
  constructor() {
    this.observer = null;
    this.staggerObserver = null;
    this.init();
  }

  init() {
    this.initScrollReveal();
    this.initStaggerAnimations();
    this.initLiquidButtons();
    this.initNavIndicators();
    this.initCounterAnimations();
    this.initTypingEffect();
    this.initBorderGlow();
  }

  /**
   * Scroll-triggered reveal animations
   * Elements with: data-reveal, data-reveal-left, data-reveal-right, data-reveal-scale
   */
  initScrollReveal() {
    const defaults = {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseInt(el.dataset.revealDelay) || 0;
          const duration = parseInt(el.dataset.revealDuration) || 800;

          setTimeout(() => {
            el.classList.add('revealed');
          }, delay);

          this.observer.unobserve(el);
        }
      });
    }, defaults);

    // Observe all reveal elements
    document.querySelectorAll('[data-reveal]').forEach(el => {
      el.classList.add('will-reveal', 'reveal-fade-up');
      this.observer.observe(el);
    });

    document.querySelectorAll('[data-reveal-left]').forEach(el => {
      el.classList.add('will-reveal', 'reveal-left');
      this.observer.observe(el);
    });

    document.querySelectorAll('[data-reveal-right]').forEach(el => {
      el.classList.add('will-reveal', 'reveal-right');
      this.observer.observe(el);
    });

    document.querySelectorAll('[data-reveal-scale]').forEach(el => {
      el.classList.add('will-reveal', 'reveal-scale');
      this.observer.observe(el);
    });

    document.querySelectorAll('[data-reveal-blur]').forEach(el => {
      el.classList.add('will-reveal', 'reveal-blur');
      this.observer.observe(el);
    });
  }

  /**
   * Stagger animation for grid items
   * Parent needs: data-stagger
   * Children get staggered delay
   */
  initStaggerAnimations() {
    this.staggerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const parent = entry.target;
          const delay = parseInt(parent.dataset.staggerDelay) || 80;
          const animClass = parent.dataset.staggerAnim || 'reveal-fade-up';

          parent.querySelectorAll('.stagger-item').forEach((item, index) => {
            item.classList.add('will-reveal', animClass);
            setTimeout(() => {
              item.classList.add('revealed');
            }, index * delay);
          });

          this.staggerObserver.unobserve(parent);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('[data-stagger]').forEach(el => {
      // If children don't have stagger-item class, add it
      if (!el.querySelector('.stagger-item')) {
        el.querySelectorAll(':scope > *').forEach(child => {
          child.classList.add('stagger-item');
        });
      }
      this.staggerObserver.observe(el);
    });
  }

  /**
   * Liquid Button Effect
   * Creates a ripple/morph effect on hover
   */
  initLiquidButtons() {
    document.querySelectorAll('.btn-liquid, .btn-primary, .btn-outline').forEach(btn => {
      // Add liquid effect container
      const liquid = document.createElement('span');
      liquid.className = 'btn-liquid-effect';
      btn.appendChild(liquid);

      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        btn.style.setProperty('--mouse-x', `${x}px`);
        btn.style.setProperty('--mouse-y', `${y}px`);

        // Ripple
        const ripple = document.createElement('span');
        ripple.className = 'btn-ripple';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      });
    });
  }

  /**
   * Navigation active indicator
   */
  initNavIndicators() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    if (sections.length === 0 || navLinks.length === 0) return;

    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { threshold: 0.3 });

    sections.forEach(section => navObserver.observe(section));
  }

  /**
   * Animated Counters with easing
   */
  initCounterAnimations() {
    document.querySelectorAll('.animate-counter').forEach(counter => {
      const target = parseInt(counter.dataset.target);
      if (!target) return;

      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          this.animateCounterValue(counter, target);
          observer.unobserve(counter);
        }
      }, { threshold: 0.5 });

      observer.observe(counter);
    });
  }

  animateCounterValue(element, target) {
    const duration = 2000;
    const start = performance.now();
    const startVal = 0;

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function update(currentTime) {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      const current = Math.floor(startVal + (target - startVal) * easedProgress);

      element.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = target.toLocaleString();
      }
    }

    requestAnimationFrame(update);
  }

  /**
   * Typing Effect for hero text
   */
  initTypingEffect() {
    document.querySelectorAll('.typing-effect').forEach(el => {
      const text = el.textContent;
      const speed = parseInt(el.dataset.typingSpeed) || 50;
      el.textContent = '';
      el.style.visibility = 'visible';

      let i = 0;
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          const type = () => {
            if (i < text.length) {
              el.textContent += text.charAt(i);
              i++;
              setTimeout(type, speed);
            }
          };
          type();
          observer.unobserve(el);
        }
      });
      observer.observe(el);
    });
  }

  /**
   * Animated border glow on cards
   */
  initBorderGlow() {
    document.querySelectorAll('.glow-border').forEach(el => {
      el.style.setProperty('--border-glow', 'rgba(99, 102, 241, 0.3)');
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  window.nexusAnimations = new NexusAnimations();
});
