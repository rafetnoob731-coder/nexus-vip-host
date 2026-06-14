"""
Main routes - All public-facing pages
"""
from datetime import datetime
from flask import Blueprint, render_template, request, jsonify, redirect, url_for, flash
from flask_login import login_required, current_user
from models import db
from models.plan import Plan
from models.order import Order
from models.ticket import Ticket, TicketResponse
from models.payment import Payment
from models.domain import Domain

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    """Home page"""
    plans = Plan.query.filter_by(is_active=True).order_by(Plan.sort_order).all()
    shared_plans = [p for p in plans if p.type == 'shared'][:3]
    return render_template('index.html', plans=plans, shared_plans=shared_plans)

@main_bp.route('/plans')
def plans():
    """Hosting plans page"""
    plan_type = request.args.get('type', 'shared')
    plans = Plan.query.filter_by(is_active=True, type=plan_type).order_by(Plan.sort_order).all()
    return render_template('plans.html', plans=plans, current_type=plan_type)

@main_bp.route('/plans/api')
def plans_api():
    """API endpoint for hosting plans"""
    plans = Plan.query.filter_by(is_active=True).order_by(Plan.sort_order).all()
    return jsonify([plan.to_dict() for plan in plans])

@main_bp.route('/domains')
def domains():
    """Domain registration page"""
    return render_template('domains.html')

@main_bp.route('/domains/search', methods=['POST'])
def domain_search():
    """Search domain availability (mock)"""
    data = request.get_json()
    domain_name = data.get('domain', '').strip()
    tld = data.get('tld', '.com').strip()

    if not domain_name:
        return jsonify({'error': 'Domain name required'}), 400

    full_domain = f'{domain_name}{tld}'

    # Mock availability check
    import random
    available = random.random() > 0.3

    return jsonify({
        'domain': full_domain,
        'available': available,
        'price': {
            '.com': 9.99,
            '.net': 11.99,
            '.org': 10.99,
            '.io': 34.99,
            '.dev': 14.99,
            '.app': 13.99,
            '.co': 24.99,
            '.store': 29.99
        }.get(tld, 9.99)
    })

@main_bp.route('/support')
def support():
    """Support center page"""
    return render_template('support.html')

@main_bp.route('/support/tickets')
@login_required
def tickets():
    """User's support tickets"""
    tickets_list = Ticket.query.filter_by(user_id=current_user.id)\
        .order_by(Ticket.updated_at.desc()).all()
    return render_template('tickets.html', tickets=tickets_list)

@main_bp.route('/support/tickets/create', methods=['GET', 'POST'])
@login_required
def create_ticket():
    """Create a new support ticket"""
    if request.method == 'POST':
        subject = request.form.get('subject', '').strip()
        message = request.form.get('message', '').strip()
        department = request.form.get('department', 'general')
        priority = request.form.get('priority', 'normal')

        if not subject or not message:
            flash('Please fill in all required fields.', 'danger')
            return render_template('create_ticket.html')

        ticket = Ticket(
            user_id=current_user.id,
            subject=subject,
            message=message,
            department=department,
            priority=priority,
            status='open'
        )
        db.session.add(ticket)
        db.session.commit()

        flash('Ticket created successfully!', 'success')
        return redirect(url_for('main.tickets'))

    return render_template('create_ticket.html')

@main_bp.route('/support/tickets/<int:ticket_id>')
@login_required
def view_ticket(ticket_id):
    """View a specific ticket"""
    ticket = Ticket.query.get_or_404(ticket_id)

    # Ensure user owns ticket or is staff
    if ticket.user_id != current_user.id and not current_user.is_staff():
        flash('Access denied.', 'danger')
        return redirect(url_for('main.tickets'))

    responses = TicketResponse.query.filter_by(ticket_id=ticket_id)\
        .order_by(TicketResponse.created_at).all()
    return render_template('view_ticket.html', ticket=ticket, responses=responses)

@main_bp.route('/support/tickets/<int:ticket_id>/respond', methods=['POST'])
@login_required
def respond_ticket(ticket_id):
    """Respond to a ticket"""
    ticket = Ticket.query.get_or_404(ticket_id)

    if ticket.user_id != current_user.id and not current_user.is_staff():
        flash('Access denied.', 'danger')
        return redirect(url_for('main.tickets'))

    message = request.form.get('message', '').strip()
    if not message:
        flash('Message cannot be empty.', 'danger')
        return redirect(url_for('main.view_ticket', ticket_id=ticket_id))

    response = TicketResponse(
        ticket_id=ticket_id,
        user_id=current_user.id,
        message=message,
        is_staff=current_user.is_staff()
    )
    db.session.add(response)

    # Update ticket status
    ticket.status = 'pending' if current_user.is_staff() else 'open'
    ticket.updated_at = datetime.utcnow()
    db.session.commit()

    flash('Response added.', 'success')
    return redirect(url_for('main.view_ticket', ticket_id=ticket_id))

@main_bp.route('/knowledge')
def knowledge():
    """Knowledge base page"""
    return render_template('knowledge.html')

@main_bp.route('/about')
def about():
    """About us page"""
    return render_template('about.html')

@main_bp.route('/status')
def status_page():
    """Server status page"""
    return render_template('status.html')

@main_bp.route('/dashboard')
@login_required
def dashboard():
    """Client dashboard"""
    orders = Order.query.filter_by(user_id=current_user.id)\
        .order_by(Order.created_at.desc()).all()
    tickets = Ticket.query.filter_by(user_id=current_user.id)\
        .order_by(Ticket.updated_at.desc()).limit(5).all()
    payments = Payment.query.filter_by(user_id=current_user.id)\
        .order_by(Payment.created_at.desc()).limit(5).all()

    stats = {
        'total_orders': len(orders),
        'active_services': sum(1 for o in orders if o.status == 'active'),
        'open_tickets': sum(1 for t in tickets if t.status == 'open'),
        'total_paid': sum(p.amount for p in payments if p.status == 'completed')
    }

    return render_template('dashboard.html',
                         orders=orders,
                         tickets=tickets,
                         payments=payments,
                         stats=stats)

@main_bp.route('/api/stats')
def api_stats():
    """API endpoint for homepage stats"""
    total_users = db.session.query(db.func.count()).select_from(type('', (), {'__tablename__': 'users'})()).scalar() or 0
    total_orders = Order.query.count()
    active_orders = Order.query.filter_by(status='active').count()

    return jsonify({
        'total_users': total_users,
        'total_orders': total_orders,
        'active_services': active_orders,
        'uptime': 99.99,
        'datacenters': 15,
        'staff': 247
    })

@main_bp.route('/api/server-status')
def server_status():
    """API endpoint for live server status"""
    from utils.helpers import get_server_stats
    stats = get_server_stats()
    return jsonify({
        'web_server': {'status': 'operational', 'latency': '12ms'},
        'database': {'status': 'operational', 'latency': '8ms'},
        'dns': {'status': 'operational', 'latency': '5ms'},
        'cdn': {'status': 'operational', 'latency': '23ms'},
        'load_balancer': {'status': 'operational', 'latency': '3ms'},
        'overall': 'All Systems Operational',
        **stats
    })
