# 🚀 NEXUS VIP HOST - Production Deployment Guide

## 📋 Overview

This document provides complete instructions for deploying and maintaining the NEXUS VIP HOST premium hosting platform.

---

## 🌐 Live URLs

| Environment | URL |
|------------|-----|
| **Production** | `https://nexus-vip-host-mv89afr29-rafetnoob731-coders-projects.vercel.app` |
| **GitHub** | `https://github.com/rafetnoob731-coder/nexus-vip-host` |

---

## 🔧 Installation Guide

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/rafetnoob731-coder/nexus-vip-host.git
cd nexus-vip-host

# 2. Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env
# Edit .env with your settings

# 5. Run the application
python app.py
```

The app will be available at `http://localhost:5000`.

### Docker Deployment

```bash
# Build and run
docker-compose up -d

# Or build manually
docker build -t nexus-vip-host .
docker run -p 5000:5000 nexus-vip-host
```

### Production (Nginx + Gunicorn)

```bash
# 1. Copy service file
sudo cp deploy/nexus-vip-host.service /etc/systemd/system/

# 2. Copy nginx config
sudo cp deploy/nginx.conf /etc/nginx/sites-available/nexus-vip-host
sudo ln -s /etc/nginx/sites-available/nexus-vip-host /etc/nginx/sites-enabled/

# 3. Start services
sudo systemctl enable nexus-vip-host
sudo systemctl start nexus-vip-host
sudo systemctl restart nginx
```

---

## 🔐 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `FLASK_ENV` | No | `development` | Application environment |
| `SECRET_KEY` | Yes | - | Flask secret key for sessions |
| `DATABASE_URL` | No | `sqlite:///nexus_host.db` | Database connection string |
| `SESSION_COOKIE_SECURE` | No | `False` | HTTPS-only cookies |
| `VERCEL` | No | - | Set to `1` for Vercel deployment |

---

## 👤 Admin Credentials

After first run, the following accounts are created:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@nexusviphost.com` | `Admin123!` |
| **Demo Client** | `demo@example.com` | `Demo123!` |

**⚠️ IMPORTANT:** Change these passwords immediately in production!

---

## 🗄️ Database

The application uses SQLAlchemy ORM with SQLite by default.

### Database Schema

- **users** - User accounts and profiles
- **hosting_plans** - Hosting service plans (18 seeded plans)
- **orders** - User orders and subscriptions
- **tickets** - Support tickets
- **ticket_responses** - Ticket conversation threads
- **payments** - Payment transactions
- **domains** - Domain registrations

### Switching to MySQL/PostgreSQL

Update the `DATABASE_URL` in your `.env` file:

```bash
# MySQL
DATABASE_URL=mysql://user:password@localhost/nexus_host

# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost/nexus_host

# SQLite (default)
DATABASE_URL=sqlite:///nexus_host.db
```

---

## 📊 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/v1/plans` | No | List all hosting plans |
| `GET` | `/api/v1/plans/:id` | No | Get plan details |
| `POST` | `/api/v1/orders` | Yes | Create order |
| `GET` | `/api/v1/orders` | Yes | List user orders |
| `POST` | `/api/v1/tickets` | Yes | Create ticket |
| `GET` | `/api/v1/tickets` | Yes | List user tickets |
| `GET` | `/api/v1/stats` | No | Public statistics |
| `GET` | `/api/v1/server-status` | No | Server status |
| `POST` | `/api/v1/domain/check` | No | Domain availability |

---

## 🎨 UI Features

- **3D Card Effects** - Mouse-tracking tilt on all cards
- **Scroll Animations** - Staggered reveal animations
- **Particle Systems** - Network connections, floating orbs
- **Dark/Light Theme** - Toggle with localStorage persistence
- **Glassmorphism** - Premium glass effects with depth
- **Liquid Buttons** - Ripple + shine hover effects
- **Dashboard Charts** - Revenue, orders, server monitoring
- **Activity Feed** - Real-time live updates

---

## 🔒 Security Checklist

- [ ] Change default admin password
- [ ] Set strong `SECRET_KEY` in production
- [ ] Enable HTTPS (already enabled on Vercel)
- [ ] Set `SESSION_COOKIE_SECURE=True` in production
- [ ] Use PostgreSQL/MySQL for production database
- [ ] Configure rate limiting for API endpoints
- [ ] Set up monitoring and alerting

---

## 🛠 Maintenance Guide

### Daily
- Check server status page
- Monitor database size
- Review open support tickets

### Weekly
- Review error logs
- Update SSL certificates (if not auto-renewed)
- Backup database

### Monthly
- Update dependencies
- Review security patches
- Analyze performance metrics
- Clean up old sessions

### Backup

```bash
# Backup SQLite database
cp instance/nexus_host.db backups/nexus_host_$(date +%Y%m%d).db

# Backup using Flask
python -c "from app import create_app; app = create_app(); from models import db; db.backup()"
```

---

## 🐛 Troubleshooting

### Common Issues

**Problem:** 500 Internal Server Error
**Solution:** Check logs, ensure database is writable, verify environment variables

**Problem:** SQLite read-only error on Vercel
**Solution:** The app uses `/tmp/nexus_host.db` on Vercel. Data is ephemeral.

**Problem:** Static files not loading
**Solution:** Clear browser cache, check `url_for('static', ...)` paths

---

## 📞 Support

For deployment issues, contact:
- Email: support@nexusviphost.com
- GitHub Issues: https://github.com/rafetnoob731-coder/nexus-vip-host/issues
