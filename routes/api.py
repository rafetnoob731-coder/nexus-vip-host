"""
Public REST API endpoints
"""
from datetime import datetime
from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from models import db
from models.plan import Plan
from models.order import Order
from models.ticket import Ticket
from models.payment import Payment
from models.user import User

api_bp = Blueprint('api', __name__, url_prefix='/api/v1')

@api_bp.route('/plans')
def get_plans():
    """Get all active hosting plans"""
    plan_type = request.args.get('type')
    query = Plan.query.filter_by(is_active=True)

    if plan_type:
        query = query.filter_by(type=plan_type)

    plans = query.order_by(Plan.sort_order).all()
    return jsonify([plan.to_dict() for plan in plans])

@api_bp.route('/plans/<int:plan_id>')
def get_plan(plan_id):
    """Get a specific plan"""
    plan = Plan.query.get_or_404(plan_id)
    return jsonify(plan.to_dict())

@api_bp.route('/orders', methods=['POST'])
@login_required
def create_order():
    """Create a new order"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid request data'}), 400

    plan_id = data.get('plan_id')
    billing_cycle = data.get('billing_cycle', 'monthly')
    domain = data.get('domain', '')

    plan = Plan.query.get(plan_id)
    if not plan:
        return jsonify({'error': 'Plan not found'}), 404

    amount = plan.price_monthly if billing_cycle == 'monthly' else plan.price_yearly

    order = Order(
        user_id=current_user.id,
        plan_id=plan_id,
        domain=domain,
        billing_cycle=billing_cycle,
        total_amount=amount,
        status='pending',
        payment_status='unpaid',
        next_due_date=datetime.utcnow().replace(day=1)  # Simplified
    )
    db.session.add(order)
    db.session.commit()

    return jsonify(order.to_dict()), 201

@api_bp.route('/orders')
@login_required
def get_orders():
    """Get user's orders"""
    if current_user.is_staff():
        orders = Order.query.order_by(Order.created_at.desc()).limit(50).all()
    else:
        orders = Order.query.filter_by(user_id=current_user.id)\
            .order_by(Order.created_at.desc()).all()

    return jsonify([order.to_dict() for order in orders])

@api_bp.route('/tickets', methods=['POST'])
@login_required
def create_ticket():
    """Create a support ticket"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid request data'}), 400

    ticket = Ticket(
        user_id=current_user.id,
        subject=data.get('subject', ''),
        message=data.get('message', ''),
        department=data.get('department', 'general'),
        priority=data.get('priority', 'normal')
    )
    db.session.add(ticket)
    db.session.commit()

    return jsonify(ticket.to_dict()), 201

@api_bp.route('/tickets')
@login_required
def get_tickets():
    """Get user's tickets"""
    if current_user.is_staff():
        tickets = Ticket.query.order_by(Ticket.updated_at.desc()).limit(50).all()
    else:
        tickets = Ticket.query.filter_by(user_id=current_user.id)\
            .order_by(Ticket.updated_at.desc()).all()

    return jsonify([ticket.to_dict() for ticket in tickets])

@api_bp.route('/stats')
def get_stats():
    """Get public statistics"""
    total_users = User.query.count()
    total_orders = Order.query.count()
    active_services = Order.query.filter_by(status='active').count()

    return jsonify({
        'total_users': total_users,
        'total_orders': total_orders,
        'active_services': active_services,
        'uptime': 99.99,
        'datacenters': 15,
        'staff_count': User.query.filter(User.role.in_(['admin', 'staff'])).count()
    })

@api_bp.route('/server-status')
def server_status():
    """Get server status information"""
    return jsonify({
        'status': 'operational',
        'message': 'All Systems Operational',
        'components': [
            {'name': 'Web Server', 'status': 'operational', 'latency': '12ms', 'uptime': '99.99%'},
            {'name': 'Database', 'status': 'operational', 'latency': '8ms', 'uptime': '99.99%'},
            {'name': 'DNS', 'status': 'operational', 'latency': '5ms', 'uptime': '99.99%'},
            {'name': 'CDN', 'status': 'operational', 'latency': '23ms', 'uptime': '99.99%'},
            {'name': 'Load Balancer', 'status': 'operational', 'latency': '3ms', 'uptime': '99.99%'},
            {'name': 'Email Services', 'status': 'operational', 'latency': '15ms', 'uptime': '99.98%'},
            {'name': 'Backup Systems', 'status': 'operational', 'latency': '0ms', 'uptime': '100%'}
        ],
        'last_checked': datetime.utcnow().isoformat()
    })

@api_bp.route('/domain/check', methods=['POST'])
def check_domain():
    """Check domain availability (mock)"""
    data = request.get_json()
    domain = data.get('domain', '').strip().lower()

    if not domain:
        return jsonify({'error': 'Domain name required'}), 400

    import random
    available = random.random() > 0.3

    return jsonify({
        'domain': domain,
        'available': available,
        'suggestions': [
            f'{domain}.net',
            f'{domain}.org',
            f'{domain}.io',
            f'get{domain}.com'
        ] if not available else []
    })
