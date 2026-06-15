/**
 * NEXUS VIP HOST - Advanced Client Dashboard Engine
 * Premium cloud-hosting control panel with real-time features
 */

class DashboardApp {
  constructor() {
    this.currentSection = 'overview';
    this.notifications = [];
    this.init();
  }

  init() {
    this.cacheDOM();
    this.bindEvents();
    this.loadSection('overview');
    this.initMockData();
    this.initTerminal();
    this.initFileManager();
    this.initMonitoring();
    this.initDatabaseManager();
    this.initBackupManager();
    this.initSecurityCenter();
    this.initAnalytics();
    this.initNotificationCenter();
    this.showWelcomeToast();
    this.activateCharts();
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);
  }

  cacheDOM() {
    this.sidebar = document.getElementById('dashSidebar');
    this.content = document.getElementById('dashContent');
    this.notifPanel = document.getElementById('notifPanel');
    this.notifOverlay = document.getElementById('notifOverlay');
    this.toastContainer = document.getElementById('dashToastContainer');
    this.sidebarLinks = document.querySelectorAll('.dash-sidebar-item');
    this.overlay = document.getElementById('dashOverlay');
  }

  bindEvents() {
    // Sidebar toggle
    document.querySelectorAll('.dash-sidebar-toggle, .mobile-sidebar-toggle').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.innerWidth <= 768) {
          this.sidebar.classList.toggle('mobile-open');
          this.overlay.classList.toggle('show');
        } else {
          this.sidebar.classList.toggle('collapsed');
        }
      });
    });

    // Overlay click
    if (this.overlay) {
      this.overlay.addEventListener('click', () => {
        this.sidebar.classList.remove('mobile-open');
        this.overlay.classList.remove('show');
      });
    }

    // Sidebar navigation
    this.sidebarLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.dataset.section;
        if (section) {
          this.loadSection(section);
          this.sidebarLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
          // Close mobile sidebar
          if (window.innerWidth <= 768) {
            this.sidebar.classList.remove('mobile-open');
            this.overlay.classList.remove('show');
          }
        }
      });
    });

    // Notification panel toggle
    document.querySelectorAll('[data-toggle-notif]').forEach(el => {
      el.addEventListener('click', () => this.toggleNotifications());
    });
    if (this.notifPanel) {
      document.querySelectorAll('.notif-panel-close, .notif-overlay').forEach(el => {
        el.addEventListener('click', () => this.toggleNotifications(false));
      });
    }

    // Quick actions
    document.querySelectorAll('[data-action]').forEach(el => {
      el.addEventListener('click', (e) => {
        const action = el.dataset.action;
        this.handleQuickAction(action);
      });
    });

    // Topbar search
    const searchInput = document.querySelector('.dash-topbar-search input');
    if (searchInput) {
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && searchInput.value.trim()) {
          this.showToast('info', 'Search', `Searching for "${searchInput.value}"...`);
        }
      });
    }

    // Re-initialize on window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => this.handleResize(), 200);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Esc to close modals / notification panel
      if (e.key === 'Escape') {
        this.toggleNotifications(false);
        document.querySelectorAll('.dash-modal-overlay.show').forEach(m => m.classList.remove('show'));
      }
      // Ctrl+K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.querySelector('.dash-topbar-search input');
        if (input) input.focus();
      }
    });
  }

  /* ===== SECTION LOADING ===== */
  loadSection(section) {
    this.currentSection = section;
    document.querySelectorAll('.dash-section').forEach(el => {
      el.classList.remove('active');
    });
    const target = document.getElementById(`section-${section}`);
    if (target) {
      target.classList.add('active');
    }
    // Update section-specific things
    if (section === 'analytics') {
      setTimeout(() => this.activateCharts(), 300);
    }
    if (section === 'monitoring') {
      this.startMonitoringUpdates();
    }
  }

  /* ===== CLOCK ===== */
  updateClock() {
    const clock = document.querySelector('.dash-clock');
    if (clock) {
      clock.textContent = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
  }

  /* ===== NOTIFICATIONS ===== */
  toggleNotifications(forceState) {
    const isOpen = forceState !== undefined ? forceState : !this.notifPanel.classList.contains('open');
    this.notifPanel.classList.toggle('open', isOpen);
    this.notifOverlay.classList.toggle('show', isOpen);
    if (isOpen) {
      document.querySelectorAll('.notif-dot').forEach(d => d.remove());
      document.querySelectorAll('.notif-item.unread').forEach(item => item.classList.remove('unread'));
      // Update badge
      const badge = document.querySelector('[data-toggle-notif] .notif-dot');
      if (badge) badge.style.display = 'none';
    }
  }

  /* ===== TOASTS ===== */
  showToast(type, title, text, duration = 4000) {
    if (!this.toastContainer) return;
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };
    const toast = document.createElement('div');
    toast.className = `dash-toast ${type}`;
    toast.innerHTML = `
      <i class="fas ${icons[type] || icons.info} dash-toast-icon"></i>
      <div class="dash-toast-content">
        <div class="dash-toast-title">${title}</div>
        <div class="dash-toast-text">${text}</div>
      </div>
      <button class="dash-toast-close" onclick="this.parentElement.classList.add('removing');setTimeout(()=>this.parentElement.remove(),300)"><i class="fas fa-times"></i></button>
    `;
    this.toastContainer.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
  }

  showWelcomeToast() {
    setTimeout(() => {
      this.showToast('success', 'Welcome Back!', 'All systems operational. 0 incidents reported.');
    }, 1500);
    setTimeout(() => {
      this.addNotification('system', 'System Update', 'Server maintenance scheduled for June 20, 2026', '2 min ago', true);
    }, 3000);
  }

  /* ===== QUICK ACTIONS ===== */
  handleQuickAction(action) {
    const actions = {
      'create-vps': () => this.showToast('info', 'Create VPS', 'Opening VPS deployment wizard...'),
      'restart-server': () => this.showToast('warning', 'Restart Server', 'Initiating graceful server restart...'),
      'open-terminal': () => { this.loadSection('terminal'); this.showToast('info', 'Terminal', 'Opening web terminal...'); },
      'open-files': () => { this.loadSection('files'); this.showToast('info', 'File Manager', 'Loading file manager...'); },
      'create-db': () => this.showToast('info', 'Create Database', 'Opening database creation wizard...'),
      'backup': () => this.showToast('info', 'Backup', 'Starting manual backup... This may take a few minutes.'),
      'submit-ticket': () => this.showToast('info', 'Submit Ticket', 'Opening support ticket form...'),
    };
    if (actions[action]) actions[action]();
    else this.showToast('info', 'Quick Action', `Executing: ${action.replace(/-/g, ' ')}`);
  }

  /* ===== MODALS ===== */
  openModal(html) {
    let overlay = document.querySelector('.dash-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'dash-modal-overlay';
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = `<div class="dash-modal">${html}</div>`;
    overlay.classList.add('show');
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('show');
    });
    // Close button
    overlay.querySelector('.dash-modal-close')?.addEventListener('click', () => overlay.classList.remove('show'));
    return overlay;
  }

  closeModal() {
    document.querySelectorAll('.dash-modal-overlay.show').forEach(m => m.classList.remove('show'));
  }

  /* ===== MOCK DATA ===== */
  initMockData() {
    this.mockFileSystem = {
      root: {
        type: 'folder',
        children: {
          'var': {
            type: 'folder', children: {
              'www': { type: 'folder', children: {
                'html': { type: 'folder', children: {
                  'index.html': { type: 'file', size: '2.4 KB' },
                  'style.css': { type: 'file', size: '45 KB' },
                  'app.js': { type: 'file', size: '12 KB' },
                  'config.json': { type: 'file', size: '0.8 KB' },
                  'assets': { type: 'folder', children: {
                    'logo.png': { type: 'image', size: '156 KB' },
                    'banner.jpg': { type: 'image', size: '2.1 MB' }
                  }}
                }}
              }},
              'log': { type: 'folder', children: {
                'access.log': { type: 'file', size: '1.2 MB' },
                'error.log': { type: 'file', size: '245 KB' },
                'nginx.log': { type: 'file', size: '890 KB' }
              }}
            }
          },
          'etc': { type: 'folder', children: {
            'nginx': { type: 'folder', children: {
              'nginx.conf': { type: 'file', size: '3.1 KB' },
              'sites-available': { type: 'folder', children: {} }
            }},
            'php': { type: 'folder', children: {
              'php.ini': { type: 'file', size: '12 KB' }
            }}
          }},
          'home': { type: 'folder', children: {
            'nexus': { type: 'folder', children: {
              'backups': { type: 'folder', children: {} },
              'scripts': { type: 'folder', children: {
                'deploy.sh': { type: 'file', size: '1.5 KB' },
                'backup.sh': { type: 'file', size: '0.9 KB' }
              }}
            }}
          }},
          'usr': { type: 'folder', children: {} },
          'tmp': { type: 'folder', children: {} },
          'README.txt': { type: 'file', size: '0.3 KB' },
          'package.json': { type: 'file', size: '1.1 KB' }
        }
      }
    };

    this.mockDatabases = [
      { name: 'nexus_main', size: '12.4 MB', tables: 24, users: 3 },
      { name: 'nexus_users', size: '4.1 MB', tables: 6, users: 2 },
      { name: 'nexus_billing', size: '8.7 MB', tables: 12, users: 2 },
      { name: 'blog', size: '2.3 MB', tables: 8, users: 1 }
    ];

    this.mockBackups = [
      { name: 'Full Server Backup', date: '2026-06-14 03:00 AM', size: '256 MB', type: 'scheduled' },
      { name: 'Database Dump', date: '2026-06-13 12:00 PM', size: '45 MB', type: 'scheduled' },
      { name: 'Pre-Update Snapshot', date: '2026-06-12 06:30 PM', size: '312 MB', type: 'manual' },
      { name: 'Weekly Archive', date: '2026-06-11 03:00 AM', size: '1.2 GB', type: 'scheduled' },
      { name: 'Config Backup', date: '2026-06-10 09:15 AM', size: '12 MB', type: 'manual' }
    ];

    this.mockInvoices = [
      { number: 'INV-2026-001', date: 'Jun 1, 2026', amount: '$29.99', status: 'paid' },
      { number: 'INV-2026-002', date: 'May 1, 2026', amount: '$29.99', status: 'paid' },
      { number: 'INV-2026-003', date: 'Apr 1, 2026', amount: '$29.99', status: 'paid' },
      { number: 'INV-2026-004', date: 'Mar 1, 2026', amount: '$49.99', status: 'paid' }
    ];

    this.mockApiKeys = [
      { name: 'Production API Key', key: 'nxp_live_8f7a...3b2c', created: 'Jan 15, 2026' },
      { name: 'Development Key', key: 'nxp_dev_2e4d...9a1f', created: 'Feb 20, 2026' },
      { name: 'Monitoring Service', key: 'nxp_mon_5c6b...7d3e', created: 'Mar 10, 2026' }
    ];

    this.mockLoginHistory = [
      { location: 'Chrome on Windows', ip: '203.0.113.42', time: '2 min ago', status: 'success' },
      { location: 'Safari on macOS', ip: '198.51.100.17', time: '3 hours ago', status: 'success' },
      { location: 'Firefox on Linux', ip: '192.0.2.88', time: '1 day ago', status: 'success' },
      { location: 'Unknown Location', ip: '185.220.101.52', time: '2 days ago', status: 'failed' },
      { location: 'Chrome on Android', ip: '203.0.113.15', time: '3 days ago', status: 'success' }
    ];

    this.mockNotifications = [
      { type: 'system', title: 'Server Maintenance', text: 'Scheduled maintenance in 24 hours', time: '15 min ago', unread: true },
      { type: 'billing', title: 'Invoice Generated', text: 'Your June invoice is ready', time: '1 hour ago', unread: true },
      { type: 'security', title: 'New Login Detected', text: 'Login from Chrome on Windows', time: '2 hours ago', unread: false },
      { type: 'support', title: 'Ticket Updated', text: 'Your support ticket #4281 has a new response', time: '5 hours ago', unread: false },
      { type: 'update', title: 'PHP 8.3 Available', text: 'PHP 8.3 is now available for your server', time: '1 day ago', unread: false }
    ];

    this.systemMetrics = {
      cpu: { usage: 34, cores: 4, model: 'Intel Xeon E5-2683 v4' },
      ram: { used: 3.2, total: 8, percent: 40 },
      disk: { used: 45, total: 120, percent: 37.5 },
      network: { rx: 1.2, tx: 0.8, unit: 'MB/s' },
      uptime: 342816
    };

    // Terminal filesystem
    this.terminalFS = {
      '/': { type: 'dir', content: ['var', 'etc', 'home', 'usr', 'tmp', 'README.txt'] },
      '/var': { type: 'dir', content: ['www', 'log'] },
      '/var/www': { type: 'dir', content: ['html'] },
      '/var/www/html': { type: 'dir', content: ['index.html', 'style.css', 'app.js'] },
      '/var/log': { type: 'dir', content: ['access.log', 'error.log'] },
      '/etc': { type: 'dir', content: ['nginx', 'hostname', 'os-release'] },
      '/etc/nginx': { type: 'dir', content: ['nginx.conf'] },
      '/home': { type: 'dir', content: ['nexus'] },
      '/home/nexus': { type: 'dir', content: ['backups', 'scripts'] }
    };
    this.terminalFiles = {
      '/README.txt': 'Welcome to NEXUS VIP HOST\nThis is a premium cloud hosting server.\nFor support, visit https://nexusviphost.com',
      '/etc/hostname': 'srv-nexus-vip-01',
      '/etc/os-release': 'NAME="NexusOS"\nVERSION="1.0 (Platinum)"\nID=nexus\nPRETTY_NAME="NexusOS 1.0 Platinum"',
      '/var/www/html/index.html': '<!DOCTYPE html>\n<html>\n<head><title>My Site</title></head>\n<body>\n<h1>Welcome to my site!</h1>\n</body>\n</html>',
      '/var/www/html/style.css': 'body { background: #0a0a1a; color: #fff; }',
      '/var/www/html/app.js': 'console.log("App initialized");',
      '/etc/nginx/nginx.conf': 'server {\n    listen 80;\n    server_name example.com;\n    root /var/www/html;\n}'
    };
  }

  addNotification(type, title, text, time, unread = true) {
    this.mockNotifications.unshift({ type, title, text, time, unread });
    // Update badge
    const badge = document.querySelector('[data-toggle-notif] .notif-dot');
    if (badge) badge.style.display = 'block';
    this.showToast('info', title, text);
  }

  handleResize() {
    // Nothing special needed
  }

  /* =========================================================== */
  /* === TERMINAL ============================================= */
  /* =========================================================== */
  initTerminal() {
    this.terminalState = {
      cwd: '/',
      history: [],
      historyIndex: -1,
      user: 'nexus',
      hostname: 'srv-nexus-vip-01',
      theme: 'default'
    };

    const terminalBody = document.getElementById('terminalBody');
    if (!terminalBody) return;
    const input = document.getElementById('terminalInput');
    const termContainer = document.getElementById('termContainer');

    // Welcome message
    this.terminalWrite('Welcome to NEXUS VIP HOST Terminal v2.0', 'highlight');
    this.terminalWrite('Type "help" for available commands', 'info');
    this.terminalWrite('━'.repeat(50), 'output');
    this.terminalWrite('');

    // Event listeners
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = input.value.trim();
        if (cmd) {
          this.terminalHistoryAdd(cmd);
          this.terminalExec(cmd);
        }
        input.value = '';
        this.terminalScrollBottom();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this.terminalState.historyIndex > 0) {
          this.terminalState.historyIndex--;
          input.value = this.terminalState.history[this.terminalState.historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (this.terminalState.historyIndex < this.terminalState.history.length - 1) {
          this.terminalState.historyIndex++;
          input.value = this.terminalState.history[this.terminalState.historyIndex];
        } else {
          this.terminalState.historyIndex = this.terminalState.history.length;
          input.value = '';
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        // Simple tab completion for commands
        const partial = input.value.trim().toLowerCase();
        const cmds = ['help', 'ls', 'cd', 'pwd', 'cat', 'echo', 'clear', 'whoami', 'uname', 'date', 'uptime', 'free', 'df', 'ps', 'top', 'mkdir', 'touch', 'rm', 'cp', 'mv', 'grep', 'find', 'chmod', 'sudo', 'exit', 'reboot', 'shutdown', 'neofetch', 'theme', 'll', 'man'];
        const matches = cmds.filter(c => c.startsWith(partial));
        if (matches.length === 1) {
          input.value = matches[0] + ' ';
        } else if (matches.length > 1) {
          this.terminalWrite(matches.join('  '), 'info');
        }
      }
    });

    // Terminal theme buttons
    document.querySelectorAll('[data-term-theme]').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.dataset.termTheme;
        this.terminalSetTheme(theme);
      });
    });

    // Terminal fullscreen
    document.querySelectorAll('[data-term-fullscreen]').forEach(btn => {
      btn.addEventListener('click', () => {
        termContainer.classList.toggle('terminal-fullscreen');
        btn.innerHTML = termContainer.classList.contains('terminal-fullscreen') ? '<i class="fas fa-compress"></i>' : '<i class="fas fa-expand"></i>';
        setTimeout(() => this.terminalScrollBottom(), 100);
      });
    });

    // Terminal clear
    document.querySelectorAll('[data-term-clear]').forEach(btn => {
      btn.addEventListener('click', () => this.terminalClear());
    });

    // Focus input on terminal click
    terminalBody.addEventListener('click', () => input.focus());
  }

  terminalWrite(text, className = 'output') {
    const body = document.getElementById('terminalBody');
    if (!body) return;
    const line = document.createElement('div');
    line.className = 'terminal-line';
    const span = document.createElement('span');
    span.className = className;
    span.textContent = text;
    line.appendChild(span);
    // Insert before input line
    const inputLine = body.querySelector('.terminal-input-line');
    if (inputLine) body.insertBefore(line, inputLine);
    else body.appendChild(line);
  }

  terminalExec(cmd) {
    const prompt = `[${this.terminalState.user}@${this.terminalState.hostname} ${this.terminalState.cwd}]$`;
    this.terminalWrite(prompt + ' ' + cmd, 'command');

    const args = cmd.split(/\s+/);
    const command = args[0].toLowerCase();
    const rest = args.slice(1);

    if (!cmd) return;
    const commands = {
      help: () => {
        this.terminalWrite('Available commands:', 'highlight');
        const cmds = [
          '  ls, ll        List directory contents',
          '  cd <dir>      Change directory',
          '  pwd           Print working directory',
          '  cat <file>    Display file contents',
          '  echo <text>   Print text',
          '  clear         Clear terminal',
          '  whoami        Display user',
          '  uname         System information',
          '  date          Current date and time',
          '  uptime        Server uptime',
          '  free          Memory usage',
          '  df            Disk usage',
          '  ps            Process list',
          '  mkdir <name>  Create directory',
          '  touch <file>  Create file',
          '  rm <file>     Remove file',
          '  neofetch      System info display',
          '  theme <name>  Change theme (hacker, light, ocean, dracula, default)',
          '  reboot        Simulate server reboot',
          '  shutdown      Simulate server shutdown',
          '  exit          Exit session',
          '  sudo          Elevate privileges (simulated)'
        ];
        cmds.forEach(c => this.terminalWrite(c, 'info'));
      },
      ls: () => {
        const path = rest[0] || this.terminalState.cwd;
        const dir = this.terminalFS[path] || this.terminalFS[this.terminalState.cwd];
        if (!dir || dir.type !== 'dir') {
          this.terminalWrite(`ls: cannot access '${path}': No such directory`, 'error');
          return;
        }
        dir.content.forEach(item => {
          const isDir = this.terminalFS[path === '/' ? '/' + item : path + '/' + item]?.type === 'dir';
          this.terminalWrite((isDir ? '📁 ' : '📄 ') + item, isDir ? 'highlight' : 'output');
        });
      },
      ll: () => commands.ls(),
      pwd: () => this.terminalWrite(this.terminalState.cwd, 'success'),
      cd: () => {
        const target = rest[0] || '/';
        if (target === '..') {
          const parts = this.terminalState.cwd.split('/').filter(Boolean);
          parts.pop();
          this.terminalState.cwd = '/' + parts.join('/') || '/';
          this.updatePrompt();
          return;
        }
        if (target === '~' || target === '/home/nexus') {
          this.terminalState.cwd = '/home/nexus';
          this.updatePrompt();
          return;
        }
        const newPath = target.startsWith('/') ? target : (this.terminalState.cwd === '/' ? '/' + target : this.terminalState.cwd + '/' + target);
        const dir = this.terminalFS[newPath];
        if (dir && dir.type === 'dir') {
          this.terminalState.cwd = newPath;
          this.updatePrompt();
        } else {
          this.terminalWrite(`cd: ${target}: No such directory`, 'error');
        }
      },
      cat: () => {
        if (!rest[0]) { this.terminalWrite('cat: missing operand', 'error'); return; }
        const path = rest[0].startsWith('/') ? rest[0] : (this.terminalState.cwd === '/' ? '/' + rest[0] : this.terminalState.cwd + '/' + rest[0]);
        const file = this.terminalFiles[path];
        if (file) {
          this.terminalWrite(file, 'output');
        } else {
          this.terminalWrite(`cat: ${rest[0]}: No such file`, 'error');
        }
      },
      echo: () => this.terminalWrite(rest.join(' ') || '', 'output'),
      clear: () => this.terminalClear(),
      whoami: () => this.terminalWrite(this.terminalState.user, 'success'),
      uname: () => this.terminalWrite('Linux srv-nexus-vip-01 5.15.0-nexus #1 SMP PREEMPT x86_64 GNU/Linux', 'output'),
      date: () => this.terminalWrite(new Date().toString(), 'output'),
      uptime: () => {
        const uptime = this.systemMetrics.uptime;
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const mins = Math.floor((uptime % 3600) / 60);
        this.terminalWrite(`  ${days} days, ${hours} hours, ${mins} minutes`, 'output');
        this.terminalWrite(`  CPU: ${this.systemMetrics.cpu.usage}% | RAM: ${this.systemMetrics.ram.used}GB/${this.systemMetrics.ram.total}GB`, 'info');
      },
      free: () => {
        const r = this.systemMetrics.ram;
        this.terminalWrite('               total        used        free      shared  buff/cache', 'output');
        this.terminalWrite(`Mem:          ${r.total}Gi       ${r.used}Gi       ${(r.total - r.used).toFixed(1)}Gi       0.0Gi       ${(r.total * 0.1).toFixed(1)}Gi`, 'output');
        this.terminalWrite(`Swap:         4.0Gi       0.2Gi       3.8Gi`, 'output');
      },
      df: () => {
        const d = this.systemMetrics.disk;
        this.terminalWrite('Filesystem      Size  Used  Avail  Use%  Mounted on', 'output');
        this.terminalWrite(`/dev/vda1       ${d.total}G   ${d.used}G   ${d.total - d.used}G    ${d.percent}%  /`, 'output');
      },
      ps: () => {
        const processes = [
          '  PID  USER  %CPU  %MEM  COMMAND',
          '    1  root   0.1   0.3  systemd',
          '  342  root   0.5   1.2  nginx',
          '  890  nexus  1.2   2.1  php-fpm',
          ' 1234  nexus  0.3   0.8  python3',
          ' 1567  nexus  0.0   0.1  sshd'
        ];
        processes.forEach(p => this.terminalWrite(p, 'output'));
      },
      mkdir: () => {
        if (!rest[0]) { this.terminalWrite('mkdir: missing operand', 'error'); return; }
        this.terminalWrite(`Created directory: ${rest[0]}`, 'success');
      },
      touch: () => {
        if (!rest[0]) { this.terminalWrite('touch: missing operand', 'error'); return; }
        this.terminalWrite(`Created file: ${rest[0]}`, 'success');
      },
      rm: () => {
        if (!rest[0]) { this.terminalWrite('rm: missing operand', 'error'); return; }
        if (rest.includes('-rf') && rest.length > 1) {
          this.terminalWrite('⚠️  rm -rf: Permission denied. Use sudo for dangerous operations.', 'error');
          return;
        }
        this.terminalWrite(`Removed: ${rest.filter(r => !r.startsWith('-')).join(', ')}`, 'success');
      },
      neofetch: () => {
        this.terminalWrite('', 'output');
        this.terminalWrite('          ██████████          nexus@srv-nexus-vip-01', 'highlight');
        this.terminalWrite('        ██          ██        -----------------------', 'info');
        this.terminalWrite('       ██  ██████  ██        OS: NexusOS 1.0 Platinum', 'output');
        this.terminalWrite('       ██  ██████  ██        Host: Premium VPS (Gold)', 'output');
        this.terminalWrite('       ██  ██████  ██        Kernel: 5.15.0-nexus', 'output');
        this.terminalWrite('        ██          ██       Shell: bash 5.2.15', 'output');
        this.terminalWrite('          ██████████         Uptime: ${Math.floor(this.systemMetrics.uptime/86400)} days', 'output');
        this.terminalWrite('                              CPU: Intel Xeon E5-2683 v4', 'output');
        this.terminalWrite('                              RAM: ${this.systemMetrics.ram.used}GB / ${this.systemMetrics.ram.total}GB', 'output');
        this.terminalWrite('', 'output');
      },
      theme: () => {
        if (rest[0]) this.terminalSetTheme(rest[0]);
        else this.terminalWrite('Usage: theme <name> (hacker, light, ocean, dracula, default)', 'info');
      },
      sudo: () => {
        if (rest.length === 0) { this.terminalWrite('sudo: missing operand', 'error'); return; }
        this.terminalWrite('⚠️  Running command with elevated privileges...', 'warning');
        setTimeout(() => {
          this.terminalState.user = 'root';
          this.updatePrompt();
          const sudoCmd = rest.join(' ');
          this.terminalWrite(`✅ Command executed as root: ${sudoCmd}`, 'success');
          setTimeout(() => {
            this.terminalState.user = 'nexus';
            this.updatePrompt();
          }, 2000);
        }, 500);
      },
      reboot: () => {
        this.terminalWrite('Initiating server reboot...', 'warning');
        let dots = 0;
        const interval = setInterval(() => {
          dots++;
          this.terminalWrite('.'.repeat(dots), 'output');
          if (dots >= 5) {
            clearInterval(interval);
            this.terminalWrite('✅ Server reboot complete. System ready.', 'success');
          }
        }, 300);
      },
      shutdown: () => {
        this.terminalWrite('⚠️  Shutting down server...', 'warning');
        let dots = 0;
        const interval = setInterval(() => {
          dots++;
          this.terminalWrite('.'.repeat(dots), 'output');
          if (dots >= 5) {
            clearInterval(interval);
            this.terminalWrite('✅ Server shutdown complete.', 'success');
            this.terminalWrite('Type "reboot" to restart the server.', 'info');
          }
        }, 300);
      },
      exit: () => this.terminalWrite('Session disconnected. Type any command to reconnect.', 'info'),
      man: () => this.terminalWrite('Manual pages not available. Use "help" for commands.', 'info'),
      history: () => {
        this.terminalState.history.forEach((c, i) => this.terminalWrite(`  ${i + 1}  ${c}`, 'output'));
      },
      grep: () => {
        if (rest.length < 2) { this.terminalWrite('Usage: grep <pattern> <file>', 'error'); return; }
        this.terminalWrite(`Searching for "${rest[0]}" in ${rest[1]}...`, 'info');
        this.terminalWrite('No matches found.', 'output');
      },
      find: () => {
        if (rest.length < 1) { this.terminalWrite('Usage: find <name>', 'error'); return; }
        this.terminalWrite(`Searching for "${rest[0]}"...`, 'info');
        const found = [];
        for (const path of Object.keys(this.terminalFS)) {
          const name = path.split('/').pop();
          if (name && name.includes(rest[0])) found.push(path);
        }
        if (found.length) found.forEach(f => this.terminalWrite(f, 'success'));
        else this.terminalWrite('No matches found.', 'output');
      },
      chmod: () => this.terminalWrite('Permissions updated.', 'success'),
      cp: () => this.terminalWrite('File copied successfully.', 'success'),
      mv: () => this.terminalWrite('File moved successfully.', 'success'),
      top: () => {
        this.terminalWrite('Process monitor (simulated):', 'highlight');
        const procs = [
          '  PID USER      PR  NI  VIRT   RES   SHR S  %CPU  %MEM  TIME+   COMMAND',
          '    1 root      20   0 1024M 120M 8192  S   0.1   0.3   0:01.2 systemd',
          '  342 root      20   0  512M  64M 12288 S   0.5   1.2   2:34.1 nginx',
          '  890 nexus     20   0  256M  48M  4096 S   1.2   2.1  15:42.3 php-fpm',
          ' 1234 nexus     20   0  128M  32M  2048 S   0.3   0.8   1:12.5 python3'
        ];
        procs.forEach(p => this.terminalWrite(p, 'output'));
        this.terminalWrite('Press q to quit (simulated)', 'info');
      },
      '?': () => commands.help()
    };

    if (commands[command]) commands[command]();
    else if (command) this.terminalWrite(`Command not found: ${command}. Type "help" for available commands.`, 'error');

    this.terminalScrollBottom();
  }

  terminalHistoryAdd(cmd) {
    this.terminalState.history.push(cmd);
    this.terminalState.historyIndex = this.terminalState.history.length;
  }

  terminalClear() {
    const body = document.getElementById('terminalBody');
    if (!body) return;
    const inputLine = body.querySelector('.terminal-input-line');
    body.innerHTML = '';
    if (inputLine) body.appendChild(inputLine);
  }

  terminalScrollBottom() {
    const body = document.getElementById('terminalBody');
    if (body) body.scrollTop = body.scrollHeight;
  }

  updatePrompt() {
    const promptEl = document.getElementById('terminalPrompt');
    if (promptEl) {
      promptEl.textContent = `[${this.terminalState.user}@${this.terminalState.hostname} ${this.terminalState.cwd}]$`;
    }
  }

  terminalSetTheme(theme) {
    const themes = ['default', 'hacker', 'light', 'ocean', 'dracula'];
    const container = document.getElementById('termContainer');
    themes.forEach(t => container.classList.remove(`terminal-theme-${t}`));
    if (theme !== 'default') {
      container.classList.add(`terminal-theme-${theme}`);
    }
    this.terminalWrite(`Theme set to: ${theme}`, 'success');
  }

  /* =========================================================== */
  /* === FILE MANAGER ========================================== */
  /* =========================================================== */
  initFileManager() {
    this.fmCurrentPath = '/var/www/html';
    this.fmSelectedItems = [];
    this.fmViewMode = 'grid'; // grid or list

    const fmBody = document.getElementById('fmBody');
    if (!fmBody) return;

    this.renderFileManager();

    // View toggle
    document.querySelectorAll('[data-fm-view]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.fmViewMode = btn.dataset.fmView;
        document.querySelectorAll('[data-fm-view]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderFileManager();
      });
    });

    // New folder
    document.querySelectorAll('[data-fm-new-folder]').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = prompt('Enter folder name:');
        if (name) {
          this.showToast('success', 'Folder Created', `Created: ${name}`);
          this.renderFileManager();
        }
      });
    });

    // Upload button
    document.querySelectorAll('[data-fm-upload]').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.addEventListener('change', (e) => {
          Array.from(e.target.files).forEach((f, i) => {
            setTimeout(() => this.simulateUpload(f.name, f.size), i * 500);
          });
        });
        input.click();
      });
    });

    // Context menu
    document.addEventListener('contextmenu', (e) => {
      const item = e.target.closest('.fm-grid-item, .fm-list tr');
      if (item && (e.target.closest('#fmBody') || e.target.closest('.fm-grid') || e.target.closest('.fm-list'))) {
        e.preventDefault();
        this.showContextMenu(e.clientX, e.clientY, item.dataset.path || item.querySelector('.fm-grid-name')?.textContent);
      } else {
        document.querySelectorAll('.fm-context-menu').forEach(m => m.classList.remove('show'));
      }
    });

    document.addEventListener('click', () => {
      document.querySelectorAll('.fm-context-menu').forEach(m => m.classList.remove('show'));
    });

    // Drag & drop
    const fileManager = document.querySelector('.file-manager');
    if (fileManager) {
      fileManager.addEventListener('dragover', (e) => {
        e.preventDefault();
        document.querySelector('.fm-drop-zone')?.classList.add('active');
      });
      fileManager.addEventListener('dragleave', () => {
        document.querySelector('.fm-drop-zone')?.classList.remove('active');
      });
      fileManager.addEventListener('drop', (e) => {
        e.preventDefault();
        document.querySelector('.fm-drop-zone')?.classList.remove('active');
        Array.from(e.dataTransfer.files).forEach((f, i) => {
          setTimeout(() => this.simulateUpload(f.name, f.size), i * 500);
        });
      });
    }

    // Breadcrumb navigation
    document.addEventListener('click', (e) => {
      const bc = e.target.closest('.fm-breadcrumb-item');
      if (bc && bc.dataset.path) {
        this.fmNavigate(bc.dataset.path);
      }
    });
  }

  getDirContents(path) {
    const parts = path.split('/').filter(Boolean);
    let current = this.mockFileSystem.root.children;
    for (const part of parts) {
      if (current[part]?.type === 'folder') {
        current = current[part].children;
      } else {
        return {};
      }
    }
    // Return items sorted: folders first, then files
    const entries = Object.entries(current);
    const folders = entries.filter(([k, v]) => v.type === 'folder');
    const files = entries.filter(([k, v]) => v.type !== 'folder');
    return Object.fromEntries([...folders, ...files]);
  }

  getFileIcon(type, name) {
    if (type === 'folder') return 'folder';
    const ext = name?.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico'].includes(ext)) return 'image';
    if (['js', 'ts', 'py', 'rb', 'go', 'rs', 'java', 'c', 'cpp', 'h'].includes(ext)) return 'code';
    if (['html', 'css', 'json', 'xml', 'yaml', 'yml', 'toml', 'md', 'txt'].includes(ext)) return 'code';
    if (['zip', 'tar', 'gz', 'bz2', '7z', 'rar'].includes(ext)) return 'archive';
    if (['pdf'].includes(ext)) return 'pdf';
    return 'file';
  }

  formatFileSize(size) {
    if (!size) return '—';
    const match = size.match(/^([0-9.]+)\s*(KB|MB|GB|B)$/i);
    if (match) {
      const val = parseFloat(match[1]);
      const unit = match[2].toUpperCase();
      if (unit === 'KB') return val + ' KB';
      if (unit === 'MB') return val.toFixed(1) + ' MB';
      if (unit === 'GB') return val.toFixed(2) + ' GB';
      return val + ' B';
    }
    return size;
  }

  fmNavigate(path) {
    this.fmCurrentPath = path;
    this.fmSelectedItems = [];
    this.renderFileManager();
  }

  renderFileManager() {
    if (!document.getElementById('fmBody')) return;
    const contents = this.getDirContents(this.fmCurrentPath);
    this.renderBreadcrumb();
    if (this.fmViewMode === 'grid') this.renderFmGrid(contents);
    else this.renderFmList(contents);
  }

  renderBreadcrumb() {
    const container = document.querySelector('.file-manager-breadcrumb');
    if (!container) return;
    const parts = this.fmCurrentPath.split('/').filter(Boolean);
    let html = `<span class="fm-breadcrumb-item" data-path="/">root</span>`;
    let cumPath = '';
    for (const part of parts) {
      cumPath += '/' + part;
      html += `<span class="fm-breadcrumb-sep">/</span><span class="fm-breadcrumb-item" data-path="${cumPath}">${part}</span>`;
    }
    container.innerHTML = html;
  }

  renderFmGrid(contents) {
    const grid = document.getElementById('fmGrid');
    if (!grid) return;
    const entries = Object.entries(contents);
    if (entries.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-folder-open"></i><h4>Empty Directory</h4><p>This folder has no files yet.</p></div>`;
      return;
    }
    const html = entries.map(([name, data]) => {
      const iconType = this.getFileIcon(data.type, name);
      const isSelected = this.fmSelectedItems.includes(name);
      return `<div class="fm-grid-item ${isSelected ? 'selected' : ''}" data-path="${name}" data-type="${data.type}">
        <div class="fm-grid-icon ${iconType}"><i class="fas fa-${data.type === 'folder' ? 'folder' : iconType === 'image' ? 'file-image' : iconType === 'code' ? 'file-code' : iconType === 'archive' ? 'file-archive' : iconType === 'pdf' ? 'file-pdf' : 'file'}"></i></div>
        <span class="fm-grid-name">${name}</span>
        <span class="fm-grid-size">${data.size || (data.type === 'folder' ? 'Folder' : '')}</span>
      </div>`;
    }).join('');
    grid.innerHTML = html;

    // Click handlers
    grid.querySelectorAll('.fm-grid-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const name = item.dataset.path;
        const type = item.dataset.type;
        if (type === 'folder') {
          const newPath = this.fmCurrentPath === '/' ? '/' + name : this.fmCurrentPath + '/' + name;
          this.fmNavigate(newPath);
        } else {
          // Toggle selection
          const idx = this.fmSelectedItems.indexOf(name);
          if (idx >= 0) this.fmSelectedItems.splice(idx, 1);
          else this.fmSelectedItems.push(name);
          item.classList.toggle('selected');
        }
      });
      item.addEventListener('dblclick', (e) => {
        const name = item.dataset.path;
        const type = item.dataset.type;
        if (type !== 'folder') {
          this.previewFile(name);
        }
      });
    });
  }

  renderFmList(contents) {
    const list = document.getElementById('fmList');
    if (!list) return;
    const entries = Object.entries(contents);
    if (entries.length === 0) {
      list.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:2rem;color:var(--text-muted)"><i class="fas fa-folder-open" style="font-size:2rem;display:block;margin-bottom:0.5rem"></i>Empty Directory</td></tr>`;
      return;
    }
    const html = entries.map(([name, data]) => {
      const iconType = this.getFileIcon(data.type, name);
      const iconName = data.type === 'folder' ? 'folder' : iconType === 'image' ? 'file-image' : iconType === 'code' ? 'file-code' : iconType === 'archive' ? 'file-archive' : iconType === 'pdf' ? 'file-pdf' : 'file';
      return `<tr data-path="${name}" data-type="${data.type}">
        <td><div class="fm-name-cell"><i class="fas fa-${iconName}" style="color:${data.type === 'folder' ? '#3b82f6' : '#6366f1'}"></i>${name}</div></td>
        <td>${data.type === 'folder' ? 'Folder' : 'File'}</td>
        <td>${data.size || '—'}</td>
        <td>${data.type === 'folder' ? '—' : 'Jun 14, 2026'}</td>
      </tr>`;
    }).join('');
    list.innerHTML = html;

    list.querySelectorAll('tr').forEach(row => {
      row.addEventListener('click', () => {
        const name = row.dataset.path;
        const type = row.dataset.type;
        if (type === 'folder') {
          const newPath = this.fmCurrentPath === '/' ? '/' + name : this.fmCurrentPath + '/' + name;
          this.fmNavigate(newPath);
        } else {
          row.classList.toggle('selected');
          this.previewFile(name);
        }
      });
    });
  }

  previewFile(name) {
    const ext = name.split('.').pop()?.toLowerCase();
    const previewable = ['txt', 'html', 'css', 'js', 'json', 'md', 'xml', 'yml', 'yaml', 'py', 'sh', 'conf', 'ini'];
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];

    if (imageExts.includes(ext)) {
      this.showToast('info', 'Preview', `Preview not available for ${name} in this environment.`, 2000);
    } else if (previewable.includes(ext)) {
      // Find the file in our terminal files
      const filePath = this.fmCurrentPath === '/' ? '/' + name : this.fmCurrentPath + '/' + name;
      const content = this.terminalFiles[filePath];
      if (content) {
        this.openModal(`
          <div class="dash-modal-header">
            <h3><i class="fas fa-file-code"></i> ${name}</h3>
            <button class="dash-modal-close"><i class="fas fa-times"></i></button>
          </div>
          <div class="dash-modal-body">
            <pre style="background:rgba(0,0,0,0.2);padding:1rem;border-radius:8px;font-size:0.8rem;max-height:400px;overflow-y:auto;font-family:'JetBrains Mono',monospace;color:var(--text-primary)">${this.escapeHtml(content)}</pre>
          </div>
          <div class="dash-modal-footer">
            <button class="btn btn-outline" onclick="dashboardApp.closeModal()">Close</button>
            <button class="btn btn-primary" onclick="dashboardApp.showToast('success','Download Started','${name}');dashboardApp.closeModal()">Download</button>
          </div>
        `);
      } else {
        this.showToast('info', 'Preview', `Content not available for ${name}`, 2000);
      }
    } else {
      this.showToast('info', 'File', `Selected: ${name}`, 2000);
    }
  }

  simulateUpload(name, size) {
    const progress = document.querySelector('.fm-upload-progress');
    if (progress) {
      progress.classList.add('show');
      const item = document.createElement('div');
      item.className = 'fm-upload-item';
      const sizeStr = size ? (size / 1024).toFixed(1) + ' KB' : 'Unknown';
      item.innerHTML = `
        <div class="fm-upload-name">
          <span>${name}</span>
          <span>${sizeStr}</span>
        </div>
        <div class="fm-upload-bar">
          <div class="fm-upload-fill" style="width:0%"></div>
        </div>
      `;
      progress.appendChild(item);
      let width = 0;
      const interval = setInterval(() => {
        width += Math.random() * 15 + 5;
        if (width >= 100) {
          width = 100;
          clearInterval(interval);
          setTimeout(() => {
            item.querySelector('.fm-upload-fill').style.width = '100%';
            setTimeout(() => {
              item.style.opacity = '0';
              setTimeout(() => item.remove(), 300);
              if (progress.querySelectorAll('.fm-upload-item').length <= 1) {
                setTimeout(() => progress.classList.remove('show'), 500);
              }
            }, 500);
          }, 200);
        }
        item.querySelector('.fm-upload-fill').style.width = width + '%';
      }, 100);
    }
    this.showToast('success', 'Upload Complete', `${name} uploaded successfully.`);
  }

  showContextMenu(x, y, name) {
    const menu = document.querySelector('.fm-context-menu');
    if (!menu) return;
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    menu.classList.add('show');
    // Keep in viewport
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) menu.style.left = (window.innerWidth - rect.width - 10) + 'px';
    if (rect.bottom > window.innerHeight) menu.style.top = (window.innerHeight - rect.height - 10) + 'px';
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /* =========================================================== */
  /* === MONITORING ============================================ */
  /* =========================================================== */
  initMonitoring() {
    this.monitoringInterval = null;
    // Populate initial values
    this.updateMonitoringUI();
  }

  startMonitoringUpdates() {
    if (this.monitoringInterval) clearInterval(this.monitoringInterval);
    this.monitoringInterval = setInterval(() => {
      // Simulate slight fluctuations
      this.systemMetrics.cpu.usage = Math.max(5, Math.min(95, this.systemMetrics.cpu.usage + (Math.random() - 0.5) * 8));
      this.systemMetrics.ram.used = Math.max(0.5, Math.min(this.systemMetrics.ram.total, this.systemMetrics.ram.used + (Math.random() - 0.5) * 0.5));
      this.systemMetrics.ram.percent = Math.round((this.systemMetrics.ram.used / this.systemMetrics.ram.total) * 100);
      this.systemMetrics.disk.used = Math.max(10, Math.min(this.systemMetrics.disk.total - 5, this.systemMetrics.disk.used + (Math.random() - 0.5) * 0.3));
      this.systemMetrics.disk.percent = Math.round((this.systemMetrics.disk.used / this.systemMetrics.disk.total) * 100);
      this.systemMetrics.network.rx = Math.max(0.1, this.systemMetrics.network.rx + (Math.random() - 0.5) * 0.2);
      this.systemMetrics.network.tx = Math.max(0.1, this.systemMetrics.network.tx + (Math.random() - 0.5) * 0.2);
      this.systemMetrics.uptime += 5;
      this.updateMonitoringUI();
    }, 2000);
  }

  updateMonitoringUI() {
    const m = this.systemMetrics;
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    const setBar = (id, pct) => {
      const el = document.getElementById(id);
      if (el) el.style.width = pct + '%';
    };

    setVal('monCpu', m.cpu.usage.toFixed(1) + '%');
    setBar('monCpuBar', m.cpu.usage);
    setVal('monCpuCore', `4 Cores @ 2.4 GHz`);
    setVal('monCpuModel', m.cpu.model);

    setVal('monRam', `${m.ram.used.toFixed(1)} GB / ${m.ram.total} GB`);
    setBar('monRamBar', m.ram.percent);
    setVal('monRamPercent', `${m.ram.percent}% used`);

    setVal('monDisk', `${m.disk.used} GB / ${m.disk.total} GB`);
    setBar('monDiskBar', m.disk.percent);
    setVal('monDiskPercent', `${m.disk.percent}% used`);

    setVal('monNet', `${m.network.rx.toFixed(1)} MB/s`);
    setVal('monNetTx', `${m.network.tx.toFixed(1)} MB/s`);
    setBar('monNetBar', Math.min(100, (m.network.rx / 10) * 100));

    const uptime = m.uptime;
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const mins = Math.floor((uptime % 3600) / 60);
    setVal('monUptime', `${days}d ${hours}h ${mins}m`);

    const processes = Math.floor(120 + Math.random() * 30);
    setVal('monProcesses', processes);
  }

  /* =========================================================== */
  /* === DATABASE MANAGER ====================================== */
  /* =========================================================== */
  initDatabaseManager() {
    if (!document.getElementById('dbList')) return;
    this.renderDatabases();

    // Create database
    document.querySelectorAll('[data-db-create]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.openModal(`
          <div class="dash-modal-header">
            <h3><i class="fas fa-database" style="color:var(--primary)"></i> Create Database</h3>
            <button class="dash-modal-close"><i class="fas fa-times"></i></button>
          </div>
          <div class="dash-modal-body">
            <div class="form-group">
              <label class="form-label">Database Name</label>
              <input type="text" class="form-control" id="newDbName" placeholder="e.g., my_app_db" style="margin-bottom:0.75rem">
            </div>
            <div class="form-group">
              <label class="form-label">Character Set</label>
              <select class="form-control" style="margin-bottom:0.75rem">
                <option>utf8mb4</option><option>utf8</option><option>latin1</option>
              </select>
            </div>
            <div class="form-check">
              <input type="checkbox" id="newDbUser" checked>
              <label for="newDbUser">Create user with same name</label>
            </div>
          </div>
          <div class="dash-modal-footer">
            <button class="btn btn-outline" onclick="dashboardApp.closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="dashboardApp.createDatabase();dashboardApp.closeModal()">Create</button>
          </div>
        `);
      });
    });
  }

  renderDatabases() {
    const list = document.getElementById('dbList');
    if (!list) return;
    list.innerHTML = this.mockDatabases.map(db => `
      <div class="db-item">
        <div class="db-item-left">
          <div class="db-item-icon"><i class="fas fa-database"></i></div>
          <div>
            <div class="db-item-name">${db.name}</div>
            <div class="db-item-size">${db.size} · ${db.tables} tables · ${db.users} users</div>
          </div>
        </div>
        <div class="db-item-actions">
          <button class="db-action-btn" onclick="dashboardApp.showToast('info','Export','Exporting ${db.name}...')" title="Export"><i class="fas fa-download"></i></button>
          <button class="db-action-btn" onclick="dashboardApp.showToast('info','Import','Import wizard for ${db.name}')" title="Import"><i class="fas fa-upload"></i></button>
          <button class="db-action-btn danger" onclick="dashboardApp.showToast('error','Delete','Confirm deletion of ${db.name}')" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `).join('');
  }

  createDatabase() {
    const name = document.getElementById('newDbName')?.value || 'new_database';
    this.mockDatabases.push({ name, size: '0.0 MB', tables: 0, users: 1 });
    this.renderDatabases();
    this.showToast('success', 'Database Created', `${name} has been created successfully.`);
  }

  /* =========================================================== */
  /* === BACKUP MANAGER ======================================== */
  /* =========================================================== */
  initBackupManager() {
    if (!document.getElementById('backupList')) return;
    this.renderBackups();

    document.querySelectorAll('[data-backup-now]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.showToast('info', 'Backup', 'Starting manual backup...');
        const backup = { name: 'Manual Backup', date: new Date().toLocaleString(), size: `${Math.floor(Math.random() * 200 + 50)} MB`, type: 'manual' };
        this.mockBackups.unshift(backup);
        this.renderBackups();
        setTimeout(() => this.showToast('success', 'Backup Complete', 'Manual backup finished successfully.'), 3000);
      });
    });

    document.querySelectorAll('[data-backup-schedule]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.openModal(`
          <div class="dash-modal-header">
            <h3><i class="fas fa-clock" style="color:var(--primary)"></i> Backup Schedule</h3>
            <button class="dash-modal-close"><i class="fas fa-times"></i></button>
          </div>
          <div class="dash-modal-body">
            <div class="form-group">
              <label class="form-label">Frequency</label>
              <select class="form-control" style="margin-bottom:0.75rem">
                <option>Daily</option><option>Weekly</option><option>Monthly</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Time</label>
              <input type="time" class="form-control" value="03:00" style="margin-bottom:0.75rem">
            </div>
            <div class="form-group">
              <label class="form-label">Retention</label>
              <select class="form-control">
                <option>Keep last 7 backups</option>
                <option>Keep last 14 backups</option>
                <option>Keep last 30 backups</option>
              </select>
            </div>
          </div>
          <div class="dash-modal-footer">
            <button class="btn btn-outline" onclick="dashboardApp.closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="dashboardApp.showToast('success','Schedule Updated','Backup schedule saved.');dashboardApp.closeModal()">Save</button>
          </div>
        `);
      });
    });
  }

  renderBackups() {
    const list = document.getElementById('backupList');
    if (!list) return;
    list.innerHTML = this.mockBackups.map(b => `
      <div class="backup-item">
        <div class="backup-item-left">
          <div class="backup-item-icon"><i class="fas fa-${b.type === 'manual' ? 'user' : 'clock'}"></i></div>
          <div>
            <div class="backup-item-name">${b.name}</div>
            <div class="backup-item-date">${b.date} · ${b.size}</div>
          </div>
        </div>
        <div class="db-item-actions">
          <button class="db-action-btn" onclick="dashboardApp.showToast('info','Restore','Restoring from ${b.name}...')" title="Restore"><i class="fas fa-undo"></i></button>
          <button class="db-action-btn" onclick="dashboardApp.showToast('success','Download','Downloading ${b.name}...')" title="Download"><i class="fas fa-download"></i></button>
          <button class="db-action-btn danger" onclick="dashboardApp.showToast('error','Delete','Backup deleted')" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `).join('');
  }

  /* =========================================================== */
  /* === SECURITY CENTER ======================================= */
  /* =========================================================== */
  initSecurityCenter() {
    if (!document.getElementById('loginHistory')) return;
    this.renderLoginHistory();
    this.renderApiKeys();

    document.querySelectorAll('[data-2fa-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const isEnabled = btn.querySelector('.toggle-switch input')?.checked;
        // Toggle
        this.showToast(isEnabled ? 'success' : 'warning', '2FA', isEnabled ? 'Two-factor authentication enabled.' : 'Two-factor authentication disabled.');
      });
    });

    document.querySelectorAll('[data-create-api]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.openModal(`
          <div class="dash-modal-header">
            <h3><i class="fas fa-key" style="color:var(--primary)"></i> Create API Key</h3>
            <button class="dash-modal-close"><i class="fas fa-times"></i></button>
          </div>
          <div class="dash-modal-body">
            <div class="form-group">
              <label class="form-label">Key Name</label>
              <input type="text" class="form-control" id="newApiName" placeholder="e.g., Production API" style="margin-bottom:0.75rem">
            </div>
            <div class="form-group">
              <label class="form-label">Permissions</label>
              <div style="display:flex;flex-direction:column;gap:0.35rem;margin-bottom:0.75rem">
                <label class="form-check"><input type="checkbox" checked> Read access</label>
                <label class="form-check"><input type="checkbox"> Write access</label>
                <label class="form-check"><input type="checkbox"> Admin access</label>
              </div>
            </div>
          </div>
          <div class="dash-modal-footer">
            <button class="btn btn-outline" onclick="dashboardApp.closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="dashboardApp.createApiKey();dashboardApp.closeModal()">Create Key</button>
          </div>
        `);
      });
    });
  }

  renderLoginHistory() {
    const container = document.getElementById('loginHistory');
    if (!container) return;
    container.innerHTML = this.mockLoginHistory.map(l => `
      <div class="login-entry">
        <div class="login-location">
          <i class="fas fa-${l.status === 'success' ? 'check-circle' : 'times-circle'}" style="color:${l.status === 'success' ? '#22c55e' : '#ef4444'}"></i>
          ${l.location}
        </div>
        <div class="login-info">${l.ip}</div>
        <div class="login-time">${l.time}</div>
        <span class="login-status ${l.status}">${l.status === 'success' ? 'Success' : 'Failed'}</span>
      </div>
    `).join('');
  }

  renderApiKeys() {
    const container = document.getElementById('apiKeysList');
    if (!container) return;
    container.innerHTML = this.mockApiKeys.map(k => `
      <div class="api-key-item">
        <div>
          <div class="api-key-name">${k.name}</div>
          <div class="api-key-value">${k.key}</div>
        </div>
        <div class="api-key-actions">
          <button class="db-action-btn" onclick="dashboardApp.showToast('info','Copied','API key copied to clipboard')" title="Copy"><i class="fas fa-copy"></i></button>
          <button class="db-action-btn danger" onclick="dashboardApp.showToast('error','Revoked','API key revoked')" title="Revoke"><i class="fas fa-times"></i></button>
        </div>
      </div>
    `).join('');
  }

  createApiKey() {
    const name = document.getElementById('newApiName')?.value || 'New API Key';
    const key = 'nxp_' + Math.random().toString(36).substr(2, 8) + '...' + Math.random().toString(36).substr(2, 4);
    this.mockApiKeys.push({ name, key, created: new Date().toLocaleDateString() });
    this.renderApiKeys();
    this.showToast('success', 'API Key Created', `${name} key has been created. Store it securely.`);
  }

  /* =========================================================== */
  /* === ANALYTICS ============================================= */
  /* =========================================================== */
  initAnalytics() {
    // Analytics charts are initialized in activateCharts
  }

  /* =========================================================== */
  /* === CHARTS ================================================ */
  /* =========================================================== */
  activateCharts() {
    if (typeof Chart === 'undefined') return;

    // Destroy existing charts
    if (this.charts) {
      Object.values(this.charts).forEach(c => { try { c.destroy(); } catch(e) {} });
    }
    this.charts = {};

    // Revenue chart (in overview)
    const revCtx = document.getElementById('chart-revenue')?.getContext('2d');
    if (revCtx) {
      this.charts.revenue = new Chart(revCtx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Revenue',
            data: [1200, 1900, 2400, 2800, 3200, 4100],
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99,102,241,0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#6366f1',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#6b7280', font: { size: 11 } } },
            y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#6b7280', font: { size: 11 }, callback: v => '$' + v } }
          }
        }
      });
    }

    // Orders chart (in overview)
    const ordCtx = document.getElementById('chart-orders')?.getContext('2d');
    if (ordCtx) {
      this.charts.orders = new Chart(ordCtx, {
        type: 'bar',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Orders',
            data: [12, 19, 15, 22, 28, 18, 14],
            backgroundColor: 'rgba(99,102,241,0.6)',
            borderColor: '#6366f1',
            borderWidth: 1,
            borderRadius: 4,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#6b7280', font: { size: 11 } } },
            y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#6b7280', font: { size: 11 } }, beginAtZero: true }
          }
        }
      });
    }

    // Monitoring mini charts
    this.initMiniChart('chart-cpu', Array.from({length:20}, () => Math.random() * 60 + 20), '#3b82f6');
    this.initMiniChart('chart-ram', Array.from({length:20}, () => Math.random() * 40 + 20), '#22c55e');
    this.initMiniChart('chart-disk', Array.from({length:20}, () => Math.random() * 30 + 20), '#f97316');
    this.initMiniChart('chart-net', Array.from({length:20}, () => Math.random() * 50 + 10), '#a78bfa');

    // Analytics section charts
    this.initAnalyticsCharts();
  }

  initMiniChart(canvasId, data, color) {
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) return;
    this.charts[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map((_, i) => i),
        datasets: [{
          data: data,
          borderColor: color,
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.4,
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
        elements: { point: { radius: 0 } }
      }
    });
  }

  initAnalyticsCharts() {
    // Analytics - Visitors
    const vCtx = document.getElementById('chart-visitors')?.getContext('2d');
    if (vCtx) {
      this.charts.visitors = new Chart(vCtx, {
        type: 'line',
        data: {
          labels: ['Jan','Feb','Mar','Apr','May','Jun'],
          datasets: [{
            label: 'Visitors',
            data: [4500, 5200, 6100, 7800, 9100, 12500],
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99,102,241,0.08)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#6366f1',
            pointRadius: 3,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#6b7280', font: { size: 10 } } },
            y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#6b7280', font: { size: 10 } } }
          }
        }
      });
    }

    // Analytics - Bandwidth
    const bCtx = document.getElementById('chart-bandwidth')?.getContext('2d');
    if (bCtx) {
      this.charts.bandwidth = new Chart(bCtx, {
        type: 'bar',
        data: {
          labels: ['Jan','Feb','Mar','Apr','May','Jun'],
          datasets: [{
            label: 'Bandwidth (TB)',
            data: [2.4, 3.1, 3.8, 4.2, 5.1, 6.8],
            backgroundColor: 'rgba(99,102,241,0.5)',
            borderColor: '#6366f1',
            borderWidth: 1,
            borderRadius: 4,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#6b7280', font: { size: 10 } } },
            y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#6b7280', font: { size: 10 } } }
          }
        }
      });
    }

    // Analytics - Resources
    const rCtx = document.getElementById('chart-resources')?.getContext('2d');
    if (rCtx) {
      this.charts.resources = new Chart(rCtx, {
        type: 'doughnut',
        data: {
          labels: ['CPU', 'RAM', 'Disk', 'Bandwidth'],
          datasets: [{
            data: [34, 40, 38, 22],
            backgroundColor: ['#3b82f6', '#22c55e', '#f97316', '#a78bfa'],
            borderWidth: 0,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#9ca3af', padding: 10, font: { size: 11 } }
            }
          }
        }
      });
    }

    // Analytics - Revenue (detailed)
    const rvCtx = document.getElementById('chart-revenue-detailed')?.getContext('2d');
    if (rvCtx) {
      this.charts.revenueDetailed = new Chart(rvCtx, {
        type: 'line',
        data: {
          labels: ['Jan','Feb','Mar','Apr','May','Jun'],
          datasets: [{
            label: 'Revenue',
            data: [12000, 19000, 24000, 28000, 34000, 42000],
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34,197,94,0.08)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#22c55e',
            pointRadius: 3,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#6b7280', font: { size: 10 } } },
            y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#6b7280', font: { size: 10 }, callback: v => '$' + v } }
          }
        }
      });
    }
  }

  /* =========================================================== */
  /* === NOTIFICATION CENTER =================================== */
  /* =========================================================== */
  initNotificationCenter() {
    const body = document.querySelector('.notif-panel-body');
    if (!body) return;
    this.renderNotifications();

    // Mark all read
    document.querySelectorAll('[data-notif-mark-all]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.mockNotifications.forEach(n => n.unread = false);
        this.renderNotifications();
        document.querySelectorAll('.notif-dot').forEach(d => d.remove());
        const badge = document.querySelector('[data-toggle-notif] .notif-dot');
        if (badge) badge.style.display = 'none';
        this.showToast('info', 'Notifications', 'All notifications marked as read.');
      });
    });

    // Simulate new notification every 30 seconds
    setInterval(() => {
      const types = ['system', 'billing', 'security', 'support', 'update'];
      const titles = ['System Update', 'Invoice Reminder', 'Security Alert', 'New Ticket Response', 'Feature Update'];
      const texts = [
        'Server monitoring check completed.',
        'Your invoice is due in 3 days.',
        'Failed login attempt detected.',
        'Support agent responded to your ticket.',
        'New backup feature now available.'
      ];
      const idx = Math.floor(Math.random() * types.length);
      this.addNotification(types[idx], titles[idx], texts[idx], 'Just now');
      this.renderNotifications();
    }, 30000);
  }

  renderNotifications() {
    const body = document.querySelector('.notif-panel-body');
    if (!body) return;
    body.innerHTML = this.mockNotifications.map(n => `
      <div class="notif-item ${n.unread ? 'unread' : ''}" onclick="dashboardApp.markNotifRead(this)">
        <div class="notif-icon ${n.type}"><i class="fas ${n.type === 'system' ? 'fa-server' : n.type === 'billing' ? 'fa-credit-card' : n.type === 'security' ? 'fa-shield-alt' : n.type === 'support' ? 'fa-headset' : 'fa-code-branch'}"></i></div>
        <div class="notif-content">
          <div class="notif-title">${n.title}</div>
          <div class="notif-text">${n.text}</div>
          <div class="notif-time">${n.time}</div>
        </div>
        ${n.unread ? '<div class="notif-dot"></div>' : ''}
      </div>
    `).join('');
  }

  markNotifRead(el) {
    el.classList.remove('unread');
    const dot = el.querySelector('.notif-dot');
    if (dot) dot.remove();
  }
}

/* ===== TOASTS UTILITY (standalone) ===== */
const NexusToast = {
  show(type, title, text, duration = 4000) {
    if (window.dashboardApp) {
      window.dashboardApp.showToast(type, title, text, duration);
    }
  },
  success(title, text) { this.show('success', title, text); },
  error(title, text) { this.show('error', title, text); },
  info(title, text) { this.show('info', title, text); },
  warning(title, text) { this.show('warning', title, text); }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.dashboardApp = new DashboardApp();
  window.NexusToast = NexusToast;
});
