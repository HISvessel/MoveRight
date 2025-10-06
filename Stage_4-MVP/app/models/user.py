from app.models.base_class import BaseClass
import bcrypt
import re
from app.models.db_model import db
from sqlalchemy.orm import relationship, validates
import pymongo


"""the following script contains a user class


The user inherits from the base class for SQL schema and is composed
of other methods for its creation.

the following elements make up its composition:

1. First name
2. Last name
3. email
4. encrypted password
5. age
6. height in the following measurements: 
    feet(int)
    inches(int)
7. weight(float)
8. video_collection"""


class User(BaseClass):
    def __init__(self, first_name='', last_name='', email='', 
                 password='', age=0, feet=0, inches=0, weight=0):
        super().__init__()
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self._password = self.hash_password(password) if password else None
        self._age = age
        self._feet = feet
        self._inches = inches
        self._weight = weight

        #an optional feature that can be seen at the push of a button
        #if no videos are stored, a prompt message will be placed instead
        self.video_collection = []
        
        #special constructor for administrator privileges
        #administrator can view all entities and flush the database during testing period
        self._admin = False
    
    #preparing ORM structure for RDBMS schema
    """__table__ = 'users'
    first_name = db.Column()
    last_name = db.Column()
    age = db.Column()
    feet(height) = db.Column()
    inches(height) = db.Column()
    weight = db.Column()

    review = relationship()
    """

    #preparing non relational object mapping for video storage using pymongo
    """Mongo DB document based ORM under construction"""

    def hash_password(self, password):
        """password hashing method"""
        password = self._password.encode('utf-8')
        salted_pwd = bcrypt.gensalt()
        hashed_pwd = bcrypt.hashpw(password, salted_pwd)

        return hashed_pwd

    def verify_password(self, password):
        """this class method verifies that the password is hashed
        and matches the input given by the user when class is created"""
        if not self._password:
            return False
        return bcrypt.checkpw(password.encode('utf-8'), self._password.encode('utf-8'))

    def verify_email(self, email):
        """class method for verifying correct email pattern"""
        #domain_suffix = ['yahoo', 'gmail', 'outlook', 'icloud']
        #valid = [suffix for suffix in domain_suffix]
        #test yahoo.com pattern, then proceed to make separate methods for other domain mails
        pattern = r'^[\w\.-]+@yahoo\.com$'
        return re.match(pattern, email) is not None


    #setting the age property for a value greater than 0
    @property
    def age(self):
        return self._age

    @age.setter
    def age(self, input):
        try:
            self.age = input
        except TypeError and ValueError:
            if type(input) is not int:
                raise TypeError('Age must be an number')
            if self.age < 1: #pending change, observe behavior
                raise ValueError('You must be of valid age.')


    #setting the feet for a value between 3 and 7 feet
    @property
    def feet(self):
        return self._feet

    @feet.setter
    def feet(self, input):
        try:
            self.feet = input
        except TypeError and ValueError:
            if type(input) is not int:
                raise TypeError('Feet must be a valid number')
            if 3 < input < 8:
                raise ValueError('Please enter a valid feet measurement.')


    #setting the inches to a value between 0 and 11
    @property
    def inches(self):
        return self._inches

    @inches.setter
    def inches(self, input):
        try:
            self.inches = input
        except TypeError and ValueError:
            if type(input) is not int:
                raise TypeError('Inches must be a valid number')
            if 0 < input < 12:
                raise ValueError('Please enter a valid measurement in inches.')

    #setting the weight to be greater than 0(no judgement if they weight 1 single lbs)
    @property
    def weight(self):
        return self._weight

    @weight.setter
    def weight(self, input):
        try:
            self.weight = input
        except TypeError and ValueError:
            if type(input) is not int:
                raise TypeError('Your weight must be a number')
            if 0 > self.weight:
                raise ValueError('Enter your valid weight')

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

        if not self.email: #checks for email entry
            errors.append('Please enter an email')

        if not self.verify_email(self.email): #checks for valid email
            errors.append('Please enter a valid email address')

        if not self._password:#checks for password entry
            errors.append('Please enter a password')

        if not self.verify_password(self._password): #checks for valid password
            errors.append('Invalid password, please try again.')

        if self._password < 10: #checks for password length
            errors.append('Password must be at least 10 characters long')

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
            'first name': self.first_name,
            'last name': self.last_name,
            'age': self.age,
            'height': f"{self.feet}'{self.inches}''",
            'weight': self.weight,
            'video_collection': self.video_collection,
        })
        return data
