# app/models/user.py
"""
User model for Move Right application.

The user inherits from the base class for SQL schema and is composed
of other methods for its creation.

The following elements make up its composition:
1. First name
2. Last name
3. email
4. encrypted password
5. age
6. height in the following measurements: feet(int), inches(int)
7. weight(float)
8. video_collection
"""

from app.models.base_class import BaseClass
import bcrypt
import re
from app.models.db_model import db
from sqlalchemy.orm import relationship, validates
import pymongo


class User(BaseClass):
    
    #preparing ORM structure for RDBMS schema
    __tablename__ = 'users'
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    # changed to string 200 bcrypt hashes need ~60 chars minimum
    #removed unique=true passwords shouldnt be unique
    password = db.Column(db.String(200), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    feet = db.Column(db.Integer, nullable=False)
    inches = db.Column(db.Integer, nullable=False)
    weight = db.Column(db.Float, nullable=False)
    admin = db.Column(db.Boolean, default=False)

    # FIXED: Changed from relationship('User'...) to relationship('Review'...)
    # was creating self-referential relationship (User pointing to User)
    reviews = db.relationship('Review', backref='user', lazy='dynamic', cascade='all, delete-orphan')

    def __init__(self, first_name='', last_name='', email='', 
                 password='', age=0, feet=0, inches=0, weight=0):
        super().__init__()
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        # Changed from self._password to self.password
        # Must store in actual database column (self.password), not private variable (self._password)
        self.password = self.hash_password(password) if password else ''
        self.age = age
        self.feet = feet
        self.inches = inches
        self.weight = weight

        #an optional feature that can be seen at the push of a button
        #if no videos are stored, a prompt message will be placed instead
        self.video_collection = []
        
        #special constructor for administrator privileges
        #administrator can view all entities and flush the database during testing period
        self._admin = False

    #preparing non relational object mapping for video storage using pymongo
    """Mongo DB document based ORM under construction"""

    def hash_password(self, password):
        """password hashing method"""
        passcode = password.encode('utf-8')
        salted_pwd = bcrypt.gensalt()
        hashed_pwd = bcrypt.hashpw(passcode, salted_pwd)
        return hashed_pwd.decode('utf-8')

    def verify_password(self, password):
        """this class method verifies that the password is hashed
        and matches the input given by the user when class is created"""
        if not self.password:
            return False
        return bcrypt.checkpw(password.encode('utf-8'), self.password.encode('utf-8'))

    def verify_email(self, email):
        """class method for verifying correct email pattern"""
        #domain_suffix = ['yahoo', 'gmail', 'outlook', 'icloud']
        #valid = [suffix for suffix in domain_suffix]
        #test yahoo.com pattern, then proceed to make separate methods for other domain mails
        pattern = r'^[\w\.-]+@yahoo\.com$'
        return re.match(pattern, email) is not None


    # #setting the age property for a value greater than 0
    # @property
    # def age(self):
    #     # Read from column if private var doesn't exist
    #     return getattr(self, '_age', self.__dict__.get('age'))

    # @age.setter
    # def age(self, input):
    #     if type(input) is not int:
    #         raise TypeError('Age must be an number')
    #     if input < 1:
    #         raise ValueError('You must be of valid age.')
    #     self._age = input


    # #setting the feet for a value between 3 and 7 feet
    # @property
    # def feet(self):
    #     return getattr(self, '_feet', self.__dict__.get('feet'))

    # @feet.setter
    # def feet(self, input):
    #     if type(input) is not int:
    #         raise TypeError('Feet must be a valid number')
    #     if not 3 <= input < 8:
    #         raise ValueError('Please enter a valid feet measurement.')
    #     self._feet = input


    # #setting the inches to a value between 0 and 11
    # @property
    # def inches(self):
    #     return getattr(self, '_inches', self.__dict__.get('inches'))

    # @inches.setter
    # def inches(self, input):
    #     if type(input) is not int:
    #         raise TypeError('Inches must be a valid number')
    #     if not 0 <= input < 12:
    #         raise ValueError('Please enter a valid measurement in inches.')
    #     self._inches = input

    # #setting the weight to be greater than 0(no judgement if they weight 1 single lbs)
    # @property
    # def weight(self):
    #     return getattr(self, '_weight', self.__dict__.get('weight'))

    # @weight.setter
    # def weight(self, input):
    #     if type(input) is not int:
    #         raise TypeError('Your weight must be a number')
    #     if 0 > input:
    #         raise ValueError('Enter your valid weight')
    #     self._weight = input

    #set admin to True
    #private method that no one sees
    def make_user_an_admin(self):
        """class method to make a web app admin
        useful for testing and flushing a database during testing."""
        if self._admin == False:
            self._admin = True

    def validate_account(self):
        """this is a method for validating the user inserting their information
        correctly from the server side."""
        errors = []

        #checks for valid first name entry
        if not self.first_name or len(self.first_name.strip()) == 0:
            errors.append('Please enter your first name')

        #checks for valid last name entry
        if not self.last_name or len(self.last_name.strip()) == 0:
            errors.append('Please enter your last name')

        if not self.email:
            errors.append('Please enter an email')

        if not self.verify_email(self.email):
            errors.append('Please enter a valid email address')

        if not self.password:
            errors.append('Please enter a password')

        return errors

    def add_video(self):
        """this method will add videos as items to a miniature list
        that will be displayed to the user.
        
        this will store a list of dictionaries, that contain
        the key/value pairs of the video by their filename and
        date of creation
        
        the filename will be a formatted string containing:
        1. user_id
        2. exercise_selected"""
        pass

    def to_dict(self):
        data = super().to_dict()
        data.update({
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'age': self.age,
            'height': f"{self.feet}'{self.inches}\"",
            'weight': self.weight,
            'video_collection': getattr(self, 'video_collection', []),
        })
        return data