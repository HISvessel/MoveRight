frmoapp.models.base_class import BaseClass
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

from app.models.base_class import BaseClass

class User(BaseClass):
    def __init__(self, first_name='', last_name='', email='', 
                 password='', age=0, feet=0, inches=0, weight=0,
                 video_collection=[]):
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self._password = password
        self._age = age
        self._feet = feet
        self._inches = inches
        self._weight = weight
        self.video = video_collection if not None else []
        
        #special constructor for administrator privileges
        #administrator can view all entities and flush the database during testing period
        self._admin = False

    def hash_password(self):
        """password hashing method"""
        pass

    def verify_email(self):
        """class method for verifying email existence"""
        pass

    #setting the age property for a value rgeater than 0
    @property
    def age(self):
        return self._age
    
    @age.setter
    def age(self, input):
        pass

    #setting the feet for a value between 3 and 7 feet
    @property
    def feet(self):
        return self._feet
    
    @feet.setter
    def feet(self, input):
        pass


    #setting the inches to a value between 0 and 11
    @property
    def inches(self):
        return self._inches
    
    @inches.setter
    def inches(self, input):
        pass

    #setting the weight to be greater than 0(no judgement if they weight 1 single lbs)
    @property
    def weight(self):
        return self._weight
    
    @weight.setter
    def weight(self, input):
        pass
