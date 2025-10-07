from app.services.persistence import Persistence
from app.services.ORM_operations import SQLAlchemyORM
from app.models.user import User
from app.models.review import Review

"""this is the intermediary call to the database when a request
is made in the application interface"""


class Facade():
    def __init__(self):
        self.user_service = SQLAlchemyORM(User)
        self.review_service = SQLAlchemyORM(Review)
    
    #this is the operation to create a user
    def create_user(self):
        pass

    #this is the operation to get user
    def get_user(self, id):
        pass

    #this is the admin operation to get all users

    #this is the operation to update all users

    #this is the operation to get user by email

    #this is the operation to delete user