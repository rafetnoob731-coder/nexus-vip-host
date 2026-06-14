"""
Payment model for transactions
"""
from datetime import datetime
from models import db

class Payment(db.Model):
    __tablename__ = 'payments'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=True)
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(3), default='USD')
    method = db.Column(db.String(50), default='')  # credit_card, paypal, stripe, crypto
    status = db.Column(db.String(20), default='pending')  # pending, completed, failed, refunded
    transaction_id = db.Column(db.String(255), default='')
    payment_details = db.Column(db.Text, default='')  # JSON for additional details
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)

    order = db.relationship('Order', foreign_keys=[order_id])

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'username': self.user.username if self.user else '',
            'order_id': self.order_id,
            'amount': self.amount,
            'currency': self.currency,
            'method': self.method,
            'status': self.status,
            'transaction_id': self.transaction_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }

    def __repr__(self):
        return f'<Payment {self.id}: ${self.amount} - {self.status}>'
