# app/api/auth_namespace.py
"""
Authentication endpoints - login, logout, etc.
"""

from flask import request
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models.user import User

auth_api = Namespace('auth', description='Authentication operations')

# Login input model - what user sends
login_model = auth_api.model('Login', {
    'email': fields.String(required=True, description='User email', example='john@example.com'),
    'password': fields.String(required=True, description='User password', example='secret123')
})

# Login response model - what we send back
login_response = auth_api.model('LoginResponse', {
    'token': fields.String(description='JWT access token'),
    'user': fields.Raw(description='User information')
})

@auth_api.route('/login')
class Login(Resource):
    """User login endpoint"""
    
    @auth_api.expect(login_model)
    # @auth_api.marshal_with(login_response)
    def post(self):
        """Login with email and password"""
        # Get email and password from request
        data = request.json
        email = data.get('email')
        password = data.get('password')
        
        # Find user by email
        user = User.query.filter_by(email=email).first()
        
        # Check if user exists
        if not user:
            return {'message': 'Invalid email or password'}, 401
        
        # Check if password is correct
        if not user.verify_password(password):
            return {'message': 'Invalid email or password'}, 401
        
        # Create JWT token
        token = create_access_token(identity=str(user.id))
        
        # Return token and user info
        return {
            'token': token,
            'user': user.to_dict()
        }, 200