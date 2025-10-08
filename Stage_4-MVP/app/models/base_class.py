import uuid
from datetime import datetime
from app.models.db_model import db


"""This is the base class for all ORM focused entities

Created for the purpose of all tables and databse constraints

Objects it will have:
1. Creation timestamp
2. Updating timestamp
3. object id with UUID"""

class BaseClass(db.Model):
    __abstract__ = True
    id = db.Column(db.String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __init__(self):
        """temporary constructor method for the base class."""

        self.id = uuid.uuid4()
        self.created_at = datetime.now()
        self.updated_at = datetime.now()
    
    def update(self):
        """class method for updating the timestamp of updating an element."""
        self.updated_at = datetime.now()

    def save(self, data):
        """saving method for overwriting an existing key element in the class object."""
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
            self.save()

    def to_dict(self):
        return {
            "id": self.id,
            "created at": self.created_at.isoformat(),
            "updated at": self.updated_at.isoformat()
        }