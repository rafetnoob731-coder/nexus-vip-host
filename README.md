# 🚀 NEXUS VIP HOST - Premium Hosting Platform

> **Powering Your Digital Future**

A professional, production-ready hosting provider platform built with Flask, featuring a modern glassmorphism UI, full admin panel, client area, and REST API.

## ✨ Features

### 🌐 Public Website
- **Home Page** - Hero section, features, statistics, testimonials, pricing
- **Hosting Plans** - Shared, VPS, Cloud, Dedicated, Game, Reseller
- **Domain Registration** - Search, pricing, transfer
- **Knowledge Base** - Articles, FAQs, search
- **Support Center** - Live chat, tickets, Discord, Telegram
- **Server Status** - Real-time monitoring, uptime charts
- **About Us** - Company info, team, infrastructure

### 👤 Client Area
- User registration & authentication
- Dashboard with service management
- Profile management
- Support ticket system
- Order management

### 🔐 Admin Panel
- Dashboard with analytics & revenue charts
- User management (roles, status)
- Hosting plan CRUD
- Order management
- Ticket management & responses
- Payment tracking
- System settings

### 🎨 Design
- Premium dark theme with glassmorphism
- Neon blue, purple & cyan gradients
- Smooth animations & transitions
- Fully responsive (mobile-first)
- Dark/Light mode toggle
- Professional typography

### 🛡 Security
- Password hashing (bcrypt)
- CSRF protection
- SQL injection protection
- XSS protection
- Session management
- Role-based access control

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- pip

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/nexus-vip-host.git
cd nexus-vip-host

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Run the application
python app.py
```

The app will be available at `http://localhost:5000`

### Default Credentials
- **Admin:** admin@nexusviphost.com / Admin123!
- **Demo User:** demo@example.com / Demo123!

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t nexus-vip-host .
docker run -p 5000:5000 nexus-vip-host
```

## 🔧 Production Deployment

### Nginx + Gunicorn

1. Copy `deploy/nginx.conf` to `/etc/nginx/sites-available/`
2. Copy `deploy/nexus-vip-host.service` to `/etc/systemd/system/`
3. Update paths and secrets
4. Enable and start services:

```bash
sudo systemctl enable nexus-vip-host
sudo systemctl start nexus-vip-host
sudo systemctl enable nginx
sudo systemctl restart nginx
```

## 📁 Project Structure

```
nexus-vip-host/
├── app.py                  # Flask application entry point
├── config.py               # Configuration management
├── requirements.txt        # Python dependencies
├── Dockerfile              # Docker build file
├── docker-compose.yml      # Docker Compose configuration
├── .env.example            # Environment variables template
│
├── models/
│   ├── __init__.py         # Database & extensions init
│   ├── user.py             # User model
│   ├── plan.py             # Hosting plans model
│   ├── order.py            # Orders model
│   ├── ticket.py           # Support tickets model
│   ├── payment.py          # Payments model
│   └── domain.py           # Domain model
│
├── routes/
│   ├── __init__.py
│   ├── main.py             # Public routes
│   ├── auth.py             # Authentication routes
│   ├── admin.py            # Admin panel routes
│   └── api.py              # REST API endpoints
│
├── utils/
│   ├── __init__.py
│   └── helpers.py          # Utility functions & seed data
│
├── static/
│   ├── css/
│   │   └── style.css       # Main stylesheet
│   └── js/
│       ├── main.js         # Frontend JavaScript
│       └── admin.js        # Admin JavaScript
│
├── templates/
│   ├── base.html           # Base template
│   ├── index.html          # Home page
│   ├── login.html          # Login page
│   ├── register.html       # Registration page
│   ├── dashboard.html      # Client dashboard
│   ├── profile.html        # User profile
│   ├── plans.html          # Hosting plans
│   ├── domains.html        # Domain registration
│   ├── support.html        # Support center
│   ├── knowledge.html      # Knowledge base
│   ├── about.html          # About us
│   ├── status.html         # Server status
│   ├── tickets.html        # Support tickets list
│   ├── create_ticket.html  # Create ticket
│   ├── view_ticket.html    # View ticket details
│   ├── errors/
│   │   ├── 404.html        # Not found
│   │   ├── 403.html        # Forbidden
│   │   └── 500.html        # Server error
│   └── admin/
│       ├── base.html       # Admin base template
│       ├── dashboard.html  # Admin dashboard
│       ├── users.html      # User management
│       ├── user_detail.html# User detail
│       ├── plans.html      # Plan management
│       ├── create_plan.html# Create plan
│       ├── edit_plan.html  # Edit plan
│       ├── orders.html     # Order management
│       ├── tickets.html    # Ticket management
│       ├── ticket_detail.html# Ticket detail
│       ├── payments.html   # Payment management
│       └── settings.html   # System settings
│
└── deploy/
    ├── nginx.conf           # Nginx configuration
    └── nexus-vip-host.service  # Systemd service file
```

## 🛣 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/plans` | Get all hosting plans |
| GET | `/api/v1/plans/<id>` | Get specific plan |
| POST | `/api/v1/orders` | Create an order |
| GET | `/api/v1/orders` | Get user orders |
| POST | `/api/v1/tickets` | Create a ticket |
| GET | `/api/v1/tickets` | Get user tickets |
| GET | `/api/v1/stats` | Get public statistics |
| GET | `/api/v1/server-status` | Get server status |
| POST | `/api/v1/domain/check` | Check domain availability |

## 🔒 Security

- All passwords hashed with bcrypt
- CSRF protection on all forms
- SQL injection safe (SQLAlchemy ORM)
- Input validation on all endpoints
- Session-based authentication with Flask-Login
- Role-based access (client, staff, admin)

## 📊 Database Schema

- **users** - User accounts and profiles
- **hosting_plans** - Hosting service plans
- **orders** - User orders and subscriptions
- **tickets** - Support tickets
- **ticket_responses** - Ticket conversation
- **payments** - Payment transactions
- **domains** - Domain registrations

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Support

- Email: support@nexusviphost.com
- Discord: [Join our server](https://discord.gg/nexusvip)
- Telegram: [@nexusvip](https://t.me/nexusvip)

---

Built with ❤️ by the NEXUS VIP HOST Team
