/**
 * NEXUS VIP HOST - Premium Dashboard Widgets
 * Interactive charts, real-time stats, animated widgets
 */

class NexusDashboard {
  constructor() {
    this.charts = [];
    this.widgets = [];
    this.init();
  }

  init() {
    this.initCharts();
    this.initProgressWidgets();
    this.initServerMonitor();
    this.initActivityFeed();
    this.initMiniCharts();
  }

  /**
   * Initialize Chart.js charts with premium styling
   */
  initCharts() {
    if (typeof Chart === 'undefined') return;

    const chartDefaults = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#94a3b8',
            font: { family: 'Inter, sans-serif', size: 11 },
            boxWidth: 12,
            padding: 16
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 15, 42, 0.9)',
          titleColor: '#fff',
          bodyColor: '#94a3b8',
          borderColor: 'rgba(99, 102, 241, 0.3)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          boxPadding: 4
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
          ticks: { color: '#64748b', font: { size: 10 } }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
          ticks: { color: '#64748b', font: { size: 10 } }
        }
      }
    };

    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = 'Inter, sans-serif';

    // Revenue Chart
    const revenueCanvas = document.getElementById('revenueChart');
    if (revenueCanvas) {
      const labels = JSON.parse(revenueCanvas.dataset.labels || '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]');
      const data = JSON.parse(revenueCanvas.dataset.values || '[1200,1900,3000,2500,3200,2800,4000]');

      new Chart(revenueCanvas, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Revenue',
            data,
            borderColor: '#6366f1',
            backgroundColor: (ctx) => {
              const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
              gradient.addColorStop(0, 'rgba(99, 102, 241, 0.2)');
              gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
              return gradient;
            },
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#6366f1',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 2
          }]
        },
        options: {
          ...chartDefaults,
          plugins: {
            ...chartDefaults.plugins,
            legend: { display: false }
          }
        }
      });
    }

    // Orders Chart (Doughnut)
    const ordersCanvas = document.getElementById('ordersChart');
    if (ordersCanvas) {
      new Chart(ordersCanvas, {
        type: 'doughnut',
        data: {
          labels: ['Active', 'Pending', 'Suspended', 'Cancelled'],
          datasets: [{
            data: [65, 20, 10, 5],
            backgroundColor: ['#10b981', '#6366f1', '#f59e0b', '#ef4444'],
            borderWidth: 0,
            hoverOffset: 8
          }]
        },
        options: {
          ...chartDefaults,
          cutout: '75%',
          plugins: {
            ...chartDefaults.plugins,
            legend: { position: 'bottom' }
          }
        }
      });
    }

    // Server Load Chart
    const serverCanvas = document.getElementById('serverChart');
    if (serverCanvas) {
      new Chart(serverCanvas, {
        type: 'line',
        data: {
          labels: Array.from({length: 24}, (_, i) => `${i}:00`),
          datasets: [
            {
              label: 'CPU',
              data: Array.from({length: 24}, () => Math.random() * 60 + 20),
              borderColor: '#6366f1',
              tension: 0.4,
              borderWidth: 2,
              pointRadius: 0
            },
            {
              label: 'Memory',
              data: Array.from({length: 24}, () => Math.random() * 40 + 40),
              borderColor: '#06b6d4',
              tension: 0.4,
              borderWidth: 2,
              pointRadius: 0
            },
            {
              label: 'Disk',
              data: Array.from({length: 24}, () => Math.random() * 20 + 30),
              borderColor: '#8b5cf6',
              tension: 0.4,
              borderWidth: 2,
              pointRadius: 0
            }
          ]
        },
        options: {
          ...chartDefaults,
          plugins: {
            ...chartDefaults.plugins,
            legend: { position: 'bottom' }
          }
        }
      });
    }
  }

  /**
   * Animated progress widgets
   */
  initProgressWidgets() {
    document.querySelectorAll('.dashboard-progress').forEach(widget => {
      const bar = widget.querySelector('.progress-bar-fill');
      const target = parseInt(bar?.dataset.target) || 75;
      const label = widget.querySelector('.progress-value');

      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          let current = 0;
          const step = target / 60;
          const timer = setInterval(() => {
            current += step;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            if (bar) bar.style.width = `${current}%`;
            if (label) label.textContent = `${Math.round(current)}%`;
          }, 20);
          observer.unobserve(widget);
        }
      }, { threshold: 0.3 });
      observer.observe(widget);
    });
  }

  /**
   * Real-time server monitoring widgets
   */
  initServerMonitor() {
    document.querySelectorAll('[data-monitor]').forEach(monitor => {
      const interval = parseInt(monitor.dataset.monitorInterval) || 3000;
      const endpoint = monitor.dataset.monitorEndpoint;

      const update = async () => {
        try {
          if (endpoint) {
            const res = await fetch(endpoint);
            const data = await res.json();
            this.updateMonitorWidget(monitor, data);
          } else {
            // Simulate live data
            this.simulateMonitorUpdate(monitor);
          }
        } catch (e) {
          console.warn('Monitor update failed:', e);
        }
      };

      update();
      setInterval(update, interval);
    });
  }

  updateMonitorWidget(monitor, data) {
    const statusDot = monitor.querySelector('.status-dot');
    const statusText = monitor.querySelector('.status-text');
    const latencyEl = monitor.querySelector('.latency');

    if (data.status === 'operational') {
      statusDot?.classList.add('online');
      statusDot?.classList.remove('offline');
      statusText && (statusText.textContent = 'Operational');
    } else {
      statusDot?.classList.add('offline');
      statusDot?.classList.remove('online');
      statusText && (statusText.textContent = 'Issues Detected');
    }

    if (latencyEl && data.latency) {
      latencyEl.textContent = data.latency;
    }
  }

  simulateMonitorUpdate(monitor) {
    const statusDot = monitor.querySelector('.status-dot');
    const latencyEl = monitor.querySelector('.latency');

    // Random slight latency changes
    if (latencyEl) {
      const baseLatency = parseInt(latencyEl.dataset.baseLatency) || 12;
      const variance = Math.random() * 6 - 3;
      const latency = Math.max(1, baseLatency + variance);
      latencyEl.textContent = `${Math.round(latency)}ms`;
    }

    // 99.9% uptime simulation - rarely go offline
    if (statusDot && Math.random() > 0.998) {
      statusDot.className = 'status-dot offline';
    }
  }

  /**
   * Animated activity feed
   */
  initActivityFeed() {
    document.querySelectorAll('.activity-feed').forEach(feed => {
      const interval = parseInt(feed.dataset.feedInterval) || 8000;

      const activities = [
        { icon: 'fa-server', text: 'New server deployed in Frankfurt', time: '2 min ago' },
        { icon: 'fa-user', text: 'New client registration', time: '5 min ago' },
        { icon: 'fa-credit-card', text: 'Payment received - $149.99', time: '8 min ago' },
        { icon: 'fa-ticket-alt', text: 'Support ticket resolved #2847', time: '12 min ago' },
        { icon: 'fa-shield-alt', text: 'DDoS attack mitigated - 500 Gbps', time: '15 min ago' },
        { icon: 'fa-globe', text: 'New domain registered - techstartup.io', time: '20 min ago' },
      ];

      let index = 0;

      const addActivity = () => {
        const activity = activities[index % activities.length];
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.style.cssText = 'opacity:0;transform:translateX(-20px);transition:all 0.5s ease;';
        item.innerHTML = `
          <div class="activity-icon"><i class="fas ${activity.icon}"></i></div>
          <div class="activity-content">
            <p>${activity.text}</p>
            <span>${activity.time}</span>
          </div>
        `;
        feed.prepend(item);

        requestAnimationFrame(() => {
          item.style.opacity = '1';
          item.style.transform = 'translateX(0)';
        });

        // Remove old items
        if (feed.children.length > 8) {
          feed.lastChild.remove();
        }

        index++;
      };

      addActivity();
      setInterval(addActivity, interval);
    });
  }

  /**
   * Mini sparkline charts for stat cards
   */
  initMiniCharts() {
    if (typeof Chart === 'undefined') return;

    document.querySelectorAll('[data-mini-chart]').forEach(canvas => {
      const color = canvas.dataset.chartColor || '#6366f1';
      const points = (canvas.dataset.chartData || '10,20,15,30,25,40,35').split(',').map(Number);

      new Chart(canvas, {
        type: 'line',
        data: {
          labels: Array.from({length: points.length}, (_, i) => ''),
          datasets: [{
            data: points,
            borderColor: color,
            backgroundColor: 'transparent',
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          scales: {
            x: { display: false },
            y: { display: false, beginAtZero: true }
          },
          elements: {
            point: { radius: 0 }
          }
        }
      });
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  window.nexusDashboard = new NexusDashboard();
});
