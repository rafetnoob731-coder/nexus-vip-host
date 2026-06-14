"""
Admin panel routes - Dashboard, User Management, Orders, Tickets, Settings
"""
from datetime import datetime, timedelta
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from models import db
from models.user import User
from models.plan import Plan
from models.order import Order
from models.ticket import Ticket, TicketResponse
from models.payment import Payment
from models.domain import Domain
from utils.helpers import admin_required, staff_required, paginate

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

@admin_bp.before_request
@login_required
@admin_required
def check_admin():
    """Ensure user is admin for all admin routes"""
    pass

@admin_bp.route('/')
def dashboard():
    """Admin dashboard"""
    stats = {
        'total_users': User.query.count(),
        'total_orders': Order.query.count(),
        'active_services': Order.query.filter_by(status='active').count(),
        'total_revenue': db.session.query(db.func.sum(Payment.amount))\
            .filter(Payment.status == 'completed').scalar() or 0,
        'open_tickets': Ticket.query.filter_by(status='open').count(),
        'total_plans': Plan.query.count(),
        'pending_orders': Order.query.filter_by(status='pending').count(),
        'recent_users': User.query.order_by(User.created_at.desc()).limit(5).all()
    }

    # Revenue chart data (last 7 days)
    revenue_data = []
    for i in range(6, -1, -1):
        day = datetime.utcnow() - timedelta(days=i)
        start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        end = start + timedelta(days=1)
        daily_rev = db.session.query(db.func.sum(Payment.amount))\
            .filter(Payment.created_at >= start, Payment.created_at < end,
                   Payment.status == 'completed').scalar() or 0
        revenue_data.append({
            'date': day.strftime('%a'),
            'amount': float(daily_rev)
        })

    return render_template('admin/dashboard.html', stats=stats, revenue_data=revenue_data)

@admin_bp.route('/users')
def users():
    """User management"""
    page = request.args.get('page', 1, type=int)
    query = User.query.order_by(User.created_at.desc())
    result = paginate(query, page=page, per_page=20)
    return render_template('admin/users.html', users=result)

@admin_bp.route('/users/<int:user_id>')
def user_detail(user_id):
    """User detail view"""
    user = User.query.get_or_404(user_id)
    orders = Order.query.filter_by(user_id=user_id).all()
    tickets = Ticket.query.filter_by(user_id=user_id).all()
    payments = Payment.query.filter_by(user_id=user_id).all()
    return render_template('admin/user_detail.html', user=user,
                         orders=orders, tickets=tickets, payments=payments)

@admin_bp.route('/users/<int:user_id>/update-role', methods=['POST'])
def update_user_role(user_id):
    """Update user role"""
    user = User.query.get_or_404(user_id)
    new_role = request.form.get('role', 'client')

    if new_role in ('client', 'staff', 'admin'):
        user.role = new_role
        db.session.commit()
        flash(f'User role updated to {new_role}.', 'success')

    return redirect(url_for('admin.user_detail', user_id=user_id))

@admin_bp.route('/users/<int:user_id>/toggle-status', methods=['POST'])
def toggle_user_status(user_id):
    """Toggle user active status"""
    user = User.query.get_or_404(user_id)
    user.is_active = not user.is_active
    db.session.commit()
    status = 'activated' if user.is_active else 'deactivated'
    flash(f'User {status}.', 'success')
    return redirect(url_for('admin.user_detail', user_id=user_id))

@admin_bp.route('/plans')
def plans():
    """Hosting plan management"""
    plans = Plan.query.order_by(Plan.type, Plan.sort_order).all()
    return render_template('admin/plans.html', plans=plans)

@admin_bp.route('/plans/create', methods=['GET', 'POST'])
def create_plan():
    """Create a new hosting plan"""
    if request.method == 'POST':
        import json
        name = request.form.get('name', '').strip()
        plan_type = request.form.get('type', 'shared')
        price_monthly = float(request.form.get('price_monthly', 0))
        price_yearly = float(request.form.get('price_yearly', 0))
        cpu = request.form.get('cpu', '')
        ram = request.form.get('ram', '')
        storage = request.form.get('storage', '')
        bandwidth = request.form.get('bandwidth', '')
        websites = request.form.get('websites', '')
        description = request.form.get('description', '')
        features = request.form.getlist('features[]')

        if not name:
            flash('Plan name is required.', 'danger')
            return render_template('admin/create_plan.html')

        plan = Plan(
            name=name,
            type=plan_type,
            description=description,
            price_monthly=price_monthly,
            price_yearly=price_yearly,
            cpu=cpu,
            ram=ram,
            storage=storage,
            bandwidth=bandwidth,
            websites=websites,
            features=json.dumps(features),
            is_popular=request.form.get('is_popular') == 'on',
            sort_order=int(request.form.get('sort_order', 0))
        )
        db.session.add(plan)
        db.session.commit()

        flash(f'Plan "{name}" created successfully!', 'success')
        return redirect(url_for('admin.plans'))

    return render_template('admin/create_plan.html')

@admin_bp.route('/plans/<int:plan_id>/edit', methods=['GET', 'POST'])
def edit_plan(plan_id):
    """Edit a hosting plan"""
    plan = Plan.query.get_or_404(plan_id)

    if request.method == 'POST':
        import json
        plan.name = request.form.get('name', '').strip()
        plan.type = request.form.get('type', 'shared')
        plan.description = request.form.get('description', '')
        plan.price_monthly = float(request.form.get('price_monthly', 0))
        plan.price_yearly = float(request.form.get('price_yearly', 0))
        plan.cpu = request.form.get('cpu', '')
        plan.ram = request.form.get('ram', '')
        plan.storage = request.form.get('storage', '')
        plan.bandwidth = request.form.get('bandwidth', '')
        plan.websites = request.form.get('websites', '')
        features = request.form.getlist('features[]')
        plan.features = json.dumps(features)
        plan.is_popular = request.form.get('is_popular') == 'on'
        plan.sort_order = int(request.form.get('sort_order', 0))
        plan.is_active = request.form.get('is_active') == 'on'
        db.session.commit()

        flash(f'Plan "{plan.name}" updated successfully!', 'success')
        return redirect(url_for('admin.plans'))

    return render_template('admin/edit_plan.html', plan=plan)

@admin_bp.route('/plans/<int:plan_id>/delete', methods=['POST'])
def delete_plan(plan_id):
    """Delete a hosting plan"""
    plan = Plan.query.get_or_404(plan_id)
    name = plan.name
    db.session.delete(plan)
    db.session.commit()
    flash(f'Plan "{name}" deleted.', 'info')
    return redirect(url_for('admin.plans'))

@admin_bp.route('/orders')
def orders():
    """Order management"""
    page = request.args.get('page', 1, type=int)
    status_filter = request.args.get('status', '')
    query = Order.query.order_by(Order.created_at.desc())

    if status_filter:
        query = query.filter(Order.status == status_filter)

    result = paginate(query, page=page, per_page=20)
    return render_template('admin/orders.html', orders=result, status_filter=status_filter)

@admin_bp.route('/orders/<int:order_id>/update-status', methods=['POST'])
def update_order_status(order_id):
    """Update order status"""
    order = Order.query.get_or_404(order_id)
    new_status = request.form.get('status', 'pending')

    if new_status in ('pending', 'active', 'suspended', 'cancelled'):
        order.status = new_status
        if new_status == 'active' and not order.activated_at:
            order.activated_at = datetime.utcnow()
        order.updated_at = datetime.utcnow()
        db.session.commit()
        flash(f'Order #{order_id} status updated to {new_status}.', 'success')

    return redirect(url_for('admin.orders'))

@admin_bp.route('/tickets')
def tickets():
    """Ticket management"""
    page = request.args.get('page', 1, type=int)
    status_filter = request.args.get('status', '')
    query = Ticket.query.order_by(Ticket.updated_at.desc())

    if status_filter:
        query = query.filter(Ticket.status == status_filter)

    result = paginate(query, page=page, per_page=20)
    return render_template('admin/tickets.html', tickets=result, status_filter=status_filter)

@admin_bp.route('/tickets/<int:ticket_id>')
def ticket_detail(ticket_id):
    """View ticket details"""
    ticket = Ticket.query.get_or_404(ticket_id)
    responses = TicketResponse.query.filter_by(ticket_id=ticket_id)\
        .order_by(TicketResponse.created_at).all()
    return render_template('admin/ticket_detail.html', ticket=ticket, responses=responses)

@admin_bp.route('/tickets/<int:ticket_id>/respond', methods=['POST'])
def respond_ticket(ticket_id):
    """Staff response to ticket"""
    ticket = Ticket.query.get_or_404(ticket_id)
    message = request.form.get('message', '').strip()

    if not message:
        flash('Message cannot be empty.', 'danger')
        return redirect(url_for('admin.ticket_detail', ticket_id=ticket_id))

    response = TicketResponse(
        ticket_id=ticket_id,
        user_id=current_user.id,
        message=message,
        is_staff=True
    )
    db.session.add(response)

    ticket.status = request.form.get('status', 'pending')
    ticket.updated_at = datetime.utcnow()
    db.session.commit()

    flash('Response added.', 'success')
    return redirect(url_for('admin.ticket_detail', ticket_id=ticket_id))

@admin_bp.route('/payments')
def payments():
    """Payment management"""
    page = request.args.get('page', 1, type=int)
    query = Payment.query.order_by(Payment.created_at.desc())
    result = paginate(query, page=page, per_page=20)
    return render_template('admin/payments.html', payments=result)

@admin_bp.route('/settings', methods=['GET', 'POST'])
def settings():
    """Admin settings"""
    if request.method == 'POST':
        # Update site settings (stored in config for demo)
        flash('Settings updated successfully!', 'success')
        return redirect(url_for('admin.settings'))

    return render_template('admin/settings.html')

@admin_bp.route('/api/revenue-stats')
def revenue_stats():
    """API endpoint for revenue statistics"""
    total_revenue = db.session.query(db.func.sum(Payment.amount))\
        .filter(Payment.status == 'completed').scalar() or 0

    monthly_revenue = db.session.query(
        db.func.strftime('%Y-%m', Payment.created_at).label('month'),
        db.func.sum(Payment.amount).label('total')
    ).filter(Payment.status == 'completed')\
     .group_by('month')\
     .order_by('month')\
     .all()

    return jsonify({
        'total_revenue': float(total_revenue),
        'monthly_revenue': [{'month': r.month, 'total': float(r.total)} for r in monthly_revenue]
    })
