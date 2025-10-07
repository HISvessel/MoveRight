from app.models.base_class import BaseClass
from app.models.db_model import db
from flask_sqlalchemy.orm import relationship

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
    def __init__(self, title='', comment='', rating=0):
        super().__init__()
        self.title = title
        self.comment = comment
        self.rating = rating

    #adding RDBMS schema
    """__table__ = 'reviews'

    id = db.Column()
    title = db.Column()
    comment = db.Column()
    rating = db.Column()
    """
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

        if not self.title:
<<<<<<< Updated upstream
            errors.append("Please enter the review's title.")
=======
            errors.append["Please enter the review's title."]
>>>>>>> Stashed changes

        if not self.comment:
            errors.append("Please comment.")

        if not self.rating:
            errors.append("Please rate the app.")

        return errors

    def to_dict(self):
        data = super().to_dict()
        data.update({
            "title": self.title,
            "comment": self.comment,
            'self.rating': self.rating
        })
        return data
