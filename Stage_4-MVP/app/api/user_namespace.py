from flask import request
from flask_restx import Namespace, Resource, fields
from app.models.user import User
from app.services.facade import Facade

# creates instance
facade = Facade()

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
    'age': fields.Integer(description='Age'),
    'height': fields.String(description='Formatted height'),
    'weight': fields.Float(description='Weight'),
    'created at': fields.String(description='Creation timestamp'),
    'updated at': fields.String(description='Last update timestamp'),
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
        
        users = facade.get_all_users()
        list_of_users = [user.to_dict() for user in users]
        
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
            
            # save user to db
            facade.user_service.add(new_user)
            
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


@user_api.route('/<string:user_id>')
class UserDetail(Resource):
    """
    Handles operations for a single user
    GET - retrieve one user
    PUT - update one user  
    DELETE - delete one user
    """
    def get(self, user_id):
        """
        Get a single user by their ID
        
        Args:
            user_id (string): The UUID of the user to retrieve
            
        Returns:
            tuple: User data dictionary and HTTP status code
        """
        user = facade.user_service.get(user_id)
        if not user:
            return {'message': f'User with ID {user_id} not found'}, 404
        return user.to_dict(), 200
    
    def put(self, user_id):
        """
        Update an existing user
        
        Args:
            user_id (string): The UUID of the user to update
            
        Returns:
            tuple: Updated user data and HTTP status code
        """
        data = request.json
        
        try:
            user = facade.user_service.get(user_id)
            if not user:
                return {'message': f'User with ID {user_id} not found'}, 404
            
            # Handle password change if provided
            if data.get('new_password'):
                # Verify current password first
                if not data.get('current_password'):
                    return {'message': 'Current password is required to change password'}, 400
                
                if not user.verify_password(data['current_password']):
                    return {'message': 'Current password is incorrect'}, 401
                
                # Hash the new password before updating
                data['password'] = user.hash_password(data['new_password'])
                
            # Remove password-related fields that shouldn't be in update
            data.pop('current_password', None)
            data.pop('new_password', None)
            
            facade.user_service.update(user_id, data)
            # Get the updated user from database
            updated_user = facade.user_service.get(user_id)
            return updated_user.to_dict(), 200  # ← Return user object!
            
        except (KeyError, TypeError, ValueError) as error:
            return {'message': str(error)}, 400
        
    def delete(self, user_id):
        """
        Delete a user by their ID

        Args:
            user_id (string): The UUID of the user to delete
        
        Returns:
            tuple: Empty response and HTTP status code
        """
        user = facade.user_service.get(user_id)
        if not user:
            return {'message': f'User with ID {user_id} not found'}, 404
        
        facade.user_service.delete(user_id)
        return '', 204