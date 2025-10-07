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

    """below this line, we have written all CRUD operations for the user entity"""    
    #this is the operation to create a user
    def create_user(self, user_data):
        existing_user = self.get_user_by_email(user_data.get("email"))
        if existing_user:
            raise ValueError('This user already exists.')
        new_user = User(**user_data)
        errors = new_user.validate_account()
        if errors:
            return {404, errors}
        self.user_service.add(new_user)
        return new_user

    #this is the operation to get user
    def get_user(self, user_id):
        return self.user_service.get(user_id)

    #this is the admin operation to get all users
    def get_all_users(self):
        return self.user_service.get_all()

    #this is the operation to update all users
    def update_user(self, user_id, value):
        user = self.user_service.get(user_id)
        if not user:
            return None
        user.update(value)
        return user        

    #this is the operation to get user by email
    def get_user_by_email(self, email):
        return self.user_service.get_by_attribute("email", email)

    #this is the operation to delete user
    def delete_user(self, user_id):
        user = self.get_user(user_id)
        if user:
            self.user_service.delete(user_id)
        return False

    #this is an admin method to delete all users and flush the database
    def delete_all_users():
        pass

    """below this line, all CRUD operation for the review entity are written"""

    #this is the operation to create a review
    def create_review(self):
        pass

    #this is the operation to get a review by the user
    def get_review(self):
        pass

    #this operation gets all the reviews and places them on the homepage
    def get_all_reviews(self):
        pass

    #this operation updates a review that belongs to the user requesting to update it
    def update_review(self):
        pass

    #this operation deletes a review that belongs to the user
    def delete_review(self):
        pass