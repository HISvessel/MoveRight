from app.models.base_class import BaseClass


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
        super().__init__
        self.title = title
        self.comment = comment
        self.rating = rating
    
    def to_dict(self):
        data = super().to_dict()
        data.update({
            "title": self.title,
            "comment": self.comment,
            'self.rating': self.rating
        })
        return data