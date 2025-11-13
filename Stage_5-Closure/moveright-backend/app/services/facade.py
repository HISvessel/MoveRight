from app.services.persistence import Persistence
from app.services.ORM_operations import SQLAlchemyORM
from app.models.user import User
from app.models.review import Review

"""this is the intermediary call to the database when a request
is made in the application interface"""


class Facade():
    """The facade class, a container for all CRUD
    operations belonging to the user and review entities.

    Methods will be used in each respective application namespace,
    providing the interaction with our database."""
    def __init__(self):
        self.user_service = SQLAlchemyORM(User)
        self.review_service = SQLAlchemyORM(Review)

    """below this line, we have written all CRUD operations for the user entity"""    
    #this is the operation to create a user
    def create_user(self, user_data):
        """POST operation for the creation of a single, non-existing
        user. It takes the user data as a singular argument.

        Stores the newly created user into the database and 
        returns the new user as an object for a JSON response."""

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
        """GET operation to retrieve an existing user from the database.
        It takes the user id as an argument and returns the user."""

        return self.user_service.get(user_id)

    #this is the admin operation to get all users
    #strictly reserved for True valued _admin users
    def get_all_users(self):
        """GET operation reserved for administrators
        to get a list of all users on the database."""

        return self.user_service.get_all()

    #this is the operation to update all users
    def update_user(self, user_id, value):
        """PUT operation to update the selected element of the user.

        Recieves two arguments:
        1. User ID(retrieves it from database.)
        2. The value which will be changed."""

        user = self.user_service.get(user_id)
        if not user:
            return None
        user.update(value)
        return user

    #this is the operation to get user by email
    def get_user_by_email(self, email):
        """Helper function to retrieve a user by
        getting the email credential as stored in the
        database. It takes the email string as the argument and
        returns the user by the provided email."""

        return self.user_service.get_by_attribute("email", email)

    #this is the operation to delete user
    def delete_user(self, user_id):
        """DELETE operation to delete the user from the database.
        
        It takes as argument the id given to the user upon creation
        and deletes it if it returns true."""

        user = self.get_user(user_id)
        if user:
            self.user_service.delete(user_id)
        return False #optional return of error

    #this is an admin method to delete all users and flush the database
    def delete_all_users(self):
        """DELETE operation reserved for admin users to flush the
        database without having to operate from the server.
        
        Deletes all users whose _admin boolean value is False, 
        preserving at least one entry on the database."""
        pass

    """below this line, all CRUD operation for the review entity are written"""

    #this is the operation to create a review
    def create_review(self, review_data):
        """POST operation for the creation of a single, non-existing
        review. It takes the review data as a singular argument.

        Stores the newly created review into the database and 
        returns the new review as an object for a JSON response."""

        existing_review = self.review_service.get(review_data.get('review_id'))#I believe my error was here
        if existing_review:
            raise ValueError("Review already exists in the database.")
        new_review = Review(**review_data)
        errors = new_review.validate_information()
        if errors:
            return {400, errors}
        self.review_service.add(new_review)
        return new_review

    #this is the operation to get a review by the user
    def get_review(self, review_id):
        """GET operation to retrieve an existing review from the database.
        It takes the id as an argument and returns the review."""

        return self.review_service.get_by_attribute('id', review_id)

    #this operation gets all the reviews and places them on the homepage
    def get_all_reviews(self):
        """GET operation reserved for administrators
        to get a list of all users on the database."""

        return self.review_service.get_all()

    #this operation updates a review that belongs to the user requesting to update it
    def update_review(self, review_id, value):
        """PUT operation to update the selected element of the review.

        Recieves two arguments:
        1. Review ID(retrieves it from database.)
        2. The value which will be changed."""

        review = self.review_service.get(review_id)
        if not review:
            return None
        review.update(value)
        return review

    #this operation deletes a review that belongs to the user
    def delete_review(self, review_id):
        """DELETE operation to delete the review from the database.

        It takes as argument the id given to the review upon creation
        and deletes it if it returns true."""

        review = self.review_service.get(review_id)
        if review:
            self.review_service.delete(review_id)
        return False #optional return of error message instead

    #this is an admin operation to delete all reviews and flush the database
    def delete_all_reviews(self):
        """DELETE operation to delete all reviews from the database
        and flush the system."""
        pass
