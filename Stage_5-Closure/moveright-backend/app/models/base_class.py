# app/models/base_class.py
"""
Base class for all database models.

Provides common functionality:
- Unique ID (UUID)
- Timestamps (created_at, updated_at)
- Common methods (to_dict, update, save)
"""

import uuid
from datetime import datetime
from app.models.db_model import db


class BaseClass(db.Model):
    """
    Abstract base class for all models.
    
    Provides:
    - id: Unique identifier (UUID)
    - created_at: When record was created
    - updated_at: When record was last modified
    """
    
    __abstract__ = True
    
    # Columns that every model will have
    id = db.Column(db.String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __init__(self):
        """temporary constructor method for the base class."""
        super().__init__()
        self.id = str(uuid.uuid4())
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    def update(self):
        """class method for updating the timestamp of updating an element."""
        self.updated_at = datetime.utcnow()

    def save(self, data):
        """saving method for overwriting an existing key element in the class object."""
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
        self.update()

    def to_dict(self):
        """
        Convert model instance to dictionary.
        
        Used for JSON responses in API.
        
        Returns:
            dict: Dictionary with id, created_at, updated_at
        """
        return {
            'id': str(self.id),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }