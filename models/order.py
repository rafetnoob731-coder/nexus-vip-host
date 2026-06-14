"""
Orders model for tracking user purchases
"""
from datetime import datetime
from models import db

class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    plan_id = db.Column(db.Integer, db.ForeignKey('hosting_plans.id'), nullable=False)
    domain = db.Column(db.String(255), default='')
    billing_cycle = db.Column(db.String(20), default='monthly')  # monthly, yearly
    total_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, active, suspended, cancelled
    payment_status = db.Column(db.String(20), default='unpaid')  # unpaid, paid, refunded
    next_due_date = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    activated_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'plan_id': self.plan_id,
            'plan_name': self.plan.name if self.plan else '',
            'domain': self.domain,
            'billing_cycle': self.billing_cycle,
            'total_amount': self.total_amount,
            'status': self.status,
            'payment_status': self.payment_status,
            'next_due_date': self.next_due_date.isoformat() if self.next_due_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'activated_at': self.activated_at.isoformat() if self.activated_at else None
        }

    def __repr__(self):
        return f'<Order {self.id} - {self.status}>'
