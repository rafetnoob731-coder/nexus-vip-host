"""
Authentication routes - Login, Register, Logout, Profile
"""
from datetime import datetime
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from models import db
from models.user import User

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    """Handle user login"""
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))

    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        remember = request.form.get('remember', False) == 'on'

        if not email or not password:
            flash('Please fill in all fields.', 'warning')
            return render_template('login.html')

        user = User.query.filter_by(email=email).first()

        if not user:
            # Try username
            user = User.query.filter_by(username=email).first()

        if user and user.check_password(password):
            if not user.is_active:
                flash('Your account has been deactivated. Contact support.', 'danger')
                return render_template('login.html')

            login_user(user, remember=remember)
            user.last_login = datetime.utcnow()
            db.session.commit()

            flash(f'Welcome back, {user.full_name or user.username}!', 'success')

            next_page = request.args.get('next')
            if next_page:
                return redirect(next_page)

            if user.is_admin():
                return redirect(url_for('admin.dashboard'))
            return redirect(url_for('main.dashboard'))
        else:
            flash('Invalid email/username or password.', 'danger')

    return render_template('login.html')

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    """Handle user registration"""
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))

    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')
        full_name = request.form.get('full_name', '').strip()
        agree_terms = request.form.get('agree_terms', False) == 'on'

        # Validation
        errors = []
        if not username or len(username) < 3:
            errors.append('Username must be at least 3 characters.')
        if not email:
            errors.append('Email is required.')
        if not password or len(password) < 8:
            errors.append('Password must be at least 8 characters.')
        elif password != confirm_password:
            errors.append('Passwords do not match.')
        if not agree_terms:
            errors.append('You must agree to the Terms of Service.')

        # Check existing user
        if User.query.filter_by(username=username).first():
            errors.append('Username already taken.')
        if User.query.filter_by(email=email).first():
            errors.append('Email already registered.')

        if errors:
            for error in errors:
                flash(error, 'danger')
            return render_template('register.html', form_data=request.form)

        # Create user
        user = User(
            username=username,
            email=email,
            full_name=full_name or username,
            role='client',
            email_verified=True  # Auto-verified for demo
        )
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        flash('Account created successfully! You can now log in.', 'success')
        return redirect(url_for('auth.login'))

    return render_template('register.html')

@auth_bp.route('/logout')
@login_required
def logout():
    """Handle user logout"""
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('main.index'))

@auth_bp.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    """User profile management"""
    if request.method == 'POST':
        full_name = request.form.get('full_name', '').strip()
        company = request.form.get('company', '').strip()
        phone = request.form.get('phone', '').strip()
        address = request.form.get('address', '').strip()

        current_user.full_name = full_name
        current_user.company = company
        current_user.phone = phone
        current_user.address = address
        db.session.commit()

        flash('Profile updated successfully!', 'success')
        return redirect(url_for('auth.profile'))

    return render_template('profile.html', user=current_user)

@auth_bp.route('/change-password', methods=['POST'])
@login_required
def change_password():
    """Change user password"""
    current_password = request.form.get('current_password', '')
    new_password = request.form.get('new_password', '')
    confirm_password = request.form.get('confirm_password', '')

    if not current_user.check_password(current_password):
        flash('Current password is incorrect.', 'danger')
        return redirect(url_for('auth.profile'))

    if len(new_password) < 8:
        flash('New password must be at least 8 characters.', 'danger')
        return redirect(url_for('auth.profile'))

    if new_password != confirm_password:
        flash('New passwords do not match.', 'danger')
        return redirect(url_for('auth.profile'))

    current_user.set_password(new_password)
    db.session.commit()

    flash('Password changed successfully!', 'success')
    return redirect(url_for('auth.profile'))

@auth_bp.route('/api/check-auth')
def check_auth():
    """API endpoint to check if user is authenticated"""
    if current_user.is_authenticated:
        return jsonify({
            'authenticated': True,
            'user': current_user.to_dict()
        })
    return jsonify({'authenticated': False})
