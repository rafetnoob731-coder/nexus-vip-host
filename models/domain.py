"""
Domain model for domain registrations
"""
from datetime import datetime
from models import db

class Domain(db.Model):
    __tablename__ = 'domains'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)
    name = db.Column(db.String(255), nullable=False)
    tld = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, registered, expired, cancelled
    registration_date = db.Column(db.DateTime, nullable=True)
    expiry_date = db.Column(db.DateTime, nullable=True)
    auto_renew = db.Column(db.Boolean, default=True)
    nameservers = db.Column(db.Text, default='')  # JSON array
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'tld': self.tld,
            'full_domain': f'{self.name}{self.tld}',
            'status': self.status,
            'registration_date': self.registration_date.isoformat() if self.registration_date else None,
            'expiry_date': self.expiry_date.isoformat() if self.expiry_date else None,
            'auto_renew': self.auto_renew,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        return f'<Domain {self.name}{self.tld}>'
