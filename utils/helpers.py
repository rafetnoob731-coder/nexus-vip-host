"""
Helper functions for NEXUS VIP HOST
"""
import json
import re
from datetime import datetime, timedelta
from functools import wraps
from flask import flash, redirect, url_for, abort
from flask_login import current_user

def admin_required(f):
    """Decorator to require admin role"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            flash('Please log in to access this page.', 'warning')
            return redirect(url_for('auth.login'))
        if not current_user.is_admin():
            abort(403)
        return f(*args, **kwargs)
    return decorated_function

def staff_required(f):
    """Decorator to require staff role"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            flash('Please log in to access this page.', 'warning')
            return redirect(url_for('auth.login'))
        if not current_user.is_staff():
            abort(403)
        return f(*args, **kwargs)
    return decorated_function

def validate_email(email):
    """Basic email validation"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Password strength validation"""
    if len(password) < 8:
        return False, 'Password must be at least 8 characters long'
    if not re.search(r'[A-Z]', password):
        return False, 'Password must contain at least one uppercase letter'
    if not re.search(r'[a-z]', password):
        return False, 'Password must contain at least one lowercase letter'
    if not re.search(r'[0-9]', password):
        return False, 'Password must contain at least one number'
    return True, 'Password is strong'

def format_currency(amount):
    """Format currency amount"""
    return f'${amount:,.2f}'

def calculate_revenue(orders):
    """Calculate total revenue from orders"""
    return sum(order.total_amount for order in orders if order.payment_status == 'paid')

def get_status_color(status):
    """Return appropriate color class for status"""
    colors = {
        'active': 'success',
        'pending': 'warning',
        'suspended': 'danger',
        'cancelled': 'secondary',
        'open': 'info',
        'resolved': 'success',
        'closed': 'secondary',
        'paid': 'success',
        'unpaid': 'warning',
        'refunded': 'info',
        'failed': 'danger'
    }
    return colors.get(status.lower(), 'primary')

def generate_invoice_number():
    """Generate unique invoice number"""
    from models import db
    from datetime import datetime
    timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
    return f'INV-{timestamp}-{db.session.query(db.func.random()).scalar()}'

def paginate(query, page=1, per_page=10):
    """Simple pagination helper"""
    total = query.count()
    records = query.offset((page - 1) * per_page).limit(per_page).all()
    total_pages = (total + per_page - 1) // per_page
    return {
        'records': records,
        'total': total,
        'page': page,
        'per_page': per_page,
        'total_pages': total_pages,
        'has_prev': page > 1,
        'has_next': page < total_pages
    }

def get_uptime_percentage():
    """Return mock uptime percentage for demo"""
    return 99.99

def get_server_stats():
    """Return mock server stats for demo"""
    return {
        'total_servers': 1250,
        'online_servers': 1248,
        'offline_servers': 2,
        'average_load': '0.42',
        'total_bandwidth': '2.5 Tbps',
        'used_bandwidth': '1.8 Tbps'
    }

def seed_demo_data():
    """Seed the database with demo data for testing"""
    from app import db
    from models.user import User
    from models.plan import Plan
    from models.order import Order
    from models.ticket import Ticket, TicketResponse
    from models.payment import Payment
    from datetime import datetime, timedelta
    import json

    # Create admin user if not exists
    if not User.query.filter_by(username='admin').first():
        admin = User(
            username='admin',
            email='admin@nexusviphost.com',
            full_name='Admin User',
            role='admin',
            email_verified=True
        )
        admin.set_password('Admin123!')
        db.session.add(admin)

    # Create demo client
    if not User.query.filter_by(username='demo').first():
        demo = User(
            username='demo',
            email='demo@example.com',
            full_name='Demo Client',
            role='client',
            email_verified=True
        )
        demo.set_password('Demo123!')
        db.session.add(demo)

    # Seed hosting plans
    if Plan.query.count() == 0:
        plans_data = [
            # Shared Hosting
            Plan(name='Starter Shared', type='shared', description='Perfect for personal sites',
                 price_monthly=2.99, price_yearly=2.24, cpu='Shared', ram='1 GB',
                 storage='5 GB NVMe', bandwidth='50 GB', websites='1 Website',
                 features=json.dumps(['1 Website', '5 GB NVMe Storage', '50 GB Bandwidth', 'Free SSL', '1 Email Account']),
                 sort_order=1),
            Plan(name='Business Shared', type='shared', description='For small businesses',
                 price_monthly=5.99, price_yearly=4.49, cpu='Shared', ram='2 GB',
                 storage='50 GB NVMe', bandwidth='500 GB', websites='10 Websites',
                 features=json.dumps(['10 Websites', '50 GB NVMe Storage', '500 GB Bandwidth', 'Free SSL + CDN', '10 Email Accounts']),
                 is_popular=True, sort_order=2),
            Plan(name='Enterprise Shared', type='shared', description='For high-traffic sites',
                 price_monthly=11.99, price_yearly=8.99, cpu='Shared', ram='4 GB',
                 storage='150 GB NVMe', bandwidth='2 TB', websites='Unlimited',
                 features=json.dumps(['Unlimited Websites', '150 GB NVMe Storage', '2 TB Bandwidth', 'Free SSL + CDN + WAF', 'Unlimited Email']),
                 sort_order=3),
            # VPS Hosting
            Plan(name='VPS-S', type='vps', description='2 vCPU, 4 GB RAM',
                 price_monthly=14.99, price_yearly=11.24, cpu='2 vCPU', ram='4 GB',
                 storage='50 GB NVMe', bandwidth='1 TB', websites='Unlimited',
                 features=json.dumps(['2 vCPU Cores', '4 GB RAM', '50 GB NVMe', '1 TB Bandwidth', 'Full Root Access']),
                 sort_order=4),
            Plan(name='VPS-M', type='vps', description='4 vCPU, 8 GB RAM',
                 price_monthly=29.99, price_yearly=22.49, cpu='4 vCPU', ram='8 GB',
                 storage='100 GB NVMe', bandwidth='2 TB', websites='Unlimited',
                 features=json.dumps(['4 vCPU Cores', '8 GB RAM', '100 GB NVMe', '2 TB Bandwidth', 'Full Root Access']),
                 is_popular=True, sort_order=5),
            Plan(name='VPS-L', type='vps', description='8 vCPU, 16 GB RAM',
                 price_monthly=59.99, price_yearly=44.99, cpu='8 vCPU', ram='16 GB',
                 storage='200 GB NVMe', bandwidth='4 TB', websites='Unlimited',
                 features=json.dumps(['8 vCPU Cores', '16 GB RAM', '200 GB NVMe', '4 TB Bandwidth', 'Full Root Access']),
                 sort_order=6),
            # Cloud Hosting
            Plan(name='Cloud-S', type='cloud', description='2 vCPU, 4 GB RAM',
                 price_monthly=24.99, price_yearly=18.74, cpu='2 vCPU', ram='4 GB',
                 storage='100 GB NVMe', bandwidth='1 TB', websites='Unlimited',
                 features=json.dumps(['2 vCPU Cores', '4 GB RAM', '100 GB NVMe', 'Auto Scaling', 'Load Balancer']),
                 sort_order=7),
            Plan(name='Cloud-M', type='cloud', description='4 vCPU, 8 GB RAM',
                 price_monthly=49.99, price_yearly=37.49, cpu='4 vCPU', ram='8 GB',
                 storage='250 GB NVMe', bandwidth='2 TB', websites='Unlimited',
                 features=json.dumps(['4 vCPU Cores', '8 GB RAM', '250 GB NVMe', 'Auto Scaling', 'Load Balancer']),
                 is_popular=True, sort_order=8),
            Plan(name='Cloud-L', type='cloud', description='8 vCPU, 16 GB RAM',
                 price_monthly=99.99, price_yearly=74.99, cpu='8 vCPU', ram='16 GB',
                 storage='500 GB NVMe', bandwidth='5 TB', websites='Unlimited',
                 features=json.dumps(['8 vCPU Cores', '16 GB RAM', '500 GB NVMe', 'Auto Scaling', 'Priority Support']),
                 sort_order=9),
            # Dedicated Servers
            Plan(name='DS-E5', type='dedicated', description='Intel Xeon E5',
                 price_monthly=79.99, price_yearly=59.99, cpu='Intel Xeon E5-2620', ram='16 GB DDR4 ECC',
                 storage='2×480 GB SSD', bandwidth='10 TB', websites='Unlimited',
                 features=json.dumps(['Intel Xeon E5-2620', '16 GB DDR4 ECC', '2×480 GB SSD', '10 TB Bandwidth', 'Hardware RAID']),
                 sort_order=10),
            Plan(name='DS-Gold', type='dedicated', description='Intel Xeon Gold',
                 price_monthly=149.99, price_yearly=112.49, cpu='Intel Xeon Gold 5218', ram='64 GB DDR4 ECC',
                 storage='2×1 TB NVMe', bandwidth='20 TB', websites='Unlimited',
                 features=json.dumps(['Intel Xeon Gold 5218', '64 GB DDR4 ECC', '2×1 TB NVMe', '20 TB Bandwidth', 'IPMI Access']),
                 is_popular=True, sort_order=11),
            Plan(name='DS-Platinum', type='dedicated', description='AMD EPYC',
                 price_monthly=299.99, price_yearly=224.99, cpu='AMD EPYC 7502', ram='128 GB DDR4 ECC',
                 storage='4×2 TB NVMe', bandwidth='50 TB', websites='Unlimited',
                 features=json.dumps(['AMD EPYC 7502', '128 GB DDR4 ECC', '4×2 TB NVMe', '50 TB Bandwidth', 'DDoS Protection']),
                 sort_order=12),
            # Game Hosting
            Plan(name='Minecraft', type='game', description='Up to 20 players',
                 price_monthly=9.99, price_yearly=7.49, cpu='4 vCPU', ram='4 GB',
                 storage='20 GB NVMe', bandwidth='Unlimited', websites='N/A',
                 features=json.dumps(['4 GB RAM', '20 GB NVMe', 'DDoS Protection', 'Free MySQL', '24/7 Uptime']),
                 sort_order=13),
            Plan(name='Valheim', type='game', description='Up to 10 players',
                 price_monthly=14.99, price_yearly=11.24, cpu='4 vCPU', ram='6 GB',
                 storage='30 GB NVMe', bandwidth='Unlimited', websites='N/A',
                 features=json.dumps(['6 GB RAM', '30 GB NVMe', 'DDoS Protection', 'Auto Backup', 'Mod Support']),
                 is_popular=True, sort_order=14),
            Plan(name='Custom Game', type='game', description='Any game server',
                 price_monthly=24.99, price_yearly=18.74, cpu='8 vCPU', ram='8 GB',
                 storage='50 GB NVMe', bandwidth='Unlimited', websites='N/A',
                 features=json.dumps(['8 GB RAM', '50 GB NVMe', 'DDoS Protection', 'Full FTP Access', 'Priority Support']),
                 sort_order=15),
            # Reseller Hosting
            Plan(name='Reseller-S', type='reseller', description='Up to 20 clients',
                 price_monthly=19.99, price_yearly=14.99, cpu='Shared', ram='2 GB',
                 storage='50 GB NVMe', bandwidth='500 GB', websites='20 Clients',
                 features=json.dumps(['50 GB NVMe Storage', '500 GB Bandwidth', 'WHM Control Panel', 'Free SSL', 'White Label']),
                 sort_order=16),
            Plan(name='Reseller-M', type='reseller', description='Up to 50 clients',
                 price_monthly=39.99, price_yearly=29.99, cpu='Shared', ram='4 GB',
                 storage='150 GB NVMe', bandwidth='2 TB', websites='50 Clients',
                 features=json.dumps(['150 GB NVMe Storage', '2 TB Bandwidth', 'WHM + cPanel', 'Free SSL + CDN', 'White Label']),
                 is_popular=True, sort_order=17),
            Plan(name='Reseller-L', type='reseller', description='Unlimited clients',
                 price_monthly=69.99, price_yearly=52.49, cpu='Shared', ram='8 GB',
                 storage='500 GB NVMe', bandwidth='5 TB', websites='Unlimited',
                 features=json.dumps(['500 GB NVMe Storage', '5 TB Bandwidth', 'WHM + cPanel + Jet', 'Free SSL + CDN + WAF', 'White Label + API']),
                 sort_order=18),
        ]
        for plan in plans_data:
            db.session.add(plan)

    # Seed some demo orders
    if Order.query.count() == 0:
        demo_user = User.query.filter_by(username='demo').first()
        business_plan = Plan.query.filter_by(name='Business Shared').first()
        vps_plan = Plan.query.filter_by(name='VPS-M').first()

        if demo_user and business_plan:
            order1 = Order(
                user_id=demo_user.id,
                plan_id=business_plan.id,
                domain='mybusiness.com',
                billing_cycle='monthly',
                total_amount=5.99,
                status='active',
                payment_status='paid',
                next_due_date=datetime.utcnow() + timedelta(days=30),
                activated_at=datetime.utcnow() - timedelta(days=15)
            )
            db.session.add(order1)

        if demo_user and vps_plan:
            order2 = Order(
                user_id=demo_user.id,
                plan_id=vps_plan.id,
                billing_cycle='yearly',
                total_amount=269.88,
                status='active',
                payment_status='paid',
                next_due_date=datetime.utcnow() + timedelta(days=350),
                activated_at=datetime.utcnow() - timedelta(days=60)
            )
            db.session.add(order2)

    # Seed some demo tickets
    if Ticket.query.count() == 0:
        demo_user = User.query.filter_by(username='demo').first()
        if demo_user:
            ticket = Ticket(
                user_id=demo_user.id,
                subject='How to set up my domain?',
                message='I just purchased the Business Shared plan and I need help pointing my domain to your nameservers.',
                department='technical',
                priority='normal',
                status='open'
            )
            db.session.add(ticket)

    db.session.commit()
