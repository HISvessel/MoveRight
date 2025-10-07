from flask import request
from flask_restx import Namespace, Resource, fields
from app.models.user import User

# user namespace - groups all user endpoints
user_api = Namespace('users', description='User operations')

# user model holds schema for input data
user_input = user_api.model('UserInput', {
    'first_name': fields.String(required=True, description='First name'),
    'last_name': fields.String(required=True, description='Last name'),
    'email': fields.String(required=True, description='Email (yahoo.com only)'),
    'password': fields.String(required=True, description='Password'),
    'age': fields.Integer(required=True, description='Age'),
    'feet': fields.Integer(required=True, description='Height feet (3-7)'),
    'inches': fields.Integer(required=True, description='Height inches (0-11)'),
    'weight': fields.Float(required=True, description='Weight in lbs')
})

# user model holds schema for output data
user_output = user_api.model('UserOutput', {
    'id': fields.String(description='User UUID'),
    'first name': fields.String(description='First name'),
    'last name': fields.String(description='Last name'),
    'email': fields.String(description='Email'),
    'age': fields.Integer(description='Age'),
    'height': fields.String(description='Formatted height'),
    'weight': fields.Float(description='Weight'),
    'created_at': fields.String(description='Creation timestamp'),
    'updated_at': fields.String(description='Last update timestamp'),
    'video_collection': fields.List(fields.Raw, description='List of user videos')
})

# class handles request to api/users - list users and create user
@user_api.route('') #URL - /api/users
class UserList(Resource):
    """
    GET request - list all users
    POST request - create a new user
    """
    def get(self):
        """
        Runs when someone makes GET request to /api/users
        
        Returns:
            A list of all users and status code 200 (OK)
        """
        
        # TO DO: get user data from DB
        list_of_users = []
        
        return list_of_users, 200
    
    def post(self):
        """
        This function runs when someone makes a POST request to /api/users        
        Returns:
            The created user data and status code 201 (Created)
        """
        # Get the JSON data that was sent from the frontend
        data = request.json
        
        try:
            # creates new user object
            new_user = User(
                first_name=data['first_name'],
                last_name=data['last_name'],
                email=data['email'],
                password=data['password'],
                age=data['age'],
                feet=data['feet'],
                inches=data['inches'],
                weight=data['weight']
            )
            
            # convert user obj to dictionary
            user_data = new_user.to_dict()
            
            return user_data, 201
        # Get the JSON data that was sent from the frontend
data = request.json

try:
    # creates new user object
    new_user = User(
        first_name=data['first_name'],
        last_name=data['last_name'],
        email=data['email'],
        password=data['password'],
        age=data['age'],
        feet=data['feet'],
        inches=data['inches'],
        weight=data['weight']
    )
    
    # convert user obj to dictionary
    user_data = new_user.to_dict()
    
    return user_data, 201

except KeyError as error:
    # happens when frontend forgets to send a required field
    missing_field = str(error)
    return {'message': f'Missing required field: {missing_field}'}, 400

except TypeError as error:
    # happens when wrong data type
    error_message = str(error)
    return {'message': error_message}, 400

except ValueError as error:
    # happens when invalid value
    error_message = str(error)
    return {'message': error_message}, 400