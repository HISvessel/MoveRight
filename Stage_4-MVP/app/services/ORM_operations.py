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
    def __init_(self):
        self.user = User()