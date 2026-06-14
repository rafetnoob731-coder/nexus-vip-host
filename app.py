"""
NEXUS VIP HOST - Premium Hosting Platform
Main Flask Application Entry Point

A professional hosting provider platform with:
- Client area with authentication
- Admin panel with full management
- REST API for frontend integration
- SQLite/MySQL database
- Modern responsive UI
"""
import os
from flask import Flask
from config import config_by_name
from models import db, login_manager

def create_app(config_name=None):
    """Application factory"""
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')

    app = Flask(__name__)
    app.config.from_object(config_by_name.get(config_name, config_by_name['development']))

    # Initialize extensions
    db.init_app(app)
    login_manager.init_app(app)

    # Login manager configuration
    login_manager.login_view = 'auth.login'
    login_manager.login_message_category = 'info'
    login_manager.login_message = 'Please log in to access this page.'

    # User loader
    from models.user import User

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # Register blueprints
    from routes.main import main_bp
    from routes.auth import auth_bp
    from routes.admin import admin_bp
    from routes.api import api_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(api_bp)

    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        from flask import render_template
        return render_template('errors/404.html'), 404

    @app.errorhandler(403)
    def forbidden(error):
        from flask import render_template
        return render_template('errors/403.html'), 403

    @app.errorhandler(500)
    def server_error(error):
        from flask import render_template
        return render_template('errors/500.html'), 500

    # Context processor for global template variables
    @app.context_processor
    def inject_globals():
        return {
            'site_name': 'NEXUS VIP HOST',
            'site_tagline': 'Powering Your Digital Future',
            'current_year': __import__('datetime').datetime.utcnow().year,
            'current_theme': 'dark'
        }

    # Create tables and seed demo data
    with app.app_context():
        db.create_all()
        from utils.helpers import seed_demo_data
        try:
            seed_demo_data()
        except Exception:
            pass  # Seed data already exists

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
