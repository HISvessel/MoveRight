from app.services.persistence import Persistence, MemoryPersistence
from app.models.db_model import db


"""this script contains a class for database persistence as backed
up by SQLAlchemy"""

class SQLAlchemyORM(Persistence):
    def __init__(self, model):
        self.model = model
    
    def add(self, obj):
        db.session.add(obj)
        db.session.commit()
    
    def get(self, obj_id):
        return self.model.query.get(obj_id)

    def get_all(self):
        return self.model.query.all()

    def get_by_attribute(self, attr_name, attr_data):
        return self.model.query.filter_by(**({attr_name: attr_data})).first()

    def update(self, obj_id, data):
        obj = self.get(obj_id)
        if obj:
            for key, value in data.items():
                if hasattr(obj, key): #changed instance, obtain attribute from key and not obj
                    setattr(obj, key, value)
            db.session.commit()

    def delete(self, obj_id):
        obj = self.get(obj_id)
        if obj:
            db.session.delete(obj)
            db.session.commit()
