import uuid
from datetime import datetime
from app.models.db_model import db


"""This is the base class for all ORM focused entities

Created for the purpose of all tables and databse constraints

Objects it will have:
1. Creation timestamp
2. Updating timestamp
3. object id with UUID"""

class BaseClass():#db.Model):
    __abstract__ = True
    """
    id = db.Column()
    created_at = db.Column()
    updated_at = db.Column()"""
    def __init__(self):
        """temporary constructor method for the base class."""

        self.id = uuid.uuid4()
        self.created_at = datetime.date()
        self.updated_at = datetime.date()
    
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
            "created at": self.created_at,
            "updated at": self.updated_at
        }