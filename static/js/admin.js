/**
 * NEXUS VIP HOST - Admin JavaScript
 * Admin panel interactions
 */

document.addEventListener('DOMContentLoaded', function() {
  initSidebar();
  initAutoCloseFlash();
});

/**
 * Admin Sidebar
 */
function initSidebar() {
  const sidebar = document.getElementById('adminSidebar');
  const mobileToggle = document.getElementById('mobileToggle');
  const sidebarToggle = document.getElementById('sidebarToggle');

  function toggleSidebar() {
    sidebar.classList.toggle('open');
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', toggleSidebar);
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', toggleSidebar);
  }

  // Close sidebar on outside click (mobile)
  document.addEventListener('click', function(e) {
    if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
      if (!sidebar.contains(e.target) && !mobileToggle?.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    }
  });

  // Close sidebar on escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      sidebar?.classList.remove('open');
    }
  });
}

/**
 * Auto-close flash messages
 */
function initAutoCloseFlash() {
  document.querySelectorAll('.flash-message').forEach(flash => {
    setTimeout(() => {
      flash.style.opacity = '0';
      flash.style.transform = 'translateX(50px)';
      flash.style.transition = 'all 0.3s ease';
      setTimeout(() => flash.remove(), 300);
    }, 5000);
  });
}

/**
 * Confirm dialog helper
 */
function confirmAction(message) {
  return confirm(message || 'Are you sure?');
}

/**
 * Format currency
 */
function formatCurrency(amount) {
  return '$' + parseFloat(amount).toFixed(2);
}

/**
 * Copy to clipboard
 */
function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied to clipboard!', 'success');
    });
  } else {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('Copied to clipboard!', 'success');
  }
}
