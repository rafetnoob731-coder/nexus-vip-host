/**
 * NEXUS VIP HOST - Main JavaScript
 * Premium hosting platform client-side interactions
 */

document.addEventListener('DOMContentLoaded', function() {
  initPreloader();
  initNavbar();
  initThemeToggle();
  initBackToTop();
  initFAQ();
  initSwiper();
  initCounters();
  initPricingToggle();

  // These are called only if the elements exist on the page
  if (document.getElementById('heroParticles')) initHeroParticles();
  if (document.getElementById('domainSearchBtn')) initDomainSearch();
});

/**
 * Preloader
 */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', function() {
      setTimeout(() => preloader.classList.add('hidden'), 500);
    });
    // Fallback: hide after 2 seconds
    setTimeout(() => preloader.classList.add('hidden'), 3000);
  }
}

/**
 * Navbar
 */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');

  // Scroll effect
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile toggle
  if (toggle && menu) {
    toggle.addEventListener('click', function() {
      menu.classList.toggle('active');
      toggle.classList.toggle('active');
    });

    // Close menu on link click
    menu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
          menu.classList.remove('active');
          toggle.classList.remove('active');
        }
      });
    });
  }

  // Mobile dropdown toggle
  document.querySelectorAll('.dropdown > .nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        this.parentElement.classList.toggle('active');
      }
    });
  });

  // Auto-close dropdowns on escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.dropdown-menu').forEach(m => {
        m.closest('.dropdown')?.classList.remove('active');
      });
    }
  });
}

/**
 * Theme Toggle
 */
function initThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  // Check saved preference
  const savedTheme = localStorage.getItem('nexus-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  toggle.addEventListener('click', function() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('nexus-theme', next);
  });
}

/**
 * Back to Top Button
 */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', function() {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/**
 * FAQ Accordion
 */
function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', function() {
      this.parentElement.classList.toggle('active');
    });
  });
}

/**
 * Testimonial Swiper
 */
function initSwiper() {
  const swiperEl = document.querySelector('.testimonial-swiper');
  if (!swiperEl || typeof Swiper === 'undefined') return;

  new Swiper(swiperEl, {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    autoplay: { delay: 5000, disableOnInteraction: false },
    pagination: { el: '.swiper-pagination', clickable: true },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    breakpoints: {
      640: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 }
    }
  });
}

/**
 * Animated Counters
 */
function initCounters() {
  const counters = document.querySelectorAll('[data-count], .stat-number[data-target]');

  if (counters.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
  const target = parseInt(element.getAttribute('data-count') || element.getAttribute('data-target'));
  if (!target || isNaN(target)) return;

  const duration = 2000;
  const start = parseInt(element.textContent) || 0;
  const increment = (target - start) / (duration / 16);
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current);
    }
  }, 16);
}

/**
 * Pricing Toggle (Monthly / Yearly)
 */
function initPricingToggle() {
  const switches = document.querySelectorAll('#billingSwitch, #billingSwitch2');
  switches.forEach(toggle => {
    if (!toggle) return;

    toggle.addEventListener('change', function() {
      const isYearly = this.checked;
      const grid = this.closest('.billing-toggle')?.nextElementSibling?.querySelector?.('.pricing-grid')
                  || document.getElementById('pricingGrid');

      if (grid) {
        grid.querySelectorAll('.price.amount').forEach(price => {
          const monthly = parseFloat(price.dataset.monthly);
          const yearly = parseFloat(price.dataset.yearly);
          if (isYearly && yearly) {
            price.textContent = yearly.toFixed(2);
          } else if (monthly) {
            price.textContent = monthly.toFixed(2);
          }
        });
      }

      // Update labels
      const labels = this.closest('.billing-toggle')?.querySelectorAll('.toggle-label');
      if (labels) {
        labels.forEach(label => {
          label.style.color = label.dataset.period === (isYearly ? 'yearly' : 'monthly')
            ? 'var(--text-primary)' : 'var(--text-secondary)';
        });
      }
    });

    // Trigger initial state
    toggle.dispatchEvent(new Event('change'));
  });
}

/**
 * Hero Particles Animation
 */
function initHeroParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;

  for (let i = 0; i < 50; i++) {
    const particle = document.createElement('div');
    const size = Math.random() * 4 + 1;
    particle.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: ${['rgba(99,102,241,0.6)', 'rgba(6,182,212,0.6)', 'rgba(139,92,246,0.6)'][Math.floor(Math.random() * 3)]};
      border-radius: 50%;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation: float ${Math.random() * 10 + 10}s ease-in-out infinite;
      animation-delay: ${Math.random() * 5}s;
    `;
    container.appendChild(particle);
  }
}

/**
 * Domain Search
 */
function initDomainSearch() {
  const searchBtn = document.getElementById('domainSearchBtn');
  const input = document.getElementById('domainInput');
  const tld = document.getElementById('domainTld');
  const results = document.getElementById('domainResults');

  if (!searchBtn || !input) return;

  searchBtn.addEventListener('click', function() {
    const domain = input.value.trim().toLowerCase();
    if (!domain) {
      showToast('Please enter a domain name.', 'warning');
      return;
    }

    const extension = tld ? tld.value : '.com';
    results.innerHTML = '<div style="text-align:center;padding:1rem"><i class="fas fa-spinner fa-spin"></i> Searching...</div>';

    setTimeout(() => {
      const available = Math.random() > 0.4;
      const prices = { '.com': 9.99, '.net': 11.99, '.org': 10.99, '.io': 34.99, '.dev': 14.99, '.app': 13.99, '.co': 24.99, '.store': 29.99 };
      const price = prices[extension] || 9.99;

      if (available) {
        results.innerHTML = `
          <div class="domain-result available" style="display:flex;align-items:center;justify-content:space-between;padding:1rem;margin-top:1rem;border-radius:12px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);flex-wrap:wrap;gap:1rem">
            <span><i class="fas fa-check-circle" style="color:#10b981"></i> <strong>${domain}${extension}</strong> is available!</span>
            <span style="font-weight:700;color:var(--primary)">$${price.toFixed(2)}/yr</span>
            <button class="btn btn-primary btn-sm">Register Now</button>
          </div>`;
      } else {
        results.innerHTML = `
          <div class="domain-result taken" style="display:flex;align-items:center;justify-content:space-between;padding:1rem;margin-top:1rem;border-radius:12px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);flex-wrap:wrap;gap:1rem">
            <span><i class="fas fa-times-circle" style="color:#ef4444"></i> <strong>${domain}${extension}</strong> is taken</span>
            <span style="color:var(--text-secondary)">Try: ${domain}${extension === '.com' ? '.net' : '.com'}</span>
          </div>`;
      }
    }, 1000);
  });

  input.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') searchBtn.click();
  });
}

/**
 * Toast Notification System
 */
function showToast(message, type = 'info') {
  const types = ['success', 'error', 'info', 'warning'];
  if (!types.includes(type)) type = 'info';

  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icons = {
    success: '<i class="fas fa-check-circle"></i>',
    error: '<i class="fas fa-times-circle"></i>',
    info: '<i class="fas fa-info-circle"></i>',
    warning: '<i class="fas fa-exclamation-triangle"></i>'
  };

  toast.innerHTML = `${icons[type] || icons.info} <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/**
 * Filter Table (for admin search)
 */
function filterTable(inputId, tableId) {
  const input = document.getElementById(inputId);
  const table = document.getElementById(tableId);
  if (!input || !table) return;

  const filter = input.value.toLowerCase();
  const rows = table.querySelectorAll('tbody tr');

  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(filter) ? '' : 'none';
  });
}
