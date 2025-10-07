from app.services.persistence import MemoryPersistence
from app.models.db_model import db
from app.models.user import User
from app.models.review import Review


"""this script contains a class for database persistence as backed
up by SQLAlchemy"""

class SQLAlchemyORM(MemoryPersistence):
    pass
from app.services.persistence import Persistence, MemoryPersistence
from app.models.db_model import db
from app.models.user import User
from app.models.review import Review


"""this script contains a class for database persistence as backed
up by SQLAlchemy"""

class SQLAlchemyORM(Persistence):
    def __init_(self, model):
        self.model = model
    
    def add(self, obj):
        db.session.add(obj)
        db.session.commit()
    
    def get(self, obj_id):
        pass

    def get_all(self):
        pass

    def get_by_attribute(self, attr_name, attr_data):
        return super().get_by_attribute(attr_name, attr_data)
    
    def update(self, attr_name, attr_data):
        pass

    def delete(self, obj_id):
        pass
