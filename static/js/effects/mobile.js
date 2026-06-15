/**
 * NEXUS VIP HOST - Mobile Enhancement Engine
 * Touch interactions, swipe gestures, mobile-optimized UX
 */

class NexusMobile {
  constructor() {
    this.isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this.isMobile = window.innerWidth <= 768;
    this.init();
  }

  init() {
    if (this.isTouch) {
      this.initTouchFeedback();
      this.initSwipeGestures();
      this.initBetterScroll();
    }
    if (this.isMobile) {
      this.initMobileNav();
      this.initTableScroll();
      this.initSmoothAnchors();
    }
    this.initResponsiveCharts();
    window.addEventListener('resize', () => this.handleResize());
  }

  /**
   * Haptic touch feedback on buttons and cards
   */
  initTouchFeedback() {
    document.addEventListener('touchstart', (e) => {
      const target = e.target.closest('.btn, .tilt-card, .feature-card, .pricing-card, .nav-link, .hosting-tab');
      if (target) {
        target.style.transform = 'scale(0.97)';
        target.style.transition = 'transform 0.15s ease';
      }
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      const target = e.target.closest('.btn, .tilt-card, .feature-card, .pricing-card, .nav-link, .hosting-tab');
      if (target) {
        target.style.transform = 'scale(1)';
      }
    }, { passive: true });
  }

  /**
   * Swipe gestures for carousels and panels
   */
  initSwipeGestures() {
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let isSwiping = false;

    // Swipeable testimonial cards
    const swiperEl = document.querySelector('.testimonial-swiper');
    if (swiperEl && typeof Swiper !== 'undefined') {
      // Swiper already handles touch
    }

    // Sidebar swipe to close
    const sidebar = document.getElementById('adminSidebar');
    if (sidebar) {
      let touchStartX = 0;
      sidebar.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
      }, { passive: true });

      sidebar.addEventListener('touchmove', (e) => {
        const diff = e.touches[0].clientX - touchStartX;
        if (diff < -50 && sidebar.classList.contains('open')) {
          sidebar.classList.remove('open');
        }
      }, { passive: true });
    }
  }

  /**
   * Better scroll behavior for mobile
   */
  initBetterScroll() {
    // Smooth scroll to sections
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href && href.length > 1) {
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            const offset = 80;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
          }
        }
      });
    });

    // Fix 100vh issue on mobile browsers
    const fixVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    fixVH();
    window.addEventListener('resize', fixVH);
    window.addEventListener('orientationchange', () => setTimeout(fixVH, 100));
  }

  /**
   * Enhanced mobile navigation
   */
  initMobileNav() {
    const menu = document.getElementById('navMenu');
    const toggle = document.getElementById('navToggle');

    // Close menu when tapping outside
    if (menu && toggle) {
      document.addEventListener('touchstart', (e) => {
        if (menu.classList.contains('active') &&
            !menu.contains(e.target) &&
            !toggle.contains(e.target)) {
          menu.classList.remove('active');
          toggle.classList.remove('active');
        }
      }, { passive: true });

      // Close menu after link click
      menu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          if (window.innerWidth <= 768) {
            menu.classList.remove('active');
            toggle.classList.remove('active');
          }
        });
      });
    }

    // Prevent body scroll when mobile menu is open
    if (menu) {
      const observer = new MutationObserver(() => {
        document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
      });
      observer.observe(menu, { attributes: true, attributeFilter: ['class'] });
    }
  }

  /**
   * Horizontal table scrolling hint
   */
  initTableScroll() {
    document.querySelectorAll('.table-responsive').forEach(table => {
      if (table.scrollWidth > table.clientWidth) {
        const hint = document.createElement('div');
        hint.className = 'scroll-hint';
        hint.innerHTML = '<i class="fas fa-arrow-right"></i> Swipe to see more';
        hint.style.cssText = 'text-align:center;padding:0.5rem;color:var(--text-muted);font-size:0.8rem;animation:fadeIn 1s ease 2s forwards;opacity:0;';
        table.parentNode.insertBefore(hint, table.nextSibling);
        setTimeout(() => hint.remove(), 5000);
      }
    });
  }

  /**
   * Smooth anchor scrolling with offset
   */
  initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const id = anchor.getAttribute('href');
        if (id === '#') return;
        const el = document.querySelector(id);
        if (el) {
          e.preventDefault();
          const offset = 80;
          const top = el.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  }

  /**
   * Handle responsive chart resizing
   */
  initResponsiveCharts() {
    // Charts are handled by dashboard.js which uses Chart.js responsive mode
  }

  /**
   * Debounced resize handler
   */
  handleResize() {
    clearTimeout(this._resizeTimer);
    this._resizeTimer = setTimeout(() => {
      this.isMobile = window.innerWidth <= 768;
      // Trigger responsive chart resize
      window.dispatchEvent(new Event('resize'));
    }, 250);
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.nexusMobile = new NexusMobile();
});
