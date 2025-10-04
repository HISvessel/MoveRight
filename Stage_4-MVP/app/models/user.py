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
7. weight(float)"""

from app.models.base_class import BaseClass

class User(BaseClass):
    pass