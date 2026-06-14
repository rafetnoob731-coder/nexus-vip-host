"""
Support Ticket model
"""
from datetime import datetime
from models import db

class Ticket(db.Model):
    __tablename__ = 'tickets'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    subject = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    department = db.Column(db.String(50), default='general')  # general, sales, technical, billing
    priority = db.Column(db.String(20), default='normal')  # low, normal, high, urgent
    status = db.Column(db.String(20), default='open')  # open, pending, resolved, closed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = db.Column(db.DateTime, nullable=True)

    # Responses
    responses = db.relationship('TicketResponse', backref='ticket', lazy='dynamic',
                                 cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'username': self.user.username if self.user else '',
            'subject': self.subject,
            'message': self.message,
            'department': self.department,
            'priority': self.priority,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f'<Ticket {self.id}: {self.subject}>'


class TicketResponse(db.Model):
    __tablename__ = 'ticket_responses'

    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey('tickets.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_staff = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    responder = db.relationship('User', foreign_keys=[user_id])

    def to_dict(self):
        return {
            'id': self.id,
            'ticket_id': self.ticket_id,
            'user_id': self.user_id,
            'username': self.responder.username if self.responder else '',
            'message': self.message,
            'is_staff': self.is_staff,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
