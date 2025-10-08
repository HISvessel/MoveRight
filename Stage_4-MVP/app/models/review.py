from app.models.base_class import BaseClass
from app.models.db_model import db

"""the following script contains a review class.

The review inherits from the base class for SQL schema and is composed
of other methods for its creation and updating. Base class provides the
following information:
1. ID
2. Creation timestamp
3. Updating timestamp

the following elements make up the review composition:

1. Title(string)
2. Comment(string)
3. Rating(int between 0 and 5)
4. User_Name"""

class Review(BaseClass):
    def __init__(self, title='', comment='', rating=0, user_id=''):
        super().__init__()
        self.title = title
        self.comment = comment
        self.rating = rating
        self.user_id = user_id

    #adding RDBMS schema
    __tablename__ = 'reviews'
    title = db.Column(db.String(50), nullable=False)
    comment = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.String(100), db.foreignkey('users.id'), nullable=False)

    @property
    def rating(self):
        return self._rating

    @rating.setter
    def rating(self, input):
        if type(input) is not int:
            raise TypeError('Your rating must be a number.')
        if 0 > input > 5:
            raise ValueError("Your rating must be between 0 and 5")

        self._rating = input

    def validate_information(self):
        errors = []

        if not self.title or len(self.title) == 0:
            errors.append("Please enter the review's title.")

        if not self.comment or len(self.title) == 0:
            errors.append("Please comment.")

        if not self.rating:
            errors.append("Please rate the app.")

        return errors

    def to_dict(self):
        data = super().to_dict()
        data.update({
            "title": self.title,
            "comment": self.comment,
            'self.rating': self.rating,
            'user_id': self.user_id
        })
        return data