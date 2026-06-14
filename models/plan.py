"""
Hosting Plans model
"""
from datetime import datetime
from models import db

class Plan(db.Model):
    __tablename__ = 'hosting_plans'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # shared, vps, cloud, dedicated, game, reseller
    description = db.Column(db.Text, default='')
    price_monthly = db.Column(db.Float, nullable=False)
    price_yearly = db.Column(db.Float, nullable=False)
    cpu = db.Column(db.String(50), default='')
    ram = db.Column(db.String(50), default='')
    storage = db.Column(db.String(50), default='')
    bandwidth = db.Column(db.String(50), default='')
    websites = db.Column(db.String(50), default='')
    features = db.Column(db.Text, default='')  # JSON string of features
    is_popular = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    sort_order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    orders = db.relationship('Order', backref='plan', lazy='dynamic')

    def get_features_list(self):
        import json
        try:
            return json.loads(self.features) if self.features else []
        except (json.JSONDecodeError, TypeError):
            return []

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'description': self.description,
            'price_monthly': self.price_monthly,
            'price_yearly': self.price_yearly,
            'cpu': self.cpu,
            'ram': self.ram,
            'storage': self.storage,
            'bandwidth': self.bandwidth,
            'websites': self.websites,
            'features': self.get_features_list(),
            'is_popular': self.is_popular,
            'sort_order': self.sort_order
        }

    def __repr__(self):
        return f'<Plan {self.name}>'
