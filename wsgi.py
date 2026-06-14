"""
NEXUS VIP HOST - WSGI Entry Point for Vercel deployment
"""
import sys
import os

# Add the project root to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set environment for Vercel
os.environ.setdefault('FLASK_ENV', 'production')

from app import create_app

# Export the Flask application for Vercel's Python runtime
app = create_app()

# Vercel looks for 'app' by default
handler = app
